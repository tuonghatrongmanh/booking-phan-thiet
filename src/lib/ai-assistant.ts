// Goi Gemini API (free tier, chi can API key mien phi tu Google AI Studio) lam "fallback"
// khi tim kiem trong he thong khong ra ket qua nao - AI tro chuyen tu nhien voi khach,
// nhung PHAI trung thuc: khong duoc bia ra ten quan/homestay/gia cu the khong co that
// trong he thong, chi tu van chung hoac huong dan khach lien he/quay lai sau.
export const AI_GEMINI_MODEL = "gemini-3.5-flash-lite";

const NO_KEY_MESSAGE = "Xin lỗi, trợ lý AI hiện chưa sẵn sàng. Bạn vui lòng thử từ khóa khác hoặc liên hệ bộ phận hỗ trợ nhé.";
const ERROR_MESSAGE = "Trợ lý AI đang tạm thời gián đoạn, bạn vui lòng thử lại sau ít phút nhé.";

const SYSTEM_PROMPT = `Bạn là trợ lý AI của Booking Phan Thiết (bookingphanthiet.com) - trang web tra cứu & đánh giá uy tín về homestay/villa/khu du lịch, thuê xe máy, quán ăn và điểm tham quan tại Phan Thiết, Việt Nam.

Khách vừa tìm kiếm một từ khóa nhưng hệ thống KHÔNG tìm thấy kết quả phù hợp trong dữ liệu thật của trang. Nhiệm vụ của bạn là trò chuyện, tư vấn hữu ích thay cho kết quả tìm kiếm.

QUY TẮC BẮT BUỘC:
- KHÔNG được bịa ra tên homestay/villa/quán ăn/địa điểm cụ thể, giá cả, số điện thoại, hay khẳng định rằng chúng có trên hệ thống - vì hệ thống thực sự không tìm thấy.
- Nếu khách hỏi về một địa điểm/dịch vụ cụ thể mà bạn không chắc có thật trong hệ thống, hãy nói rõ là chưa tìm thấy trong hệ thống, gợi ý khách thử từ khóa khác, duyệt các danh mục (Lưu trú, Ẩm thực, Cộng đồng), hoặc liên hệ hỗ trợ.
- Có thể chia sẻ kiến thức chung, hữu ích về du lịch Phan Thiết (thời tiết, kinh nghiệm, địa danh nổi tiếng công khai) nếu phù hợp với câu hỏi.
- Trả lời ngắn gọn, thân thiện, tối đa khoảng 4-5 câu.
- Luôn trả lời bằng Tiếng Việt.`;

export async function askAI(question: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NO_KEY_MESSAGE;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini trả lỗi ${res.status}`);

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    return text.trim() || ERROR_MESSAGE;
  } catch (err) {
    console.error("[ai-assistant] Lỗi gọi Gemini:", err);
    return ERROR_MESSAGE;
  }
}

export type FoodIntentCandidate = {
  id: string;
  name: string;
  restaurant: string;
  description: string;
  mealTime: string | null;
  is24h: boolean;
  featured: boolean;
  badge: string | null;
};

// "RAG" don gian: khi tim chu truc tiep (contains) khong ra ket qua vi khach hoi kieu
// tu nhien/ngu canh (vd "mon an toi nhat dinh phai an la gi") thay vi go dung ten mon -
// gui DANH SACH MON AN THAT cho Gemini kem cau hoi, bat no CHI duoc chon id co san trong
// danh sach (khong duoc bia), roi ben goi ham nay tu lay du lieu that (anh/mo ta/link)
// tu DB de hien thi - dam bao thong tin hien cho khach LUON la du lieu that, AI chi lam
// nhiem vu "hieu y khach muon gi va tro ve dung id nao phu hop".
export async function matchFoodByIntent(question: string, candidates: FoodIntentCandidate[]): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || candidates.length === 0) return [];

  const list = candidates
    .map(
      (c) =>
        `id="${c.id}" | Tên món: ${c.name} | Quán: ${c.restaurant} | Buổi ăn: ${c.mealTime ?? "chưa phân loại"} | Quán mở 24/24: ${c.is24h ? "Có" : "Không"}${
          c.featured ? " | ĐƯỢC ADMIN ĐÁNH DẤU NỔI BẬT / MÓN NÊN THỬ" : ""
        }${c.badge ? ` | Nhãn: ${c.badge}` : ""} | Mô tả: ${c.description}`
    )
    .join("\n");

  const prompt = `Dưới đây là danh sách món ăn THẬT đang có trên hệ thống Booking Phan Thiết (bookingphanthiet.com):
${list}

Câu hỏi của khách: "${question}"

QUY TẮC LỌC - PHẢI TUÂN THỦ NGHIÊM NGẶT:
- CHỈ chọn món khi có BẰNG CHỨNG RÕ RÀNG trong dữ liệu (trường "Buổi ăn" khớp đúng với điều khách hỏi, hoặc phần Mô tả nói rõ về điều đó).
- "Buổi ăn: chưa phân loại" nghĩa là admin CHƯA xác nhận cụ thể - đây KHÔNG phải bằng chứng món đó thuộc bất kỳ buổi nào. TUYỆT ĐỐI không được tự suy đoán một món "chưa phân loại" là món sáng/trưa/chiều/tối chỉ dựa vào LOẠI món ăn (vd không được nghĩ "món nướng/lẩu chắc là món tối" nếu Buổi ăn không ghi rõ Tối) - đó là suy đoán thiếu căn cứ.
- Nếu khách hỏi về một thời điểm/tiêu chí cụ thể (vd "món ăn đêm/tối", "món sáng") mà KHÔNG có món nào ghi đúng Buổi ăn đó, hãy trả về mảng RỖNG thay vì đoán bừa - thà không gợi ý còn hơn gợi ý sai.
- Nếu khách hỏi về giờ mở cửa/mở khuya/24 tiếng, chỉ dựa vào trường "Quán mở 24/24" - "Không" nghĩa là admin xác nhận KHÔNG mở 24/24 (có thể vẫn mở khuya theo giờ cụ thể, nhưng đừng khẳng định là mở 24/24).
- Ưu tiên món được đánh dấu NỔI BẬT nếu khách hỏi chung chung kiểu "món phải thử/nên ăn".
- Tối đa chỉ chọn 5 món phù hợp nhất, không liệt kê tràn lan.
- CHỈ được chọn id có sẵn trong danh sách phía trên, TUYỆT ĐỐI không được bịa ra id khác.`;


  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: { matchIds: { type: "ARRAY", items: { type: "STRING" } } },
              required: ["matchIds"],
            },
          },
        }),
      }
    );
    if (!res.ok) return [];

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "{}";
    const parsed = JSON.parse(text) as { matchIds?: unknown };
    const matchIds = Array.isArray(parsed.matchIds) ? parsed.matchIds.filter((v): v is string => typeof v === "string") : [];

    const validIds = new Set(candidates.map((c) => c.id));
    return matchIds.filter((id) => validIds.has(id)).slice(0, 5);
  } catch (err) {
    console.error("[ai-assistant] Lỗi matchFoodByIntent:", err);
    return [];
  }
}

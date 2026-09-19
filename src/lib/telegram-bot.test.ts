import { describe, expect, it } from "vitest";
import { buildCallbackData, confirmKeyboard, initialKeyboard, isAuthorizedTelegramUser, parseCallbackData } from "./telegram-bot";

const ID = "cmrvyfrcq0004dsk5tfqxn6w5";

describe("callback data", () => {
  it("khứ hồi và đủ ngắn cho giới hạn 64 byte của Telegram", () => {
    const data = buildCallbackData("cf", "rental", ID);
    expect(data.length).toBeLessThanOrEqual(64);
    expect(parseCallbackData(data)).toEqual({ action: "cf", kind: "rental", id: ID });
    expect(parseCallbackData(buildCallbackData("no", "stay", ID))?.kind).toBe("stay");
  });
  it("từ chối dữ liệu lạ hoặc id chèn ký tự", () => {
    expect(parseCallbackData("dep:ok:x:" + ID)).toBeNull();
    expect(parseCallbackData("dep:zz:s:" + ID)).toBeNull();
    expect(parseCallbackData("dep:ok:s:abc")).toBeNull();
    expect(parseCallbackData("dep:ok:s:" + ID + ";drop")).toBeNull();
    expect(parseCallbackData(undefined)).toBeNull();
  });
});

describe("keyboards", () => {
  it("đơn mới chỉ có nút nhận cọc, khách báo chuyển có thêm nút chưa nhận", () => {
    expect(initialKeyboard("stay", ID, false)[0]).toHaveLength(1);
    expect(initialKeyboard("stay", ID, true)[0]).toHaveLength(2);
  });
  it("bước xác nhận nêu số tiền và có nút quay lại", () => {
    const kb = confirmKeyboard("ok", "rental", ID, 300000);
    expect(kb[0][0].text).toContain("300.000");
    expect(parseCallbackData(kb[1][0].callback_data)?.action).toBe("bk");
  });
});

describe("isAuthorizedTelegramUser", () => {
  it("chat riêng: chỉ chính chủ", () => {
    expect(isAuthorizedTelegramUser(123, { chatId: "123" })).toBe(true);
    expect(isAuthorizedTelegramUser(999, { chatId: "123" })).toBe(false);
  });
  it("nhóm (chat id âm): phải nằm trong danh sách cho phép", () => {
    expect(isAuthorizedTelegramUser(999, { chatId: "-100555" })).toBe(false);
    expect(isAuthorizedTelegramUser(999, { chatId: "-100555", adminIds: "5, 999" })).toBe(true);
  });
});

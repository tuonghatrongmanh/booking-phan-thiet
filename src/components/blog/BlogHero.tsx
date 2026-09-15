import Image from "next/image";

// Hero banner cho trang Blog (/tin-tuc) - chi 1 anh banner-tintuc.png do user
// cung cap, giu dung ty le goc 2172x724 (3:1), khong overlay/text/search box.
export default function BlogHero() {
  return (
    <section className="relative w-full aspect-[3/1]">
      <Image src="/images/banner-tintuc.png" alt="Khám phá Phan Thiết" fill priority className="object-cover" />
    </section>
  );
}

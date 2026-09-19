import type { LocalSpecialty } from "@prisma/client";

export default function LocalSpecialties({ specialties }: { specialties: LocalSpecialty[] }) {
  return (
    <section className="relative bg-gradient-to-b from-food-light to-white overflow-hidden">
      <div className="container-custom py-12 sm:py-14">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="lg:w-[280px] shrink-0">
            <span className="w-14 h-14 rounded-2xl bg-white text-food-primary shadow-card flex items-center justify-center text-2xl mb-4">
              <i className="fa-solid fa-shrimp" aria-hidden="true" />
            </span>
            <h2 className="font-display font-bold text-[24px] sm:text-[28px] text-food-text leading-tight">
              Đặc sản Phan Thiết
            </h2>
            <p className="text-sm text-food-textMuted mt-2">Hương vị đặc trưng – Đậm đà khó quên</p>
          </div>

          <div className="flex-1 min-w-0">
            <div data-swipe-hint className="flex gap-5 overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-1 sm:py-1">
              {specialties.map((item) => (
                <div key={item.id} className="shrink-0 w-[128px] text-center">
                  <div className="w-[112px] h-[112px] mx-auto rounded-full bg-white shadow-card border border-white overflow-hidden flex items-center justify-center text-food-primary/30 text-3xl">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-utensils" aria-hidden="true" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-food-text mt-2.5 leading-snug">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <svg
        className="absolute bottom-0 left-0 w-full text-white"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,32 C240,60 480,4 720,20 C960,36 1200,58 1440,26 L1440,60 L0,60 Z"
        />
      </svg>
    </section>
  );
}

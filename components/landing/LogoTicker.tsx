"use client";

export function LogoTicker() {
  const logos = [
    "DENTAL365", "ORALX", "BRIGHTSMILE", "PEARLAI", "DENTALFLOW", "TOOTHFAIRY", "CLEARPATH"
  ];

  return (
    <section className="py-10 border-y border-[#e5e7eb] bg-white overflow-hidden">
      <div className="logo-ticker-track">
        {[...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-10 md:px-14 flex items-center"
          >
            <span className="text-[#9ca3af] font-bold text-sm md:text-base tracking-widest uppercase whitespace-nowrap">
              {logo}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

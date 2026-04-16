import heroBrush from "@/assets/hero-brush.jpg";

export function HeroBanner() {
  return (
    <div className="relative w-full h-52 md:h-72 overflow-hidden mb-8 md:mb-10">
      {/* Sumi-e backdrop */}
      <img
        src={heroBrush}
        alt="Ink wash mountain landscape"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />

      {/* Atmospheric mist overlays — pale washi feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />

      {/* Vertical kanji watermark, like the Yōtei map */}
      <div className="absolute right-6 top-6 bottom-6 hidden md:flex items-start">
        <span className="kanji-watermark text-7xl tracking-[0.4em]">羊蹄</span>
      </div>


      <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-8 max-w-xl">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] mb-3">
          The Path of the Fox
        </p>
        <h2 className="text-3xl md:text-5xl serif-jp font-medium text-foreground tracking-[0.08em] leading-tight">
          狐道
        </h2>
        <div className="mt-3 h-px w-24 bg-foreground/40" />
        <p className="text-sm text-foreground/70 mt-3 max-w-md tracking-wide italic">
          Let the kitsune spirit guide your brush through the way of Japanese.
        </p>
      </div>
    </div>
  );
}

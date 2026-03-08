import heroBrush from "@/assets/hero-brush.jpg";

export function HeroBanner() {
  return (
    <div className="relative w-full h-40 md:h-52 rounded-2xl overflow-hidden mb-6 md:mb-8">
      <img 
        src={heroBrush} 
        alt="Ink wash landscape" 
        className="w-full h-full object-cover"
      />
      
      {/* Smooth gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
      
      <div className="absolute bottom-0 left-0 p-5 md:p-7">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-0.5 h-5 bg-primary rounded-full" />
          <p className="text-[11px] text-primary font-brush uppercase tracking-[0.2em]">Path of the Fox</p>
        </div>
        <h2 className="text-2xl md:text-3xl font-brush font-bold text-foreground tracking-wide">
          <span className="brush-underline">狐道</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
          Let the kitsune spirit guide your brush through the way of Japanese
        </p>
      </div>

      {/* Hanko stamp */}
      <div className="absolute top-4 right-4 md:top-5 md:right-5 hanko-badge text-xs opacity-70">
        学
      </div>
    </div>
  );
}

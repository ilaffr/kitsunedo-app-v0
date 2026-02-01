import heroBrush from "@/assets/hero-brush.jpg";

export function HeroBanner() {
  return (
    <div className="relative w-full h-44 md:h-56 rounded-sm overflow-hidden mb-6 md:mb-8 border-2 border-border">
      <img 
        src={heroBrush} 
        alt="Ink wash landscape" 
        className="w-full h-full object-cover"
      />
      
      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent" />
      
      <div className="absolute bottom-0 left-0 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <p className="text-xs text-primary font-brush uppercase tracking-widest">Path of the Fox</p>
        </div>
        <h2 className="text-2xl md:text-3xl font-brush font-bold text-foreground tracking-wide">
          <span className="brush-underline">狐道</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Let the kitsune spirit guide your brush through the way of Japanese
        </p>
      </div>

      {/* Decorative hanko stamp */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 hanko-badge text-xs opacity-80">
        学
      </div>
    </div>
  );
}

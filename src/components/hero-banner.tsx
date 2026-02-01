import heroLandscape from "@/assets/hero-landscape.jpg";

export function HeroBanner() {
  return (
    <div className="relative w-full h-40 md:h-52 rounded-2xl overflow-hidden mb-6 md:mb-8">
      <img 
        src={heroLandscape} 
        alt="Mount Yotei landscape" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      
      <div className="absolute bottom-0 left-0 p-4 md:p-6">
        <p className="text-xs md:text-sm text-primary font-medium mb-1">Welcome back, warrior</p>
        <h2 className="text-xl md:text-3xl font-bold text-foreground font-title tracking-wide">
          The Path of the <span className="text-gradient-golden">Kitsune</span>
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Let the fox spirit guide your Japanese journey
        </p>
      </div>

      {/* Cherry blossom petals decoration */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-accent/60 animate-float"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </div>
    </div>
  );
}

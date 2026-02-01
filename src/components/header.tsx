import { Search, Menu } from "lucide-react";
import { Button } from "./ui/button";
import foxBrush from "@/assets/fox-brush.png";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b-2 border-border">
      <div className="container flex items-center justify-between h-14 md:h-16 px-4">
        {/* Logo with brush stroke style */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-sm overflow-hidden bg-card border-2 border-foreground/20 p-0.5">
            <img src={foxBrush} alt="Kitsune" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-brush font-bold text-foreground tracking-wider">狐道</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Kitsune-dō</p>
          </div>
        </div>

        {/* Search - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search lessons..."
              className="w-full h-10 pl-10 pr-4 rounded-sm bg-card border-2 border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-sm md:hidden">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-sm bg-card border-2 border-border">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

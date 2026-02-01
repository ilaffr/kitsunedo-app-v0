import { Bell, Search, Menu } from "lucide-react";
import { Button } from "./ui/button";
import foxMascot from "@/assets/fox-mascot.png";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-14 md:h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden bg-card border border-primary/30 p-1">
            <img src={foxMascot} alt="Kitsune" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground font-title tracking-wider">Kitsune</h1>
            <p className="text-[10px] md:text-xs text-primary font-japanese">狐の道</p>
          </div>
        </div>

        {/* Search - Desktop only */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search lessons, kanji, vocabulary..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9 md:w-10 md:h-10 md:hidden">
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9 md:w-10 md:h-10">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9 md:w-10 md:h-10 bg-card border border-border">
            <Menu className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

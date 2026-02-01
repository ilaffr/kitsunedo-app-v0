import { Bell, Search, Settings, User } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground font-japanese">学</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Nihongo</h1>
            <p className="text-xs text-muted-foreground">日本語</p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search lessons, kanji, vocabulary..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl bg-muted">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

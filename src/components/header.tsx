import { Search, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import foxBrush from "@/assets/fox-brush.png";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-[68px] px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/5 border border-primary/20 p-1 flex items-center justify-center">
            <img src={foxBrush} alt="Kitsune" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-brush font-bold text-foreground tracking-wider leading-tight">狐道</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Kitsune-dō</p>
          </div>
        </div>

        {/* Search - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search lessons..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
          </div>
        </div>

        {/* User actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl md:hidden">
            <Search className="w-5 h-5" />
          </Button>
          {user && (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground max-w-[100px] truncate">
                  {user.email?.split("@")[0]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

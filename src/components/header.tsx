import { Search, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import foxBrush from "@/assets/fox-brush.png";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md">
      {/* Hairline ink divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

      <div className="container flex items-center justify-between h-14 md:h-16 px-4">
        {/* Logo — kitsune seal + brush kanji */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 overflow-hidden">
            <img src={foxBrush} alt="Kitsune" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight">
            <h1 className="text-xl md:text-2xl font-medium text-foreground tracking-[0.15em] serif-jp">狐道</h1>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.32em] mt-0.5">Kitsune-dō</p>
          </div>
        </div>

        {/* Search — Desktop, minimal underline style */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <Search className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search the path…"
              className="w-full h-9 pl-7 pr-2 bg-transparent border-0 border-b border-foreground/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors tracking-wide"
            />
          </div>
        </div>

        {/* User actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-sm md:hidden">
            <Search className="w-5 h-5" />
          </Button>
          {user && (
            <>
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground tracking-wide max-w-[120px] truncate">
                  {user.email?.split("@")[0]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="rounded-sm hover:bg-foreground/5"
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

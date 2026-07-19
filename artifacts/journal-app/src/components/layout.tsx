import { Link, useLocation } from "wouter";
import { Book, Calendar, Feather, Home, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/write", label: "Write", icon: Feather },
    { href: "/entries", label: "Journal", icon: Book },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/insights", label: "Insights", icon: LineChart },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 pb-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-2 rounded-xl">
              <Feather className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-medium tracking-tight text-foreground">
              Luminary
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "opacity-100" : "opacity-70")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-primary" />
            <span className="font-serif text-xl font-medium">Luminary</span>
          </Link>
        </header>

        <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:p-8 lg:p-12">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border/50 pb-safe z-50">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className={cn("w-5 h-5 mb-1 transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

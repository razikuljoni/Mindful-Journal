import { Link, useLocation } from "wouter";
import { Book, Calendar, Feather, Home, LineChart, Wind, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/write", label: "Write", icon: Feather },
    { href: "/entries", label: "Journal", icon: Book },
    { href: "/breathe", label: "Breathe", icon: Wind },
    { href: "/mindful", label: "Mindful", icon: Sparkles },
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

        <nav className="flex-1 px-4 py-6 space-y-1">
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

        {/* Reminder toggle in sidebar footer */}
        <ReminderToggle />
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
        <div className="flex items-center justify-around p-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className={cn("w-4 h-4 mb-0.5 transition-transform", isActive && "scale-110")} />
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─── Reminder toggle ──────────────────────────────────────────────────────────
function ReminderToggle() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      setEnabled(localStorage.getItem("luminary_reminders") === "true" && Notification.permission === "granted");
    }
  }, []);

  const toggle = async () => {
    if (!("Notification" in window)) return;

    if (!enabled) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === "granted") {
        localStorage.setItem("luminary_reminders", "true");
        setEnabled(true);
        new Notification("Luminary reminders on 🌿", {
          body: "We'll remind you to breathe and journal each day.",
          icon: "/favicon.ico",
        });
      }
    } else {
      localStorage.setItem("luminary_reminders", "false");
      setEnabled(false);
    }
  };

  if (!("Notification" in window)) return null;

  return (
    <div className="px-4 pb-6">
      <button
        onClick={toggle}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
          enabled
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-muted/30 border-border text-muted-foreground hover:bg-accent"
        )}
      >
        <span className="text-base">{enabled ? "🔔" : "🔕"}</span>
        <span>{enabled ? "Reminders on" : "Enable reminders"}</span>
      </button>
    </div>
  );
}

// Needed imports for ReminderToggle
import { useState, useEffect } from "react";

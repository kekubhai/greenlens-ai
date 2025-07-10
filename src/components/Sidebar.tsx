import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Trash, Coins, Medal, Settings, Home } from "lucide-react";

const sidebarItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/report", icon: MapPin, label: "Report Waste" },
  { href: "/collect", icon: Trash, label: "Collect Waste" },
  { href: "/rewards", icon: Coins, label: "Rewards" },
  { href: "/leaderboard", icon: Medal, label: "Leaderboard" },
];

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border pt-20 text-foreground fixed inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out
      ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:w-64 w-64 shadow-lg lg:shadow-none`}
    >
      
      <nav className="h-full flex flex-col justify-between">
        <div className="px-4 py-6 space-y-2">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`flex items-center w-full justify-start py-3 space-x-3 rounded-xl text-left group ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 shadow-sm border border-green-200 dark:border-green-800"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-green-200 dark:hover:border-green-800"
                } transition-all duration-200 ease-in-out hover:shadow-md`}
              >
                <item.icon className={`h-5 w-5 ${pathname === item.href ? 'text-green-600 dark:text-green-400' : ''} group-hover:scale-110 transition-transform duration-200`} />
                <span className="text-base font-medium">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
        
        <div className="p-4 border-t border-border">
          <Link href="/settings" passHref>
            <Button
              variant={pathname === "/settings" ? "secondary" : "outline"}
              className={`flex items-center w-full py-3 rounded-xl group ${
                pathname === "/settings"
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 shadow-sm border border-green-200 dark:border-green-800"
                  : "text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-green-200 dark:hover:border-green-800"
              } transition-all duration-200 ease-in-out hover:shadow-md`}
            >
              <Settings className={`mr-3 h-5 w-5 ${pathname === "/settings" ? 'text-green-600 dark:text-green-400' : ''} group-hover:scale-110 transition-transform duration-200`} />
              <span className="text-base font-medium">Settings</span>
            </Button>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Settings, Radar, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const isKeywordsPage = pathname === "/keywords";
  const isResultsPage = pathname === "/dashboard/results";

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-muted/50 border-r border-border transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Radar className="w-6 h-6 text-primary" />
              <span className="font-bold text-foreground">TrafficDuck</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/keywords">
            <Button
              variant={isKeywordsPage ? "default" : "ghost"}
              className={`w-full justify-start ${!sidebarOpen ? "px-2" : ""}`}
              title={sidebarOpen ? "" : "Niche"}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="ml-3">Niche</span>}
            </Button>
          </Link>

          <Link href="/dashboard/results">
            <Button
              variant={isResultsPage ? "default" : "ghost"}
              className={`w-full justify-start ${!sidebarOpen ? "px-2" : ""}`}
              title={sidebarOpen ? "" : "Results"}
            >
              <Radar className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="ml-3">Search Results</span>}
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className={`w-full justify-start text-destructive hover:text-destructive ${
              !sidebarOpen ? "px-2" : ""
            }`}
            title={sidebarOpen ? "" : "Logout"}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;

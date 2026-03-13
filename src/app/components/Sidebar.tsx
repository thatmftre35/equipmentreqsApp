import { Link, useLocation } from "react-router";
import { ClipboardList, Package, Settings, FileText, Wrench } from "lucide-react";

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    {
      title: "Forms",
      items: [
        { path: "/", label: "Equipment Call Off", icon: ClipboardList },
        { path: "/rental-request", label: "Rental Request", icon: Package },
        { path: "/owned-equipment", label: "Owned Equipment", icon: Wrench },
      ],
    },
    {
      title: "Management",
      items: [
        { path: "/projects", label: "Projects", icon: FileText },
        { path: "/equipment", label: "Equipment Types", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Logo/Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">EquipTrack</h1>
            <p className="text-xs text-sidebar-foreground/60">Contractor Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3 px-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent rounded-lg p-3">
          <p className="text-xs text-sidebar-accent-foreground/70">
            Need help? Contact support at{" "}
            <a href="mailto:support@equiptrack.com" className="text-sidebar-primary hover:underline">
              support@equiptrack.com
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}

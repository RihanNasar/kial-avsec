import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  Home,
  Users,
  FileText,
  CheckCircle,
  Upload,
  User,
  Building2,
  Menu,
  BarChart3,
  Activity,
  Bell,
  X,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import logo from "../public/kial.svg";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Date Widget Logic
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // --- Role-Based Navigation Logic ---
  const getNavItems = () => {
    if (!user) return [];

    // Group 1: "Navigation"
    const baseItems = [
      { path: "/", label: "Dashboard", icon: Home, group: "Navigation" },
    ];

    if (user.role === "CSO") {
      return [
        ...baseItems,
        {
          path: "/system-overview",
          label: "Overview",
          icon: BarChart3,
          group: "Navigation",
        },
        {
          path: "/audit",
          label: "Audit Logs",
          icon: Activity,
          group: "Navigation",
        },

        // Group 2: "App" (Management)
        { path: "/entities", label: "Entities", icon: Building2, group: "App" },
        { path: "/staff", label: "Staff Data", icon: Users, group: "App" },
        {
          path: "/approvals",
          label: "Approvals",
          icon: CheckCircle,
          group: "App",
        },
        { path: "/import", label: "Import", icon: Upload, group: "App" },
      ];
    }

    if (user.role === "ENTITY_HEAD") {
      return [
        ...baseItems,
        { path: "/staff", label: "My Staff", icon: Users, group: "App" },
        {
          path: "/certificates",
          label: "Certificates",
          icon: FileText,
          group: "App",
        },
      ];
    }

    if (user.role === "STAFF") {
      return [
        ...baseItems,
        {
          path: "/profile",
          label: "My Profile",
          icon: User,
          group: "Navigation",
        },
        {
          path: "/certificates",
          label: "My Certificates",
          icon: FileText,
          group: "Navigation",
        },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  // Split items for the visual groups
  const mainItems = navItems.filter((i) => i.group === "Navigation");
  const appItems = navItems.filter((i) => i.group === "App");

  const getRoleLabel = (role) => {
    const labels = {
      CSO: "Chief Security Officer",
      ENTITY_HEAD: "Entity Head",
      STAFF: "Staff Member",
    };
    return labels[role] || role;
  };

  return (
    // OUTER CONTAINER
    <div className="flex h-screen w-full bg-[#F3F4F6] p-4 md:p-6 overflow-hidden font-['Poppins'] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* SIDEBAR COMPONENT (Desktop) */}
      <aside className="hidden lg:flex flex-col w-[280px] h-full bg-white rounded-[32px] shadow-xl shadow-slate-200/50 overflow-hidden relative shrink-0 z-20">
        {/* 1. Header & Brand Area */}
        <div className="px-6 pt-8 pb-2">
          {/* LOGO AREA */}
          <div className="flex items-center justify-center mb-8">
            <img
              src={logo}
              alt="Logo"
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* TOP WIDGET: Date Only */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Today
                </p>
                <p className="text-sm font-bold text-slate-900">{dateString}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-8 no-scrollbar">
          {/* Navigation Group */}
          <div>
            <div className="mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-4">
              Menu
            </div>
            <div className="space-y-2">
              {mainItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative
                    ${
                      isActive(item.path)
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                    }
                  `}
                >
                  <item.icon
                    size={20}
                    strokeWidth={isActive(item.path) ? 2.5 : 2}
                    className={
                      isActive(item.path)
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                  />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* App/Management Group */}
          {appItems.length > 0 && (
            <div>
              <div className="mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-4">
                Management
              </div>
              <div className="space-y-2">
                {appItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group
                      ${
                        isActive(item.path)
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                      }
                    `}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={isActive(item.path) ? 2.5 : 2}
                      className={
                        isActive(item.path)
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-600"
                      }
                    />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* 3. Bottom Area: Profile Only */}
        <div className="px-6 pb-6 mt-auto">
          {/* User Profile */}
          <div className="flex items-center gap-3 pl-1 pt-4 border-t border-slate-100">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 truncate">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] font-medium text-slate-400 truncate">
                {getRoleLabel(user?.role)}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden lg:pl-6">
        {/* Header */}
        <header className="h-20 mb-2 flex items-center justify-between z-10 shrink-0">
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-white rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <img
              src={logo}
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {navItems.find((i) => isActive(i.path))?.label || "Dashboard"}
            </h2>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            <button className="w-11 h-11 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors relative group">
              <Bell size={20} className="group-hover:animate-swing" />
              <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm border border-slate-100 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all hover:shadow-md"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        {/* Content Card Wrapper */}
        <div className="flex-1 overflow-y-auto scroll-smooth no-scrollbar pb-2">
          <div className="bg-white min-h-full rounded-[32px] p-6 lg:p-8 shadow-sm border border-slate-100">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE DRAWER (Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-['Poppins']">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300">
            {/* Mobile Brand */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center justify-center flex-1">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                     flex items-center gap-4 p-3.5 rounded-2xl text-sm font-medium transition-all
                     ${
                       isActive(item.path)
                         ? "bg-slate-900 text-white shadow-lg"
                         : "text-slate-500 hover:bg-slate-50"
                     }
                   `}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Logout */}
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-colors"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;

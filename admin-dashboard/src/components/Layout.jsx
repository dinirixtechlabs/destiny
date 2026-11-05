import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Car,
  Route,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Drivers', path: '/drivers', icon: Car },
    { name: 'Rides', path: '/rides', icon: Route },
  ];

  const NavContent = () => (
    <div className="flex flex-col justify-between h-full bg-[#071439]">
      <div>
        {/* Brand with Official Logo */}
        <div className="h-20 flex items-center px-5 border-b border-white/10 space-x-3">
          <div className="bg-white/10 p-1.5 rounded-xl border border-white/10 flex items-center justify-center shrink-0">
            <img
              src={logoImg}
              alt="Destiny Logo"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div className="flex items-center">
            <span className="text-lg font-black text-white tracking-tight">destiny</span>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-[#0096f0]/20 text-[#38bdf8] border border-[#0096f0]/30 rounded">
              Admin
            </span>
          </div>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0096f0] text-white font-semibold shadow-lg shadow-[#0096f0]/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050e26] flex relative">
      {/* Desktop / Large Tablet Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#071439] border-r border-white/10 flex-col shrink-0">
        <NavContent />
      </aside>

      {/* Mobile / Tablet Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Mobile / Tablet Sliding Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#071439] border-r border-white/10 flex flex-col transform transition-transform duration-200 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#050e26]">
        {/* Top Header */}
        <header className="h-16 bg-[#071439]/90 border-b border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg lg:hidden transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex items-center text-xs text-slate-400">
              <span className="font-semibold text-white">Destiny Platform</span>
              <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-500" />
              <span className="text-[#38bdf8] font-semibold">Administration Portal</span>
            </div>
            <div className="sm:hidden flex items-center space-x-2">
              <img src={logoImg} alt="Destiny Logo" className="h-6 w-auto" />
              <span className="text-xs font-bold text-white">Admin</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-7 h-7 rounded-full bg-[#0096f0] text-white flex items-center justify-center text-xs font-bold shadow-md shadow-[#0096f0]/30">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left pr-1 hidden sm:block">
                <p className="text-xs font-semibold text-white leading-none">
                  {user?.full_name || 'Administrator'}
                </p>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {user?.email || 'admin@destiny.com'}
                </p>
              </div>
              <ShieldCheck className="w-4 h-4 text-[#38bdf8] shrink-0" />
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#050e26]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

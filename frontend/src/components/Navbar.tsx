import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Moon, Sun, ChevronDown, User, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { name: 'URL Checker', href: '/url-checker' },
  { name: 'Email Checker', href: '/email-checker' },
  { name: 'SMS Checker', href: '/sms-checker' },
  {
    name: 'More Tools',
    href: '#',
    children: [
      { name: 'Screenshot Scanner', href: '/screenshot-scanner' },
      { name: 'QR Code Scanner', href: '/qr-scanner' },
      { name: 'Community Reports', href: '/community-reports' },
    ],
  },
  { name: 'Scam Alerts', href: '/scam-alerts' },
  { name: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] safe-area-top">
      <nav className="container-page">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[#2563EB] rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-800 text-xl text-[#0F172A]">TrustLens</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setToolsOpen(true)}
                    onMouseLeave={() => setToolsOpen(false)}
                  >
                    <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#475569] hover:text-[#2563EB] rounded-xl hover:bg-[#F1F5F9] transition-colors duration-150">
                      {item.name}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {toolsOpen && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-lg border border-[#E2E8F0] py-2 animate-in">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            className="block px-4 py-2.5 text-sm text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-colors"
                            onClick={() => setToolsOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                      location.pathname === item.href
                        ? 'text-[#2563EB] bg-[#EFF6FF]'
                        : 'text-[#475569] hover:text-[#2563EB] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="ml-3 flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#475569] hover:text-[#2563EB] rounded-xl hover:bg-[#F1F5F9] transition-colors"
                >
                  <div className="w-8 h-8 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-lg border border-[#E2E8F0] py-2">
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2.5 text-sm text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="ml-3 btn-primary text-sm px-5 py-2">
                Sign In
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-[#F1F5F9] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl hover:bg-[#F1F5F9] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-[#F1F5F9] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-[#E2E8F0] py-4 px-1 space-y-1">
            {navigation.map((item) => (
              item.children ? (
                <div key={item.name} className="space-y-0.5">
                  <span className="block px-3 py-2 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    {item.name}
                  </span>
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      to={child.href}
                      className="block px-3 py-3 text-sm text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] rounded-xl"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-3 text-sm font-medium text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] rounded-xl"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
            <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-2 text-sm text-[#475569]">
                    <User className="w-4 h-4" />
                    <span className="truncate">{user?.name}</span>
                  </div>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-3 py-3 text-sm font-medium text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] rounded-xl"
                      onClick={() => setMobileOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full text-left px-3 py-3 text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-3 text-sm font-semibold text-[#2563EB] hover:bg-[#F8FAFC] rounded-xl"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Server, Zap } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { path: '/services', label: 'Services', icon: Server },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-card mx-4 mt-2 rounded-2xl' : 'border-b border-white/5'
      }`}
      style={{ background: scrolled ? undefined : 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
          >
            <Zap size={18} className="text-white" />
          </motion.div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight">IncidentIQ</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-2">
          {links.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-white glow-purple'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={active ? {
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))',
                    border: '1px solid rgba(139,92,246,0.3)'
                  } : {}}
                >
                  <Icon size={15} />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
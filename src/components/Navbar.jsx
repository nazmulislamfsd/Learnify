import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, BookOpen, User, LogOut, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import Logo from './Logo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === '/';

  // Check login state on mount & path changes
  useEffect(() => {
    const rawUser = localStorage.getItem('currentUser');
    if (rawUser) {
      try {
        setCurrentUser(JSON.parse(rawUser));
      } catch (e) {
        console.error(e);
      }
    } else {
      setCurrentUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('enrolled_courses');
    setCurrentUser(null);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Intersection Observer for active section - only on landing page
    let observer;
    if (isLandingPage) {
      const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0
      };

      const observerCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      };

      observer = new IntersectionObserver(observerCallback, observerOptions);
      const sections = ['home', 'courses', 'faq', 'about', 'contact'];
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observer) observer.disconnect();
    };
  }, [isLandingPage]);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Courses', href: '#courses' },
    { name: 'FAQ', href: '#faq' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Admin Dashboard', href: '/admin' },
  ];

  const isAdmin = currentUser && (currentUser.role === 'Admin' || currentUser.email === 'admin@example.com');
  const visibleNavLinks = navLinks.filter((link) => {
    if (link.href === '/admin' && !isAdmin) return false;
    if (link.href === '/dashboard' && (!currentUser || isAdmin)) return false;
    return true;
  });

  const handleNavLinkClick = (e, href) => {
    if (href.startsWith('#')) {
      if (!isLandingPage) {
        e.preventDefault();
        navigate('/' + href);
      }
    } else {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4',
        isScrolled ? 'py-3' : 'py-6'
      )}
    >
      <div className={cn(
        'max-w-7xl mx-auto rounded-full transition-all duration-300 px-6 py-2 flex items-center justify-between',
        isScrolled ? 'glass-dark shadow-2xl' : 'bg-transparent'
      )}>
        <div className="flex items-center gap-2">
          <Link to="/" className="outline-none">
            <Logo />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {visibleNavLinks.map((link) => {
            const isHash = link.href.startsWith('#');
            const isActive = isHash 
              ? (activeSection === link.href.replace('#', '') && isLandingPage)
              : (location.pathname === link.href);

            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavLinkClick(e, link.href)}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full',
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {link.name}
              </a>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60 font-mono">
                {currentUser.name}
              </span>
              <button 
                title={isAdmin ? "Go to Admin Dashboard" : "Go to Dashboard"}
                onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                className="w-10 h-10 rounded-full glass hover:border-brand-primary/40 flex items-center justify-center overflow-hidden border-orange-500/20"
              >
                <User className="w-5 h-5 text-brand-primary" />
              </button>
              <button 
                title="Log Out Student" 
                onClick={handleLogout} 
                className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium hover:text-brand-primary transition-all">Login</Link>
              <Link to="/register" className="px-6 py-2 bg-brand-primary text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 group">
                Register
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>


        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-6 right-6 p-6 glass-dark rounded-3xl md:hidden flex flex-col gap-2"
          >
            {visibleNavLinks.map((link) => {
              const isHash = link.href.startsWith('#');
              const isActive = isHash 
                ? (activeSection === link.href.replace('#', '') && isLandingPage)
                : (location.pathname === link.href);

              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    handleNavLinkClick(e, link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    'text-lg font-medium px-4 py-3 rounded-2xl transition-all duration-300',
                    isActive ? 'bg-brand-primary text-white' : 'text-white/60 hover:bg-white/5 active:bg-white/10'
                  )}
                >
                  {link.name}
                </a>
              );
            })}
            <div className="h-px bg-white/10 w-full my-4" />
            <div className="flex flex-col gap-4">
              {currentUser ? (
                <>
                  <div className="text-center text-xs text-white/50 font-mono py-1">
                    Logged in as: <span className="text-brand-primary">{currentUser.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate(isAdmin ? '/admin' : '/dashboard');
                    }} 
                    className="w-full py-4 glass rounded-2xl font-medium text-center text-sm"
                  >
                    Go to {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                  </button>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }} 
                    className="w-full py-4 bg-red-500/10 text-red-400 hover:bg-red-500/25 rounded-2xl font-semibold text-center text-sm transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 glass rounded-2xl font-medium text-center">Login</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-semibold text-center">Register</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

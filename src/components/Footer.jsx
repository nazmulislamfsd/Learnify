import { Mail, Github, Twitter, Instagram, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-black py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/">
              <Logo className="scale-110 origin-left" />
            </Link>
          </div>
          <p className="text-white/40 max-w-sm mb-8 leading-relaxed">
            The world's most advanced learning platform for creative professionals and developers. Join 2.4k+ students leveling up their careers today.
          </p>
          <div className="flex gap-4">
            {[Twitter, Github, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/50 hover:text-brand-primary hover:border-brand-primary/50 transition-all">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold text-lg mb-6">Platform</h4>
          <ul className="space-y-4 text-white/40 text-sm">
            <li><a href="#" className="hover:text-brand-primary transition-colors">Courses</a></li>
            <li><a href="#" className="hover:text-brand-primary transition-colors">Instructor Panel</a></li>
            <li><a href="#" className="hover:text-brand-primary transition-colors">Certificates</a></li>
            <li><a href="#" className="hover:text-brand-primary transition-colors">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-lg mb-6">Newsletter</h4>
          <p className="text-sm text-white/40 mb-4">Get the latest course updates and student tips.</p>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-primary transition-all"
              />
            </div>
            <button className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20 font-medium uppercase tracking-[0.2em]">
        <span>&copy; 2026 Learnyfy. All Rights Reserved.</span>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

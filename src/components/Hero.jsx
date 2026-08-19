import { motion } from 'motion/react';
import { Play, Star, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section id="home" className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-orange-500/20 text-brand-primary text-sm font-semibold mb-8">
              <Star className="w-4 h-4" />
              Over 2,400+ Active Students
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] mb-8">
              Elevate Your <span className="gradient-text">Skills</span> with Learnify
            </h1>
            <p className="text-xl text-white/60 mb-10 max-w-lg leading-relaxed">
              Experience the next generation of online learning. Premium courses delivered through a world-class interface.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/courses" 
                className="px-10 py-5 bg-brand-primary text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/30 text-center"
              >
                Explore Courses
              </Link>
              <button className="px-8 py-5 glass hover:bg-white/10 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-brand-primary fill-brand-primary" />
                </div>
                Watch Preview
              </button>
            </div>

            <div className="mt-16 flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-bold">120+</span>
                <span className="text-sm text-white/40 uppercase tracking-widest">Premium Courses</span>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold">15k+</span>
                <span className="text-sm text-white/40 uppercase tracking-widest">Enrollments</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                alt="Online Learning" 
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 glass p-6 rounded-3xl backdrop-blur-xl border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="text-brand-primary w-5 h-5" />
                    <span className="font-bold text-sm">Verified Path</span>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">Industry recognized certifications for your career growth.</p>
                </div>
                <div className="flex-1 glass p-6 rounded-3xl backdrop-blur-xl border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="text-blue-400 w-5 h-5" />
                    <span className="font-bold text-sm">Global Alumni</span>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">Join a network of 15k+ successful professionals worldwide.</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-primary/20 rounded-full mix-blend-screen blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full mix-blend-screen blur-[100px] pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

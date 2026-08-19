import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FAQAccordion from '../components/FAQAccordion';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { Star, Clock, BarChart, ChevronRight, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCourses } from '../lib/dataStore';

export default function Landing() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses().then((data) => {
      setCourses(data || []);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-primary">
      <Navbar />
      <Hero />

      {/* Featured Courses */}
      <section id="courses" className="py-24 px-6 relative">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-5xl font-bold mb-4">Curated <span className="gradient-text">Learning</span> Paths</h2>
              <p className="text-white/50 text-lg max-w-xl">Deep-dive into specialized tech tracks designed by industry veterans.</p>
            </div>
            <Link 
              to="/courses" 
              className="px-6 py-3 glass hover:bg-white/10 rounded-2xl font-bold flex items-center gap-2 transition-all"
            >
              View All Courses
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-white/40 font-mono text-sm gap-2">
              <span className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand-primary animate-spin" />
              <span>Checking course catalogs...</span>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 3).map((course) => (
                <Link 
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="block"
                >
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="group glass rounded-3xl overflow-hidden flex flex-col h-full border-white/5 hover:border-brand-primary/20 transition-all aspect-square"
                  >
                    <div className="relative h-1/2 overflow-hidden">
                      <img 
                        src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"} 
                        alt={course.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop";
                        }}
                      />
                      <div className="absolute top-3 right-3 px-2 py-1 glass rounded-full text-[8px] font-bold uppercase tracking-widest text-brand-primary">
                        {course.level}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-orange-400">
                          {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                        </div>
                        <span className="text-[9px] uppercase font-bold text-white/30">4.9</span>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-2 group-hover:text-brand-primary transition-colors leading-tight line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/40">Instructor</span>
                          <span className="font-semibold text-xs">{course.instructor}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-white/40 block">Price</span>
                          <span className="text-xl font-bold text-brand-primary">${course.price}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 px-6 glass rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
              <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-full mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Build Your Catalog</h3>
              <p className="text-xs text-white/50 mb-6">
                No courses are currently active in the database catalog. Use the Administrator dashboard to create or manually import dynamic learning pathways.
              </p>
              <Link 
                to="/courses" 
                className="px-5 py-2.5 text-xs font-semibold bg-brand-primary hover:opacity-90 text-white rounded-xl transition-colors cursor-pointer"
              >
                Browse Syllabus System
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section className="py-24 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          {[
            { icon: BarChart, label: 'Success Rate', value: '98%' },
            { icon: Clock, label: 'Course Hours', value: '1.4k+' },
            { icon: Users, label: 'Active Students', value: '2.4k' },
            { icon: Star, label: 'Expert Mentors', value: '50+' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-brand-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-4xl font-bold mb-1">{stat.value}</span>
              <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <FAQAccordion />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

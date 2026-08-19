import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCourses } from '../lib/dataStore';

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getCourses().then(data => {
      setCourses(data || []);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-primary">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-6xl font-bold mb-4 tracking-tighter">
              All <span className="gradient-text">Courses</span>
            </h1>
            <p className="text-white/50 text-xl max-w-2xl">
              Browse our complete library of professional-grade technical courses.
            </p>
          </div>

          {/* Course Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link key={course.id} to={`/course/${course.id}`} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
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

                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-4">
                      {course.category}
                    </div>
                    
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

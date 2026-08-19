import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { BookOpen, PlayCircle, Trophy, Clock, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses, getMe } from '../lib/dataStore';

export default function Dashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const rawUser = localStorage.getItem('currentUser');
    if (!rawUser) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      if (user.role === 'Admin' || user.email === 'admin@example.com') {
        navigate('/admin');
        return;
      }

      // Fetch live user status directly from server
      getMe(user.email).then(async (res) => {
        const liveUser = res?.user || user;
        localStorage.setItem('currentUser', JSON.stringify(liveUser));
        localStorage.setItem('enrolled_courses', JSON.stringify(liveUser.enrolledIds || []));

        const courses = await getCourses();
        const activeEnrolledIds = liveUser.enrolledIds || [];
        const filtered = (courses || []).filter(c => activeEnrolledIds.includes(c.id));
        setEnrolledCourses(filtered);
        setCheckingAuth(false);
      }).catch(() => {
        setCheckingAuth(false);
      });

    } catch (e) {
      console.error(e);
      setCheckingAuth(false);
    }
    
    window.scrollTo(0, 0);
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono text-sm gap-2">
        <span className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand-primary animate-spin" />
        <span>Authenticating session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-primary">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-8 h-1 bg-brand-primary rounded-full" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary">Student Center</span>
              </motion.div>
              <h1 className="text-6xl font-bold tracking-tighter">
                My <span className="gradient-text">Dashboard</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-white/5">
                <Trophy className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="text-xs text-white/30 font-bold uppercase tracking-widest">Achieved</div>
                  <div className="font-bold">0 Certificates</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {[
              { label: 'Courses Enrolled', value: enrolledCourses.length, icon: BookOpen, color: 'text-blue-400' },
              { label: 'Completed', value: '0', icon: Trophy, color: 'text-orange-400' },
              { label: 'Learning Hours', value: '0h', icon: Clock, color: 'text-teal-400' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-3xl border-white/5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-xs text-white/40 font-bold uppercase tracking-widest">{stat.label}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Courses List */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight mb-8 flex items-center gap-3">
              Continue <span className="text-brand-primary italic">Learning</span>
            </h2>

            {enrolledCourses.length > 0 ? (
              <div className="grid gap-6">
                {enrolledCourses.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass group p-6 rounded-[2.5rem] border-white/5 hover:border-brand-primary/20 transition-all flex flex-col md:flex-row items-center gap-8"
                  >
                    <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden relative shadow-2xl">
                      <img 
                        src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"} 
                        alt={course.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <span className="px-2 py-0.5 glass rounded-full text-[8px] font-bold uppercase tracking-widest text-brand-primary">
                          {course.level}
                        </span>
                        <span className="text-white/20 text-xs">•</span>
                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{course.category}</span>
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight group-hover:text-brand-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-white/40 text-sm font-medium">By {course.instructor}</p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-4">
                      <div className="w-full md:w-48 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-0 bg-brand-primary rounded-full" />
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">0% Complete</div>
                        <Link 
                          to={`/course/${course.id}`}
                          className="flex-1 md:flex-none glass px-6 py-3 rounded-2xl font-bold text-sm hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center glass rounded-[3rem] border-white/5 bg-white/[0.02]">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">No Active Enrollments</h3>
                <p className="text-white/40 mb-8 max-w-sm mx-auto">
                  Start your learning journey today and master world-class technical skills from industry experts.
                </p>
                <Link 
                  to="/courses"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:scale-105 transition-all"
                >
                  Browse Courses
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

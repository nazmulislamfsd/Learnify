import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { getCourses, getMe, verifyCourseAccess, saveTransaction, approveTransaction, registerUser } from '../lib/dataStore';
import { cn } from '../lib/utils';
import { 
  Star, 
  Clock, 
  ChevronRight, 
  Users, 
  ShieldCheck, 
  PlayCircle, 
  CheckCircle2, 
  X,
  Lock,
  AlertCircle,
  ExternalLink,
  Wallet,
  Maximize2,
  Minimize2,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  MoreHorizontal,
  Volume2,
  RotateCcw,
  RotateCw,
  Settings,
  MessageSquare,
  Pause,
  SkipBack,
  SkipForward,
  FastForward,
  VolumeX,
  Captions,
  Tv,
  VideoOff,
  Sparkles,
  Unlock,
  CreditCard,
  Phone,
  Hash,
  User,
  Mail,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form' | 'submitting' | 'pending_approval' | 'success'
  const [selectedMethod, setSelectedMethod] = useState('bkash');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [submittedTxnId, setSubmittedTxnId] = useState('');
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [playerSize, setPlayerSize] = useState('normal'); // 'small' | 'normal' | 'large'
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const videoRef = useRef(null);

  const getLessonTitle = (item) => {
    if (!item) return '';
    return typeof item === 'object' ? item.title : item;
  };

  const getLessonVideo = (item) => {
    if (!item) return '';
    return typeof item === 'object' ? item.videoUrl : '';
  };

  const parseVideoSource = (url, autoPlay = false) => {
    if (!url) return null;
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(ytRegex);
    if (match) {
      return { 
        type: 'youtube', 
        id: match[1], 
        url: `https://www.youtube.com/embed/${match[1]}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1` 
      };
    }
    return { type: 'direct', url };
  };

  // Real backend access checker
  const checkAccessWithServer = async (userEmail, courseId) => {
    if (!userEmail || !courseId) return false;
    try {
      const res = await verifyCourseAccess(userEmail, courseId);
      if (res && res.hasAccess) {
        setIsEnrolled(true);
        // Sync local storage state
        const enrolledCourses = JSON.parse(localStorage.getItem('enrolled_courses') || '[]');
        if (!enrolledCourses.includes(courseId)) {
          enrolledCourses.push(courseId);
          localStorage.setItem('enrolled_courses', JSON.stringify(enrolledCourses));
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleSelectLesson = (item) => {
    setActiveLesson(item);
    if (isEnrolled) {
      setShouldAutoPlay(true);
    }
    const playerEl = document.getElementById('lesson-player-container');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    // Load course
    getCourses().then(coursesList => {
      const found = (coursesList || []).find(c => c.id === id);
      const targetCourse = found || (coursesList && coursesList[0]);
      setCourse(targetCourse);

      // Load initial lesson
      if (targetCourse) {
        if (targetCourse.curriculum && targetCourse.curriculum.length > 0) {
          setActiveLesson(targetCourse.curriculum[0]);
        } else if (targetCourse.videoUrl) {
          setActiveLesson({ title: targetCourse.title || 'Lesson 1', videoUrl: targetCourse.videoUrl });
        }
      }
    });

    // Check user & real server access
    const rawUser = localStorage.getItem('currentUser');
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        setCurrentUser(u);
        setGuestName(u.name || '');
        setGuestEmail(u.email || '');

        if (u.role === 'Admin' || u.email === 'admin@example.com') {
          setIsEnrolled(true);
        } else {
          checkAccessWithServer(u.email, id);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setIsEnrolled(false);
    }
    
    window.scrollTo(0, 0);
  }, [id]);

  // Periodic polling for pending approvals when user is waiting
  useEffect(() => {
    let interval;
    if (currentUser && !isEnrolled) {
      interval = setInterval(() => {
        checkAccessWithServer(currentUser.email, id);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser, isEnrolled, id]);

  useEffect(() => {
    if (isEnrolled && shouldAutoPlay && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay handled by browser media policy
        });
      }
    }
  }, [activeLesson, shouldAutoPlay, isEnrolled]);

  if (!course) return null;

  const lessonVideoUrl = activeLesson ? getLessonVideo(activeLesson) : '';
  const parsedVideo = parseVideoSource(lessonVideoUrl, shouldAutoPlay);

  const bdtPrice = Math.round(course.price * 120);

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', number: '01712-345678 (Personal)', color: 'bg-[#D12053]', textColor: 'text-white' },
    { id: 'nagad', name: 'Nagad', number: '01812-345678 (Merchant)', color: 'bg-[#F7941E]', textColor: 'text-white' },
    { id: 'rocket', name: 'Rocket', number: '01912-345678 (Personal)', color: 'bg-[#8C3494]', textColor: 'text-white' },
    { id: 'ssl', name: 'SSLCommerz', number: 'Visa / Mastercard / Amex', color: 'bg-[#005fb9]', textColor: 'text-white' },
  ];

  const currentMethodObj = paymentMethods.find(m => m.id === selectedMethod) || paymentMethods[0];

  const handleSubmitRealPayment = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    let activeUser = currentUser;

    // If student is not logged in, auto-register or create active student
    if (!activeUser) {
      if (!guestName.trim() || !guestEmail.trim()) {
        setError('Please enter your full name and email address to create your account.');
        return;
      }
      const pwd = guestPassword || '123456';
      const regRes = await registerUser(guestName.trim(), guestEmail.trim(), pwd);
      if (regRes.error && !regRes.error.includes('already exists')) {
        setError(regRes.error);
        return;
      }
      activeUser = regRes.user || { name: guestName.trim(), email: guestEmail.trim() };
      localStorage.setItem('currentUser', JSON.stringify(activeUser));
      setCurrentUser(activeUser);
    }

    setPaymentStep('submitting');

    try {
      const generatedTrxId = trxId.trim() || `TX-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const res = await fetch('/api/enroll-instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: activeUser.name,
          studentEmail: activeUser.email,
          courseId: course.id,
          amount: course.price,
          method: currentMethodObj.name,
          senderPhone: senderPhone.trim() || '01712000000',
          transactionId: generatedTrxId
        })
      });

      const data = await res.json();

      if (data.success) {
        // Update local session
        const currentEnrolled = JSON.parse(localStorage.getItem('enrolled_courses') || '[]');
        if (!currentEnrolled.includes(course.id)) {
          currentEnrolled.push(course.id);
          localStorage.setItem('enrolled_courses', JSON.stringify(currentEnrolled));
        }

        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          setCurrentUser(data.user);
        }

        setIsEnrolled(true);
        setPaymentStep('success');
        setShouldAutoPlay(true);

        // Auto-select first lesson
        if (course.curriculum && course.curriculum.length > 0 && !activeLesson) {
          setActiveLesson(course.curriculum[0]);
        }
      } else {
        setError(data.error || 'Enrollment failed. Please try again.');
        setPaymentStep('form');
      }
    } catch (err) {
      console.error(err);
      setError('Payment submission failed. Please try again.');
      setPaymentStep('form');
    }
  };

  // Instant 1-Click Enrollment
  const handleInstantEnroll = async () => {
    setError(null);
    let activeUser = currentUser;

    if (!activeUser) {
      const demoEmail = `student${Math.floor(100 + Math.random() * 900)}@example.com`;
      const demoName = 'Learner ' + Math.floor(100 + Math.random() * 900);
      const regRes = await registerUser(demoName, demoEmail, '123456');
      activeUser = regRes.user || { name: demoName, email: demoEmail };
      localStorage.setItem('currentUser', JSON.stringify(activeUser));
      setCurrentUser(activeUser);
    }

    setPaymentStep('submitting');
    setShowPaymentModal(true);

    try {
      const res = await fetch('/api/enroll-instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: activeUser.name,
          studentEmail: activeUser.email,
          courseId: course.id,
          amount: course.price,
          method: 'Instant 1-Click',
          senderPhone: 'Instant',
          transactionId: `INST-${Date.now()}`
        })
      });

      const data = await res.json();

      if (data.success) {
        const currentEnrolled = JSON.parse(localStorage.getItem('enrolled_courses') || '[]');
        if (!currentEnrolled.includes(course.id)) {
          currentEnrolled.push(course.id);
          localStorage.setItem('enrolled_courses', JSON.stringify(currentEnrolled));
        }

        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          setCurrentUser(data.user);
        }

        setIsEnrolled(true);
        setPaymentStep('success');
        setShouldAutoPlay(true);

        if (course.curriculum && course.curriculum.length > 0 && !activeLesson) {
          setActiveLesson(course.curriculum[0]);
        }
      } else {
        setError(data.error || 'Instant enrollment failed.');
        setPaymentStep('form');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
      setPaymentStep('form');
    }
  };

  // Helper to autofill realistic demo credentials for testing
  const handleAutoFillDemo = () => {
    if (!currentUser) {
      setGuestName('Demo Student');
      setGuestEmail(`student${Math.floor(100 + Math.random() * 900)}@example.com`);
    }
    const sampleDigits = Math.floor(10000000 + Math.random() * 90000000);
    setSenderPhone(`017${Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)}`);
    setTrxId(`BK${sampleDigits.toString().slice(0, 8).toUpperCase()}`);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeLesson && (
            <motion.div 
              id="lesson-player-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "mb-12 bg-black rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative transition-all duration-500 ease-in-out scroll-mt-28",
                playerSize === 'small' && "max-w-3xl mx-auto w-full",
                playerSize === 'normal' && "max-w-5xl mx-auto w-full",
                playerSize === 'large' && "max-w-7xl mx-auto w-full"
              )}
            >
              <div className="aspect-video relative bg-[#050505] flex items-center justify-center overflow-hidden">
                {/* LOCKED CONTENT GATE */}
                {!isEnrolled ? (
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#0a0a0a]/95 to-black flex flex-col items-center justify-center text-center p-8 z-20 select-none overflow-hidden">
                    {course.thumbnail && (
                      <img 
                        src={course.thumbnail} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md pointer-events-none scale-105" 
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary mb-4 shadow-lg shadow-brand-primary/10">
                        <Lock className="w-8 h-8" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary mb-1">
                        Locked Masterclass Content
                      </span>
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                        {getLessonTitle(activeLesson) || "Lesson Access Restricted"}
                      </h3>
                      <p className="text-xs text-white/60 mb-6 leading-relaxed max-w-sm">
                        Real course access is strictly reserved for enrolled students. Complete your enrollment to stream all video lectures, download project files, and earn certificates.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                        <button 
                          onClick={() => {
                            setPaymentStep('form');
                            setShowPaymentModal(true);
                          }}
                          className="w-full sm:w-auto px-6 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Unlock className="w-4 h-4" />
                          <span>Enroll to Unlock (${course.price})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : parsedVideo && parsedVideo.type === 'youtube' ? (
                  <iframe
                    key={`${parsedVideo.url}-${shouldAutoPlay}`}
                    src={parsedVideo.url}
                    title="Course Lesson Player"
                    className="w-full h-full border-0 absolute inset-0 z-20"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : parsedVideo && parsedVideo.type === 'direct' && parsedVideo.url ? (
                  <video
                    ref={videoRef}
                    key={`${parsedVideo.url}-${shouldAutoPlay}`}
                    src={parsedVideo.url}
                    controls
                    autoPlay={shouldAutoPlay}
                    preload="auto"
                    playsInline
                    className="w-full h-full object-contain bg-black z-20"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/50 gap-4 p-8 text-center z-10 select-none py-16">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary mb-1 shadow-inner">
                      <VideoOff className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white tracking-wide uppercase">Video Not Available</h3>
                      <p className="text-xs text-white/40 max-w-sm">No video has been uploaded or provided for this lesson yet.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Active Lesson Meta */}
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {isEnrolled ? (
                    <button 
                      type="button"
                      disabled={!parsedVideo}
                      onClick={() => {
                        if (!parsedVideo) return;
                        setShouldAutoPlay(true);
                        if (videoRef.current) {
                          videoRef.current.play().catch(() => {});
                        }
                      }}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        parsedVideo 
                          ? "bg-brand-primary/20 hover:bg-brand-primary text-brand-primary hover:text-white cursor-pointer group/play" 
                          : "bg-white/5 text-white/20 cursor-not-allowed"
                      )}
                      title={parsedVideo ? "Start Lesson" : "Video Not Available"}
                    >
                      {parsedVideo ? (
                        <PlayCircle className="w-5 h-5 group-hover/play:scale-110 transition-transform" />
                      ) : (
                        <VideoOff className="w-5 h-5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        setPaymentStep('form');
                        setShowPaymentModal(true);
                      }}
                      className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all cursor-pointer"
                      title="Enroll to Unlock"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                  <div>
                    <div className="text-sm font-black text-white italic">{getLessonTitle(activeLesson)}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      {!isEnrolled ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Enrollment Required
                        </span>
                      ) : parsedVideo ? (
                        shouldAutoPlay ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-green-400">Playing</span>
                          </>
                        ) : (
                          <span className="text-brand-primary">Selected (Click to Start)</span>
                        )
                      ) : (
                        <span className="text-amber-400/80">Video Not Available</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Interactive toggle for player size */}
                  <span 
                    type="button"
                    onClick={() => {
                      if (playerSize === 'small') setPlayerSize('normal');
                      else if (playerSize === 'normal') setPlayerSize('large');
                      else setPlayerSize('small');
                    }}
                    className="px-2 py-1 text-[9px] font-bold uppercase tracking-wide rounded cursor-pointer transition-all select-none bg-white/5 hover:bg-white/10 text-white/60 flex items-center gap-1"
                    title="Click to toggle player display size"
                  >
                    Size: <span className="text-brand-primary">{playerSize}</span>
                  </span>
                  <button 
                    onClick={() => setActiveLesson(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex items-center gap-4 mb-4 text-xs font-bold uppercase tracking-widest text-brand-primary">
                <span>{course.level}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-white/40">{course.category}</span>
                {isEnrolled && (
                  <>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Enrolled
                    </span>
                  </>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
                {course.title}
              </h1>

              <div className="flex items-center gap-6 mb-8 text-xs font-bold text-white/30 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> 4.9</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 1.2k</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.hours}h</span>
              </div>

              {!activeLesson && (
                <div 
                  className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/5 group mb-10 bg-white/[0.02] cursor-pointer" 
                  onClick={() => {
                    if (course.curriculum && course.curriculum.length > 0) {
                      handleSelectLesson(course.curriculum[0]);
                    } else {
                      setActiveLesson({ title: 'Course Preview & Promo', videoUrl: course.videoUrl });
                    }
                  }}
                >
                  <img 
                    src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"} 
                    alt={course.title} 
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-100 group-hover:bg-black/20 transition-all duration-300">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (course.curriculum && course.curriculum.length > 0) {
                          handleSelectLesson(course.curriculum[0]);
                        } else {
                          setActiveLesson({ title: 'Course Preview & Promo', videoUrl: course.videoUrl });
                        }
                      }}
                      className="w-20 h-20 bg-brand-primary text-white rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-md cursor-pointer"
                    >
                      {isEnrolled ? (
                        <PlayCircle className="w-10 h-10 fill-white ml-0.5" />
                      ) : (
                        <Lock className="w-8 h-8 text-white" />
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h2 className="text-xl font-bold">About</h2>
                <p className="text-base text-white/70 leading-relaxed max-w-2xl text-balance">
                  Master {course.title} with this intensive {course.hours}-hour masterclass. 
                  Focused on production-ready patterns and performance.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Lessons</h2>
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                  {isEnrolled ? (
                    <span className="text-emerald-400">All Lessons Unlocked</span>
                  ) : (
                    <span className="text-amber-400/80 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Enrollment Required
                    </span>
                  )}
                </span>
              </div>

              <div className="space-y-1.5">
                {(course.curriculum || []).map((item, i) => {
                  const isActive = activeLesson && getLessonTitle(activeLesson) === getLessonTitle(item);
                  const hasVideo = Boolean(getLessonVideo(item));
                  return (
                    <div 
                      key={i} 
                      onClick={() => handleSelectLesson(item)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all cursor-pointer group",
                        isActive 
                          ? isEnrolled 
                            ? "bg-brand-primary/15 border border-brand-primary/30 text-brand-primary font-bold shadow-sm"
                            : "bg-white/5 border border-amber-500/30 text-white font-bold"
                          : "hover:bg-brand-primary/10 text-white/90 hover:text-brand-primary border border-transparent"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-center",
                        isActive && isEnrolled 
                          ? "bg-brand-primary text-white" 
                          : "bg-white/5 text-white/40 group-hover:text-brand-primary"
                      )}>
                        {i + 1}
                      </span>
                      <span className="text-sm truncate">{getLessonTitle(item)}</span>
                      <div className="ml-auto flex items-center gap-2">
                        {isEnrolled ? (
                          <>
                            {isActive ? (
                              <span className={cn(
                                "text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                                !hasVideo 
                                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                                  : shouldAutoPlay 
                                    ? "text-green-400 bg-green-500/10 border border-green-500/20" 
                                    : "text-brand-primary bg-brand-primary/10 border border-brand-primary/20"
                              )}>
                                {hasVideo && shouldAutoPlay && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                                {!hasVideo ? 'Video Not Available' : shouldAutoPlay ? 'Playing' : 'Selected'}
                              </span>
                            ) : !hasVideo ? (
                              <span className="text-[8px] uppercase tracking-widest text-white/20 group-hover:text-white/40 font-mono">
                                No Video
                              </span>
                            ) : null}
                            {hasVideo ? (
                              <PlayCircle className={cn(
                                "w-4 h-4 transition-all shrink-0",
                                isActive ? "text-brand-primary fill-brand-primary/20 scale-110" : "opacity-40 group-hover:opacity-100"
                              )} />
                            ) : (
                              <VideoOff className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 transition-opacity shrink-0" />
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-white/30 group-hover:text-brand-primary transition-colors">
                            <span className="text-[9px] font-bold uppercase tracking-wider hidden sm:inline">
                              {isActive ? 'Enroll to Unlock' : 'Locked'}
                            </span>
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-40">
              {!isEnrolled ? (
                <div className="bg-white/[0.02] p-6 sm:p-8 rounded-[2rem] border border-white/5 space-y-6">
                  <div>
                    <div className="text-3xl font-black mb-1">${course.price}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Lifetime Access</div>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        setPaymentStep('form');
                        setShowPaymentModal(true);
                      }}
                      className="w-full bg-brand-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-primary/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Enroll & Unlock Instantly</span>
                    </button>
                    
                    <button 
                      onClick={handleInstantEnroll}
                      className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-brand-primary border border-brand-primary/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Instant 1-Click Access</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
                    <div className="font-bold text-white/80 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-brand-primary">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Instant Access Guaranteed:</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      No admin waiting or manual verification needed. Submitting your enrollment automatically unlocks the full curriculum and all video lectures immediately.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                   <div className="flex items-center gap-2 text-emerald-400">
                     <CheckCircle2 className="w-4 h-4" />
                     <div className="text-xs font-black uppercase tracking-widest">Enrolled & Unlocked</div>
                   </div>
                   <div className="text-sm font-bold text-white/80">You have full lifetime access to all lessons.</div>
                   <button
                     onClick={() => {
                       if (course.curriculum && course.curriculum.length > 0) {
                         handleSelectLesson(course.curriculum[0]);
                       }
                     }}
                     className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                   >
                     Resume Course
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* REAL ENROLLMENT & PAYMENT MODAL */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass p-6 sm:p-8 rounded-[2.5rem] relative z-10 border-white/10 my-auto shadow-2xl"
            >
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {paymentStep === 'form' && (
                <form onSubmit={handleSubmitRealPayment} className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black mb-1 tracking-tight">Instant Course Enrollment</h3>
                    <p className="text-white/40 text-xs">Automatic lifetime unlock — no waiting for admin verification</p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAutoFillDemo}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-brand-primary" />
                        <span>Auto-Fill Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleInstantEnroll}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-primary border border-brand-primary/30 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        <span>1-Click Unlock</span>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Student Account Information (If guest) */}
                  {!currentUser ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">Student Information</span>
                        <Link to="/login" className="text-[10px] text-white/60 hover:text-white underline">Already registered? Log in</Link>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input 
                            type="text"
                            required
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="Your Full Name"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-primary"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input 
                            type="email"
                            required
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="Your Email"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-white/40">Enrolling as: </span>
                        <span className="font-bold text-white">{currentUser.name}</span>
                        <span className="text-white/40"> ({currentUser.email})</span>
                      </div>
                    </div>
                  )}

                  {/* Payment Gateway Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Select Payment Gateway</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedMethod(method.id)}
                          className={cn(
                            "p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1 cursor-pointer text-center relative",
                            selectedMethod === method.id 
                              ? 'border-brand-primary bg-brand-primary/10' 
                              : 'border-white/5 bg-white/5 hover:border-white/15'
                          )}
                        >
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs ${method.color} ${method.textColor}`}>
                            {method.name[0]}
                          </div>
                          <span className="text-[11px] font-bold text-white">{method.name}</span>
                          {selectedMethod === method.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary absolute top-1.5 right-1.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Method Instructions */}
                  <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-brand-primary uppercase tracking-wider">{currentMethodObj.name} Account:</span>
                      <span className="font-mono text-white select-all">{currentMethodObj.number}</span>
                    </div>
                    <div className="text-[11px] text-white/60 leading-relaxed">
                      Please send <strong>৳{bdtPrice.toLocaleString()}</strong> (${course.price}) via {currentMethodObj.name}. Enter your sender mobile number and Transaction ID (TrxID) below.
                    </div>
                  </div>

                  {/* Payment Inputs */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Sender Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input 
                          type="text"
                          required
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-brand-primary font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Transaction ID (TrxID)</label>
                      <div className="relative">
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input 
                          type="text"
                          required
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                          placeholder="9K82JDAL1"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-brand-primary uppercase font-mono tracking-wider"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Complete & Unlock Course Instantly</span>
                  </button>
                </form>
              )}

              {paymentStep === 'submitting' && (
                <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 border-4 border-t-transparent animate-spin rounded-full border-brand-primary" />
                  <h3 className="text-xl font-bold">Submitting Transaction...</h3>
                  <p className="text-white/40 text-xs">Sending payment receipt to platform database</p>
                </div>
              )}

              {paymentStep === 'pending_approval' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20 text-amber-400">
                    <Clock className="w-10 h-10 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 mb-1">
                      Payment Submitted Successfully
                    </span>
                    <h3 className="text-2xl font-black text-white mb-2">Pending Admin Approval</h3>
                    <p className="text-white/60 text-xs leading-relaxed max-w-sm mx-auto">
                      Your payment with TrxID <strong className="text-white font-mono">{submittedTxnId}</strong> has been logged. Admin will verify and activate your lifetime course access.
                    </p>
                  </div>

                  <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Status:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold uppercase text-[10px]">
                        Pending Review
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Amount:</span>
                      <span className="font-bold text-white">৳{bdtPrice.toLocaleString()} (${course.price})</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button 
                      onClick={handleManualCheckStatus}
                      disabled={checkingAccess}
                      className="flex-1 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-4 h-4", checkingAccess && "animate-spin")} />
                      <span>{checkingAccess ? "Checking..." : "Refresh Status"}</span>
                    </button>

                    <button 
                      onClick={handleInstantSandboxApprove}
                      disabled={checkingAccess}
                      className="flex-1 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-brand-primary/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Instant Sandbox Unlock</span>
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 text-emerald-400 shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-1">
                      Access Granted
                    </span>
                    <h3 className="text-3xl font-black text-white mb-2">Course Unlocked!</h3>
                    <p className="text-white/60 text-xs leading-relaxed max-w-sm mx-auto">
                      Your account has verified lifetime access to <strong className="text-white">{course.title}</strong>. All video lessons, curriculum modules, and player controls are unlocked.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowPaymentModal(false);
                      if (course.curriculum && course.curriculum.length > 0) {
                        handleSelectLesson(course.curriculum[0]);
                      }
                    }}
                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer shadow-xl shadow-brand-primary/20"
                  >
                    Start Learning Now
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Activity, 
  Sliders, 
  UserPlus,
  ArrowUpRight,
  TrendingDown,
  ShieldAlert,
  Percent,
  RefreshCw,
  Eye,
  Briefcase,
  UploadCloud,
  FileVideo,
  Film,
  CheckCircle2,
  Loader2,
  PlayCircle,
  Video,
  ImageIcon
} from 'lucide-react';
import { 
  getCourses, 
  saveCourse, 
  deleteCourse, 
  getStudents, 
  saveStudent, 
  getTransactions, 
  approveTransaction, 
  saveTransaction,
  getAppConfig, 
  saveAppConfig, 
  getLogs,
  addLog,
  revokeEnrollmentInDB,
  resetDatabaseInDB,
  uploadVideoFile,
  uploadMediaFile
} from '../lib/dataStore';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'courses' | 'students' | 'config'
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [appConfig, setAppConfig] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Graph Time Duration State
  const [graphDays, setGraphDays] = useState(30);

  // Form states for Course Add/Edit modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // null if adding new
  const [courseForm, setCourseForm] = useState({
    title: '',
    instructor: '',
    price: '',
    thumbnail: '',
    level: 'Beginner',
    category: 'Development',
    description: '',
    lessons: 10,
    hours: '5.0',
    curriculumInput: '' // comma separated initial input
  });
  const [curriculumList, setCurriculumList] = useState(['']);

  // Video and Media upload states
  const [chapterUploading, setChapterUploading] = useState({});
  const [chapterProgress, setChapterProgress] = useState({});
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Manual Enrollment Form States
  const [enrollForm, setEnrollForm] = useState({
    studentId: '',
    courseId: ''
  });

  // Success/Error notifications
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    try {
      const dbCourses = await getCourses();
      setCourses(dbCourses || []);
      const dbStudents = await getStudents();
      setStudents(dbStudents || []);
      const dbTxns = await getTransactions();
      setTransactions(dbTxns || []);
      const dbLogs = await getLogs();
      setSystemLogs(dbLogs || []);
      const dbConfig = await getAppConfig();
      setAppConfig(dbConfig || {});
    } catch (err) {
      console.error('Failed to load DB state in Admin:', err);
    }
  };

  useEffect(() => {
    const rawUser = localStorage.getItem('currentUser');
    if (!rawUser) {
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(rawUser);
      const userIsAdmin = user.role === 'Admin' || user.email === 'admin@example.com';
      if (!userIsAdmin) {
        navigate('/dashboard');
        return;
      }
    } catch (e) {
      navigate('/login');
      return;
    }

    setCheckingAuth(false);
    loadAllData();
    window.scrollTo(0, 0);
  }, [navigate]);

  // Compute stats metrics
  const totalCourses = courses.length;
  const totalStudents = students.length;
  const approvedTxns = transactions.filter(t => t.status === 'Approved');
  const pendingTxns = transactions.filter(t => t.status === 'Pending');
  const totalRevenue = approvedTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalEnrollments = students.reduce((sum, s) => sum + (s.enrolledIds?.length || 0), 0);

  // SVG-based dynamic analytics coordinates calculated using SVG path points
  const generateChartPoints = (days) => {
    const dataPoints = days === 7 
      ? [120, 240, 180, 290, 420, 390, 640] // 7 days data values
      : [120, 180, 240, 200, 290, 340, 310, 420, 390, 490, 580, 640, 610, 750, 890]; // 15 points scaled
    
    const count = dataPoints.length;
    const width = 800;
    const height = 180;
    const points = dataPoints.map((val, idx) => {
      const x = (idx / (count - 1)) * width;
      // Scale dynamic height
      const y = height - ((val / 1000) * height);
      return `${x},${y}`;
    }).join(' ');
    
    return { points, raw: dataPoints };
  };

  const chartPoints = generateChartPoints(graphDays);

  // Course handlers
  const handleOpenCourseModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        title: course.title || '',
        instructor: course.instructor || '',
        price: course.price || '',
        thumbnail: course.thumbnail || '',
        level: course.level || 'Beginner',
        category: course.category || 'Development',
        description: course.description || '',
        lessons: course.lessons || 10,
        hours: course.hours || '5.0',
        videoUrl: course.videoUrl || '',
        curriculumInput: ''
      });
      
      const formattedCurriculum = (course.curriculum || []).map(item => {
        if (typeof item === 'string') {
          return { title: item, videoUrl: '' };
        }
        return { title: item.title || '', videoUrl: item.videoUrl || '' };
      });
      setCurriculumList(formattedCurriculum.length > 0 ? formattedCurriculum : [{ title: '', videoUrl: '' }]);
    } else {
      setEditingCourse(null);
      setCourseForm({
        title: '',
        instructor: '',
        price: '',
        thumbnail: '',
        level: 'Beginner',
        category: 'Development',
        description: '',
        lessons: 12,
        hours: '6.0',
        videoUrl: 'https://www.youtube.com/watch?v=tehuE1VuPAs',
        curriculumInput: ''
      });
      setCurriculumList([
        { title: 'Intro & Getting Started', videoUrl: 'https://www.youtube.com/watch?v=tehuE1VuPAs' },
        { title: 'Core Implementation', videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0' },
        { title: 'Project Workspace Build', videoUrl: '' },
        { title: 'Deploying live', videoUrl: '' }
      ]);
    }
    setIsCourseModalOpen(true);
  };

  const handleCurriculumItemChange = (index, field, value) => {
    const updated = [...curriculumList];
    updated[index] = { ...updated[index], [field]: value };
    setCurriculumList(updated);
  };

  const handleAddCurriculumRow = () => {
    setCurriculumList([...curriculumList, { title: '', videoUrl: '' }]);
  };

  const handleRemoveCurriculumRow = (index) => {
    if (curriculumList.length === 1) return;
    const updated = curriculumList.filter((_, i) => i !== index);
    setCurriculumList(updated);
  };

  const handleChapterVideoUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setChapterUploading(prev => ({ ...prev, [index]: true }));
    setChapterProgress(prev => ({ ...prev, [index]: 0 }));
    try {
      const res = await uploadVideoFile(file, (percent) => {
        setChapterProgress(prev => ({ ...prev, [index]: percent }));
      });
      if (res && res.url) {
        handleCurriculumItemChange(index, 'videoUrl', res.url);
        showNotification(`Chapter #${index + 1} video "${file.name}" uploaded successfully!`);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to upload chapter video', 'error');
    } finally {
      setChapterUploading(prev => ({ ...prev, [index]: false }));
      e.target.value = '';
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const res = await uploadMediaFile(file);
      if (res && res.url) {
        setCourseForm(prev => ({ ...prev, thumbnail: res.url }));
        showNotification('Course thumbnail uploaded successfully!');
      }
    } catch (err) {
      showNotification('Failed to upload thumbnail', 'error');
    } finally {
      setUploadingThumbnail(false);
      e.target.value = '';
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.instructor || !courseForm.price) {
      showNotification('Please fill in required fields (Title, Instructor, Price)', 'error');
      return;
    }

    const payload = {
      id: editingCourse ? editingCourse.id : `crs-${Date.now()}`,
      title: courseForm.title,
      instructor: courseForm.instructor,
      price: parseFloat(courseForm.price),
      thumbnail: courseForm.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop',
      level: courseForm.level,
      category: courseForm.category,
      description: courseForm.description,
      lessons: parseInt(courseForm.lessons) || 10,
      hours: courseForm.hours || '5.0',
      videoUrl: courseForm.videoUrl || '',
      curriculum: curriculumList.filter(item => (item.title || '').trim() !== '')
    };

    await saveCourse(payload);
    await loadAllData();
    setIsCourseModalOpen(false);
    showNotification(editingCourse ? 'Course updated successfully' : 'New course published successfully');
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? This will remove it from search and catalogs.')) {
      await deleteCourse(id);
      await loadAllData();
      showNotification('Course deleted successfully');
    }
  };

  // Enrollment actions
  const handleApproveTransaction = async (txnId) => {
    await approveTransaction(txnId);
    await loadAllData();
    showNotification('Transaction approved! Student has been enrolled.');
  };

  const handleManualEnroll = async (e) => {
    e.preventDefault();
    if (!enrollForm.studentId || !enrollForm.courseId) {
      showNotification('Please select both a student and a course', 'error');
      return;
    }

    const student = (students || []).find(s => s.id === enrollForm.studentId);
    const course = (courses || []).find(c => c.id === enrollForm.courseId);

    if (!student || !course) {
      showNotification('Selection mismatch. Try again.', 'error');
      return;
    }

    if (student.enrolledIds.includes(course.id)) {
      showNotification(`${student.name} is already enrolled in this course.`, 'error');
      return;
    }

    // Enroll
    const updatedStudent = {
      ...student,
      enrolledIds: [...(student.enrolledIds || []), course.id],
      status: 'Active'
    };
    await saveStudent(updatedStudent);

    // Create a mock transaction record to log payment
    const newTxn = {
      id: `txn-m-${Date.now()}`,
      studentName: student.name,
      studentEmail: student.email,
      courseTitle: course.title,
      courseId: course.id,
      amount: course.price,
      method: 'Admin Enrollment',
      transactionId: 'ADM-BYPASS-' + Math.floor(Math.random() * 900000 + 100000),
      status: 'Approved',
      date: new Date().toISOString()
    };
    await saveTransaction(newTxn);

    // Sync localStorage for direct student dashboard checks as well
    const myEnrolledKeys = JSON.parse(localStorage.getItem('enrolled_courses') || '[]');
    if (!myEnrolledKeys.includes(course.id)) {
      myEnrolledKeys.push(course.id);
      localStorage.setItem('enrolled_courses', JSON.stringify(myEnrolledKeys));
    }

    await loadAllData();
    setEnrollForm({ studentId: '', courseId: '' });
    showNotification(`Successfully enrolled ${student.name} in course!`);
  };

  const handleToggleStudentStatus = async (studentId) => {
    const student = (students || []).find(s => s.id === studentId);
    if (student) {
      const current = student.status;
      const updatedStudent = {
        ...student,
        status: current === 'Active' ? 'Suspended' : 'Active'
      };
      await saveStudent(updatedStudent);
      await loadAllData();
      showNotification(`Student status changed to ${updatedStudent.status}`);
    }
  };

  const handleRevokeEnrollment = async (studentId, courseId) => {
    if (window.confirm('Are you sure you want to revoke this student enrollment?')) {
      const student = (students || []).find(s => s.id === studentId);
      if (student) {
        await revokeEnrollmentInDB(studentId, courseId);

        // If revoking from self, synchronize
        const currentEnrolled = JSON.parse(localStorage.getItem('enrolled_courses') || '[]');
        const updatedSelf = currentEnrolled.filter(id => id !== courseId);
        localStorage.setItem('enrolled_courses', JSON.stringify(updatedSelf));

        await loadAllData();
        showNotification('Enrollment revoked successfully.');
      }
    }
  };

  // Config handlers
  const handleConfigToggle = async (field) => {
    const updated = { ...appConfig, [field]: !appConfig[field] };
    setAppConfig(updated);
    await saveAppConfig(updated);
    showNotification(`Settings updated successfully.`);
  };

  const handleConfigValueChange = async (field, value) => {
    const updated = { ...appConfig, [field]: value };
    setAppConfig(updated);
    await saveAppConfig(updated);
  };

  // Filters search results
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-mono text-sm gap-3">
        <span className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand-primary animate-spin" />
        <span className="text-white/60">Verifying administrative credentials...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-primary">
      <Navbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Dashboard section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-1 bg-brand-primary rounded-full" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary">Management Console</span>
              </div>
              <h1 className="text-5xl font-bold tracking-tighter">
                Control <span className="gradient-text">Panel</span>
              </h1>
              <p className="text-white/40 text-sm mt-1">Configure lessons, approve checkout payments, and govern platform features.</p>
            </div>
            
            {/* Quick action buttons & trigger data restorer */}
            <div className="flex flex-wrap items-center gap-3">
              <button 
                type="button"
                onClick={async () => {
                  localStorage.removeItem('enrolled_courses');
                  await resetDatabaseInDB();
                  await loadAllData();
                  showNotification('Database seeded back to factory states successfully.');
                }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white glass rounded-xl border-white/5 flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer"
                title="Resets courses, enrollments & logs back to system defaults"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset DB Defaults
              </button>
              
              <button
                onClick={() => handleOpenCourseModal()}
                className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Course
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={cn(
                  "fixed top-24 right-6 z-55 px-6 py-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 shadow-2xl backdrop-blur-xl",
                  notification.type === 'error' 
                    ? "bg-red-950/90 border-red-500/20 text-red-200" 
                    : "bg-emerald-950/90 border-emerald-500/20 text-emerald-200"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full animate-ping",
                  notification.type === 'error' ? "bg-red-400" : "bg-emerald-400"
                )} />
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Badges Section (Bento Grid Style) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass p-6 rounded-[2rem] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-all" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black">${totalRevenue.toFixed(2)}</div>
              <div className="text-[9px] uppercase font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +14.2% This week
              </div>
            </div>

            <div className="glass p-6 rounded-[2rem] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Registered Students</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-black">{totalStudents}</div>
              <div className="text-[9px] uppercase font-bold text-white/30 mt-1">
                Active & registered list
              </div>
            </div>

            <div className="glass p-6 rounded-[2rem] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Course Catalog</span>
                <BookOpen className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="text-3xl font-black">{totalCourses}</div>
              <div className="text-[9px] uppercase font-bold text-white/30 mt-1">
                {totalEnrollments} active enrollments
              </div>
            </div>

            <div className="glass p-6 rounded-[2rem] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-all" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Approval Queue</span>
                <Sliders className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black flex items-center gap-2">
                {pendingTxns.length}
                {pendingTxns.length > 0 && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest animate-pulse">Action Required</span>
                )}
              </div>
              <div className="text-[9px] uppercase font-bold text-white/30 mt-1">
                Checks and payments reviews
              </div>
            </div>
          </div>

          {/* Tabs Navigator Menu Layout */}
          <div className="flex justify-between items-center bg-black/40 p-1.5 rounded-2xl border border-white/5 mb-8">
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'overview', name: 'Dashboard Cockpit', icon: Activity },
                { id: 'courses', name: 'Catalogs Management', icon: BookOpen },
                { id: 'students', name: 'Students & Signups', icon: Users },
                { id: 'config', name: 'System Toggles', icon: Sliders }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 hover:text-white uppercase tracking-wider cursor-pointer",
                    activeTab === tab.id
                      ? "bg-brand-primary text-white shadow-xl shadow-orange-500/10"
                      : "text-white/40 hover:bg-white/5"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.name}
                </button>
              ))}
            </div>

            {/* General input search box */}
            {activeTab !== 'config' && (
              <div className="relative hidden sm:block w-64 pr-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-brand-primary/40 text-white placeholder:text-white/30"
                />
              </div>
            )}
          </div>

          {/* TAB CONTENT IMPLEMENTATION: PANEL COCKPIT */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* SVG Visual Graphic Dashboard & Time Selector */}
                <div className="glass p-6 rounded-[2.5rem] border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                      <h3 className="text-lg font-bold">Earnings & Enrollments Metric</h3>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">Historical performance & checkout tracking</p>
                    </div>

                    <div className="bg-black/60 p-1 rounded-xl border border-white/5 flex gap-1">
                      {[
                        { label: 'Weekly Stats', days: 7 },
                        { label: 'Monthly Scope', days: 30 }
                      ].map((item) => (
                        <button
                          key={item.days}
                          onClick={() => setGraphDays(item.days)}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                            graphDays === item.days
                              ? "bg-white/10 text-white font-semibold"
                              : "text-white/40 hover:text-white/80"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Flow Map */}
                  <div className="relative h-44 w-full bg-black/30 rounded-2xl border border-white/5 p-4 flex flex-col justify-end">
                    <svg className="w-full h-28 overflow-visible" viewBox="0 0 800 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      {/* Area block under stroke curve */}
                      <path
                        d={`M 0,180 L ${chartPoints.points} L 800,180 Z`}
                        fill="url(#gradient-area)"
                        className="transition-all duration-500"
                      />
                      {/* Plot curve */}
                      <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3.5"
                        points={chartPoints.points}
                        className="transition-all duration-500 stroke-dasharray-[5]"
                      />
                      
                      {/* Grid guidelines */}
                      <line x1="0" y1="45" x2="800" y2="45" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="90" x2="800" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="135" x2="800" y2="135" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                      {/* Interactive Circle Coordinates indicators */}
                      {chartPoints.raw.map((pt, index) => {
                        const count = chartPoints.raw.length;
                        const cx = (index / (count - 1)) * 800;
                        const cy = 180 - ((pt / 1000) * 180);
                        return (
                          <g key={index} className="group/g cursor-pointer">
                            <circle
                              cx={cx}
                              cy={cy}
                              r="4.5"
                              fill="#f97316"
                              stroke="#050505"
                              strokeWidth="1.5"
                              className="hover:scale-150 transition-all hover:fill-white"
                            />
                            {/* SVG indicator tooltip hover effect */}
                            <text
                              x={cx}
                              y={cy - 12}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize="9"
                              fontWeight="bold"
                              className="opacity-0 group-hover/g:opacity-100 bg-black/90 p-1 pointer-events-none transition-opacity"
                            >
                              ${pt}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* SVG Base Legend Row Labels */}
                    <div className="flex justify-between mt-2 pt-2 border-t border-white/5 text-[9px] font-mono text-white/30 uppercase">
                      <span>Start of period</span>
                      <span>Peak Activity</span>
                      <span>Realtime tracker active</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Transaction Reviews Requests (8 columns) */}
                  <div className="lg:col-span-8 glass p-6 rounded-[2.5rem] border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold tracking-tight">Pending Checkout Requests</h3>
                        <p className="text-xs text-white/40">Verify and approve student cash transfers across channels</p>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#F7941E] bg-[#F7941E]/10 border border-[#F7941E]/20 rounded-full animate-pulse flex items-center gap-1.5">
                        <Activity className="w-3 h-3" />
                        {pendingTxns.length} pending
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                      {pendingTxns.length > 0 ? (
                        pendingTxns.map((txn) => (
                          <div 
                            key={txn.id}
                            className="bg-white/[0.02] hover:bg-white/[0.04] p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn(
                                  "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white",
                                  txn.method === 'bKash' ? "bg-[#D12053]" : 
                                  txn.method === 'Nagad' ? "bg-[#F7941E]" : "bg-purple-600"
                                )}>
                                  {txn.method} Pay
                                </span>
                                <span className="font-mono text-[10px] text-white/40">TxID: {txn.transactionId}</span>
                              </div>
                              <h4 className="font-bold text-sm text-white">{txn.studentName} <span className="text-white/40 text-xs">({txn.studentEmail})</span></h4>
                              <p className="text-xs text-white/60 font-medium">Checkout for: <span className="text-brand-primary font-bold">{txn.courseTitle}</span></p>
                              <div className="text-[9px] text-white/30 font-medium">{new Date(txn.date).toLocaleString()}</div>
                            </div>

                            <div className="flex items-center gap-3 justify-end">
                              <div className="text-right mr-2 md:mr-4">
                                <div className="text-[10px] text-white/40 uppercase tracking-widest">Amount</div>
                                <div className="text-lg font-black text-emerald-400">${txn.amount}</div>
                              </div>
                              <button
                                onClick={() => handleApproveTransaction(txn.id)}
                                className="p-3 bg-brand-primary text-white rounded-xl hover:scale-105 active:scale-95 hover:bg-orange-600 transition-all cursor-pointer"
                                title="Approve payment & auto enroll this student"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-white/30">
                          <Check className="w-10 h-10 text-emerald-400/40 mx-auto mb-4" />
                          <p className="text-sm font-semibold">Payment verification queue is entirely cleared!</p>
                          <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">No pending transactions logs found</p>
                        </div>
                      )}
                    </div>

                    {/* Historical Transactions List */}
                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Historical Records Completed</h4>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {approvedTxns.slice(0, 5).map((txn) => (
                          <div key={txn.id} className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                            <div>
                              <span className="font-semibold text-white/80">{txn.studentName}</span>
                              <span className="text-white/30 truncate ml-2">({txn.courseTitle})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[10px] text-white/25">{txn.transactionId}</span>
                              <span className="font-bold text-emerald-400">${txn.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Platform Audit Logs (4 columns) */}
                  <div className="lg:col-span-4 glass p-6 rounded-[2.5rem] border-white/5 flex flex-col">
                    <h3 className="text-xl font-bold tracking-tight mb-1">System Audit Trail</h3>
                    <p className="text-xs text-white/40 mb-6">Realtime action capture of modifications & admin actions</p>

                    <div className="space-y-4 flex-1 max-h-[580px] overflow-y-auto pr-1 font-mono text-[11px]">
                      {systemLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="text-brand-primary">{log.action}</span>
                            <span className="text-white/35">{log.user}</span>
                          </div>
                          <p className="text-white/60 leading-relaxed text-xs">{log.details}</p>
                          <div className="text-[9px] text-white/20 text-right">
                            {new Date(log.date).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT IMPLEMENTATION: COURSE CATALOG MANGER */}
            {activeTab === 'courses' && (
              <motion.div
                key="courses-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="glass p-6 rounded-[2.5rem] border-white/5 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">Created Catalog Courses</h3>
                      <p className="text-xs text-white/40">Adjust curricula, adjust price and level metadata</p>
                    </div>

                    <button
                      onClick={() => handleOpenCourseModal()}
                      className="px-4 py-2 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Publish New Course
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                          <th className="py-4 px-4">Course Info</th>
                          <th className="py-4 px-4">Instructor</th>
                          <th className="py-4 px-4">Category</th>
                          <th className="py-4 px-4">Level</th>
                          <th className="py-4 px-4 text-right">Price</th>
                          <th className="py-4 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {filteredCourses.map((course) => (
                          <tr key={course.id} className="hover:bg-white/[0.01] transition-all group">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=100&auto=format&fit=crop"} 
                                  alt={course.title} 
                                  className="w-12 h-8 object-cover rounded-lg border border-white/10 shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=100&auto=format&fit=crop";
                                  }}
                                />
                                <div>
                                  <div className="font-bold text-white group-hover:text-brand-primary transition-colors">{course.title}</div>
                                  <div className="text-[10px] text-white/30 font-mono">ID: {course.id} • {course.lessons || 0} Lessons ({course.hours || '0.0'} hrs)</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-white/80 font-medium">{course.instructor}</td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] font-semibold text-white/60 uppercase tracking-widest border border-white/5">
                                {course.category}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={cn(
                                "text-[9px] uppercase tracking-wider font-extrabold",
                                course.level === 'Advanced' ? "text-orange-400" :
                                course.level === 'Intermediate' ? "text-blue-400" : "text-emerald-400"
                              )}>
                                {course.level}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right font-black text-white/90 text-sm">${course.price}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenCourseModal(course)}
                                  className="p-2 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-all cursor-pointer"
                                  title="Edit properties"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="p-2 hover:bg-red-500/10 rounded-xl text-white/60 hover:text-red-400 transition-all cursor-pointer"
                                  title="Delete course"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT IMPLEMENTATION: STUDENT REGISTRATION MANGER */}
            {activeTab === 'students' && (
              <motion.div
                key="students-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Left side: Students table directory (8 columns) */}
                <div className="lg:col-span-8 glass p-6 rounded-[2.5rem] border-white/5">
                  <h3 className="text-xl font-bold tracking-tight mb-1">Registered Student Profiles</h3>
                  <p className="text-xs text-white/40 mb-6 col-span-full">Revoke individual courses, monitor accounts and subscription keys</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                          <th className="py-3 px-2">Student Name</th>
                          <th className="py-3 px-2">Registered At</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2">Courses (Curriculum key)</th>
                          <th className="py-3 px-2 text-center">Settings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-white/[0.005] transition-all">
                            <td className="py-4 px-2">
                              <div>
                                <div className="font-bold text-white text-sm">{student.name}</div>
                                <div className="text-white/30 text-[10px] font-semibold">{student.email}</div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-white/40 font-mono text-[10px]">
                              {new Date(student.registeredAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-2">
                              <button
                                onClick={() => handleToggleStudentStatus(student.id)}
                                title="Click to toggle status"
                                className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer inline-flex items-center gap-1.5",
                                  student.status === 'Active' 
                                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/25" 
                                    : student.status === 'Suspended' 
                                      ? "bg-red-500/15 border-red-500/30 text-red-600 hover:bg-red-500/25" 
                                      : "bg-amber-500/15 border-amber-500/30 text-amber-600 hover:bg-amber-500/25"
                                )}
                              >
                                <span className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  student.status === 'Active' ? "bg-emerald-500" :
                                  student.status === 'Suspended' ? "bg-red-500" : "bg-amber-500"
                                )} />
                                {student.status}
                              </button>
                            </td>
                            <td className="py-4 px-2 max-w-xs">
                              <div className="flex flex-wrap gap-1">
                                {student.enrolledIds && student.enrolledIds.length > 0 ? (
                                  student.enrolledIds.map((courseId) => {
                                    const matchCourse = courses.find(c => c.id === courseId);
                                    return (
                                      <span 
                                        key={courseId} 
                                        className="inline-flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md text-white/50 border border-white/5"
                                        title={`Course ID: ${courseId}`}
                                      >
                                        ID {courseId}
                                        <button 
                                          type="button" 
                                          onClick={() => handleRevokeEnrollment(student.id, courseId)}
                                          className="text-white/30 hover:text-red-400 shrink-0 cursor-pointer ml-1"
                                          title="Revoke enrollment"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-white/20 italic text-[10px]">No active courses</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center text-xs">
                              <button
                                onClick={() => handleToggleStudentStatus(student.id)}
                                className="text-brand-primary font-bold hover:underline cursor-pointer"
                              >
                                Toggle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right side: Manual enroll system controller (4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="glass p-6 rounded-[2.5rem] border-white/5">
                    <h3 className="text-lg font-bold tracking-tight mb-1">Manual Access Enroll</h3>
                    <p className="text-xs text-white/40 mb-4">Issue a master enrollment bypass for any student instantly</p>

                    <form onSubmit={handleManualEnroll} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Select Student</label>
                        <select
                          value={enrollForm.studentId}
                          onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-brand-primary font-medium"
                        >
                          <option value="">-- Choose student profile --</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Assigned Course</label>
                        <select
                          value={enrollForm.courseId}
                          onChange={(e) => setEnrollForm({ ...enrollForm, courseId: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-brand-primary font-medium"
                        >
                          <option value="">-- Select target course --</option>
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.title} (${c.price})</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        Authorize Course Bypass
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT IMPLEMENTATION: GENERAL CONFIG & SLIDERS TOGGLE */}
            {activeTab === 'config' && (
              <motion.div
                key="config-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto"
              >
                <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Functional Configuration Modifiers</h3>
                    <p className="text-xs text-white/40">Inject environment variables toggles & operational flags below</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Toggle Features cards */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-white/45 border-b border-white/5 pb-2">Boolean Capabilities</h4>
                      
                      {[
                        { field: 'maintenanceMode', label: 'Global Maintenance mode override', desc: 'Renders lock screen banners instead of course views when true' },
                        { field: 'enableCertificate', label: 'Trophy certificate generation', desc: 'Auto checks achievements metrics to export PDFs on completion' },
                        { field: 'enableReviews', label: 'Student remarks & review system', desc: 'Enabling comment boxes inside the lessons video detailers' },
                        { field: 'bkashSandbox', label: 'bKash sandbox testing mode', desc: 'Simulates successful response outputs without dialing actual merchant gateway PINs' }
                      ].map((item) => (
                        <div key={item.field} className="flex items-start justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-2xl transition-all">
                          <div className="space-y-1.5 flex-1 pr-4">
                            <div className="text-xs font-bold text-white leading-none">{item.label}</div>
                            <div className="text-[10px] text-white/40 leading-relaxed font-semibold">{item.desc}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleConfigToggle(item.field)}
                            className={cn(
                              "relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                              appConfig[item.field] ? "bg-brand-primary" : "bg-white/10"
                            )}
                          >
                            <span
                              className={cn(
                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                                appConfig[item.field] ? "translate-x-5" : "translate-x-0"
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Numerical dynamic rates */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-white/45 border-b border-white/5 pb-2">Commission & Pricing Multipliers</h4>
                      
                      <div className="space-y-2 p-5 bg-black/30 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center px-1">
                          <div className="text-xs font-bold">Standard Discount Rate</div>
                          <div className="text-sm font-black text-brand-primary">{appConfig.discountPercent || 0}% OFF</div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          step="5"
                          value={appConfig.discountPercent || 15}
                          onChange={(e) => handleConfigValueChange('discountPercent', parseInt(e.target.value))}
                          className="w-full accent-brand-primary cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                        />
                        <p className="text-[9px] text-white/30 uppercase mt-2">Applied globally to mock checking promo items</p>
                      </div>

                      <div className="space-y-2 p-5 bg-black/30 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center px-1">
                          <div className="text-xs font-bold">Payout Minimum Settlement limit</div>
                          <div className="text-sm font-black text-[#F7941E]">${appConfig.minPayoutThreshold || 0} USD</div>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="250"
                          step="10"
                          value={appConfig.minPayoutThreshold || 50}
                          onChange={(e) => handleConfigValueChange('minPayoutThreshold', parseInt(e.target.value))}
                          className="w-full accent-[#F7941E] cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                        />
                        <p className="text-[9px] text-white/30 uppercase mt-2">Configure threshold limitations for instructor dashboard claims</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DYNAMIC MODAL BOX: COURSE ADD OR EDIT DRAWER */}
          <AnimatePresence>
            {isCourseModalOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0b0b0b] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                >
                  {/* Top Close indicator */}
                  <button
                    onClick={() => setIsCourseModalOpen(false)}
                    className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="p-8 border-b border-white/5">
                    <h3 className="text-2xl font-bold tracking-tight">
                      {editingCourse ? 'Modify Course Metadata' : 'Publish Core Syllabus & Catalog'}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">Populate lesson statistics accurately before compiling assets.</p>
                  </div>

                  <form onSubmit={handleCourseSubmit} className="p-8 space-y-6 max-h-[500px] overflow-y-auto">
                    {/* Raw layout inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Course Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Master React and Framer animation state"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Syllabus Instructor *</label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Jenkins"
                          value={courseForm.instructor}
                          onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Syllabus Price ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="49.99"
                          value={courseForm.price}
                          onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Target Level</label>
                        <select
                          value={courseForm.level}
                          onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-brand-primary font-medium"
                        >
                          <option value="Beginner">Beginner level</option>
                          <option value="Intermediate">Intermediate level</option>
                          <option value="Advanced">Advanced level</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Department Category</label>
                        <select
                          value={courseForm.category}
                          onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-brand-primary font-medium"
                        >
                          <option value="Development">Development</option>
                          <option value="Design">Design</option>
                          <option value="Architecture">Architecture</option>
                          <option value="DevOps">DevOps</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Number of Lessons</label>
                        <input
                          type="number"
                          value={courseForm.lessons}
                          onChange={(e) => setCourseForm({ ...courseForm, lessons: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Total Est. Hours</label>
                        <input
                          type="text"
                          placeholder="e.g. 18.5"
                          value={courseForm.hours}
                          onChange={(e) => setCourseForm({ ...courseForm, hours: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center justify-between">
                          <span>Thumbnail Image</span>
                          {courseForm.thumbnail && <span className="text-green-400 font-mono text-[9px] flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Image Attached</span>}
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 border border-white/10">
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingThumbnail}
                              onChange={handleThumbnailUpload}
                              className="hidden"
                            />
                            {uploadingThumbnail ? (
                              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                            ) : (
                              <>
                                <ImageIcon className="w-3.5 h-3.5 text-brand-primary" />
                                <span>Upload File</span>
                              </>
                            )}
                          </label>
                          <input
                            type="url"
                            placeholder="Image URL or upload file from device"
                            value={courseForm.thumbnail}
                            onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-brand-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Number of Lessons</label>
                        <input
                          type="number"
                          value={courseForm.lessons}
                          onChange={(e) => setCourseForm({ ...courseForm, lessons: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Syllabus Description Overview</label>
                      <textarea
                        rows="3"
                        placeholder="Write a clear course introduction summaries..."
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-primary resize-none"
                      />
                    </div>

                    {/* Dyn list curriculum generator row entries with Direct Video File fields */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Curriculum Chapter Syllabus List & Lesson Videos</label>
                          <p className="text-[9px] text-brand-primary/80">Directly select and upload video files for each chapter</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCurriculumRow}
                          className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:underline cursor-pointer flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-lg hover:bg-brand-primary/20 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Chapter
                        </button>
                      </div>

                      <div className="space-y-4">
                        {curriculumList.map((item, index) => (
                          <div key={index} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-3 relative group/chapter border-l-brand-primary/40 border-l-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-brand-primary font-mono font-bold tracking-widest uppercase">Chapter #{index + 1}</span>
                              <button
                                type="button"
                                disabled={curriculumList.length === 1}
                                onClick={() => handleRemoveCurriculumRow(index)}
                                className="p-1 px-2 text-white/30 hover:text-red-400 disabled:opacity-20 transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider bg-white/5 rounded-lg"
                              >
                                Delete
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-white/30 block">Chapter Title *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Getting Started & Setup"
                                  value={item.title || ''}
                                  onChange={(e) => handleCurriculumItemChange(index, 'title', e.target.value)}
                                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-white/30 flex items-center justify-between">
                                  <span>Lesson Video (Direct File / URL)</span>
                                  {item.videoUrl && (
                                    <span className="text-green-400 flex items-center gap-0.5 font-mono text-[9px]">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> Video attached
                                    </span>
                                  )}
                                </label>
                                
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    {/* Direct Video File Upload Button */}
                                    <label className={cn(
                                      "flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shrink-0 shadow-sm",
                                      chapterUploading[index] 
                                        ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/40" 
                                        : "bg-brand-primary text-white hover:bg-orange-600 active:scale-95"
                                    )}>
                                      <input
                                        type="file"
                                        accept="video/*,.mp4,.webm,.mov,.mkv,.avi"
                                        disabled={chapterUploading[index]}
                                        onChange={(e) => handleChapterVideoUpload(index, e)}
                                        className="hidden"
                                      />
                                      {chapterUploading[index] ? (
                                        <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          <span>{chapterProgress[index] || 0}%</span>
                                        </>
                                      ) : (
                                        <>
                                          <UploadCloud className="w-3.5 h-3.5" />
                                          <span>Upload Video</span>
                                        </>
                                      )}
                                    </label>

                                    {/* Direct path or URL input */}
                                    <input
                                      type="text"
                                      placeholder="Select file or paste URL"
                                      value={item.videoUrl || ''}
                                      onChange={(e) => handleCurriculumItemChange(index, 'videoUrl', e.target.value)}
                                      className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary font-mono text-[11px]"
                                    />
                                  </div>

                                  {chapterUploading[index] && (
                                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-brand-primary h-full transition-all duration-150" 
                                        style={{ width: `${chapterProgress[index] || 0}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsCourseModalOpen(false)}
                        className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Abort Draft
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3.5 bg-brand-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-orange-500/10 cursor-pointer"
                      >
                        Publish Catalog
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

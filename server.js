import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import multer from 'multer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(process.cwd(), 'db.json');
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const cleanOriginalName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueName = `${cleanOriginalName}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 } // 1GB max limit
});

// --- DATABASE HOOKS & UTILITIES ---
const COURSES_DATA_DEFAULT = [];

const SEED_STUDENTS = [
  { id: 'usr-admin', name: 'Admin User', email: 'admin@example.com', password: 'admin123', registeredAt: new Date().toISOString(), enrolledIds: [], status: 'Active', role: 'Admin' }
];

const SEED_TRANSACTIONS = [];

const SEED_SYSTEM_LOGS = [
  { id: 'log-1', action: 'System Setup', user: 'System', details: 'Initialized clean application database', date: '2026-05-27T01:00:00Z' }
];

const DEFAULT_CONFIG = {
  maintenanceMode: false,
  enableCertificate: true,
  enableReviews: true,
  bkashSandbox: true,
  discountPercent: 15,
  minPayoutThreshold: 50
};

// Sync functions with standard Node.js FS routines
const fetchDB = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialDb = {
        courses: COURSES_DATA_DEFAULT,
        students: SEED_STUDENTS,
        transactions: SEED_TRANSACTIONS,
        system_logs: SEED_SYSTEM_LOGS,
        app_config: DEFAULT_CONFIG
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to load / read file-persistent database: ", err);
    return {
      courses: COURSES_DATA_DEFAULT,
      students: SEED_STUDENTS,
      transactions: SEED_TRANSACTIONS,
      system_logs: SEED_SYSTEM_LOGS,
      app_config: DEFAULT_CONFIG
    };
  }
};

const commitDB = (dbState) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write to file-persistent database: ", err);
  }
};

const addSystemLog = (action, details, user = 'System') => {
  const state = fetchDB();
  const logItem = {
    id: `log-${Date.now()}`,
    action,
    details,
    user,
    date: new Date().toISOString()
  };
  state.system_logs.unshift(logItem);
  commitDB(state);
};

// --- EXPRESS APP SETUP ---
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Serve uploaded video and media files statically
  app.use('/uploads', express.static(UPLOAD_DIR));

  // Log each API route call
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API Call] ${req.method} ${req.path}`);
    }
    next();
  });

  // Direct Video & Media File Upload Endpoint
  app.post('/api/upload-video', (req, res) => {
    upload.single('video')(req, res, (err) => {
      if (err) {
        console.error('Multer video upload error:', err);
        return res.status(400).json({ error: err.message || 'Failed to upload video file' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No video file was uploaded' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const sizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
      addSystemLog('Direct Video Uploaded', `Uploaded video file "${req.file.originalname}" (${sizeMB} MB)`, 'Admin');

      return res.json({
        success: true,
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    });
  });

  // General File / Media Upload Endpoint
  app.post('/api/upload', (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file was uploaded' });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({
        success: true,
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size
      });
    });
  });

  // --- AUTHENTICATION & ACCESS VERIFICATION APIs ---
  app.post('/api/auth/register', (req, res) => {
    const db = fetchDB();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.students.find(s => s.email.toLowerCase().trim() === cleanEmail);

    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const newStudent = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password,
      registeredAt: new Date().toISOString(),
      enrolledIds: [],
      status: 'Active',
      role: 'Student'
    };

    db.students.push(newStudent);
    commitDB(db);
    addSystemLog('Student Registered', `New student account created: "${newStudent.name}" (${newStudent.email})`, newStudent.email);

    // Return safe student object without sensitive server tokens
    const { password: _, ...safeUser } = newStudent;
    res.json({ success: true, user: safeUser });
  });

  app.post('/api/auth/login', (req, res) => {
    const db = fetchDB();
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.students.find(s => s.email.toLowerCase().trim() === cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'No user account found with this email address.' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ error: 'This account has been suspended by administration.' });
    }

    // If account has a password set and password is provided, verify it (or allow demo seed users if no password was set yet)
    if (user.password && password && user.password !== password) {
      return res.status(401).json({ error: 'Invalid password. Please verify and try again.' });
    }

    const { password: _, ...safeUser } = user;
    addSystemLog('User Logged In', `User "${user.name}" (${user.email}) authenticated successfully`, user.email);
    res.json({ success: true, user: safeUser });
  });

  app.get('/api/auth/me', (req, res) => {
    const db = fetchDB();
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.students.find(s => s.email.toLowerCase().trim() === cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  app.post('/api/auth/verify-access', (req, res) => {
    const db = fetchDB();
    const { email, courseId } = req.body;

    if (!email || !courseId) {
      return res.json({ hasAccess: false, reason: 'Missing credentials or course ID' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.students.find(s => s.email.toLowerCase().trim() === cleanEmail);

    if (!user) {
      return res.json({ hasAccess: false, reason: 'User not registered' });
    }

    if (user.role === 'Admin' || user.email === 'admin@example.com') {
      return res.json({ hasAccess: true, role: 'Admin', reason: 'Admin Privilege' });
    }

    const isEnrolled = Array.isArray(user.enrolledIds) && user.enrolledIds.includes(courseId);
    return res.json({ 
      hasAccess: isEnrolled, 
      enrolledIds: user.enrolledIds || [],
      status: user.status
    });
  });

  // 1. GET ALL STATE COCKPIT DATA
  app.get('/api/state-summary', (req, res) => {
    const db = fetchDB();
    res.json(db);
  });

  // reset routing setup helper
  app.post('/api/reset-db', (req, res) => {
    const freshDb = {
      courses: COURSES_DATA_DEFAULT,
      students: SEED_STUDENTS,
      transactions: SEED_TRANSACTIONS,
      system_logs: SEED_SYSTEM_LOGS,
      app_config: DEFAULT_CONFIG
    };
    commitDB(freshDb);
    addSystemLog('System State Reset', 'Synchronized database variables and catalogs back to system defaults.');
    res.json(freshDb);
  });

  // 2. COURSES API
  app.get('/api/courses', (req, res) => {
    const db = fetchDB();
    res.json(db.courses);
  });

  app.post('/api/courses', (req, res) => {
    const db = fetchDB();
    const coursePayload = req.body;
    
    const existingIdx = db.courses.findIndex(c => c.id === coursePayload.id);

    if (existingIdx > -1) {
      db.courses[existingIdx] = { ...db.courses[existingIdx], ...coursePayload };
      addSystemLog('Course Updated', `Modified details of existing course "${coursePayload.title}"`, 'Admin');
    } else {
      coursePayload.id = coursePayload.id || `crs-${Date.now()}`;
      db.courses.push(coursePayload);
      addSystemLog('Course Created', `Authorized and published a brand-new course catalog option "${coursePayload.title}"`, 'Admin');
    }

    commitDB(db);
    res.json(db.courses);
  });

  app.delete('/api/courses/:id', (req, res) => {
    const db = fetchDB();
    const { id } = req.params;
    const targetCourse = db.courses.find(c => c.id === id);
    
    db.courses = db.courses.filter(c => c.id !== id);
    if (targetCourse) {
      addSystemLog('Course Deleted', `Removed course catalog entry "${targetCourse.title}" successfully`, 'Admin');
    }
    
    commitDB(db);
    res.json(db.courses);
  });

  // 3. STUDENTS API
  app.get('/api/students', (req, res) => {
    const db = fetchDB();
    res.json(db.students);
  });

  app.post('/api/students', (req, res) => {
    const db = fetchDB();
    const studentPayload = req.body;
    
    const existingIdx = db.students.findIndex(s => s.id === studentPayload.id);
    if (existingIdx > -1) {
      db.students[existingIdx] = { ...db.students[existingIdx], ...studentPayload };
      addSystemLog('Student Update', `Updated administrative credentials / status for "${studentPayload.name}"`, 'Admin');
    } else {
      studentPayload.id = studentPayload.id || `usr-${Date.now()}`;
      db.students.push(studentPayload);
      addSystemLog('Student Created', `Manual student enrollment profile registered for "${studentPayload.name}"`, 'Admin');
    }

    commitDB(db);
    res.json(db.students);
  });

  app.post('/api/students/revoke', (req, res) => {
    const db = fetchDB();
    const { studentId, courseId } = req.body;
    const studentIdx = db.students.findIndex(s => s.id === studentId);

    if (studentIdx > -1) {
      db.students[studentIdx].enrolledIds = db.students[studentIdx].enrolledIds.filter(id => id !== courseId);
      addSystemLog('Enrollment Revoked', `Revoked course ID "${courseId}" from student name "${db.students[studentIdx].name}"`, 'Admin');
      commitDB(db);
    }
    res.json(db.students);
  });

  // 4. TRANSACTIONS & DIRECT ENROLLMENT API (INSTANT ACCESS - NO ADMIN APPROVAL REQUIRED)
  app.get('/api/transactions', (req, res) => {
    const db = fetchDB();
    res.json(db.transactions);
  });

  app.post('/api/transactions', (req, res) => {
    const db = fetchDB();
    const txnPayload = req.body;

    txnPayload.id = txnPayload.id || `txn-${Date.now()}`;
    txnPayload.status = 'Completed'; // Automatically completed & granted
    txnPayload.date = txnPayload.date || new Date().toISOString();

    const existingIdx = db.transactions.findIndex(t => t.id === txnPayload.id);
    if (existingIdx > -1) {
      db.transactions[existingIdx] = { ...db.transactions[existingIdx], ...txnPayload };
    } else {
      db.transactions.unshift(txnPayload);
    }

    const matchedEmail = txnPayload.studentEmail ? txnPayload.studentEmail.toLowerCase().trim() : null;
    const matchedCourseId = txnPayload.courseId;

    let updatedUser = null;

    if (matchedEmail && matchedCourseId) {
      let studentIdx = db.students.findIndex(s => s.email.toLowerCase().trim() === matchedEmail);
      if (studentIdx === -1) {
        const newStudent = {
          id: `usr-${Date.now()}`,
          name: txnPayload.studentName || 'Student',
          email: matchedEmail,
          registeredAt: new Date().toISOString(),
          enrolledIds: [matchedCourseId],
          status: 'Active',
          role: 'Student'
        };
        db.students.push(newStudent);
        updatedUser = newStudent;
        addSystemLog('Student Enrolled', `Created account & instantly enrolled "${newStudent.name}" in course ID ${matchedCourseId}`, 'System');
      } else {
        if (!Array.isArray(db.students[studentIdx].enrolledIds)) {
          db.students[studentIdx].enrolledIds = [];
        }
        if (!db.students[studentIdx].enrolledIds.includes(matchedCourseId)) {
          db.students[studentIdx].enrolledIds.push(matchedCourseId);
        }
        db.students[studentIdx].status = 'Active';
        updatedUser = db.students[studentIdx];
        addSystemLog('Instant Enrollment', `Instantly activated course ID "${matchedCourseId}" for "${db.students[studentIdx].name}"`, 'System');
      }
    }

    commitDB(db);

    const safeUser = updatedUser ? (({ password, ...rest }) => rest)(updatedUser) : null;

    res.json({
      success: true,
      transaction: txnPayload,
      user: safeUser,
      enrolledIds: safeUser ? safeUser.enrolledIds : [matchedCourseId]
    });
  });

  app.post('/api/enroll-instant', (req, res) => {
    const db = fetchDB();
    const { studentName, studentEmail, courseId, method, senderPhone, transactionId, amount } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    const cleanEmail = (studentEmail || 'student@example.com').toLowerCase().trim();
    const name = studentName || 'Learner';

    // 1. Create completed transaction record
    const txnRecord = {
      id: `txn-${Date.now()}`,
      studentName: name,
      studentEmail: cleanEmail,
      courseId: courseId,
      amount: amount || 0,
      method: method || 'Instant Access',
      senderPhone: senderPhone || 'N/A',
      transactionId: transactionId || `TX-${Date.now()}`,
      status: 'Completed',
      date: new Date().toISOString()
    };

    db.transactions.unshift(txnRecord);

    // 2. Ensure student is enrolled immediately
    let studentIdx = db.students.findIndex(s => s.email.toLowerCase().trim() === cleanEmail);
    let targetStudent = null;

    if (studentIdx === -1) {
      targetStudent = {
        id: `usr-${Date.now()}`,
        name: name,
        email: cleanEmail,
        registeredAt: new Date().toISOString(),
        enrolledIds: [courseId],
        status: 'Active',
        role: 'Student'
      };
      db.students.push(targetStudent);
    } else {
      if (!Array.isArray(db.students[studentIdx].enrolledIds)) {
        db.students[studentIdx].enrolledIds = [];
      }
      if (!db.students[studentIdx].enrolledIds.includes(courseId)) {
        db.students[studentIdx].enrolledIds.push(courseId);
      }
      db.students[studentIdx].status = 'Active';
      targetStudent = db.students[studentIdx];
    }

    addSystemLog('Instant Enrollment', `Instantly enrolled student "${name}" (${cleanEmail}) in course ${courseId}`, 'System');
    commitDB(db);

    const { password: _, ...safeUser } = targetStudent;
    res.json({
      success: true,
      enrolled: true,
      user: safeUser,
      enrolledIds: safeUser.enrolledIds
    });
  });

  // 5. TRANSACTION APPROVALS (Auto Enrollment link-up)
  app.post('/api/transactions/:id/approve', (req, res) => {
    const db = fetchDB();
    const txnId = req.params.id;
    
    const txnIndex = db.transactions.findIndex(t => t.id === txnId);
    if (txnIndex > -1) {
      db.transactions[txnIndex].status = 'Approved';
      const matchedEmail = db.transactions[txnIndex].studentEmail;
      const matchedCourseId = db.transactions[txnIndex].courseId;
      
      // Look up and update student profile automatically
      let studentIdx = db.students.findIndex(s => s.email === matchedEmail);
      if (studentIdx === -1) {
        // Register standard student dynamically if they don't exist yet
        const newStudent = {
          id: `usr-${Date.now()}`,
          name: db.transactions[txnIndex].studentName || 'New Student',
          email: matchedEmail,
          registeredAt: new Date().toISOString(),
          enrolledIds: [matchedCourseId],
          status: 'Active'
        };
        db.students.push(newStudent);
        addSystemLog('Student Registered', `Auto-registered new student "${newStudent.name}" from approved payment`, 'System');
      } else {
        if (!db.students[studentIdx].enrolledIds.includes(matchedCourseId)) {
          db.students[studentIdx].enrolledIds.push(matchedCourseId);
          db.students[studentIdx].status = 'Active';
          addSystemLog('Course Enrolled', `Enrolled "${db.students[studentIdx].name}" in course ID ${matchedCourseId}`, 'System');
        }
      }

      addSystemLog('Payment Approved', `Approved payment item #${txnId} and unlocked course access details`, 'Admin');
      commitDB(db);
    }

    res.json({
      success: true,
      transactions: db.transactions,
      students: db.students
    });
  });

  // 6. APP CONFIG API
  app.get('/api/app-config', (req, res) => {
    const db = fetchDB();
    res.json(db.app_config);
  });

  app.post('/api/app-config', (req, res) => {
    const db = fetchDB();
    db.app_config = { ...db.app_config, ...req.body };
    addSystemLog('Config Changed', 'Modified platform configuration options settings.', 'Admin');
    commitDB(db);
    res.json(db.app_config);
  });

  // 7. AUDIT LOGS API
  app.get('/api/logs', (req, res) => {
    const db = fetchDB();
    res.json(db.system_logs);
  });

  app.post('/api/logs', (req, res) => {
    const { action, details, user } = req.body;
    addSystemLog(action, details, user || 'Admin');
    const db = fetchDB();
    res.json(db.system_logs);
  });

  // 8. PAYMENT INITIATOR LINK UP
  app.post('/api/initiate-payment', async (req, res) => {
    try {
      const { amount, courseId, method, studentName, studentEmail } = req.body;
      const db = fetchDB();
      const course = db.courses.find(c => c.id === courseId);
      
      const realName = studentName || 'Nazmul Islam';
      const realEmail = studentEmail || 'nazmulislamfsd@gmail.com';
      
      // Auto-generate realistic dynamic transaction IDs
      const prefix = method === 'bkash' ? 'BK' : method === 'nagad' ? 'NG' : method === 'rocket' ? 'RO' : 'SSL';
      const randomSuffix = Math.floor(Math.random() * 900000 + 100000);
      const transactionId = `${prefix}${randomSuffix}AD`;
      const txnId = `txn-${Date.now()}`;

      // Build real record in backend database
      const newTransaction = {
        id: txnId,
        studentName: realName,
        studentEmail: realEmail,
        courseTitle: course ? course.title : 'System Premium Course',
        courseId: courseId,
        amount: course ? course.price : parseFloat(amount / 120).toFixed(2),
        method: method || 'bKash',
        transactionId: transactionId,
        status: 'Pending',
        date: new Date().toISOString()
      };

      db.transactions.unshift(newTransaction);
      commitDB(db);

      addSystemLog(
        'Transaction Initiated', 
        `Student "${realName}" initiated checkout payment via ${method} for course "${newTransaction.courseTitle}"`,
        realEmail
      );

      res.send({
        status: 'SUCCESS',
        tranId: transactionId,
        paymentUrl: '#',
        message: `Successfully registered pending payment review record for ${method}`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();


export const registerUser = async (name, email, password) => {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return await res.json();
  } catch (err) {
    console.error('Registration failed:', err);
    return { error: 'Network error during registration' };
  }
};

export const loginUser = async (email, password) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  } catch (err) {
    console.error('Login failed:', err);
    return { error: 'Network error during login' };
  }
};

export const getMe = async (email) => {
  try {
    const res = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to get user profile:', err);
    return { user: null };
  }
};

export const verifyCourseAccess = async (email, courseId) => {
  try {
    const res = await fetch('/api/auth/verify-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, courseId })
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to verify course access:', err);
    return { hasAccess: false };
  }
};

// --- Learnify Real Backend Integration Client ---

export const getCourses = async () => {
  try {
    const res = await fetch('/api/courses');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch courses:', err);
    return [];
  }
};

export const saveCourse = async (course) => {
  try {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to save course:', err);
    return [];
  }
};

export const deleteCourse = async (id) => {
  try {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to delete course:', err);
    return [];
  }
};

export const getStudents = async () => {
  try {
    const res = await fetch('/api/students');
    return await res.json();
  } catch (err) {
    console.error('Failed to get students:', err);
    return [];
  }
};

export const saveStudent = async (student) => {
  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to save student:', err);
    return [];
  }
};

export const revokeEnrollmentInDB = async (studentId, courseId) => {
  try {
    const res = await fetch('/api/students/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, courseId })
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to revoke enrollment:', err);
    return [];
  }
};

export const getTransactions = async () => {
  try {
    const res = await fetch('/api/transactions');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch transactions:', err);
    return [];
  }
};

export const saveTransaction = async (txn) => {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txn)
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to save transaction:', err);
    return [];
  }
};

export const approveTransaction = async (txnId) => {
  try {
    const res = await fetch(`/api/transactions/${txnId}/approve`, {
      method: 'POST'
    });
    return await res.json(); // returns { success, transactions, students }
  } catch (err) {
    console.error('Failed to approve transaction:', err);
    return { success: false };
  }
};

export const getAppConfig = async () => {
  try {
    const res = await fetch('/api/app-config');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch app configuration settings:', err);
    return {};
  }
};

export const saveAppConfig = async (config) => {
  try {
    const res = await fetch('/api/app-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to update app config:', err);
    return {};
  }
};

export const getLogs = async () => {
  try {
    const res = await fetch('/api/logs');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch logs:', err);
    return [];
  }
};

export const addLog = async (action, details, user = 'System') => {
  try {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, details, user })
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to send audit log:', err);
    return [];
  }
};

export const resetDatabaseInDB = async () => {
  try {
    const res = await fetch('/api/reset-db', {
      method: 'POST'
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to sync/reset API database:', err);
    return null;
  }
};

export const uploadVideoFile = async (file, onProgress) => {
  try {
    const formData = new FormData();
    formData.append('video', file);

    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.open('POST', '/api/upload-video');

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.error || 'Upload failed'));
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during video upload'));
      xhr.send(formData);
    });
  } catch (err) {
    console.error('Upload video file error:', err);
    throw err;
  }
};

export const uploadMediaFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    return await res.json();
  } catch (err) {
    console.error('Upload media file error:', err);
    throw err;
  }
};

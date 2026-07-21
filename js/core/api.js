// ============================================
// API CALLS WITH FIREBASE AUTH INTEGRATION
// ============================================

import { CONFIG } from './config.js';

export class APIError extends Error {
    constructor(message, type, status) {
        super(message);
        this.type = type;
        this.status = status;
        this.name = 'APIError';
    }
}

/**
 * Get current Firebase user's ID token
 * Returns null if not logged in
 */
async function getAuthToken() {
    try {
        const user = window.firebaseAuth?.currentUser;
        if (!user) return null;
        return await user.getIdToken();
    } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
    }
}

/**
 * Generic fetch wrapper with Firebase Auth + retry logic
 */
async function apiFetch(endpoint, options = {}, retryCount = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT || 30000);

    try {
        // Auto-attach Firebase ID token if user is logged in
        const token = await getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            ...options,
            signal: controller.signal,
            headers
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle 401 (unauthorized) - token might be expired
            if (response.status === 401 && retryCount === 0) {
                const user = window.firebaseAuth?.currentUser;
                if (user) {
                    // Force refresh the token
                    await user.getIdToken(true);
                    return apiFetch(endpoint, options, retryCount + 1);
                }
            }

            if (response.status === 503) {
                throw new APIError('Server is starting up. This takes ~30s on first request.', 'SERVICE_UNAVAILABLE', 503);
            }
            if (response.status === 429) {
                throw new APIError('Rate limit reached. Please wait a moment.', 'RATE_LIMIT', 429);
            }
            if (response.status === 401) {
                throw new APIError('Please sign in to access this feature.', 'UNAUTHORIZED', 401);
            }
            if (response.status === 404) {
                throw new APIError('Resource not found.', 'NOT_FOUND', 404);
            }

            throw new APIError(
                errorData.error?.message || `Server error: ${response.status}`,
                'SERVER_ERROR',
                response.status
            );
        }

        return await response.json();

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new APIError('Request timed out. Check your connection.', 'TIMEOUT', 0);
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new APIError('Cannot connect to server. Working offline.', 'NETWORK_ERROR', 0);
        }

        if (retryCount < 2 && (error.status === 503 || error.status === 504)) {
            console.log(`Retrying... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
            return apiFetch(endpoint, options, retryCount + 1);
        }

        throw error;
    }
}

// ============================================
// LESSON GENERATION
// ============================================

export async function generateLessonPlan(data) {
    const result = await apiFetch(CONFIG.ENDPOINTS.generate, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return result.data;
}

export async function generateWithAI(data) {
    try {
        const result = await apiFetch(CONFIG.ENDPOINTS.aiGenerate, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return {
            data: result.data,
            source: result.source || 'ai',
            saved: result.saved || null
        };
    } catch (error) {
        if (error.type === 'NETWORK_ERROR' || error.type === 'SERVICE_UNAVAILABLE') {
            console.warn('AI backend unavailable');
        }
        throw error;
    }
}

// ============================================
// AUTH API
// ============================================

export const AuthAPI = {
    async register(email, password, name) {
        return apiFetch(CONFIG.ENDPOINTS.auth.register, {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
    },
    
    async login(idToken) {
        return apiFetch(CONFIG.ENDPOINTS.auth.login, {
            method: 'POST',
            body: JSON.stringify({ idToken })
        });
    },
    
    async getMe() {
        return apiFetch(CONFIG.ENDPOINTS.auth.me);
    },
    
    async updateProfile(updates) {
        return apiFetch(CONFIG.ENDPOINTS.auth.profile, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }
};

// ============================================
// LESSONS API
// ============================================

export const LessonsAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return apiFetch(`${CONFIG.ENDPOINTS.lessons}${params ? '?' + params : ''}`);
    },
    
    async getById(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.lessons}/${id}`);
    },
    
    async save(lesson) {
        return apiFetch(CONFIG.ENDPOINTS.lessons, {
            method: 'POST',
            body: JSON.stringify(lesson)
        });
    },
    
    async update(id, updates) {
        return apiFetch(`${CONFIG.ENDPOINTS.lessons}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },
    
    async delete(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.lessons}/${id}`, {
            method: 'DELETE'
        });
    }
};

// ============================================
// STUDENTS API - FULL CRUD
// ============================================

export const StudentsAPI = {
    // Get all students (with optional filters)
    async getAll(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return apiFetch(`${CONFIG.ENDPOINTS.students}${params ? '?' + params : ''}`);
    },
    
    // Get a single student by ID
    async getById(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.students}/${id}`);
    },
    
    // Get students by class
    async getByClass(className) {
        return apiFetch(`${CONFIG.ENDPOINTS.students}/class/${encodeURIComponent(className)}`);
    },
    
    // Get students by class and arm
    async getByClassAndArm(className, arm) {
        return apiFetch(`${CONFIG.ENDPOINTS.students}/class/${encodeURIComponent(className)}/arm/${encodeURIComponent(arm)}`);
    },
    
    // Add a new student
    async add(student) {
        return apiFetch(CONFIG.ENDPOINTS.students, {
            method: 'POST',
            body: JSON.stringify(student)
        });
    },
    
    // Update a student
    async update(id, updates) {
        return apiFetch(`${CONFIG.ENDPOINTS.students}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },
    
    // Delete (soft delete) a student
    async delete(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.students}/${id}`, {
            method: 'DELETE'
        });
    },
    
    // Move a student to a new class/arm
    async move(id, moveData) {
        return apiFetch(`${CONFIG.ENDPOINTS.students}/${id}/move`, {
            method: 'PATCH',
            body: JSON.stringify(moveData)
        });
    },
    
    // Bulk import students
    async bulkImport(students) {
        return apiFetch(`${CONFIG.ENDPOINTS.students}/bulk`, {
            method: 'POST',
            body: JSON.stringify({ students })
        });
    },
    
    // Export students (CSV/PDF)
    async exportData(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return apiFetch(`${CONFIG.ENDPOINTS.students}/export${params ? '?' + params : ''}`);
    }
};

// ============================================
// CLASSES API - FULL CRUD
// ============================================

export const ClassesAPI = {
    // Get all classes
    async getAll() {
        return apiFetch(CONFIG.ENDPOINTS.classes);
    },
    
    // Get a single class by ID
    async getById(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.classes}/${id}`);
    },
    
    // Get students in a specific class
    async getStudents(classId) {
        return apiFetch(`${CONFIG.ENDPOINTS.classes}/${classId}/students`);
    },
    
    // Create a new class
    async create(classData) {
        return apiFetch(CONFIG.ENDPOINTS.classes, {
            method: 'POST',
            body: JSON.stringify(classData)
        });
    },
    
    // Update a class
    async update(id, updates) {
        return apiFetch(`${CONFIG.ENDPOINTS.classes}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },
    
    // Delete a class
    async delete(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.classes}/${id}`, {
            method: 'DELETE'
        });
    },
    
    // Archive a class (soft delete)
    async archive(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.classes}/${id}/archive`, {
            method: 'PATCH'
        });
    },
    
    // Upgrade a class (move all students to next level)
    async upgrade(id, targetClass, keepArms = true) {
        return apiFetch(`${CONFIG.ENDPOINTS.classes}/${id}/upgrade`, {
            method: 'POST',
            body: JSON.stringify({ targetClass, keepArms })
        });
    },
    
    // Get class statistics
    async getStats(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.classes}/${id}/stats`);
    },
    
    // Add an arm to a class
    async addArm(classId, armName) {
        return apiFetch(`${CONFIG.ENDPOINTS.classes}/${classId}/arms`, {
            method: 'POST',
            body: JSON.stringify({ arm: armName })
        });
    },
    
    // Remove an arm from a class
    async removeArm(classId, armName) {
        return apiFetch(`${CONFIG.ENDPOINTS.classes}/${classId}/arms/${encodeURIComponent(armName)}`, {
            method: 'DELETE'
        });
    }
};

// ============================================
// SCHEMES API
// ============================================

export const SchemesAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return apiFetch(`${CONFIG.ENDPOINTS.schemes}${params ? '?' + params : ''}`);
    },
    
    async getById(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.schemes}/${id}`);
    },
    
    async save(scheme) {
        return apiFetch(CONFIG.ENDPOINTS.schemes, {
            method: 'POST',
            body: JSON.stringify(scheme)
        });
    },
    
    async update(id, updates) {
        return apiFetch(`${CONFIG.ENDPOINTS.schemes}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },
    
    async delete(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.schemes}/${id}`, {
            method: 'DELETE'
        });
    }
};

// ============================================
// ATTENDANCE API
// ============================================

export const AttendanceAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return apiFetch(`${CONFIG.ENDPOINTS.attendance}${params ? '?' + params : ''}`);
    },
    
    async getByClass(className, arm = null) {
        let url = `${CONFIG.ENDPOINTS.attendance}/class/${encodeURIComponent(className)}`;
        if (arm) url += `/arm/${encodeURIComponent(arm)}`;
        return apiFetch(url);
    },
    
    async getByDate(date) {
        return apiFetch(`${CONFIG.ENDPOINTS.attendance}/date/${date}`);
    },
    
    async save(record) {
        return apiFetch(CONFIG.ENDPOINTS.attendance, {
            method: 'POST',
            body: JSON.stringify(record)
        });
    },
    
    async delete(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.attendance}/${id}`, {
            method: 'DELETE'
        });
    },
    
    async getStats(classId, term) {
        return apiFetch(`${CONFIG.ENDPOINTS.attendance}/stats/${classId}?term=${term || 'current'}`);
    }
};

// ============================================
// SUBJECTS API
// ============================================

export const SubjectsAPI = {
    async getAll() {
        return apiFetch(CONFIG.ENDPOINTS.subjects);
    }
};

// ============================================
// EXPORT ALL APIS FOR CONVENIENCE
// ============================================

export const API = {
    Auth: AuthAPI,
    Lessons: LessonsAPI,
    Students: StudentsAPI,
    Classes: ClassesAPI,
    Schemes: SchemesAPI,
    Attendance: AttendanceAPI,
    Subjects: SubjectsAPI,
    generateLesson: generateLessonPlan,
    generateAI: generateWithAI
};

export default API;
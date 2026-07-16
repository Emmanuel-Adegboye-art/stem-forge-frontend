// ============================================
// API CALLS WITH FIREBASE AUTH INTEGRATION
// ============================================

import { CONFIG } from './config.js';

export class APIError extends Error {
    constructor(message, type, status) {
        super(message);
        this.type = type;
        this.status = status;
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
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

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

/**
 * Generate lesson plan
 */
export async function generateLessonPlan(data) {
    const result = await apiFetch(CONFIG.ENDPOINTS.generate, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return result.data;
}

/**
 * Generate with AI
 */
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

/**
 * Auth API calls
 */
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

/**
 * Lessons API
 */
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

/**
 * Students API
 */
export const StudentsAPI = {
    async getAll() {
        return apiFetch(CONFIG.ENDPOINTS.students);
    },
    
    async getByClass(className) {
        return apiFetch(`${CONFIG.ENDPOINTS.students}/class/${encodeURIComponent(className)}`);
    },
    
    async add(student) {
        return apiFetch(CONFIG.ENDPOINTS.students, {
            method: 'POST',
            body: JSON.stringify(student)
        });
    },
    
    async update(id, updates) {
        return apiFetch(`${CONFIG.ENDPOINTS.students}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },
    
    async delete(id) {
        return apiFetch(`${CONFIG.ENDPOINTS.students}/${id}`, {
            method: 'DELETE'
        });
    }
};

/**
 * Schemes API
 */
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

/**
 * Attendance API
 */
export const AttendanceAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return apiFetch(`${CONFIG.ENDPOINTS.attendance}${params ? '?' + params : ''}`);
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
    }
};

/**
 * Subjects API
 */
export const SubjectsAPI = {
    async getAll() {
        return apiFetch(CONFIG.ENDPOINTS.subjects);
    }
};

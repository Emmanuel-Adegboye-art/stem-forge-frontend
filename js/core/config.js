// ============================================
// APP CONFIGURATION (UPDATED FOR FIREBASE)
// ============================================

export const CONFIG = {
    // For local development - change this when you deploy
    API_URL: 'https://stemforge-backend-1.onrender.com',
    
    ENDPOINTS: {
        generate: '/api/generate',
        aiGenerate: '/api/ai-generate',
        auth: {
            register: '/api/auth/register',
            login: '/api/auth/login',
            me: '/api/auth/me',
            logout: '/api/auth/logout',
            profile: '/api/auth/profile',
            promoRedeem: '/api/auth/promo/redeem'
        },
        lessons: '/api/lessons',
        students: '/api/students',
        schemes: '/api/schemes',
        attendance: '/api/attendance',
        subjects: '/api/subjects',
        classes: '/api/classes'
    },
    
    STORAGE_KEYS: {
        theme: 'stemforge-theme',
        // Keep these for backward compatibility (migration period)
        savedLessons: 'stemforge:savedLessons',
        savedSchemes: 'stemforge:savedSchemes',
        attendance: 'stemforge:attendance'
    },
    
    TIMEOUT: 120000,
    
    // Feature flags
    FEATURES: {
        requireAuthFor: {
            dashboard: true,
            saveLesson: true,
            attendance: true,
            students: true,
            schemes: true,
            aiGenerate: false  // AI is free to use
        }
    }
};
// ============================================
// APP CONFIGURATION
// ============================================

export const CONFIG = {
    API_URL: 'https://stemforge-backend-1.onrender.com',
    
    ENDPOINTS: {
        generate: '/api/generate',
        aiGenerate: '/api/ai-generate'
    },
    
    STORAGE_KEYS: {
        theme: 'stemforge-theme',
        savedLessons: 'stemforge:savedLessons',
        savedSchemes: 'stemforge:savedSchemes',
        attendance: 'stemforge:attendance'
    },
    
    TIMEOUT: 30000
};

// ============================================
// API CALLS WITH COMPREHENSIVE ERROR HANDLING
// ============================================

import { CONFIG } from './config.js';
import { showStatus } from './utils.js';

export class APIError extends Error {
    constructor(message, type, status) {
        super(message);
        this.type = type;
        this.status = status;
    }
}

/**
 * Generic fetch wrapper with retry logic and detailed errors
 */
async function apiFetch(endpoint, options = {}, retryCount = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
    
    try {
        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        clearTimeout(timeoutId);
        
        // Handle different error types
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // Specific error types
            if (response.status === 503) {
                throw new APIError(
                    'Server is starting up. This takes ~30s on first request.',
                    'SERVICE_UNAVAILABLE',
                    503
                );
            }
            
            if (response.status === 429) {
                throw new APIError(
                    'Rate limit reached. Please wait a moment.',
                    'RATE_LIMIT',
                    429
                );
            }
            
            if (response.status === 504 || response.status === 524) {
                throw new APIError(
                    'Request timed out. The server might be busy.',
                    'TIMEOUT',
                    response.status
                );
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
        
        // Network errors (no connection)
        if (error.name === 'AbortError') {
            throw new APIError(
                'Request timed out. Check your connection.',
                'TIMEOUT',
                0
            );
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new APIError(
                'Cannot connect to server. Working offline.',
                'NETWORK_ERROR',
                0
            );
        }
        
        // Retry logic for 503/504 (Render cold start)
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
 * Generate with AI (with mode support)
 */
export async function generateWithAI(data) {
    try {
        const result = await apiFetch(CONFIG.ENDPOINTS.aiGenerate, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        return {
            data: result.data,
            source: result.source || 'ai'
        };
    } catch (error) {
        // If AI fails, suggest using local generation
        if (error.type === 'NETWORK_ERROR' || error.type === 'SERVICE_UNAVAILABLE') {
            console.warn('AI backend unavailable, using local template');
        }
        throw error;
    }
}

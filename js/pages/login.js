// ============================================
// LOGIN PAGE
// Handles email/password sign-in using Firebase Auth + Backend verification
// ============================================

import { AuthAPI } from '../core/api.js';
import { escapeHtml, showStatus } from '../core/utils.js';

let isSubmitting = false;

export function init() {
    setupForm();
}

function setupForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) {
        showStatus('login-status', 'Please fill in both email and password', 'error');
        return;
    }

    isSubmitting = true;
    const btn = document.getElementById('login-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> <span>Signing in…</span>';
    showStatus('login-status', 'Signing in…', 'info', 0);

    try {
        let user = null;
        let idToken = null;

        // Try Firebase Client Auth first if available
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            user = userCredential.user;
            idToken = await user.getIdToken();
        }

        // Send login verification to backend API
        let backendResult = null;
        try {
            if (idToken) {
                backendResult = await AuthAPI.login(idToken);
            }
        } catch (apiErr) {
            console.warn('Backend login verification notice:', apiErr.message);
        }

        // Check if email is verified
        if (user && !user.emailVerified) {
            showStatus('login-status', 'Email not verified. Redirecting to verification page…', 'info', 2000);
            setTimeout(() => {
                window.location.href = 'verify-email.html';
            }, 1500);
            return;
        }

        // Save user info in localStorage
        const userData = {
            uid: user?.uid || backendResult?.data?.uid || 'user-' + Date.now(),
            email: email,
            name: user?.displayName || backendResult?.data?.name || email.split('@')[0],
            role: backendResult?.data?.role || 'teacher'
        };
        localStorage.setItem('stemforge:user', JSON.stringify(userData));

        showStatus('login-status', 'Login successful! Redirecting…', 'success', 1500);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Login error:', error);
        let msg = 'Invalid email or password';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            msg = 'Invalid email or password';
        } else if (error.message) {
            msg = error.message;
        }
        showStatus('login-status', msg, 'error', 0);
    } finally {
        isSubmitting = false;
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

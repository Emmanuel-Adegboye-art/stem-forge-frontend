    // ============================================
    // LOGIN PAGE
    // Handles email/password sign‑in using Firebase Auth
    // ============================================

    import { AuthAPI } from '../core/api.js';
    import { escapeHtml, showStatus } from '../core/utils.js';

    let isSubmitting = false;

    export function init() {
        setupForm();
        // If user already logged in, redirect to dashboard
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                if (window.location.pathname.endsWith('login.html')) {
                    window.location.href = 'index.html';
                }
            }
        });
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
            const result = await AuthAPI.login({ email, password });
            localStorage.setItem('stemforge:user', JSON.stringify({
                uid: result.data.uid,
                email: result.data.email,
                name: result.data.name
            }));

            showStatus('login-status', 'Login successful! Redirecting…', 'success', 1500);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            console.error('Login error:', error);
            let msg = 'Invalid email or password';
            if (error.response?.data?.error?.message) {
                msg = error.response.data.error.message;
            }
            showStatus('login-status', msg, 'error', 0);
        } finally {
            isSubmitting = false;
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

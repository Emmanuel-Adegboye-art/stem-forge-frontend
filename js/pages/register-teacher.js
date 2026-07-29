// ============================================
// TEACHER / ORGANIZATION REGISTRATION PAGE
// Creates a Firebase Auth user → Firestore profile (users collection)
// ============================================

import { AuthAPI } from '../core/api.js';
import { showStatus } from '../core/utils.js';

let isSubmitting = false;

export function init() {
    setupForm();
}

function setupForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    
    form.addEventListener('submit', handleSubmit);
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
}

export async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    // Grab form values
    const formData = {
        email: document.getElementById('reg-email')?.value.trim(),
        password: document.getElementById('reg-password')?.value,
        name: document.getElementById('reg-name')?.value.trim(),
        employeeId: document.getElementById('reg-employee-id')?.value.trim() || null,
        department: document.getElementById('reg-department')?.value.trim() || null,
        hireDate: document.getElementById('reg-hire-date')?.value || null,
        role: 'teacher'
    };

    // Validation
    const missing = [];
    if (!formData.email) missing.push('Email');
    if (!formData.password) missing.push('Password');
    if (!formData.name) missing.push('Name');
    
    if (missing.length) {
        showStatus('register-status', `Please fill in: ${missing.join(', ')}`, 'error');
        return;
    }

    // Submit
    isSubmitting = true;
    const btn = document.getElementById('register-btn');
    const originalText = btn ? btn.innerHTML : 'Register';
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> <span>Creating account...</span>';
    }
    
    showStatus('register-status', 'Creating your account...', 'info', 0);

    try {
        // Call backend registration API
        const result = await AuthAPI.register(formData);

        // Sign in on client side with Firebase if possible to trigger verification email
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                const cred = await firebase.auth().signInWithEmailAndPassword(formData.email, formData.password);
                if (cred.user && !cred.user.emailVerified) {
                    await cred.user.sendEmailVerification();
                }
            } catch (fbErr) {
                console.warn('Firebase client sign-in after registration:', fbErr.message);
            }
        }

        showStatus('register-status', 'Account created! Redirecting to email verification…', 'success', 2000);

        // Redirect to verify-email.html per requirements
        setTimeout(() => {
            window.location.href = 'verify-email.html';
        }, 1500);

    } catch (error) {
        console.error('Registration error:', error);
        let msg = 'Unable to create account';
        if (error.response?.data?.error?.message) {
            msg = error.response.data.error.message;
        } else if (error.message) {
            msg = error.message;
        }
        showStatus('register-status', msg, 'error', 4000);
    } finally {
        isSubmitting = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}
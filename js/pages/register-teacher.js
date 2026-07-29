// ============================================
// TEACHER / ORGANIZATION REGISTRATION PAGE
// Creates a Firebase Auth user → Firestore profile (users collection)
// ============================================

import { AuthAPI } from '../core/api.js';
import { showStatus } from '../core/utils.js';

let isSubmitting = false;

// ============================================
// INITIALIZATION
// ============================================

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
            window.location.href = 'verify-email.html';
        });
    }
    
    // Register another buttons (in success card)
    const registerAnotherBtn = document.getElementById('register-another-btn');
    if (registerAnotherBtn) {
        registerAnotherBtn.addEventListener('click', resetForm);
    }
    
    const successRegisterAnother = document.getElementById('success-register-another');
    if (successRegisterAnother) {
        successRegisterAnother.addEventListener('click', resetForm);
    }
}

// ============================================
// FORM SUBMISSION
// ============================================

export async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    // ----- Grab form values -----
    const formData = {
        email: document.getElementById('reg-email')?.value.trim(),
        password: document.getElementById('reg-password')?.value,
        name: document.getElementById('reg-name')?.value.trim(),
        employeeId: document.getElementById('reg-employee-id')?.value.trim() || null,
        department: document.getElementById('reg-department')?.value.trim() || null,
        hireDate: document.getElementById('reg-hire-date')?.value || null,
        // Role is hard-coded because this page is for teachers / org admins.
        // Change to 'org_admin' if you need a separate admin role
        role: 'teacher'
    };

    // ----- Validation -----
    const missing = [];
    if (!formData.email) missing.push('Email');
    if (!formData.password) missing.push('Password');
    if (!formData.name) missing.push('Name');
    
    if (missing.length) {
        showStatus('register-status', `Please fill in: ${missing.join(', ')}`, 'error');
        return;
    }

    // ----- Submit -----
    isSubmitting = true;
    const btn = document.getElementById('register-btn');
    const originalText = btn ? btn.innerHTML : 'Register';
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> <span>Creating account...</span>';
    }
    
    showStatus('register-status', 'Creating your account...', 'info', 0);

    try {
        // Call the backend – this will create the Firebase Auth user AND the Firestore profile
        const result = await AuthAPI.register(formData);

        // ----- Success -----
        showStatus('register-status', 'Account created! Redirecting to dashboard...', 'success');

        // Show success card if it exists
        const formCard = document.querySelector('.generator-card');
        if (formCard) formCard.style.display = 'none';

        const successCard = document.getElementById('success-card');
        if (successCard) {
            const nameEl = document.getElementById('success-name');
            const emailEl = document.getElementById('success-id');
            const roleEl = document.getElementById('success-class');
            if (nameEl) nameEl.textContent = formData.name;
            if (emailEl) emailEl.textContent = formData.email;
            if (roleEl) roleEl.textContent = formData.role;
            successCard.style.display = 'block';
        }

        // Optional: redirect after a short pause
        setTimeout(() => {
            window.location.href = 'index.html';
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

function resetForm() {
    const form = document.getElementById('register-form');
    if (form) form.reset();
    
    const successCard = document.getElementById('success-card');
    if (successCard) successCard.style.display = 'none';
    
    const formCard = document.querySelector('.generator-card');
    if (formCard) {
        formCard.style.display = 'block';
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    const status = document.getElementById('register-status');
    if (status) {
        status.classList.add('hidden');
        status.textContent = '';
    }

    setTimeout(() => {
        document.getElementById('reg-name')?.focus();
    }, 300);
}
// ============================================
// UNIFIED REGISTRATION PAGE (OPTION B)
// Handles both Student registration & Teacher/Org user account creation
// ============================================

import { AuthAPI } from '../core/api.js';
import { escapeHtml, showStatus } from '../core/utils.js';
import { StudentsStore, ClassesStore } from '../core/store.js';

let isSubmitting = false;
let currentRole = 'student';

// ============================================
// INITIALIZATION
// ============================================

export function init() {
    setupRoleToggle();
    setupForm();
    setupLivePreview();
    checkUrlParams();
    setupPasswordToggles();
}

// ============================================
// PASSWORD TOGGLES & CONFIRM MATCH
// ============================================

function setupPasswordToggles() {
    // Wire every toggle button on the page
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';

            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = isHidden ? 'visibility_off' : 'visibility';
        });
    });

    // Live password-match feedback
    const pwField = document.getElementById('reg-password');
    const pwConfirm = document.getElementById('reg-password-confirm');
    const hint = document.getElementById('password-match-hint');

    function checkMatch() {
        if (!hint || !pwConfirm?.value) { if (hint) hint.textContent = ''; return; }
        if (pwField?.value === pwConfirm.value) {
            hint.textContent = '✅ Passwords match';
            hint.className = 'password-match-hint matched';
        } else {
            hint.textContent = '❌ Passwords do not match';
            hint.className = 'password-match-hint mismatched';
        }
    }

    if (pwField) pwField.addEventListener('input', checkMatch);
    if (pwConfirm) pwConfirm.addEventListener('input', checkMatch);
}

function setupRoleToggle() {
    const roleSelect = document.getElementById('reg-role');
    roleSelect?.addEventListener('change', () => setRole(roleSelect.value));

    document.getElementById('student-role-btn')?.addEventListener('click', () => setRole('student'));
    document.getElementById('teacher-role-btn')?.addEventListener('click', () => setRole('teacher'));

    setRole(roleSelect?.value || document.body.dataset.role || 'student');
}

function setRole(role) {
    currentRole = role === 'teacher' ? 'teacher' : 'student';

    const roleSelect = document.getElementById('reg-role');
    if (roleSelect) roleSelect.value = currentRole;

    updateRoleUI();
}

function updateRoleUI() {
    const role = currentRole;
    const studentReq = document.getElementById('student-required-fields');
    const studentOpt = document.getElementById('student-optional-fields');
    const teacherFields = document.getElementById('teacher-fields');
    const submitBtn = document.getElementById('register-btn');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const formHeading = document.getElementById('form-heading');

    const activeBtn = document.getElementById(`${role}-role-btn`);
    [document.getElementById('student-role-btn'), document.getElementById('teacher-role-btn')]
        .filter(Boolean)
        .forEach(btn => {
            const isActive = btn === activeBtn;
            btn.classList.toggle('bg-white', isActive);
            btn.classList.toggle('shadow-sm', isActive);
            btn.classList.toggle('text-deep-navy', isActive);
            btn.classList.toggle('text-secondary', !isActive);
        });

    if (role === 'teacher') {
        if (studentReq) studentReq.style.display = 'none';
        if (studentOpt) studentOpt.style.display = 'none';
        if (teacherFields) teacherFields.style.display = 'block';

        if (pageTitle) pageTitle.textContent = '👩‍🏫 Register Teacher / Organization';
        if (pageSubtitle) pageSubtitle.textContent = 'Create a new teacher or organization account to log in';
        if (formHeading) formHeading.textContent = 'Teacher / Organization Registration';
        if (submitBtn) submitBtn.innerHTML = '💾 Create Account';
    } else {
        if (studentReq) studentReq.style.display = 'block';
        if (studentOpt) studentOpt.style.display = 'block';
        if (teacherFields) teacherFields.style.display = 'none';

        if (pageTitle) pageTitle.textContent = '➕ Register New Student';
        if (pageSubtitle) pageSubtitle.textContent = 'Add a student to your class roster';
        if (formHeading) formHeading.textContent = 'Student Information';
        if (submitBtn) submitBtn.innerHTML = '💾 Register Student';
    }
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
    
    // Register another button
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
// URL PARAMS
// ============================================

function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    const classParam = urlParams.get('class');
    const armParam = urlParams.get('arm');
    
    if (roleParam) {
        setRole(roleParam);
    }

    if (classParam) {
        const classSelect = document.getElementById('reg-class');
        if (classSelect) {
            classSelect.value = classParam;
            updateIdPreview();
        }
    }
    
    if (armParam) {
        const armSelect = document.getElementById('reg-arm');
        if (armSelect) {
            armSelect.value = armParam;
            updateIdPreview();
        }
    }
}

// ============================================
// LIVE ID PREVIEW (FOR STUDENTS)
// ============================================

function setupLivePreview() {
    const classSelect = document.getElementById('reg-class');
    const armSelect = document.getElementById('reg-arm');
    
    if (classSelect) classSelect.addEventListener('change', updateIdPreview);
    if (armSelect) armSelect.addEventListener('change', updateIdPreview);
}

function updateIdPreview() {
    const className = document.getElementById('reg-class')?.value;
    const arm = document.getElementById('reg-arm')?.value;
    const previewValue = document.getElementById('id-preview-value');
    
    if (!previewValue) return;
    
    if (!className || !arm) {
        previewValue.textContent = 'Select class & arm first';
        previewValue.classList.remove('ready');
        return;
    }
    
    const nextId = StudentsStore.generateId(className, arm);
    previewValue.textContent = nextId;
    previewValue.classList.add('ready');
}

// ============================================
// FORM SUBMISSION BRANCHING
// ============================================

async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    if (currentRole === 'teacher') {
        await handleTeacherSubmit();
    } else {
        await handleStudentSubmit();
    }
}

// ----- STUDENT SUBMIT -----
async function handleStudentSubmit() {
    const formData = {
        name: document.getElementById('reg-name')?.value.trim(),
        class: document.getElementById('reg-class')?.value,
        arm: document.getElementById('reg-arm')?.value,
        gender: document.getElementById('reg-gender')?.value,
        dateOfBirth: document.getElementById('reg-dob')?.value || null,
        parentName: document.getElementById('reg-parent-name')?.value.trim() || null,
        parentPhone: document.getElementById('reg-parent-phone')?.value.trim() || null,
        parentEmail: document.getElementById('reg-parent-email')?.value.trim() || null,
        address: document.getElementById('reg-address')?.value.trim() || null,
        notes: document.getElementById('reg-notes')?.value.trim() || null
    };

    if (!formData.name || !formData.class || !formData.arm || !formData.gender) {
        showStatus('register-status', 'Please fill in required fields (Name, Class, Arm, Gender)', 'error');
        return;
    }

    isSubmitting = true;
    const btn = document.getElementById('register-btn');
    const originalText = btn ? btn.innerHTML : 'Register Student';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> <span>Registering...</span>';
    }

    showStatus('register-status', 'Registering student...', 'info', 0);

    try {
        formData.id = StudentsStore.generateId(formData.class, formData.arm);
        formData.currentClass = `${formData.class} ${formData.arm}`.trim();
        formData.enrolledDate = new Date().toISOString();
        formData.active = true;
        formData.createdAt = new Date().toISOString();
        formData.updatedAt = new Date().toISOString();

        StudentsStore.save(formData);

        const status = document.getElementById('register-status');
        if (status) status.textContent = '';

        showStudentSuccessCard(formData);
    } catch (error) {
        console.error('Student registration error:', error);
        showStatus('register-status', 'Failed to register student.', 'error', 4000);
    } finally {
        isSubmitting = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

// ----- TEACHER / USER SUBMIT -----
async function handleTeacherSubmit() {
    const password = document.getElementById('reg-password')?.value;
    const passwordConfirm = document.getElementById('reg-password-confirm')?.value;

    // Validate password length
    if (password && password.length < 8) {
        showStatus('register-status', 'Password must be at least 8 characters', 'error');
        return;
    }

    // Validate password match
    if (password !== passwordConfirm) {
        showStatus('register-status', 'Passwords do not match — please re-enter', 'error');
        document.getElementById('reg-password-confirm')?.focus();
        return;
    }

    const formData = {
        name: document.getElementById('reg-name')?.value.trim(),
        email: document.getElementById('reg-email')?.value.trim(),
        password,
        employeeId: document.getElementById('reg-employee-id')?.value.trim() || null,
        department: document.getElementById('reg-department')?.value.trim() || null,
        hireDate: document.getElementById('reg-hire-date')?.value || null,
        role: 'teacher'
    };

    if (!formData.name || !formData.email || !formData.password) {
        showStatus('register-status', 'Please fill in Name, Email, and Password', 'error');
        return;
    }

    // Make sure Firebase Client SDK is available
    if (typeof firebase === 'undefined' || !firebase.auth) {
        showStatus('register-status', 'Authentication service unavailable. Please refresh and try again.', 'error');
        return;
    }

    isSubmitting = true;
    const btn = document.getElementById('register-btn');
    const originalText = btn ? btn.innerHTML : 'Create Account';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> <span>Creating Account...</span>';
    }

    showStatus('register-status', 'Creating your account…', 'info', 0);

    try {
        // 1️⃣  Create the Firebase user directly via client SDK (no Admin SDK needed)
        const cred = await firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password);
        const user = cred.user;

        // 2️⃣  Set display name
        await user.updateProfile({ displayName: formData.name });

        // 3️⃣  Send email verification
        await user.sendEmailVerification();

        // 4️⃣  (Optional) Persist extra profile info to backend — fail silently so
        //      a broken Render deploy never blocks account creation
        try {
            const idToken = await user.getIdToken();
            await fetch('https://stemforge-backend-1.onrender.com/api/auth/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    role: formData.role,
                    employeeId: formData.employeeId,
                    department: formData.department,
                    hireDate: formData.hireDate
                })
            });
        } catch (profileErr) {
            console.warn('Profile save to backend failed (non-fatal):', profileErr.message);
        }

        // 5️⃣  Sign out immediately so the user goes through the verify-email flow
        await firebase.auth().signOut();

        showStatus('register-status', 'Account created! Check your email to verify, then log in.', 'success', 0);
        setTimeout(() => {
            window.location.href = 'verify-email.html';
        }, 1800);

    } catch (error) {
        console.error('Teacher registration error:', error);
        // Surface friendly Firebase error messages
        const firebaseMessages = {
            'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
            'auth/network-request-failed': 'Network error — please check your connection and try again.',
        };
        const msg = firebaseMessages[error.code] || error.message || 'Unable to create account';
        showStatus('register-status', msg, 'error', 6000);
    } finally {
        isSubmitting = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

// ============================================
// SUCCESS CARDS & RESET
// ============================================

function showStudentSuccessCard(student) {
    const form = document.getElementById('register-form');
    if (form) form.style.display = 'none';

    const successTitle = document.getElementById('success-title');
    if (successTitle) successTitle.textContent = 'Student Registered Successfully!';

    document.getElementById('success-name').textContent = student.name;
    document.getElementById('success-id').textContent = student.id;
    document.getElementById('success-class').textContent = `${student.class} ${student.arm}`.trim();

    const successCard = document.getElementById('success-card');
    if (successCard) {
        successCard.style.display = 'block';
        successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function resetForm() {
    const form = document.getElementById('register-form');
    if (form) {
        form.reset();
        form.style.display = 'block';
    }

    const successCard = document.getElementById('success-card');
    if (successCard) successCard.style.display = 'none';

    const status = document.getElementById('register-status');
    if (status) status.textContent = '';

    updateRoleUI();
    updateIdPreview();
}

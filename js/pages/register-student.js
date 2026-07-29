// ============================================
// UNIFIED REGISTRATION PAGE (OPTION B)
// Handles both Student registration & Teacher/Org user account creation
// ============================================

import { AuthAPI } from '../core/api.js';
import { escapeHtml, showStatus } from '../core/utils.js';
import { StudentsStore, ClassesStore } from '../core/store.js';

let isSubmitting = false;

// ============================================
// INITIALIZATION
// ============================================

export function init() {
    setupRoleToggle();
    setupForm();
    setupLivePreview();
    checkUrlParams();
}

function setupRoleToggle() {
    const roleSelect = document.getElementById('reg-role');
    if (!roleSelect) return;

    roleSelect.addEventListener('change', updateRoleUI);
    // Initial sync
    updateRoleUI();
}

function updateRoleUI() {
    const role = document.getElementById('reg-role')?.value || 'student';
    const studentReq = document.getElementById('student-required-fields');
    const studentOpt = document.getElementById('student-optional-fields');
    const teacherFields = document.getElementById('teacher-fields');
    const submitBtn = document.getElementById('register-btn');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const formHeading = document.getElementById('form-heading');

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
        const roleSelect = document.getElementById('reg-role');
        if (roleSelect) {
            roleSelect.value = roleParam;
            updateRoleUI();
        }
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

    const role = document.getElementById('reg-role')?.value || 'student';

    if (role === 'teacher') {
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
    const formData = {
        name: document.getElementById('reg-name')?.value.trim(),
        email: document.getElementById('reg-email')?.value.trim(),
        password: document.getElementById('reg-password')?.value,
        employeeId: document.getElementById('reg-employee-id')?.value.trim() || null,
        department: document.getElementById('reg-department')?.value.trim() || null,
        hireDate: document.getElementById('reg-hire-date')?.value || null,
        role: 'teacher'
    };

    if (!formData.name || !formData.email || !formData.password) {
        showStatus('register-status', 'Please fill in Name, Email, and Password', 'error');
        return;
    }

    isSubmitting = true;
    const btn = document.getElementById('register-btn');
    const originalText = btn ? btn.innerHTML : 'Create Account';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> <span>Creating Account...</span>';
    }

    showStatus('register-status', 'Creating your account...', 'info', 0);

    try {
        const result = await AuthAPI.register(formData);

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
        setTimeout(() => {
            window.location.href = 'verify-email.html';
        }, 1500);

    } catch (error) {
        console.error('Teacher registration error:', error);
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

// ============================================
// SUCCESS CARDS & RESET
// ============================================

function showStudentSuccessCard(student) {
    const formCard = document.querySelector('.generator-card');
    if (formCard) formCard.style.display = 'none';

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
    if (form) form.reset();
    
    const successCard = document.getElementById('success-card');
    if (successCard) successCard.style.display = 'none';
    
    const formCard = document.querySelector('.generator-card');
    if (formCard) formCard.style.display = 'block';

    updateRoleUI();
}

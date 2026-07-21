// ============================================
// REGISTER STUDENT PAGE
// Add new students with auto-generated IDs
// ============================================

import { escapeHtml, showStatus } from '../core/utils.js';
import { StudentsStore, ClassesStore } from '../core/store.js';

let isSubmitting = false;

// ============================================
// INITIALIZATION
// ============================================

export function init() {
    setupForm();
    setupLivePreview();
    checkUrlParams();
}

function setupForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    
    form.addEventListener('submit', handleSubmit);
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'students.html';
        });
    }
    
    // Register another button (in success card)
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
// URL PARAMS (for "Add Student to JSS 1A" buttons)
// ============================================

function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const classParam = urlParams.get('class');
    const armParam = urlParams.get('arm');
    
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
// LIVE ID PREVIEW
// ============================================

function setupLivePreview() {
    const classSelect = document.getElementById('reg-class');
    const armSelect = document.getElementById('reg-arm');
    
    if (classSelect) {
        classSelect.addEventListener('change', updateIdPreview);
    }
    
    if (armSelect) {
        armSelect.addEventListener('change', updateIdPreview);
    }
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
    
    const nextId = generateNextStudentId(className, arm);
    previewValue.textContent = nextId;
    previewValue.classList.add('ready');
}

function generateNextStudentId(className, arm) {
    // Get existing students
    const students = getAllStudents();
    
    // Filter students in same class & arm
    const classStudents = students.filter(s => 
        s.class === className && s.arm === arm
    );
    
    // Get class code (J1, J2, S1, G1, G10, etc.)
    const classCode = getClassCode(className);
    
    // Get arm code (first letter or first 2 chars for special arms)
    const armCode = getArmCode(arm);
    
    // Find next number
    const prefix = `${classCode}${armCode}`;
    const existingIds = classStudents
        .map(s => s.id || '')
        .filter(id => id.startsWith(prefix))
        .map(id => {
            const numPart = id.substring(prefix.length);
            return parseInt(numPart, 10) || 0;
        });
    
    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

function getClassCode(className) {
    // JSS 1 -> J1, JSS 2 -> J2, SS 1 -> S1
    if (className.startsWith('JSS')) {
        const num = className.replace('JSS', '').trim();
        return `J${num}`;
    }
    if (className.startsWith('SS')) {
        const num = className.replace('SS', '').trim();
        return `S${num}`;
    }
    if (className.startsWith('Grade')) {
        const num = className.replace('Grade', '').trim();
        return `G${num}`;
    }
    return 'X'; // Fallback
}

function getArmCode(arm) {
    // A -> A, B -> B, Gold -> G, Silver -> S, Diamond -> D
    if (arm.length === 1) return arm;
    return arm.charAt(0).toUpperCase();
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Get form data
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
    
    // Validation
    if (!formData.name || !formData.class || !formData.arm || !formData.gender) {
        showStatus('register-status', 'Please fill in all required fields (Name, Class, Arm, Gender)', 'error');
        return;
    }
    
    // Check for duplicate names in same class
    const existing = getAllStudents();
    const duplicate = existing.find(s => 
        s.name.toLowerCase() === formData.name.toLowerCase() &&
        s.class === formData.class &&
        s.arm === formData.arm &&
        s.active !== false
    );
    
    if (duplicate) {
        const confirmAdd = confirm(
            `A student named "${formData.name}" already exists in ${formData.class} ${formData.arm} (ID: ${duplicate.id}).\n\nDo you want to add another student with the same name?`
        );
        if (!confirmAdd) return;
    }

    // Set submitting state
    isSubmitting = true;
    const submitBtn = document.getElementById('register-btn');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> <span>Registering...</span>';
    }
    
    showStatus('register-status', 'Registering student...', 'info', 0);
    
    try {
        // Generate ID using the shared store
        formData.id = StudentsStore.generateId(formData.class, formData.arm);
        formData.currentClass = `${formData.class} ${formData.arm}`.trim();
        formData.enrolledDate = new Date().toISOString();
        formData.active = true;
        formData.createdAt = new Date().toISOString();
        formData.updatedAt = new Date().toISOString();

        // Save via shared store
        StudentsStore.save(formData);
        
        // Show success
        showSuccessCard(formData);
        
    } catch (error) {
        console.error('Registration failed:', error);
        showStatus('register-status', 'Failed to register student. Please try again.', 'error', 4000);
    } finally {
        isSubmitting = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
}

// ============================================
// SUCCESS CARD
// ============================================

function showSuccessCard(student) {
    // Hide form
    const formCard = document.querySelector('.generator-card');
    if (formCard) formCard.style.display = 'none';
    
    // Populate success card
    document.getElementById('success-name').textContent = student.name;
    document.getElementById('success-id').textContent = student.id;
    document.getElementById('success-class').textContent = `${student.class} ${student.arm}`.trim();
    
    // Show success card
    const successCard = document.getElementById('success-card');
    if (successCard) {
        successCard.style.display = 'block';
        successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Show "Register Another" button in form actions
    const registerAnotherBtn = document.getElementById('register-another-btn');
    if (registerAnotherBtn) {
        registerAnotherBtn.style.display = 'inline-block';
    }
}

function resetForm() {
    // Reset form
    const form = document.getElementById('register-form');
    if (form) form.reset();
    
    // Hide success card
    const successCard = document.getElementById('success-card');
    if (successCard) successCard.style.display = 'none';
    
    // Show form card
    const formCard = document.querySelector('.generator-card');
    if (formCard) {
        formCard.style.display = 'block';
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Hide "Register Another" button
    const registerAnotherBtn = document.getElementById('register-another-btn');
    if (registerAnotherBtn) {
        registerAnotherBtn.style.display = 'none';
    }
    
    // Reset ID preview
    updateIdPreview();
    
    // Clear status
    const status = document.getElementById('register-status');
    if (status) {
        status.classList.add('hidden');
        status.textContent = '';
    }
    
    // Focus on name field
    setTimeout(() => {
        document.getElementById('reg-name')?.focus();
    }, 300);
}

// ============================================
// STORAGE — delegates to shared store
// ============================================

function getAllStudents() {
    return StudentsStore.getAll();
}

function saveAllStudents(students) {
    // Handled by StudentsStore.save() during submit
}

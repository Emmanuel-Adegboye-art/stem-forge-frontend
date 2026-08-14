// ============================================
// DASHBOARD PAGE LOGIC
// ============================================

import { escapeHtml } from '../core/utils.js';
import { ClassesStore, StudentsStore, AttendanceStore } from '../core/store.js';

export function init() {
    updateWelcomeBanner();
    loadDashboardStats();
}

function updateWelcomeBanner() {
    const storedUser = JSON.parse(localStorage.getItem('stemforge:user') || '{}');
    const firebaseUser = window.firebaseAuth?.currentUser;
    const name = firebaseUser?.displayName || storedUser.name || firebaseUser?.email?.split('@')[0] || 'Educator';

    const bannerTitle = document.querySelector('.welcome-banner h2');
    if (bannerTitle) {
        bannerTitle.textContent = `👋 Welcome back, ${name}!`;
    }
}

function loadDashboardStats() {
    // Attendance count
    const attendanceRecords = AttendanceStore.getAll();
    const attendanceEl = document.getElementById('attendance-count');
    if (attendanceEl) {
        attendanceEl.textContent = attendanceRecords.length;
    }

    // Students count
    const students = StudentsStore.getAll();
    const studentCountEl = document.getElementById('students-count');
    if (studentCountEl) {
        studentCountEl.textContent = students.length;
    }

    // Classes count
    const classes = ClassesStore.getAll();
    const classCountEl = document.getElementById('classes-count');
    if (classCountEl) {
        classCountEl.textContent = classes.length;
    }
}

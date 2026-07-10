// ============================================
// ATTENDANCE SYSTEM
// Manages class attendance with local storage
// ============================================

import { escapeHtml, showStatus } from '../core/utils.js';
import { CONFIG } from '../core/config.js';
import { generateStudentId, isValidStudentId } from '../core/studentIdGenerator.js';

const STUDENTS_BY_CLASS = {
    JSS1A: [
        { id: 'J1A001', name: 'Adebayo Tunde' },
        { id: 'J1A002', name: 'Okafor Chiamaka' },
        { id: 'J1A003', name: 'Eze Daniel' },
        { id: 'J1A004', name: 'Bello Aisha' },
        { id: 'J1A005', name: 'Okonkwo Ifeanyi' }
    ],
    JSS1B: [
        { id: 'J1B001', name: 'Adamu Haliru' },
        { id: 'J1B002', name: 'Okeke Miriam' },
        { id: 'J1B003', name: 'Lawal Tunde' }
    ],
    JSS2A: [
        { id: 'J2A001', name: 'Olayinka Femi' },
        { id: 'J2A002', name: 'Nwachukwu Grace' },
        { id: 'J2A003', name: 'Ibrahim Zainab' },
        { id: 'J2A004', name: 'Adeleke David' }
    ],
    JSS2B: [
        { id: 'J2B001', name: 'Akinwale Tomide' },
        { id: 'J2B002', name: 'Eze Ngozi' }
    ],
    JSS3A: [
        { id: 'J3A001', name: 'Okoro Esther' },
        { id: 'J3A002', name: 'Mohammed Ali' },
        { id: 'J3A003', name: 'Ogunleye Tosin' }
    ],
    SS1A: [
        { id: 'S1A001', name: 'Adekunle Joshua' },
        { id: 'S1A002', name: 'Ebere Victoria' }
    ],
    SS2A: [
        { id: 'S2A001', name: 'Balogun Samuel' }
    ]
};

let currentStudents = [];

export function init() {
    const classSelect = document.getElementById('attendance-class');
    if (!classSelect) return;
    
    classSelect.addEventListener('change', loadStudents);
    
    // Set default date
    const dateInput = document.getElementById('attendance-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Wire up action buttons
    const saveBtn = document.getElementById('save-attendance-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveAttendance);
    
    const loadBtn = document.getElementById('load-previous-btn');
    if (loadBtn) loadBtn.addEventListener('click', loadPreviousAttendance);
    
    const markAllBtn = document.getElementById('mark-all-present-btn');
    if (markAllBtn) markAllBtn.addEventListener('click', markAllPresent);
    
    // Populate class dropdown dynamically
    populateClassDropdown(classSelect);
    
    // Initial load
    if (classSelect.value) {
        loadStudents();
    }
    loadHistory();
}

function populateClassDropdown(select) {
    // Clear existing options except first
    const firstOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (firstOption) select.appendChild(firstOption);
    
    // Add classes from data
    Object.keys(STUDENTS_BY_CLASS).forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = formatClassName(className);
        select.appendChild(option);
    });
}

function formatClassName(classCode) {
    // JSS1A -> JSS 1A Robotics
    const match = classCode.match(/([A-Z]+)(\d)([A-C])/);
    if (!match) return classCode;
    
    const [, level, num, section] = match;
    const levelName = level === 'J' ? 'JSS' : 'SS';
    return `${levelName} ${num}${section} Robotics`;
}

function loadStudents() {
    const className = document.getElementById('attendance-class')?.value;
    if (!className) {
        hideStudentList();
        return;
    }
    
    currentStudents = STUDENTS_BY_CLASS[className] || [];
    
    if (currentStudents.length === 0) {
        showStatus('attendance-status', `No students found for ${className}`, 'warning');
        hideStudentList();
        return;
    }
    
    renderStudentList(currentStudents);
    showStudentList();
    updateStats();
    loadHistory();
}

function renderStudentList(students) {
    const list = document.getElementById('student-list');
    if (!list) return;
    
    list.innerHTML = students.map(student => `
        <div class="student-item">
            <div class="student-info">
                <span class="student-id">${escapeHtml(student.id)}</span>
                <span class="student-name">${escapeHtml(student.name)}</span>
            </div>
            <label class="attendance-toggle">
                <span>Present</span>
                <input type="checkbox" class="attendance-check" data-id="${student.id}" checked>
            </label>
        </div>
    `).join('');
    
    // Wire up change listeners
    list.querySelectorAll('.attendance-check').forEach(cb => {
        cb.addEventListener('change', updateStats);
    });
}

function updateStats() {
    const checkboxes = document.querySelectorAll('.attendance-check');
    const total = checkboxes.length;
    const present = Array.from(checkboxes).filter(cb => cb.checked).length;
    const absent = total - present;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    
    document.getElementById('total-students').textContent = total;
    document.getElementById('present-count').textContent = present;
    document.getElementById('absent-count').textContent = absent;
    document.getElementById('attendance-percent').textContent = `${percent}%`;
}

function showStudentList() {
    document.getElementById('student-list-container').style.display = 'block';
    document.getElementById('attendance-stats').style.display = 'grid';
}

function hideStudentList() {
    document.getElementById('student-list-container').style.display = 'none';
    document.getElementById('attendance-stats').style.display = 'none';
}

function saveAttendance() {
    const className = document.getElementById('attendance-class')?.value;
    const date = document.getElementById('attendance-date')?.value;
    
    if (!className || !date) {
        showStatus('attendance-status', 'Please select class and date', 'error');
        return;
    }
    
    if (currentStudents.length === 0) {
        showStatus('attendance-status', 'No students to save', 'warning');
        return;
    }
    
    const attendance = [];
    document.querySelectorAll('.attendance-check').forEach(cb => {
        const student = currentStudents.find(s => s.id === cb.dataset.id);
        if (student) {
            attendance.push({
                id: student.id,
                name: student.name,
                present: cb.checked
            });
        }
    });
    
    const record = {
        class: className,
        date: date,
        students: attendance,
        timestamp: new Date().toISOString(),
        presentCount: attendance.filter(s => s.present).length,
        absentCount: attendance.filter(s => !s.present).length
    };
    
    try {
        const all = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.attendance) || '[]');
        const existingIndex = all.findIndex(r => r.class === className && r.date === date);
        
        if (existingIndex >= 0) {
            all[existingIndex] = record;
        } else {
            all.push(record);
        }
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.attendance, JSON.stringify(all));
        showStatus('attendance-status', '✅ Attendance saved successfully!', 'success', 3000);
        loadHistory();
        
    } catch (error) {
        console.error('Save error:', error);
        showStatus('attendance-status', 'Failed to save. Storage may be full.', 'error', 4000);
    }
}

function loadPreviousAttendance() {
    const className = document.getElementById('attendance-class')?.value;
    const date = document.getElementById('attendance-date')?.value;
    
    if (!className || !date) {
        showStatus('attendance-status', 'Select class and date first', 'warning');
        return;
    }
    
    const all = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.attendance) || '[]');
    const record = all.find(r => r.class === className && r.date === date);
    
    if (!record) {
        showStatus('attendance-status', `No record found for ${date}`, 'warning');
        return;
    }
    
    record.students.forEach(s => {
        const cb = document.querySelector(`.attendance-check[data-id="${s.id}"]`);
        if (cb) cb.checked = s.present;
    });
    
    updateStats();
    showStatus('attendance-status', `📜 Loaded attendance for ${date}`, 'success', 3000);
}

function markAllPresent() {
    document.querySelectorAll('.attendance-check').forEach(cb => cb.checked = true);
    updateStats();
    showStatus('attendance-status', '✅ All students marked present', 'success', 2000);
}

function loadHistory() {
    const className = document.getElementById('attendance-class')?.value;
    if (!className) {
        document.getElementById('attendance-history').style.display = 'none';
        return;
    }
    
    const all = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.attendance) || '[]');
    const classRecords = all
        .filter(r => r.class === className)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const historyList = document.getElementById('history-list');
    const historyDiv = document.getElementById('attendance-history');
    
    if (!historyList || !historyDiv) return;
    
    if (classRecords.length === 0) {
        historyDiv.style.display = 'none';
        return;
    }
    
    historyList.innerHTML = classRecords.slice(0, 10).map(record => {
        const total = record.students?.length || 0;
        const present = record.presentCount || record.students?.filter(s => s.present).length || 0;
        const percent = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return `
            <div class="student-item">
                <div class="student-info">
                    <span>📅 ${escapeHtml(record.date)}</span>
                </div>
                <div class="history-stats">
                    <span>✅ ${present}</span>
                    <span>❌ ${total - present}</span>
                    <span>📊 ${percent}%</span>
                </div>
            </div>
        `;
    }).join('');
    
    historyDiv.style.display = 'block';
}

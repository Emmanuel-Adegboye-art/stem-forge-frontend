// ============================================
// ATTENDANCE SYSTEM
// Takes attendance using REAL students from the
// shared data store (no more hardcoded names).
// ============================================

import { StudentsStore, AttendanceStore, ClassesStore } from '../core/store.js';
import { escapeHtml, showStatus } from '../core/utils.js';

let currentStudents = [];
let currentClass = null;
let currentArm = null;

export function init() {
    const classSelect = document.getElementById('attendance-class');
    const armSelect   = document.getElementById('attendance-arm');
    if (!classSelect) return;

    // Set today's date
    const dateInput = document.getElementById('attendance-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Populate class dropdown from saved classes
    populateClassDropdown(classSelect);

    classSelect.addEventListener('change', () => {
        currentClass = classSelect.value || null;
        currentArm   = null;
        populateArmDropdown(armSelect, currentClass);
        renderRoster();
        loadHistory();
    });

    if (armSelect) {
        armSelect.addEventListener('change', () => {
            currentArm = armSelect.value || null;
            renderRoster();
            loadHistory();
        });
    }

    // Wire up buttons
    const saveBtn        = document.getElementById('save-attendance-btn');
    const loadPrevBtn    = document.getElementById('load-previous-btn');
    const markAllBtn     = document.getElementById('mark-all-present-btn');

    if (saveBtn)     saveBtn.addEventListener('click', saveAttendance);
    if (loadPrevBtn) loadPrevBtn.addEventListener('click', loadPreviousAttendance);
    if (markAllBtn)  markAllBtn.addEventListener('click', markAllPresent);

    loadHistory();
}

// ── Class / Arm dropdowns ─────────────────────

function populateClassDropdown(select) {
    const classes = ClassesStore.getAll();
    select.innerHTML = '<option value="">-- Select class --</option>';

    if (classes.length === 0) {
        select.innerHTML += '<option disabled>No classes yet — add one in Classes page</option>';
        return;
    }

    classes.forEach(cls => {
        const opt = document.createElement('option');
        opt.value = cls.name;
        opt.textContent = cls.name;
        select.appendChild(opt);
    });
}

function populateArmDropdown(armSelect, className) {
    if (!armSelect) return;
    armSelect.innerHTML = '<option value="">-- Select arm --</option>';

    if (!className) return;

    const cls = ClassesStore.getAll().find(c => c.name === className);
    if (!cls) return;

    (cls.arms || ['A']).forEach(arm => {
        const opt = document.createElement('option');
        opt.value = arm;
        opt.textContent = `Arm ${arm}`;
        armSelect.appendChild(opt);
    });
}

// ── Roster ───────────────────────────────────

function renderRoster() {
    const container = document.getElementById('attendance-list');
    const placeholder = document.getElementById('attendance-placeholder');
    const section = document.getElementById('attendance-section');

    if (!currentClass) {
        if (placeholder) placeholder.style.display = 'flex';
        if (section) section.style.display = 'none';
        return;
    }

    currentStudents = StudentsStore.getByClass(currentClass, currentArm || null);

    if (placeholder) placeholder.style.display = 'none';
    if (section) section.style.display = 'block';

    if (!container) return;

    if (currentStudents.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:2rem;color:var(--text-muted)">
                <p>No students in ${currentClass}${currentArm ? ' ' + currentArm : ''} yet.</p>
                <a href="register-student.html?class=${encodeURIComponent(currentClass)}${currentArm ? '&arm=' + encodeURIComponent(currentArm) : ''}" 
                   class="btn btn-primary" style="margin-top:1rem">
                    ➕ Add Students
                </a>
            </div>`;
        return;
    }

    container.innerHTML = currentStudents.map(student => `
        <div class="attendance-row" data-id="${escapeHtml(student.id)}">
            <div class="student-info">
                <span class="student-id">${escapeHtml(student.id)}</span>
                <span class="student-name">${escapeHtml(student.name)}</span>
            </div>
            <div class="attendance-buttons">
                <button class="att-btn present" data-status="present" onclick="setStatus(this, 'present')">✅ Present</button>
                <button class="att-btn absent"  data-status="absent"  onclick="setStatus(this, 'absent')">❌ Absent</button>
                <button class="att-btn late"    data-status="late"    onclick="setStatus(this, 'late')">⏰ Late</button>
            </div>
        </div>
    `).join('');
}

// Make setStatus globally accessible (onclick attribute in HTML)
window.setStatus = function(btn, status) {
    const row = btn.closest('.attendance-row');
    row.querySelectorAll('.att-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    row.dataset.status = status;
};

// ── Actions ───────────────────────────────────

function markAllPresent() {
    document.querySelectorAll('.attendance-row').forEach(row => {
        row.querySelectorAll('.att-btn').forEach(b => b.classList.remove('selected'));
        const presentBtn = row.querySelector('.att-btn.present');
        if (presentBtn) {
            presentBtn.classList.add('selected');
            row.dataset.status = 'present';
        }
    });
}

function saveAttendance() {
    if (!currentClass) {
        showStatus('attendance-status', 'Please select a class first.', 'error');
        return;
    }

    const date = document.getElementById('attendance-date')?.value;
    if (!date) {
        showStatus('attendance-status', 'Please select a date.', 'error');
        return;
    }

    const rows = document.querySelectorAll('.attendance-row');
    if (rows.length === 0) {
        showStatus('attendance-status', 'No students to mark.', 'error');
        return;
    }

    const entries = [];
    let unmarked = 0;

    rows.forEach(row => {
        const id = row.dataset.id;
        const status = row.dataset.status || '';
        const student = currentStudents.find(s => s.id === id);
        if (!status) { unmarked++; return; }
        entries.push({ id, name: student?.name || id, status });
    });

    if (unmarked > 0) {
        const go = confirm(`${unmarked} student(s) have no status marked. Save anyway (they will be skipped)?`);
        if (!go) return;
    }

    AttendanceStore.saveRecord(currentClass, currentArm || '', date, entries);
    showStatus('attendance-status', `✅ Attendance saved for ${currentClass}${currentArm ? ' ' + currentArm : ''} — ${date}`, 'success', 4000);
    loadHistory();
}

function loadPreviousAttendance() {
    if (!currentClass) {
        showStatus('attendance-status', 'Select a class first.', 'error');
        return;
    }

    const date = document.getElementById('attendance-date')?.value;
    if (!date) {
        showStatus('attendance-status', 'Select a date first.', 'error');
        return;
    }

    const record = AttendanceStore.getRecord(currentClass, currentArm || '', date);
    if (!record) {
        showStatus('attendance-status', `No saved attendance found for ${date}.`, 'info', 3000);
        return;
    }

    // Apply saved statuses
    record.entries.forEach(entry => {
        const row = document.querySelector(`.attendance-row[data-id="${entry.id}"]`);
        if (!row) return;
        row.dataset.status = entry.status;
        row.querySelectorAll('.att-btn').forEach(b => {
            b.classList.toggle('selected', b.dataset.status === entry.status);
        });
    });

    showStatus('attendance-status', `Loaded attendance from ${date}`, 'success', 3000);
}

// ── History ───────────────────────────────────

function loadHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;

    const records = currentClass
        ? AttendanceStore.getByClass(currentClass, currentArm || null)
        : AttendanceStore.getAll();

    const sorted = records.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

    if (sorted.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);text-align:center">No attendance records yet.</p>`;
        return;
    }

    container.innerHTML = sorted.map(r => {
        const present = (r.entries || []).filter(e => e.status === 'present').length;
        const total   = (r.entries || []).length;
        return `
            <div class="history-item">
                <span class="history-date">${r.date}</span>
                <span class="history-class">${r.class}${r.arm ? ' ' + r.arm : ''}</span>
                <span class="history-count">${present}/${total} present</span>
            </div>`;
    }).join('');
}

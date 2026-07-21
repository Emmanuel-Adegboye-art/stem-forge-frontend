// ============================================
// ATTENDANCE SYSTEM
// Uses REAL students from the shared store.
// Works with the existing attendance.html structure.
// ============================================

import { StudentsStore, AttendanceStore, ClassesStore } from '../core/store.js';
import { escapeHtml, showStatus } from '../core/utils.js';

let currentStudents = [];
let currentClass    = null;
let currentArm      = null;

export function init() {
    const classSelect = document.getElementById('attendance-class');
    if (!classSelect) return;

    // Set today's date
    const dateInput = document.getElementById('attendance-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Build class dropdown from saved classes
    populateClassDropdown(classSelect);

    // Inject arm dropdown if it doesn't exist yet
    injectArmDropdown(classSelect);

    // Wire events
    classSelect.addEventListener('change', onClassChange);

    const saveBtn     = document.getElementById('save-attendance-btn');
    const loadPrevBtn = document.getElementById('load-previous-btn');
    const markAllBtn  = document.getElementById('mark-all-present-btn');

    if (saveBtn)     saveBtn.addEventListener('click', saveAttendance);
    if (loadPrevBtn) loadPrevBtn.addEventListener('click', loadPreviousAttendance);
    if (markAllBtn)  markAllBtn.addEventListener('click', markAllPresent);

    // Show history panel
    const historyPanel = document.getElementById('attendance-history');
    if (historyPanel) historyPanel.style.display = 'block';
    loadHistory();
}

// ── Dropdowns ─────────────────────────────────────────────

function populateClassDropdown(select) {
    const classes = ClassesStore.getAll();
    select.innerHTML = '<option value="">-- Select class --</option>';

    if (classes.length === 0) {
        select.innerHTML += '<option disabled>No classes yet — create one in Classes page</option>';
        return;
    }
    classes.forEach(cls => {
        const opt = document.createElement('option');
        opt.value = cls.name;
        opt.textContent = cls.name;
        select.appendChild(opt);
    });
}

function injectArmDropdown(classSelect) {
    // Only inject once
    if (document.getElementById('attendance-arm')) return;

    const wrapper = classSelect.closest('.form-row') || classSelect.parentElement;
    const armGroup = document.createElement('div');
    armGroup.className = 'form-group';
    armGroup.id = 'arm-group';
    armGroup.style.display = 'none';
    armGroup.innerHTML = `
        <label for="attendance-arm">🏷️ Select Arm</label>
        <select id="attendance-arm">
            <option value="">-- Select arm --</option>
        </select>`;

    // Insert after classSelect's parent group
    const classGroup = classSelect.closest('.form-group') || classSelect.parentElement;
    classGroup.insertAdjacentElement('afterend', armGroup);

    document.getElementById('attendance-arm').addEventListener('change', onArmChange);
}

function populateArmDropdown(className) {
    const armSelect = document.getElementById('attendance-arm');
    const armGroup  = document.getElementById('arm-group');
    if (!armSelect || !armGroup) return;

    const cls = ClassesStore.getAll().find(c => c.name === className);
    if (!cls || !cls.arms || cls.arms.length === 0) {
        armGroup.style.display = 'none';
        // No arms defined — treat entire class as one group
        currentArm = '';
        renderRoster();
        return;
    }

    armSelect.innerHTML = '<option value="">-- Select arm --</option>';
    cls.arms.forEach(arm => {
        const opt = document.createElement('option');
        opt.value = arm;
        opt.textContent = `Arm ${arm}`;
        armSelect.appendChild(opt);
    });

    armGroup.style.display = 'block';
    currentArm = null; // wait for user to pick
    hideStudentList();
}

// ── Event handlers ────────────────────────────────────────

function onClassChange() {
    const classSelect = document.getElementById('attendance-class');
    currentClass = classSelect.value || null;
    currentArm   = null;

    if (!currentClass) {
        hideStudentList();
        const armGroup = document.getElementById('arm-group');
        if (armGroup) armGroup.style.display = 'none';
        loadHistory();
        return;
    }

    populateArmDropdown(currentClass);
    loadHistory();
}

function onArmChange() {
    const armSelect = document.getElementById('attendance-arm');
    currentArm = armSelect.value || null;
    renderRoster();
}

// ── Render student list ───────────────────────────────────

function renderRoster() {
    const container  = document.getElementById('student-list');
    const wrapper    = document.getElementById('student-list-container');
    const statsBox   = document.getElementById('attendance-stats');

    if (!currentClass) {
        hideStudentList();
        return;
    }

    // Load students: if arms exist, require an arm selection
    const cls = ClassesStore.getAll().find(c => c.name === currentClass);
    const hasArms = cls && cls.arms && cls.arms.length > 0;
    if (hasArms && currentArm === null) {
        // Waiting for arm selection
        hideStudentList();
        return;
    }

    currentStudents = StudentsStore.getByClass(currentClass, currentArm || null);

    if (wrapper) wrapper.style.display = 'block';
    if (statsBox) statsBox.style.display = 'flex';

    if (!container) return;

    if (currentStudents.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:1.5rem;color:var(--text-muted)">
                <p>📭 No students in ${currentClass}${currentArm ? ' Arm ' + currentArm : ''} yet.</p>
                <a href="register-student.html?class=${encodeURIComponent(currentClass)}${currentArm ? '&arm=' + encodeURIComponent(currentArm) : ''}"
                   class="primary-btn" style="display:inline-block;margin-top:0.75rem;text-decoration:none">
                    ➕ Register Students
                </a>
            </div>`;
        updateStats();
        return;
    }

    container.innerHTML = currentStudents.map(student => `
        <div class="student-attendance-row" data-id="${escapeHtml(student.id)}" data-status="">
            <div class="student-info-block">
                <span class="student-badge">${escapeHtml(student.id)}</span>
                <span class="student-full-name">${escapeHtml(student.name)}</span>
            </div>
            <div class="att-status-btns">
                <button class="att-btn att-present" onclick="markStatus(this,'present')" title="Present">✅ Present</button>
                <button class="att-btn att-absent"  onclick="markStatus(this,'absent')"  title="Absent">❌ Absent</button>
                <button class="att-btn att-late"    onclick="markStatus(this,'late')"    title="Late">⏰ Late</button>
            </div>
        </div>
    `).join('');

    updateStats();
}

function hideStudentList() {
    const wrapper  = document.getElementById('student-list-container');
    const statsBox = document.getElementById('attendance-stats');
    if (wrapper)  wrapper.style.display  = 'none';
    if (statsBox) statsBox.style.display = 'none';
}

// Exposed globally for onclick attributes
window.markStatus = function(btn, status) {
    const row = btn.closest('.student-attendance-row');
    if (!row) return;
    row.querySelectorAll('.att-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    row.dataset.status = status;
    updateStats();
};

function updateStats() {
    const rows    = document.querySelectorAll('.student-attendance-row');
    const total   = currentStudents.length;
    const present = [...rows].filter(r => r.dataset.status === 'present').length;
    const absent  = [...rows].filter(r => r.dataset.status === 'absent').length;
    const rate    = total > 0 ? Math.round((present / total) * 100) : 0;

    const el = id => document.getElementById(id);
    if (el('total-students'))   el('total-students').textContent   = total;
    if (el('present-count'))    el('present-count').textContent    = present;
    if (el('absent-count'))     el('absent-count').textContent     = absent;
    if (el('attendance-percent')) el('attendance-percent').textContent = rate + '%';
}

// ── Actions ───────────────────────────────────────────────

function markAllPresent() {
    document.querySelectorAll('.student-attendance-row').forEach(row => {
        row.querySelectorAll('.att-btn').forEach(b => b.classList.remove('selected'));
        const btn = row.querySelector('.att-present');
        if (btn) { btn.classList.add('selected'); row.dataset.status = 'present'; }
    });
    updateStats();
}

function saveAttendance() {
    if (!currentClass) {
        showStatus('attendance-status', 'Please select a class first.', 'error', 3000);
        return;
    }
    const date = document.getElementById('attendance-date')?.value;
    if (!date) {
        showStatus('attendance-status', 'Please select a date.', 'error', 3000);
        return;
    }
    const rows = document.querySelectorAll('.student-attendance-row');
    if (rows.length === 0) {
        showStatus('attendance-status', 'No students to mark.', 'error', 3000);
        return;
    }

    const entries = [];
    let unmarked = 0;
    rows.forEach(row => {
        const id = row.dataset.id;
        const status = row.dataset.status;
        const student = currentStudents.find(s => s.id === id);
        if (!status) { unmarked++; return; }
        entries.push({ id, name: student?.name || id, status });
    });

    if (unmarked > 0) {
        const go = confirm(`${unmarked} student(s) have no status. Save anyway (they'll be skipped)?`);
        if (!go) return;
    }

    AttendanceStore.saveRecord(currentClass, currentArm || '', date, entries);
    showStatus('attendance-status',
        `✅ Saved — ${currentClass}${currentArm ? ' Arm ' + currentArm : ''} | ${date} | ${entries.length} students`,
        'success', 5000);
    loadHistory();
}

function loadPreviousAttendance() {
    if (!currentClass) {
        showStatus('attendance-status', 'Select a class first.', 'error', 3000);
        return;
    }
    const date = document.getElementById('attendance-date')?.value;
    if (!date) {
        showStatus('attendance-status', 'Select a date first.', 'error', 3000);
        return;
    }

    const record = AttendanceStore.getRecord(currentClass, currentArm || '', date);
    if (!record) {
        showStatus('attendance-status', `No saved attendance found for ${date}.`, 'info', 3000);
        return;
    }

    record.entries.forEach(entry => {
        const row = document.querySelector(`.student-attendance-row[data-id="${entry.id}"]`);
        if (!row) return;
        row.dataset.status = entry.status;
        row.querySelectorAll('.att-btn').forEach(b => {
            b.classList.toggle('selected', b.classList.contains(`att-${entry.status}`));
        });
    });
    updateStats();
    showStatus('attendance-status', `Loaded attendance from ${date}`, 'success', 3000);
}

// ── History panel ─────────────────────────────────────────

function loadHistory() {
    const container = document.getElementById('history-list');
    const historyPanel = document.getElementById('attendance-history');
    if (!container) return;

    const records = currentClass
        ? AttendanceStore.getByClass(currentClass, currentArm !== null ? currentArm : null)
        : AttendanceStore.getAll();

    if (records.length === 0) {
        if (historyPanel) historyPanel.style.display = 'none';
        return;
    }

    if (historyPanel) historyPanel.style.display = 'block';

    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);
    container.innerHTML = sorted.map(r => {
        const present = (r.entries || []).filter(e => e.status === 'present').length;
        const total   = (r.entries || []).length;
        const rate    = total > 0 ? Math.round((present / total) * 100) : 0;
        return `
            <div class="history-item" style="display:flex;justify-content:space-between;align-items:center;
                padding:0.6rem 0.75rem;border-bottom:1px solid var(--border-color);gap:1rem;flex-wrap:wrap">
                <span style="font-weight:600;color:var(--text-primary)">${r.date}</span>
                <span style="color:var(--text-secondary)">${r.class}${r.arm ? ' Arm ' + r.arm : ''}</span>
                <span style="color:var(--color-primary);font-weight:600">${present}/${total} present (${rate}%)</span>
            </div>`;
    }).join('');
}

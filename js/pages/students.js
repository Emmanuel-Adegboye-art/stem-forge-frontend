// ============================================
// STUDENT MANAGEMENT PAGE
// View, edit, delete, and move students
// ============================================

import { StudentsAPI } from '../core/api.js';
import { escapeHtml, showStatus } from '../core/utils.js';
import { CONFIG } from '../core/config.js';

let allStudents = [];
let filteredStudents = [];
let currentEditingStudent = null;
let currentMovingStudent = null;

// ============================================
// INITIALIZATION
// ============================================

export async function init() {
    // Load all students
    await loadStudents();
    
    // Set up event listeners
    setupFilters();
    setupModals();
    setupActions();
}

async function loadStudents() {
    const container = document.getElementById('students-container');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    
    try {
        if (loadingState) loadingState.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';
        
        // Fetch from API (falls back to localStorage if not authenticated)
        const response = await StudentsAPI.getAll();
        allStudents = response.data || [];
        
        // Apply filters
        applyFilters();
        
        if (loadingState) loadingState.style.display = 'none';
        
    } catch (error) {
        console.error('Failed to load students:', error);
        if (loadingState) loadingState.style.display = 'none';
        
        // Fallback to localStorage
        allStudents = loadFromLocalStorage();
        applyFilters();
    }
}

function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem('stemforge:students') || '[]';
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return [];
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('stemforge:students', JSON.stringify(allStudents));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

// ============================================
// FILTERS
// ============================================

function setupFilters() {
    const classFilter = document.getElementById('filter-class');
    const armFilter = document.getElementById('filter-arm');
    const searchInput = document.getElementById('filter-search');
    
    if (classFilter) classFilter.addEventListener('change', applyFilters);
    if (armFilter) armFilter.addEventListener('change', applyFilters);
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    // Populate class filter with available classes
    populateClassFilter();
}

function populateClassFilter() {
    const classFilter = document.getElementById('filter-class');
    if (!classFilter) return;
    
    const uniqueClasses = [...new Set(allStudents.map(s => s.class).filter(Boolean))].sort();
    
    // Keep "All Classes" option
    classFilter.innerHTML = '<option value="">All Classes</option>';
    
    uniqueClasses.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        classFilter.appendChild(option);
    });
}

function applyFilters() {
    const classFilter = document.getElementById('filter-class')?.value || '';
    const armFilter = document.getElementById('filter-arm')?.value || '';
    const searchTerm = document.getElementById('filter-search')?.value.toLowerCase().trim() || '';
    
    filteredStudents = allStudents.filter(student => {
        // Only show active students
        if (student.active === false) return false;
        
        // Class filter
        if (classFilter && student.class !== classFilter) return false;
        
        // Arm filter
        if (armFilter && student.arm !== armFilter) return false;
        
        // Search filter
        if (searchTerm) {
            const name = (student.name || '').toLowerCase();
            const id = (student.id || '').toLowerCase();
            if (!name.includes(searchTerm) && !id.includes(searchTerm)) return false;
        }
        
        return true;
    });
    
    renderStudents();
    updateStats();
}

function updateStats() {
    const statsEl = document.getElementById('total-students-count');
    if (statsEl) {
        const count = filteredStudents.length;
        const total = allStudents.filter(s => s.active !== false).length;
        statsEl.textContent = count === total 
            ? `${count} student${count !== 1 ? 's' : ''}`
            : `${count} of ${total} students`;
    }
}

// ============================================
// RENDERING
// ============================================

function renderStudents() {
    const container = document.getElementById('students-container');
    const emptyState = document.getElementById('empty-state');
    
    if (!container) return;
    
    if (filteredStudents.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Group students by class
    const grouped = groupByClass(filteredStudents);
    
    // Render each class group
    container.innerHTML = Object.keys(grouped).sort().map(className => {
        const students = grouped[className];
        return renderClassGroup(className, students);
    }).join('');
    
    // Wire up action buttons
    setupActionButtons();
}

function groupByClass(students) {
    const grouped = {};
    students.forEach(student => {
        const classKey = `${student.class} ${student.arm || ''}`.trim();
        if (!grouped[classKey]) grouped[classKey] = [];
        grouped[classKey].push(student);
    });
    
    // Sort students within each class by ID
    Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
    });
    
    return grouped;
}

function renderClassGroup(className, students) {
    return `
        <div class="class-group">
            <div class="class-group-header">
                <h3>📚 ${escapeHtml(className)} <span class="student-count">(${students.length} student${students.length !== 1 ? 's' : ''})</span></h3>
                <button class="add-student-to-class-btn secondary-btn" data-class="${escapeHtml(students[0].class)}" data-arm="${escapeHtml(students[0].arm || '')}">
                    ➕ Add Student
                </button>
            </div>
            
            <div class="students-table-wrapper">
                <table class="students-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Parent</th>
                            <th class="actions-col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => renderStudentRow(student)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderStudentRow(student) {
    return `
        <tr class="student-row" data-student-id="${escapeHtml(student.id)}">
            <td><span class="student-id-badge">${escapeHtml(student.id)}</span></td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td>${escapeHtml(student.gender || '—')}</td>
            <td>${escapeHtml(student.parentName || '—')}</td>
            <td class="actions-col">
                <div class="action-buttons">
                    <button class="action-btn edit-btn" data-action="edit" data-student-id="${escapeHtml(student.id)}" title="Edit Student">
                        ✏️
                    </button>
                    <button class="action-btn move-btn" data-action="move" data-student-id="${escapeHtml(student.id)}" title="Move to Another Arm">
                        ➡️
                    </button>
                    <button class="action-btn delete-btn" data-action="delete" data-student-id="${escapeHtml(student.id)}" title="Delete Student">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// ============================================
// ACTION HANDLERS
// ============================================

function setupActionButtons() {
    // Action buttons (edit, move, delete)
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleAction);
    });
    
    // Add student to class buttons
    document.querySelectorAll('.add-student-to-class-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const className = e.currentTarget.dataset.class;
            const arm = e.currentTarget.dataset.arm;
            window.location.href = `register-student.html?class=${encodeURIComponent(className)}&arm=${encodeURIComponent(arm)}`;
        });
    });
}

function handleAction(e) {
    const action = e.currentTarget.dataset.action;
    const studentId = e.currentTarget.dataset.studentId;
    const student = allStudents.find(s => s.id === studentId);
    
    if (!student) return;
    
    switch (action) {
        case 'edit':
            openEditModal(student);
            break;
        case 'move':
            openMoveModal(student);
            break;
        case 'delete':
            confirmDelete(student);
            break;
    }
}

function setupActions() {
    // Export button
    const exportBtn = document.getElementById('export-students-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportStudents);
}

// ============================================
// EDIT STUDENT
// ============================================

function openEditModal(student) {
    currentEditingStudent = student;
    
    // Populate form
    document.getElementById('edit-student-id').value = student.id;
    document.getElementById('edit-name').value = student.name || '';
    document.getElementById('edit-gender').value = student.gender || '';
    document.getElementById('edit-dob').value = student.dateOfBirth || '';
    document.getElementById('edit-parent-name').value = student.parentName || '';
    document.getElementById('edit-parent-phone').value = student.parentPhone || '';
    document.getElementById('edit-parent-email').value = student.parentEmail || '';
    document.getElementById('edit-address').value = student.address || '';
    
    // Show modal
    document.getElementById('edit-student-modal').style.display = 'flex';
}

function setupModals() {
    // Edit modal
    const closeEditBtn = document.getElementById('close-edit-modal');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');
    
    if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
    if (saveEditBtn) saveEditBtn.addEventListener('click', saveEdit);
    
    // Move modal
    const closeMoveBtn = document.getElementById('close-move-modal');
    const cancelMoveBtn = document.getElementById('cancel-move-btn');
    const confirmMoveBtn = document.getElementById('confirm-move-btn');
    const targetClass = document.getElementById('move-target-class');
    const targetArm = document.getElementById('move-target-arm');
    
    if (closeMoveBtn) closeMoveBtn.addEventListener('click', closeMoveModal);
    if (cancelMoveBtn) cancelMoveBtn.addEventListener('click', closeMoveModal);
    if (confirmMoveBtn) confirmMoveBtn.addEventListener('click', confirmMove);
    
    if (targetClass) {
        targetClass.addEventListener('change', () => {
            populateTargetArms(targetClass.value);
        });
    }
    
    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function closeEditModal() {
    document.getElementById('edit-student-modal').style.display = 'none';
    currentEditingStudent = null;
}

async function saveEdit() {
    if (!currentEditingStudent) return;
    
    const updatedData = {
        name: document.getElementById('edit-name').value.trim(),
        gender: document.getElementById('edit-gender').value,
        dateOfBirth: document.getElementById('edit-dob').value,
        parentName: document.getElementById('edit-parent-name').value.trim(),
        parentPhone: document.getElementById('edit-parent-phone').value.trim(),
        parentEmail: document.getElementById('edit-parent-email').value.trim(),
        address: document.getElementById('edit-address').value.trim()
    };
    
    if (!updatedData.name) {
        alert('Student name is required');
        return;
    }
    
    try {
        // Try API first
        await StudentsAPI.update(currentEditingStudent.id, updatedData);
        
        // Update local data
        const index = allStudents.findIndex(s => s.id === currentEditingStudent.id);
        if (index >= 0) {
            allStudents[index] = { ...allStudents[index], ...updatedData };
            saveToLocalStorage();
        }
        
        closeEditModal();
        applyFilters();
        
    } catch (error) {
        console.error('Update failed:', error);
        
        // Fallback to localStorage
        const index = allStudents.findIndex(s => s.id === currentEditingStudent.id);
        if (index >= 0) {
            allStudents[index] = { ...allStudents[index], ...updatedData };
            saveToLocalStorage();
            closeEditModal();
            applyFilters();
        }
    }
}

// ============================================
// MOVE STUDENT
// ============================================

function openMoveModal(student) {
    currentMovingStudent = student;
    
    // Show student info
    document.getElementById('move-student-name').textContent = student.name;
    document.getElementById('move-current-class').textContent = `${student.class} ${student.arm || ''}`.trim();
    
    // Populate target class dropdown
    const targetClass = document.getElementById('move-target-class');
    const uniqueClasses = [...new Set(allStudents.map(s => s.class).filter(Boolean))].sort();
    
    targetClass.innerHTML = '<option value="">Select class</option>';
    uniqueClasses.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        targetClass.appendChild(option);
    });
    
    // Reset arm dropdown
    document.getElementById('move-target-arm').innerHTML = '<option value="">Select arm first</option>';
    
    // Show modal
    document.getElementById('move-student-modal').style.display = 'flex';
}

function populateTargetArms(className) {
    const targetArm = document.getElementById('move-target-arm');
    if (!targetArm) return;
    
    // Get unique arms for this class
    const arms = [...new Set(allStudents
        .filter(s => s.class === className && s.arm)
        .map(s => s.arm)
    )].sort();
    
    targetArm.innerHTML = '<option value="">Select arm</option>';
    arms.forEach(arm => {
        const option = document.createElement('option');
        option.value = arm;
        option.textContent = `Arm ${arm}`;
        targetArm.appendChild(option);
    });
}

function closeMoveModal() {
    document.getElementById('move-student-modal').style.display = 'none';
    currentMovingStudent = null;
}

async function confirmMove() {
    if (!currentMovingStudent) return;
    
    const targetClass = document.getElementById('move-target-class').value;
    const targetArm = document.getElementById('move-target-arm').value;
    const reason = document.getElementById('move-reason').value;
    
    if (!targetClass || !targetArm) {
        alert('Please select both target class and arm');
        return;
    }
    
    if (targetClass === currentMovingStudent.class && targetArm === currentMovingStudent.arm) {
        alert('Student is already in this class and arm');
        return;
    }
    
    if (!confirm(`Move ${currentMovingStudent.name} to ${targetClass} ${targetArm}?`)) {
        return;
    }
    
    try {
        // Try API first
        await StudentsAPI.move(currentMovingStudent.id, {
            targetClass,
            targetArm,
            reason
        });
        
        // Update local data
        const index = allStudents.findIndex(s => s.id === currentMovingStudent.id);
        if (index >= 0) {
            allStudents[index].class = targetClass;
            allStudents[index].arm = targetArm;
            allStudents[index].currentClass = `${targetClass} ${targetArm}`.trim();
            allStudents[index].updatedAt = new Date().toISOString();
            saveToLocalStorage();
        }
        
        closeMoveModal();
        applyFilters();
        populateClassFilter();
        
    } catch (error) {
        console.error('Move failed:', error);
        
        // Fallback to localStorage
        const index = allStudents.findIndex(s => s.id === currentMovingStudent.id);
        if (index >= 0) {
            allStudents[index].class = targetClass;
            allStudents[index].arm = targetArm;
            allStudents[index].currentClass = `${targetClass} ${targetArm}`.trim();
            allStudents[index].updatedAt = new Date().toISOString();
            saveToLocalStorage();
            closeMoveModal();
            applyFilters();
            populateClassFilter();
        }
    }
}

// ============================================
// DELETE STUDENT
// ============================================

function confirmDelete(student) {
    const confirmMsg = `Are you sure you want to delete ${student.name} (${student.id})?\n\nThis will mark the student as inactive. Attendance records will be preserved.`;
    
    if (!confirm(confirmMsg)) return;
    
    deleteStudent(student);
}

async function deleteStudent(student) {
    try {
        // Try API first
        await StudentsAPI.delete(student.id);
        
        // Soft delete locally
        const index = allStudents.findIndex(s => s.id === student.id);
        if (index >= 0) {
            allStudents[index].active = false;
            allStudents[index].deletedAt = new Date().toISOString();
            saveToLocalStorage();
        }
        
        applyFilters();
        
    } catch (error) {
        console.error('Delete failed:', error);
        
        // Fallback to localStorage
        const index = allStudents.findIndex(s => s.id === student.id);
        if (index >= 0) {
            allStudents[index].active = false;
            allStudents[index].deletedAt = new Date().toISOString();
            saveToLocalStorage();
            applyFilters();
        }
    }
}

// ============================================
// EXPORT
// ============================================

function exportStudents() {
    const students = filteredStudents.length > 0 ? filteredStudents : allStudents.filter(s => s.active !== false);
    
    if (students.length === 0) {
        alert('No students to export');
        return;
    }
    
    // Create CSV
    const headers = ['Student ID', 'Name', 'Class', 'Arm', 'Gender', 'DOB', 'Parent Name', 'Parent Phone', 'Parent Email'];
    const rows = students.map(s => [
        s.id || '',
        s.name || '',
        s.class || '',
        s.arm || '',
        s.gender || '',
        s.dateOfBirth || '',
        s.parentName || '',
        s.parentPhone || '',
        s.parentEmail || ''
    ]);
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// UTILITIES
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// CLASS MANAGEMENT PAGE
// Create, manage, and upgrade classes
// ============================================

import { escapeHtml, showStatus } from '../core/utils.js';
import { ClassesStore, StudentsStore, AttendanceStore } from '../core/store.js';

let allClasses = [];
let allStudents = [];
let currentUpgradeClass = null;
let currentAddArmClass = null;
let currentRenameClass = null;

// ============================================
// INITIALIZATION
// ============================================

export async function init() {
    await loadData();
    setupEventListeners();
}

async function loadData() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    
    try {
        if (loadingState) loadingState.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';
        
        // Load from localStorage
        allClasses = loadClasses();
        allStudents = loadStudents();
        
        renderClasses();
        
        if (loadingState) loadingState.style.display = 'none';
        
    } catch (error) {
        console.error('Failed to load:', error);
        if (loadingState) loadingState.style.display = 'none';
    }
}

// ============================================
// DATA LAYER — delegates to shared store
// ============================================

function loadClasses() {
    return ClassesStore.getAll();
}

function saveClasses() {
    // Write the current allClasses array to the shared store key
    try {
        localStorage.setItem('stemforge:classes', JSON.stringify(allClasses));
    } catch (e) { console.error('saveClasses failed:', e); }
}

function loadStudents() {
    return StudentsStore.getAll();
}

function saveStudents() {
    // Write the current allStudents array to the shared store key
    try {
        localStorage.setItem('stemforge:students', JSON.stringify(allStudents));
    } catch (e) { console.error('saveStudents failed:', e); }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Create class buttons
    const createBtn = document.getElementById('create-class-btn');
    const emptyCreateBtn = document.getElementById('empty-create-btn');
    if (createBtn) createBtn.addEventListener('click', openCreateClassModal);
    if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', openCreateClassModal);
    
    // Create class modal
    const closeCreateBtn = document.getElementById('close-create-modal');
    const cancelCreateBtn = document.getElementById('cancel-create-btn');
    const confirmCreateBtn = document.getElementById('confirm-create-btn');
    if (closeCreateBtn) closeCreateBtn.addEventListener('click', closeCreateClassModal);
    if (cancelCreateBtn) cancelCreateBtn.addEventListener('click', closeCreateClassModal);
    if (confirmCreateBtn) confirmCreateBtn.addEventListener('click', createClass);
    
    // Add arm modal
    const closeAddArmBtn = document.getElementById('close-add-arm-modal');
    const cancelAddArmBtn = document.getElementById('cancel-add-arm-btn');
    const confirmAddArmBtn = document.getElementById('confirm-add-arm-btn');
    if (closeAddArmBtn) closeAddArmBtn.addEventListener('click', closeAddArmModal);
    if (cancelAddArmBtn) cancelAddArmBtn.addEventListener('click', closeAddArmModal);
    if (confirmAddArmBtn) confirmAddArmBtn.addEventListener('click', addArmToClass);
    
    // Rename modal
    const closeRenameBtn = document.getElementById('close-rename-modal');
    const cancelRenameBtn = document.getElementById('cancel-rename-btn');
    const confirmRenameBtn = document.getElementById('confirm-rename-btn');
    if (closeRenameBtn) closeRenameBtn.addEventListener('click', closeRenameModal);
    if (cancelRenameBtn) cancelRenameBtn.addEventListener('click', closeRenameModal);
    if (confirmRenameBtn) confirmRenameBtn.addEventListener('click', confirmRename);

    // Upgrade modal
    const closeUpgradeBtn = document.getElementById('close-upgrade-modal');
    const cancelUpgradeBtn = document.getElementById('cancel-upgrade-btn');
    const confirmUpgradeBtn = document.getElementById('confirm-upgrade-btn');
    if (closeUpgradeBtn) closeUpgradeBtn.addEventListener('click', closeUpgradeModal);
    if (cancelUpgradeBtn) cancelUpgradeBtn.addEventListener('click', closeUpgradeModal);
    if (confirmUpgradeBtn) confirmUpgradeBtn.addEventListener('click', confirmUpgrade);
    
    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// ============================================
// RENDERING
// ============================================

function renderClasses() {
    const container = document.getElementById('classes-container');
    const emptyState = document.getElementById('empty-state');
    
    if (!container) return;
    
    if (allClasses.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = allClasses.map(cls => renderClassCard(cls)).join('');
    
    // Wire up action buttons
    setupClassActions();
}

function renderClassCard(cls) {
    const studentCount = countStudentsInClass(cls);
    const armCount = (cls.arms || []).length;
    
    return `
        <div class="class-card" data-class-id="${escapeHtml(cls.id)}">
            <div class="class-card-header">
                <div class="class-card-title">
                    <h3>📚 ${escapeHtml(cls.name)}</h3>
                    <div class="class-card-stats">
                        <span class="stat-badge">🏫 ${armCount} arm${armCount !== 1 ? 's' : ''}</span>
                        <span class="stat-badge">👥 ${studentCount} student${studentCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="class-card-actions">
                    <button class="action-btn add-arm-btn" data-class-id="${escapeHtml(cls.id)}" title="Add Arm">➕</button>
                    <button class="action-btn rename-class-btn" data-class-id="${escapeHtml(cls.id)}" title="Rename Class">✏️</button>
                    <button class="action-btn upgrade-btn" data-class-id="${escapeHtml(cls.id)}" title="Upgrade Class">⬆️</button>
                    <button class="action-btn download-btn" data-class-id="${escapeHtml(cls.id)}" title="Download PDF">📄</button>
                    <button class="action-btn delete-class-btn" data-class-id="${escapeHtml(cls.id)}" title="Delete Class">🗑️</button>
                </div>
            </div>
            
            <div class="arms-grid">
                ${(cls.arms || []).map(arm => renderArmCard(cls, arm)).join('')}
                ${armCount === 0 ? '<p class="no-arms">No arms yet. Click ➕ to add one.</p>' : ''}
            </div>
        </div>
    `;
}

function renderArmCard(cls, arm) {
    const studentCount = allStudents.filter(s => 
        s.class === cls.name && s.arm === arm && s.active !== false
    ).length;
    
    return `
        <div class="arm-card">
            <div class="arm-card-header">
                <h4>🏫 Arm ${escapeHtml(arm)}</h4>
                <span class="arm-student-count">${studentCount}</span>
            </div>
            <div class="arm-card-actions">
                <a href="register-student.html?class=${encodeURIComponent(cls.name)}&arm=${encodeURIComponent(arm)}" 
                   class="arm-action-btn">➕ Add Student</a>
                <a href="attendance.html?class=${encodeURIComponent(cls.name)}&arm=${encodeURIComponent(arm)}" 
                   class="arm-action-btn">📋 Take Attendance</a>
                <button class="arm-action-btn delete-arm-btn" 
                        data-class-id="${escapeHtml(cls.id)}" 
                        data-arm="${escapeHtml(arm)}">🗑️ Delete</button>
            </div>
        </div>
    `;
}

function countStudentsInClass(cls) {
    return allStudents.filter(s => 
        s.class === cls.name && s.active !== false
    ).length;
}

function setupClassActions() {
    // Add arm
    document.querySelectorAll('.add-arm-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const classId = e.currentTarget.dataset.classId;
            openAddArmModal(classId);
        });
    });
    
    // Rename class
    document.querySelectorAll('.rename-class-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            openRenameModal(e.currentTarget.dataset.classId);
        });
    });

    // Upgrade class
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const classId = e.currentTarget.dataset.classId;
            openUpgradeModal(classId);
        });
    });
    
    // Download PDF
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const classId = e.currentTarget.dataset.classId;
            downloadClassPDF(classId);
        });
    });
    
    // Delete class
    document.querySelectorAll('.delete-class-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const classId = e.currentTarget.dataset.classId;
            deleteClass(classId);
        });
    });
    
    // Delete arm
    document.querySelectorAll('.delete-arm-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const classId = e.currentTarget.dataset.classId;
            const arm = e.currentTarget.dataset.arm;
            deleteArm(classId, arm);
        });
    });
}

// ============================================
// RENAME CLASS
// ============================================

function openRenameModal(classId) {
    const cls = allClasses.find(c => c.id === classId);
    if (!cls) return;

    currentRenameClass = cls;

    document.getElementById('rename-current-name').textContent = cls.name;
    document.getElementById('rename-student-count').textContent = countStudentsInClass(cls);
    document.getElementById('rename-class-name').value = cls.name;
    document.getElementById('rename-class-level').value = cls.level || '';

    document.getElementById('rename-class-modal').style.display = 'flex';
}

function closeRenameModal() {
    document.getElementById('rename-class-modal').style.display = 'none';
    currentRenameClass = null;
}

function confirmRename() {
    if (!currentRenameClass) return;

    const newName = document.getElementById('rename-class-name').value.trim();
    const levelValue = document.getElementById('rename-class-level').value;
    const oldName = currentRenameClass.name;

    if (!newName) {
        alert('Class name is required');
        return;
    }

    const clash = allClasses.some(c => c.id !== currentRenameClass.id &&
        c.name.toLowerCase() === newName.toLowerCase());
    if (clash) {
        alert(`A class named "${newName}" already exists`);
        return;
    }

    currentRenameClass.name = newName;
    currentRenameClass.level = levelValue ? parseInt(levelValue, 10) : currentRenameClass.level;
    currentRenameClass.updatedAt = new Date().toISOString();
    saveClasses();

    if (newName !== oldName) {
        renameClassInStudents(oldName, newName);
        renameClassInAttendance(oldName, newName);
    }

    closeRenameModal();
    renderClasses();
}

/** Student IDs keep their original prefix — only the class label changes. */
function renameClassInStudents(oldName, newName) {
    const stored = JSON.parse(localStorage.getItem('stemforge:students') || '[]');
    stored.forEach(student => {
        if (student.class !== oldName) return;
        student.class = newName;
        student.currentClass = `${newName} ${student.arm || ''}`.trim();
        student.updatedAt = new Date().toISOString();
    });
    localStorage.setItem('stemforge:students', JSON.stringify(stored));
    allStudents = StudentsStore.getAll();
}

function renameClassInAttendance(oldName, newName) {
    const records = AttendanceStore.getAll();
    let changed = false;
    records.forEach(record => {
        if (record.class !== oldName) return;
        record.class = newName;
        changed = true;
    });
    if (changed) localStorage.setItem('stemforge:attendance', JSON.stringify(records));
}

// ============================================
// CREATE CLASS
// ============================================

function openCreateClassModal() {
    document.getElementById('new-class-name').value = '';
    document.getElementById('new-class-level').value = '';
    document.getElementById('create-class-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('new-class-name')?.focus(), 100);
}

function closeCreateClassModal() {
    document.getElementById('create-class-modal').style.display = 'none';
}

function createClass() {
    const name = document.getElementById('new-class-name').value.trim();
    const level = parseInt(document.getElementById('new-class-level').value) || null;
    
    if (!name) {
        alert('Please enter a class name');
        return;
    }
    
    // Check if class already exists
    if (allClasses.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert(`Class "${name}" already exists`);
        return;
    }
    
    // Get selected default arms
    const selectedArms = Array.from(document.querySelectorAll('#default-arms-selector input:checked'))
        .map(cb => cb.value);
    
    const newClass = {
        id: `class-${Date.now()}`,
        name: name,
        level: level,
        arms: selectedArms,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    allClasses.push(newClass);
    saveClasses();
    
    closeCreateClassModal();
    renderClasses();
    
    alert(`✅ Class "${name}" created successfully!`);
}

// ============================================
// ADD ARM
// ============================================

function openAddArmModal(classId) {
    const cls = allClasses.find(c => c.id === classId);
    if (!cls) return;
    
    currentAddArmClass = cls;
    document.getElementById('add-arm-class-name').textContent = cls.name;
    document.getElementById('new-arm-name').value = '';
    document.getElementById('add-arm-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('new-arm-name')?.focus(), 100);
}

function closeAddArmModal() {
    document.getElementById('add-arm-modal').style.display = 'none';
    currentAddArmClass = null;
}

function addArmToClass() {
    if (!currentAddArmClass) return;
    
    const armName = document.getElementById('new-arm-name').value.trim();
    
    if (!armName) {
        alert('Please enter an arm name');
        return;
    }
    
    if (!currentAddArmClass.arms) currentAddArmClass.arms = [];
    
    if (currentAddArmClass.arms.includes(armName)) {
        alert(`Arm "${armName}" already exists in ${currentAddArmClass.name}`);
        return;
    }
    
    currentAddArmClass.arms.push(armName);
    currentAddArmClass.updatedAt = new Date().toISOString();
    saveClasses();
    
    closeAddArmModal();
    renderClasses();
}

// ============================================
// DELETE ARM
// ============================================

function deleteArm(classId, arm) {
    const cls = allClasses.find(c => c.id === classId);
    if (!cls) return;
    
    const studentCount = allStudents.filter(s => 
        s.class === cls.name && s.arm === arm && s.active !== false
    ).length;
    
    let confirmMsg = `Delete Arm ${arm} from ${cls.name}?`;
    if (studentCount > 0) {
        confirmMsg += `\n\n⚠️ WARNING: This arm has ${studentCount} student(s).\nDeleting this arm will mark those students as unassigned. They will need to be moved to another arm.`;
    }
    
    if (!confirm(confirmMsg)) return;
    
    // Remove arm from class
    cls.arms = cls.arms.filter(a => a !== arm);
    cls.updatedAt = new Date().toISOString();
    saveClasses();
    
    // Unassign students in this arm
    allStudents.forEach(student => {
        if (student.class === cls.name && student.arm === arm) {
            student.arm = null;
            student.currentClass = cls.name;
            student.updatedAt = new Date().toISOString();
        }
    });
    saveStudents();
    
    renderClasses();
    alert(`✅ Arm ${arm} deleted. ${studentCount} student(s) marked as unassigned.`);
}

// ============================================
// DELETE CLASS
// ============================================

function deleteClass(classId) {
    const cls = allClasses.find(c => c.id === classId);
    if (!cls) return;
    
    const studentCount = countStudentsInClass(cls);
    
    const confirmMsg = `Delete entire class "${cls.name}"?\n\n` +
        `This will:\n` +
        `• Remove the class definition\n` +
        `• Mark ${studentCount} student(s) as unassigned\n` +
        `• Keep all attendance records\n\n` +
        `This action cannot be undone.`;
    
    if (!confirm(confirmMsg)) return;
    if (!confirm(`Are you ABSOLUTELY sure? Type OK mentally and click OK again to confirm.`)) return;
    
    // Remove class
    allClasses = allClasses.filter(c => c.id !== classId);
    saveClasses();
    
    // Unassign all students in this class
    allStudents.forEach(student => {
        if (student.class === cls.name) {
            student.class = null;
            student.arm = null;
            student.currentClass = null;
            student.updatedAt = new Date().toISOString();
        }
    });
    saveStudents();
    
    renderClasses();
    alert(`✅ Class "${cls.name}" deleted.`);
}

// ============================================
// UPGRADE CLASS
// ============================================

function openUpgradeModal(classId) {
    const cls = allClasses.find(c => c.id === classId);
    if (!cls) return;
    
    currentUpgradeClass = cls;
    
    const studentCount = countStudentsInClass(cls);
    
    document.getElementById('upgrade-class-name').textContent = cls.name;
    document.getElementById('upgrade-student-count').textContent = studentCount;
    document.getElementById('upgrade-target-class').value = '';
    document.getElementById('keep-arms').checked = true;
    document.getElementById('upgrade-class-modal').style.display = 'flex';
}

function closeUpgradeModal() {
    document.getElementById('upgrade-class-modal').style.display = 'none';
    currentUpgradeClass = null;
}

function confirmUpgrade() {
    if (!currentUpgradeClass) return;
    
    const targetClass = document.getElementById('upgrade-target-class').value;
    const keepArms = document.getElementById('keep-arms').checked;
    
    if (!targetClass) {
        alert('Please select a target class');
        return;
    }
    
    if (targetClass === currentUpgradeClass.name) {
        alert('Target class cannot be the same as current class');
        return;
    }
    
    const studentCount = countStudentsInClass(currentUpgradeClass);
    
    if (studentCount === 0) {
        alert('No students to upgrade in this class');
        return;
    }
    
    const confirmMsg = `Upgrade ${studentCount} student(s) from ${currentUpgradeClass.name} to ${targetClass}?\n\nThis action cannot be undone.`;
    if (!confirm(confirmMsg)) return;
    
    // Check if target class exists, if not create it
    let targetClassObj = allClasses.find(c => c.name === targetClass);
    if (!targetClassObj) {
        const createNew = confirm(`Class "${targetClass}" doesn't exist yet. Create it automatically?`);
        if (createNew) {
            targetClassObj = {
                id: `class-${Date.now()}`,
                name: targetClass,
                level: null,
                arms: keepArms ? [...new Set(allStudents
                    .filter(s => s.class === currentUpgradeClass.name && s.arm)
                    .map(s => s.arm))] : [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            allClasses.push(targetClassObj);
        } else {
            return;
        }
    } else if (keepArms) {
        // Add arms to target class if keeping arms
        if (!targetClassObj.arms) targetClassObj.arms = [];
        allStudents
            .filter(s => s.class === currentUpgradeClass.name && s.arm)
            .forEach(s => {
                if (!targetClassObj.arms.includes(s.arm)) {
                    targetClassObj.arms.push(s.arm);
                }
            });
    }
    
    // Move students
    let movedCount = 0;
    allStudents.forEach(student => {
        if (student.class === currentUpgradeClass.name && student.active !== false) {
            student.class = targetClass;
            student.currentClass = keepArms && student.arm 
                ? `${targetClass} ${student.arm}`.trim()
                : targetClass;
            student.updatedAt = new Date().toISOString();
            student.classHistory = student.classHistory || [];
            student.classHistory.push({
                from: currentUpgradeClass.name,
                to: targetClass,
                movedAt: new Date().toISOString(),
                reason: 'Class Upgrade'
            });
            movedCount++;
        }
    });
    
    saveStudents();
    saveClasses();
    
    closeUpgradeModal();
    renderClasses();
    
    alert(`✅ Successfully upgraded ${movedCount} student(s) to ${targetClass}!`);
}

// ============================================
// DOWNLOAD PDF
// ============================================

function downloadClassPDF(classId) {
    const cls = allClasses.find(c => c.id === classId);
    if (!cls) return;
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(`${cls.name} - Class Report`, 14, 20);
        
        // Date
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        
        // Class info
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Class Information', 14, 40);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Class Name: ${cls.name}`, 14, 47);
        doc.text(`Number of Arms: ${(cls.arms || []).length}`, 14, 54);
        doc.text(`Total Students: ${countStudentsInClass(cls)}`, 14, 61);
        
        // Arms breakdown
        let yPos = 75;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Arms & Students', 14, yPos);
        yPos += 10;
        
        const armData = (cls.arms || []).map(arm => {
            const students = allStudents.filter(s => 
                s.class === cls.name && s.arm === arm && s.active !== false
            );
            return [
                arm,
                students.length.toString(),
                students.slice(0, 3).map(s => s.name).join(', ') + (students.length > 3 ? '...' : '')
            ];
        });
        
        doc.autoTable({
            startY: yPos,
            head: [['Arm', 'Students', 'Sample Names']],
            body: armData,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
        
        // Student list
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Complete Student List', 14, yPos);
        yPos += 5;
        
        const studentRows = [];
        (cls.arms || []).forEach(arm => {
            const students = allStudents.filter(s => 
                s.class === cls.name && s.arm === arm && s.active !== false
            );
            students.forEach(s => {
                studentRows.push([s.id, s.name, arm, s.gender || '—']);
            });
        });
        
        if (studentRows.length > 0) {
            doc.autoTable({
                startY: yPos + 5,
                head: [['ID', 'Name', 'Arm', 'Gender']],
                body: studentRows,
                theme: 'striped',
                headStyles: { fillColor: [99, 102, 241] },
                styles: { fontSize: 9 }
            });
        }
        
        // Save
        doc.save(`${cls.name.replace(/\s+/g, '_')}_class_report.pdf`);
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Check console for details.');
    }
}

// ============================================
// SHARED DATA STORE
// Single source of truth for all student management pages.
// All pages (classes, register-student, students, attendance,
// attendance-reports) read and write through this module so
// data is always consistent.
// ============================================

const KEYS = {
    classes:    'stemforge:classes',
    students:   'stemforge:students',
    attendance: 'stemforge:attendance'
};

// ── helpers ──────────────────────────────────

function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
}

function save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { console.error('Store save failed:', e); }
}

// ── CLASSES ──────────────────────────────────

export const ClassesStore = {
    getAll() {
        return load(KEYS.classes);
    },

    save(classObj) {
        const all = this.getAll();
        const idx = all.findIndex(c => c.id === classObj.id);
        if (idx >= 0) all[idx] = classObj;
        else all.push(classObj);
        save(KEYS.classes, all);
        return classObj;
    },

    delete(classId) {
        const all = this.getAll().filter(c => c.id !== classId);
        save(KEYS.classes, all);
    },

    /** Returns a flat list of strings like ["JSS 1 A", "JSS 1 B", ...] */
    listClassArms() {
        const arms = [];
        this.getAll().forEach(cls => {
            (cls.arms || ['A']).forEach(arm => {
                arms.push({ className: cls.name, arm, label: `${cls.name} ${arm}` });
            });
        });
        return arms;
    }
};

// ── STUDENTS ─────────────────────────────────

export const StudentsStore = {
    getAll() {
        return load(KEYS.students).filter(s => s.active !== false);
    },

    getByClass(className, arm = null) {
        return this.getAll().filter(s =>
            s.class === className && (arm === null || s.arm === arm)
        );
    },

    getById(id) {
        return load(KEYS.students).find(s => s.id === id) || null;
    },

    save(student) {
        const all = load(KEYS.students);
        const idx = all.findIndex(s => s.id === student.id);
        student.updatedAt = new Date().toISOString();
        if (idx >= 0) all[idx] = student;
        else {
            student.createdAt = student.createdAt || new Date().toISOString();
            all.push(student);
        }
        save(KEYS.students, all);
        return student;
    },

    delete(studentId) {
        const all = load(KEYS.students);
        const idx = all.findIndex(s => s.id === studentId);
        if (idx >= 0) {
            all[idx].active = false;
            all[idx].updatedAt = new Date().toISOString();
        }
        save(KEYS.students, all);
    },

    move(studentId, newClass, newArm) {
        const all = load(KEYS.students);
        const student = all.find(s => s.id === studentId);
        if (student) {
            student.class = newClass;
            student.arm = newArm;
            student.currentClass = `${newClass} ${newArm}`.trim();
            student.updatedAt = new Date().toISOString();
            save(KEYS.students, all);
        }
    },

    generateId(className, arm) {
        const classCode = getClassCode(className);
        const armCode = arm.length === 1 ? arm : arm.charAt(0).toUpperCase();
        const prefix = `${classCode}${armCode}`;
        const existing = this.getByClass(className, arm)
            .map(s => s.id || '')
            .filter(id => id.startsWith(prefix))
            .map(id => parseInt(id.substring(prefix.length), 10) || 0);
        const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
        return `${prefix}${String(next).padStart(3, '0')}`;
    }
};

// ── ATTENDANCE ───────────────────────────────

export const AttendanceStore = {
    getAll() {
        return load(KEYS.attendance);
    },

    /** Returns the attendance record for a given class+arm+date, or null */
    getRecord(className, arm, date) {
        return this.getAll().find(r =>
            r.class === className && r.arm === arm && r.date === date
        ) || null;
    },

    /** Returns all records for a class (optionally filtered by arm) */
    getByClass(className, arm = null) {
        return this.getAll().filter(r =>
            r.class === className && (arm === null || r.arm === arm)
        );
    },

    /** Save or overwrite an attendance record for a class+arm+date */
    saveRecord(className, arm, date, entries) {
        const all = this.getAll();
        const idx = all.findIndex(r =>
            r.class === className && r.arm === arm && r.date === date
        );
        const record = { class: className, arm, date, entries, savedAt: new Date().toISOString() };
        if (idx >= 0) all[idx] = record;
        else all.push(record);
        save(KEYS.attendance, all);
        return record;
    },

    /** Returns attendance stats for a student in a date range */
    getStudentStats(studentId, className, arm, startDate = null, endDate = null) {
        const records = this.getByClass(className, arm).filter(r => {
            if (startDate && r.date < startDate) return false;
            if (endDate   && r.date > endDate)   return false;
            return true;
        });

        let present = 0, absent = 0, late = 0;
        records.forEach(record => {
            const entry = (record.entries || []).find(e => e.id === studentId);
            if (!entry) return;
            if (entry.status === 'present') present++;
            else if (entry.status === 'absent') absent++;
            else if (entry.status === 'late') late++;
        });

        const total = present + absent + late;
        return { present, absent, late, total,
            rate: total > 0 ? Math.round((present / total) * 100) : 0 };
    }
};

// ── internal helpers ──────────────────────────

function getClassCode(className) {
    if (!className) return 'X';
    if (className.startsWith('JSS')) return `J${className.replace('JSS', '').trim()}`;
    if (className.startsWith('SS'))  return `S${className.replace('SS', '').trim()}`;
    if (className.startsWith('Grade')) return `G${className.replace('Grade', '').trim()}`;
    return 'X';
}

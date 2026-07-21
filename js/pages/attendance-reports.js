// ============================================
// ATTENDANCE REPORTS PAGE
// View analytics, term-wide attendance, export data
// ============================================

import { escapeHtml } from '../core/utils.js';

let allStudents = [];
let allAttendance = [];
let allClasses = [];
let currentReport = null;

// ============================================
// INITIALIZATION
// ============================================

export async function init() {
    await loadData();
    setupEventListeners();
    populateClassFilter();
}

async function loadData() {
    allStudents = loadFromStorage('stemforge:students');
    allAttendance = loadFromStorage('stemforge:attendance');
    allClasses = loadFromStorage('stemforge:classes');
}

function loadFromStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
        return [];
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    const classSelect = document.getElementById('report-class');
    const armSelect = document.getElementById('report-arm');
    const termSelect = document.getElementById('report-term');
    
    if (classSelect) classSelect.addEventListener('change', handleFilterChange);
    if (armSelect) armSelect.addEventListener('change', generateReport);
    if (termSelect) termSelect.addEventListener('change', generateReport);
    
    // Action buttons
    const csvBtn = document.getElementById('export-csv-btn');
    const pdfBtn = document.getElementById('export-pdf-btn');
    const printBtn = document.getElementById('print-report-btn');
    
    if (csvBtn) csvBtn.addEventListener('click', exportCSV);
    if (pdfBtn) pdfBtn.addEventListener('click', exportPDF);
    if (printBtn) printBtn.addEventListener('click', printReport);
}

// ============================================
// FILTERS
// ============================================

function populateClassFilter() {
    const classSelect = document.getElementById('report-class');
    if (!classSelect) return;
    
    // Get unique classes from attendance records
    const classSet = new Set();
    allAttendance.forEach(record => {
        if (record.class) classSet.add(record.class);
    });
    
    // Also add classes from students
    allStudents.forEach(student => {
        if (student.class) classSet.add(student.class);
    });
    
    const classes = Array.from(classSet).sort();
    
    classSelect.innerHTML = '<option value="">Select class</option>';
    classes.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        classSelect.appendChild(option);
    });
}

function handleFilterChange() {
    const className = document.getElementById('report-class')?.value;
    const armSelect = document.getElementById('report-arm');
    
    if (!classSelect) return;
    
    if (!className) {
        armSelect.innerHTML = '<option value="">All Arms</option>';
        document.getElementById('report-actions').style.display = 'none';
        document.getElementById('summary-stats').style.display = 'none';
        document.getElementById('report-container').innerHTML = `
            <div class="empty-state-large">
                <div class="empty-icon">📊</div>
                <h3>Select a Class to View Report</h3>
                <p>Choose a class from the filter above to see attendance analytics</p>
            </div>
        `;
        document.getElementById('report-stats').innerHTML = '<span>Select a class to view report</span>';
        return;
    }
    
    // Populate arms based on selected class
    const arms = new Set();
    allAttendance.filter(r => r.class === className).forEach(r => {
        if (r.arm) arms.add(r.arm);
    });
    allStudents.filter(s => s.class === className).forEach(s => {
        if (s.arm) arms.add(s.arm);
    });
    
    armSelect.innerHTML = '<option value="">All Arms</option>';
    Array.from(arms).sort().forEach(arm => {
        const option = document.createElement('option');
        option.value = arm;
        option.textContent = `Arm ${arm}`;
        armSelect.appendChild(option);
    });
    
    generateReport();
}

// ============================================
// REPORT GENERATION
// ============================================

function generateReport() {
    const className = document.getElementById('report-class')?.value;
    const arm = document.getElementById('report-arm')?.value;
    
    if (!className) return;
    
    // Get students in this class
    const students = allStudents.filter(s => 
        s.class === className && 
        s.active !== false &&
        (!arm || s.arm === arm)
    );
    
    // Get attendance records for this class
    let records = allAttendance.filter(r => r.class === className);
    if (arm) {
        records = records.filter(r => !r.arm || r.arm === arm);
    }
    
    // Sort records by date (newest first)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (students.length === 0) {
        document.getElementById('report-container').innerHTML = `
            <div class="empty-state-large">
                <div class="empty-icon">👥</div>
                <h3>No Students Found</h3>
                <p>No students registered in ${className}${arm ? ' Arm ' + arm : ''}</p>
                <a href="register-student.html" class="primary-btn">➕ Register Student</a>
            </div>
        `;
        document.getElementById('summary-stats').style.display = 'none';
        document.getElementById('report-actions').style.display = 'none';
        return;
    }
    
    // Calculate per-student stats
    const studentStats = students.map(student => {
        const stats = {
            student: student,
            totalDays: records.length,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            percentage: 0
        };
        
        records.forEach(record => {
            const studentRecord = record.students?.find(s => s.id === student.id);
            if (studentRecord) {
                if (studentRecord.present === true) stats.present++;
                else if (studentRecord.status === 'late') stats.late++;
                else if (studentRecord.status === 'excused') stats.excused++;
                else stats.absent++;
            }
        });
        
        const counted = stats.present + stats.late + stats.absent;
        if (counted > 0) {
            stats.percentage = Math.round((stats.present / counted) * 100);
        }
        
        return stats;
    });
    
    // Sort by percentage (highest first)
    studentStats.sort((a, b) => b.percentage - a.percentage);
    
    // Calculate summary
    const totalDays = records.length;
    const totalPresent = studentStats.reduce((sum, s) => sum + s.present, 0);
    const totalAbsent = studentStats.reduce((sum, s) => sum + s.absent, 0);
    const totalPossible = studentStats.length * totalDays;
    const avgAttendance = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
    const topStudent = studentStats[0];
    
    // Store for export
    currentReport = {
        className,
        arm,
        students: studentStats,
        records,
        totalDays,
        totalPresent,
        totalAbsent,
        avgAttendance,
        topStudent
    };
    
    // Update UI
    renderReport(studentStats, records);
    renderSummary(totalDays, avgAttendance, totalAbsent, topStudent);
    
    document.getElementById('report-actions').style.display = 'flex';
    document.getElementById('summary-stats').style.display = 'grid';
    
    const reportStats = document.getElementById('report-stats');
    reportStats.innerHTML = `<span>${studentStats.length} students • ${totalDays} days</span>`;
}

function renderSummary(totalDays, avgAttendance, totalAbsent, topStudent) {
    document.getElementById('stat-total-days').textContent = totalDays;
    document.getElementById('stat-avg-present').textContent = `${avgAttendance}%`;
    document.getElementById('stat-total-absent').textContent = totalAbsent;
    document.getElementById('stat-top-student').textContent = 
        topStudent ? topStudent.student.name.split(' ')[0] : '—';
}

function renderReport(studentStats, records) {
    const container = document.getElementById('report-container');
    if (!container) return;
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state-large">
                <div class="empty-icon">📅</div>
                <h3>No Attendance Records Yet</h3>
                <p>Start taking attendance to see reports</p>
                <a href="attendance.html" class="primary-btn">📋 Take Attendance</a>
            </div>
        `;
        return;
    }
    
    // Get all unique dates (sorted)
    const dates = records.map(r => r.date).sort();
    
    // Build the matrix
    const html = `
        <div class="report-table-wrapper">
            <table class="report-table">
                <thead>
                    <tr>
                        <th class="sticky-col">Student</th>
                        ${dates.map(date => `<th class="date-col">${formatDateShort(date)}</th>`).join('')}
                        <th class="stats-col">P</th>
                        <th class="stats-col">A</th>
                        <th class="stats-col">%</th>
                    </tr>
                </thead>
                <tbody>
                    ${studentStats.map(stats => `
                        <tr>
                            <td class="sticky-col">
                                <div class="student-cell">
                                    <strong>${escapeHtml(stats.student.name)}</strong>
                                    <small>${escapeHtml(stats.student.id)}</small>
                                </div>
                            </td>
                            ${dates.map(date => {
                                const record = records.find(r => r.date === date);
                                const studentRecord = record?.students?.find(s => s.id === stats.student.id);
                                return renderAttendanceCell(studentRecord);
                            }).join('')}
                            <td class="stats-col stat-present-cell">${stats.present}</td>
                            <td class="stats-col stat-absent-cell">${stats.absent}</td>
                            <td class="stats-col stat-percent-cell ${getPercentClass(stats.percentage)}">
                                ${stats.percentage}%
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="legend">
            <div class="legend-item"><span class="legend-mark mark-present"></span> Present</div>
            <div class="legend-item"><span class="legend-mark mark-absent"></span> Absent</div>
            <div class="legend-item"><span class="legend-mark mark-late"></span> Late</div>
            <div class="legend-item"><span class="legend-mark mark-excused"></span> Excused</div>
            <div class="legend-item"><span class="legend-mark mark-unmarked"></span> Not Recorded</div>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderAttendanceCell(studentRecord) {
    if (!studentRecord) {
        return '<td class="attendance-cell mark-unmarked">—</td>';
    }
    
    if (studentRecord.present === true) {
        return '<td class="attendance-cell mark-present" title="Present">✓</td>';
    }
    
    if (studentRecord.status === 'late') {
        return '<td class="attendance-cell mark-late" title="Late">L</td>';
    }
    
    if (studentRecord.status === 'excused') {
        return '<td class="attendance-cell mark-excused" title="Excused">E</td>';
    }
    
    return '<td class="attendance-cell mark-absent" title="Absent">✗</td>';
}

function getPercentClass(percentage) {
    if (percentage >= 90) return 'percent-excellent';
    if (percentage >= 75) return 'percent-good';
    if (percentage >= 60) return 'percent-warning';
    return 'percent-critical';
}

function formatDateShort(dateStr) {
    try {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    } catch {
        return dateStr;
    }
}

// ============================================
// EXPORTS
// ============================================

function exportCSV() {
    if (!currentReport) return;
    
    const { className, students, records } = currentReport;
    const dates = records.map(r => r.date).sort();
    
    // Header row
    const headers = ['Student ID', 'Student Name', ...dates, 'Present', 'Absent', 'Percentage'];
    
    // Data rows
    const rows = students.map(stats => {
        const row = [stats.student.id, stats.student.name];
        dates.forEach(date => {
            const record = records.find(r => r.date === date);
            const studentRecord = record?.students?.find(s => s.id === stats.student.id);
            row.push(getStatusCode(studentRecord));
        });
        row.push(stats.present, stats.absent, `${stats.percentage}%`);
        return row;
    });
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getStatusCode(record) {
    if (!record) return '—';
    if (record.present === true) return 'P';
    if (record.status === 'late') return 'L';
    if (record.status === 'excused') return 'E';
    return 'A';
}

function exportPDF() {
    if (!currentReport) return;
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
        
        const { className, students, records, totalDays, avgAttendance, topStudent } = currentReport;
        const dates = records.map(r => r.date).sort();
        
        // Header
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(`Attendance Report - ${className}`, 14, 15);
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
        doc.text(`Total Days: ${totalDays} | Avg. Attendance: ${avgAttendance}% | Students: ${students.length}`, 14, 28);
        
        // Build table data
        const headers = ['Student'];
        dates.slice(0, 15).forEach(date => headers.push(formatDateShort(date))); // Limit to 15 dates
        headers.push('P', 'A', '%');
        
        const rows = students.map(stats => {
            const row = [stats.student.name];
            dates.slice(0, 15).forEach(date => {
                const record = records.find(r => r.date === date);
                const studentRecord = record?.students?.find(s => s.id === stats.student.id);
                row.push(getStatusCode(studentRecord));
            });
            row.push(stats.present.toString(), stats.absent.toString(), `${stats.percentage}%`);
            return row;
        });
        
        doc.autoTable({
            startY: 35,
            head: [headers],
            body: rows,
            theme: 'grid',
            headStyles: { 
                fillColor: [99, 102, 241],
                fontSize: 8,
                halign: 'center'
            },
            bodyStyles: { fontSize: 7 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 35 }
            },
            margin: { left: 10, right: 10 }
        });
        
        doc.save(`attendance_${className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('PDF export failed:', error);
        alert('Failed to export PDF. Check console.');
    }
}

function printReport() {
    window.print();
}

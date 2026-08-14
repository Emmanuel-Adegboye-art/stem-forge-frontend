// ============================================
// MULTI-BRANCH STEM SCHEME GENERATOR
// Supports: Robotics, Web Dev, App Dev, Custom
// ============================================

import { generateWithAI, APIError } from '../core/api.js';
import { escapeHtml, showStatus, setButtonLoading, resetButton } from '../core/utils.js';
import { CONFIG } from '../core/config.js';

let isGenerating = false;

// ============================================
// BRANCH DEFINITIONS
// ============================================

const BRANCH_DATA = {
    robotics: {
        name: 'Robotics',
        icon: '🤖',
        subjects: [
            'Microcontrollers (Arduino/ESP32)',
            'Sensors & Input Devices',
            'Motors & Actuators',
            'Electronics & Circuits',
            'Programming Logic',
            'Chassis & Mechanical Design',
            '3D Printing & Fabrication',
            'Wireless Communication',
            'IoT (Internet of Things)',
            'Autonomous Systems',
            'Drone Technology',
            'Robot Kinematics'
        ],
        competitions: [
            'FIRST LEGO League',
            'World Robot Olympiad',
            'Line Following Challenge',
            'Sumo Robotics',
            'Obstacle Avoidance',
            'Maze Solving',
            'Drone Racing',
            'RoboCup Junior',
            'VEX Robotics Competition'
        ],
        industries: [
            'Manufacturing Automation',
            'Smart Agriculture',
            'Healthcare Robotics',
            'Logistics & Delivery',
            'Educational Robotics',
            'Space Exploration',
            'Military & Defense',
            'Food Processing',
            'Construction Automation'
        ]
    },
    
    webdev: {
        name: 'Web Development',
        icon: '💻',
        subjects: [
            'HTML5 & Semantic Markup',
            'CSS3 & Responsive Design',
            'JavaScript Fundamentals',
            'DOM Manipulation',
            'Frontend Frameworks (React/Vue)',
            'Backend Development (Node.js)',
            'Databases (SQL/MongoDB)',
            'APIs & REST',
            'Version Control (Git/GitHub)',
            'Web Hosting & Deployment',
            'UI/UX Design Principles',
            'Web Security Basics',
            'Progressive Web Apps',
            'Serverless Functions'
        ],
        competitions: [
            'HTML5 Game Jam',
            'CSS Design Awards',
            'JavaScript Coding Challenges',
            'Hackathons (Local/National)',
            'FreeCodeCamp Challenges',
            'Google Code-in',
            'Microsoft Imagine Cup',
            'Static Site Generators Contest',
            'Web Accessibility Challenge'
        ],
        industries: [
            'E-commerce Platforms',
            'Social Media Applications',
            'News & Media Websites',
            'Educational Platforms',
            'Healthcare Portals',
            'Banking & FinTech',
            'Government Services',
            'Entertainment & Streaming',
            'SaaS Products'
        ]
    },
    
    appdev: {
        name: 'App Development (Scratch & Beyond)',
        icon: '🎮',
        subjects: [
            'Scratch Basics & Interface',
            'Block-Based Programming Logic',
            'Sprites & Animations',
            'Game Design Fundamentals',
            'Storytelling & Interactive Narratives',
            'Sound & Music Integration',
            'Variables & Data',
            'Conditional Logic & Loops',
            'Event-Driven Programming',
            'Simple AI Behaviors',
            'Mobile App Development (MIT App Inventor)',
            'Python for Beginners',
            'UI/UX for Apps',
            'Publishing & Sharing Projects'
        ],
        competitions: [
            'Scratch Coding Competition',
            'MIT App Inventor Contest',
            'Code.org Hour of Code',
            'Tynker Coding Challenges',
            'CodeCombat',
            'Global Game Jam (Junior)',
            'Pixel Art & Animation Contest',
            'Young Coders Tournament',
            'Mobile App Competitions'
        ],
        industries: [
            'Mobile Gaming Industry',
            'Educational Apps',
            'Children\'s Entertainment',
            'Interactive Storytelling',
            'Augmented Reality Apps',
            'Animation Studios',
            'EdTech Platforms',
            'Toy & Game Manufacturing',
            'Digital Art & Creative Tools'
        ]
    },
    
    custom: {
        name: 'Custom Branch',
        icon: '➕',
        subjects: [], // User will add their own
        competitions: [],
        industries: []
    }
};

// ============================================
// FORM INITIALIZATION
// ============================================

export function init() {
    const form = document.getElementById('scheme-form');
    if (!form) return;
    
    // Initial branch load
    updateBranchOptions();
    
    // Branch change listener
    document.querySelectorAll('input[name="branch"]').forEach(radio => {
        radio.addEventListener('change', updateBranchOptions);
    });
    
    form.addEventListener('submit', handleGenerate);
    
    // Custom input buttons
    document.getElementById('add-custom-subject-btn')?.addEventListener('click', addCustomSubject);
    document.getElementById('add-custom-competition-btn')?.addEventListener('click', addCustomCompetition);
    document.getElementById('add-custom-industry-btn')?.addEventListener('click', addCustomIndustry);
    
    // Enter key for custom inputs
    document.getElementById('custom-subject-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addCustomSubject(); }
    });
    document.getElementById('custom-competition-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addCustomCompetition(); }
    });
    document.getElementById('custom-industry-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addCustomIndustry(); }
    });
    
    // Action buttons
    const saveBtn = document.getElementById('save-scheme');
    if (saveBtn) saveBtn.addEventListener('click', saveScheme);
    
    const copyBtn = document.getElementById('copy-scheme');
    if (copyBtn) copyBtn.addEventListener('click', copyScheme);
    
    const printBtn = document.getElementById('print-scheme');
    if (printBtn) printBtn.addEventListener('click', printScheme);
}

// ============================================
// BRANCH MANAGEMENT
// ============================================

function getSelectedBranch() {
    const selected = document.querySelector('input[name="branch"]:checked');
    return selected ? selected.value : 'robotics';
}

function updateBranchOptions() {
    const branch = getSelectedBranch();
    const branchData = BRANCH_DATA[branch];
    
    // Show/hide custom branch input
    const customInput = document.getElementById('custom-branch-input');
    if (customInput) {
        customInput.style.display = branch === 'custom' ? 'block' : 'none';
    }
    
    // Populate subject areas
    const subjectsContainer = document.getElementById('subject-areas-container');
    if (subjectsContainer) {
        if (branchData.subjects.length === 0) {
            subjectsContainer.innerHTML = '<p class="empty-state">Add custom subjects using the field below</p>';
        } else {
            subjectsContainer.innerHTML = branchData.subjects.map(subject => `
                <label class="checkbox-pill">
                    <input type="checkbox" value="${escapeHtml(subject)}" checked>
                    ${escapeHtml(subject)}
                </label>
            `).join('');
        }
    }
    
    // Populate competitions
    const competitionsContainer = document.getElementById('competitions-container');
    if (competitionsContainer) {
        if (branchData.competitions.length === 0) {
            competitionsContainer.innerHTML = '<p class="empty-state">Add custom competitions using the field below</p>';
        } else {
            competitionsContainer.innerHTML = branchData.competitions.map(comp => `
                <label class="checkbox-pill">
                    <input type="checkbox" value="${escapeHtml(comp)}">
                    ${escapeHtml(comp)}
                </label>
            `).join('');
        }
    }
    
    // Populate industries
    const industryContainer = document.getElementById('industry-container');
    if (industryContainer) {
        if (branchData.industries.length === 0) {
            industryContainer.innerHTML = '<p class="empty-state">Add custom industries using the field below</p>';
        } else {
            industryContainer.innerHTML = branchData.industries.map(ind => `
                <label class="checkbox-pill">
                    <input type="checkbox" value="${escapeHtml(ind)}">
                    ${escapeHtml(ind)}
                </label>
            `).join('');
        }
    }
}

// ============================================
// CUSTOM ITEM ADDERS
// ============================================

function addCustomSubject() {
    const input = document.getElementById('custom-subject-input');
    const value = input.value.trim();
    if (!value) return;
    
    const container = document.getElementById('subject-areas-container');
    
    // Remove empty state if present
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    // Add new checkbox
    const label = document.createElement('label');
    label.className = 'checkbox-pill custom-added';
    label.innerHTML = `
        <input type="checkbox" value="${escapeHtml(value)}" checked>
        ${escapeHtml(value)} <span class="custom-badge">NEW</span>
    `;
    container.appendChild(label);
    
    input.value = '';
    input.focus();
}

function addCustomCompetition() {
    const input = document.getElementById('custom-competition-input');
    const value = input.value.trim();
    if (!value) return;
    
    const container = document.getElementById('competitions-container');
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    const label = document.createElement('label');
    label.className = 'checkbox-pill custom-added';
    label.innerHTML = `
        <input type="checkbox" value="${escapeHtml(value)}" checked>
        ${escapeHtml(value)} <span class="custom-badge">NEW</span>
    `;
    container.appendChild(label);
    
    input.value = '';
    input.focus();
}

function addCustomIndustry() {
    const input = document.getElementById('custom-industry-input');
    const value = input.value.trim();
    if (!value) return;
    
    const container = document.getElementById('industry-container');
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    const label = document.createElement('label');
    label.className = 'checkbox-pill custom-added';
    label.innerHTML = `
        <input type="checkbox" value="${escapeHtml(value)}" checked>
        ${escapeHtml(value)} <span class="custom-badge">NEW</span>
    `;
    container.appendChild(label);
    
    input.value = '';
    input.focus();
}

// ============================================
// FORM DATA COLLECTION
// ============================================

function collectFormData() {
    const branch = getSelectedBranch();
    const branchData = BRANCH_DATA[branch];
    
    const data = {
        branch: branch,
        branchName: branch === 'custom' 
            ? document.getElementById('custom-branch-name')?.value.trim() || 'Custom Branch'
            : branchData.name,
        startGrade: parseInt(document.getElementById('start-grade')?.value),
        endGrade: parseInt(document.getElementById('end-grade')?.value),
        subjects: getCheckedValues('subject-areas-container'),
        competitions: getCheckedValues('competitions-container'),
        industries: getCheckedValues('industry-container'),
        weeksPerTerm: parseInt(document.getElementById('weeks-per-term')?.value) || 12,
        periodsPerWeek: parseInt(document.getElementById('periods-per-week')?.value) || 2,
        additionalNotes: document.getElementById('scheme-notes')?.value.trim() || ''
    };
    
    return data;
}

function getCheckedValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// ============================================
// GENERATE HANDLER
// ============================================

async function handleGenerate(e) {
    e.preventDefault();
    
    if (isGenerating) return;
    
    const formData = collectFormData();
    
    // Validation
    if (!formData.startGrade || !formData.endGrade) {
        showStatus('scheme-status', 'Please select grade range', 'error');
        return;
    }
    
    if (formData.startGrade > formData.endGrade) {
        showStatus('scheme-status', 'End grade must be higher than start grade', 'error');
        return;
    }
    
    if (formData.subjects.length === 0) {
        showStatus('scheme-status', 'Please select at least one subject area', 'error');
        return;
    }
    
    if (formData.branch === 'custom' && !formData.branchName) {
        showStatus('scheme-status', 'Please enter a custom branch name', 'error');
        return;
    }
    
    // UI state
    isGenerating = true;
    const generateBtn = document.getElementById('generate-scheme-btn');
    const originalHtml = setButtonLoading(generateBtn, '⏳ Generating Scheme...');
    showStatus('scheme-status', 'Generating comprehensive scheme of work...', 'info', 0);
    
    try {
        // Call backend with scheme-specific mode
        const result = await generateWithAI({
            ...formData,
            mode: 'scheme'  // New mode for schemes
        });
        
        renderScheme(result.data, formData);
        showStatus('scheme-status', '✅ Scheme generated successfully!', 'success', 3000);
        
    } catch (error) {
        console.warn('Backend failed, using local generator:', error);
        
        if (error instanceof APIError) {
            showStatus('scheme-status', `${error.message} Using offline template.`, 'warning', 4000);
        }
        
        // Fallback: generate locally
        const localScheme = generateLocalScheme(formData);
        renderScheme(localScheme, formData);
        showStatus('scheme-status', '✅ Scheme generated (offline mode)', 'success', 3000);
        
    } finally {
        isGenerating = false;
        resetButton(generateBtn, originalHtml);
    }
}

// ============================================
// ⭐ BEAUTIFUL OUTPUT RENDERING
// ============================================

function renderScheme(data, formData) {
    const output = document.getElementById('scheme-output');
    const content = document.getElementById('scheme-content');
    
    if (!output || !content) return;
    
    let html = `
        <div class="scheme-document">
            <!-- Header -->
            <div class="scheme-header">
                <div class="scheme-icon">${formData.branch === 'robotics' ? '🤖' : formData.branch === 'webdev' ? '💻' : formData.branch === 'appdev' ? '🎮' : '➕'}</div>
                <h1 class="scheme-title">${escapeHtml(data.metadata?.title || `${formData.branchName} Scheme of Work`)}</h1>
                <div class="scheme-meta-grid">
                    <div class="meta-item">
                        <i class="fa-solid fa-graduation-cap"></i>
                        <span><strong>Grades:</strong> ${formData.startGrade} - ${formData.endGrade}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fa-solid fa-book"></i>
                        <span><strong>Branch:</strong> ${escapeHtml(formData.branchName)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fa-solid fa-calendar"></i>
                        <span><strong>Duration:</strong> ${formData.weeksPerTerm} weeks/term</span>
                    </div>
                    <div class="meta-item">
                        <i class="fa-solid fa-clock"></i>
                        <span><strong>Periods:</strong> ${formData.periodsPerWeek}/week</span>
                    </div>
                </div>
            </div>
            
            <!-- Program Overview -->
            ${renderSection('🎯 Program Overview', data.overview || data.metadata?.overview)}
    `;
    
    // Terms
    if (data.terms && Array.isArray(data.terms)) {
        html += renderStructuredTerms(data.terms, formData);
    } else {
        html += renderLocalTerms(formData);
    }
    
    // Equipment & Resources
    if (data.equipment || data.materials) {
        html += renderListSection('🛠️ Required Equipment & Resources', data.equipment || data.materials);
    }
    
    // Competitions
    if (formData.competitions.length > 0) {
        html += renderListSection('🏆 Competition Preparation', formData.competitions);
    }
    
    // Industries
    if (formData.industries.length > 0) {
        html += renderListSection('🏭 Industry Applications', formData.industries);
    }
    
    // Career Pathways
    if (data.careerPathways) {
        html += renderListSection('💼 Career Pathways', data.careerPathways);
    }
    
    // Assessment Strategy
    if (data.assessmentStrategy) {
        html += renderSection('📊 Assessment Strategy', data.assessmentStrategy);
    }
    
    // Additional Notes
    if (formData.additionalNotes) {
        html += renderSection('📌 Additional Notes', formData.additionalNotes);
    }
    
    html += '</div>'; // Close scheme-document
    
    content.innerHTML = html;
    output.style.display = 'block';
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderStructuredTerms(terms, formData) {
    return `
        <section class="scheme-section">
            <h2 class="section-heading">📅 Term-by-Term Breakdown</h2>
            ${terms.map(term => `
                <div class="term-block">
                    <h3 class="term-heading">${escapeHtml(term.grade)} — ${escapeHtml(term.term)}</h3>
                    ${term.weeks && term.weeks.length > 0 ? `
                        <table class="week-table">
                            <thead>
                                <tr>
                                    <th>Week</th>
                                    <th>Topic</th>
                                    <th>Learning Objectives</th>
                                    <th>Hands-on Activity</th>
                                    <th>Assessment</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${term.weeks.map(week => `
                                    <tr>
                                        <td><strong>${escapeHtml(week.week)}</strong></td>
                                        <td>${escapeHtml(week.topic)}</td>
                                        <td>${escapeHtml(week.objective)}</td>
                                        <td>${escapeHtml(week.activity)}</td>
                                        <td>${escapeHtml(week.assessment)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : ''}
                </div>
            `).join('')}
        </section>
    `;
}

function renderLocalTerms(formData) {
    let html = '<section class="scheme-section"><h2 class="section-heading">📅 Term-by-Term Breakdown</h2>';
    
    const gradeLevel = formData.startGrade <= 5 ? 'Beginner' : formData.startGrade <= 9 ? 'Intermediate' : 'Advanced';
    
    for (let grade = formData.startGrade; grade <= formData.endGrade; grade++) {
        for (let term = 1; term <= 3; term++) {
            html += `
                <div class="term-block">
                    <h3 class="term-heading">Grade ${grade} — Term ${term}</h3>
                    ${buildTermTable(grade, term, formData)}
                </div>
            `;
        }
    }
    
    html += '</section>';
    return html;
}

function buildTermTable(grade, term, formData) {
    // Generate branch-appropriate topics
    const topics = generateTopicsForBranch(grade, term, formData);
    
    return `
        <table class="week-table">
            <thead>
                <tr>
                    <th>Week</th>
                    <th>Topic</th>
                    <th>Learning Objectives</th>
                    <th>Hands-on Activity</th>
                    <th>Assessment</th>
                </tr>
            </thead>
            <tbody>
                ${topics.map((topic, idx) => `
                    <tr>
                        <td><strong>${idx + 1}</strong></td>
                        <td>${escapeHtml(topic.title)}</td>
                        <td>${escapeHtml(topic.objective)}</td>
                        <td>${escapeHtml(topic.activity)}</td>
                        <td>${escapeHtml(topic.assessment)}</td>
                    </tr>
                `).join('')}
                <tr>
                    <td><strong>${topics.length + 1}</strong></td>
                    <td><strong>📝 Review & Assessment</strong></td>
                    <td>Synthesize and apply term concepts</td>
                    <td>Group presentation + practical demo</td>
                    <td>Written test + project showcase</td>
                </tr>
            </tbody>
        </table>
    `;
}

function generateTopicsForBranch(grade, term, formData) {
    // Use selected subjects to generate relevant topics
    const subjects = formData.subjects.slice(0, 5); // Use first 5 subjects
    const difficulty = grade <= 5 ? 'Basic' : grade <= 9 ? 'Intermediate' : 'Advanced';
    
    return subjects.map(subject => ({
        title: `${subject} (${difficulty} Level)`,
        objective: `Understand and apply ${subject.toLowerCase()} concepts in ${difficulty.toLowerCase()} projects`,
        activity: `Hands-on ${formData.branchName.toLowerCase()} project using ${subject}`,
        assessment: `Practical demonstration + written quiz on ${subject}`
    }));
}

function renderSection(title, content) {
    if (!content) return '';
    
    const content_html = typeof content === 'string' 
        ? `<p>${escapeHtml(content)}</p>`
        : Array.isArray(content)
        ? `<ul class="styled-list">${content.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : `<p>${escapeHtml(JSON.stringify(content))}</p>`;
    
    return `
        <section class="scheme-section">
            <h2 class="section-heading">${title}</h2>
            <div class="section-body">${content_html}</div>
        </section>
    `;
}

function renderListSection(title, items) {
    if (!items || items.length === 0) return '';
    return `
        <section class="scheme-section">
            <h2 class="section-heading">${title}</h2>
            <ul class="styled-list">
                ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
        </section>
    `;
}

// ============================================
// LOCAL FALLBACK GENERATOR
// ============================================

function generateLocalScheme(formData) {
    return {
        metadata: {
            title: `📅 ${formData.branchName} Scheme of Work (Grades ${formData.startGrade}-${formData.endGrade})`,
            overview: `A comprehensive ${formData.branchName.toLowerCase()} curriculum spanning grades ${formData.startGrade} through ${formData.endGrade}. This progressive scheme builds skills from foundational concepts to advanced applications, integrating hands-on projects, industry applications, and competition preparation.`
        }
    };
}

// ============================================
// ACTION HANDLERS
// ============================================

function saveScheme() {
    const content = document.getElementById('scheme-content')?.innerText;
    if (!content) {
        alert('No scheme to save. Generate one first!');
        return;
    }
    
    const title = document.querySelector('#scheme-content h1')?.innerText || 'Untitled Scheme';
    const branch = getSelectedBranch();
    
    const saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.savedSchemes) || '[]');
    saved.push({
        title,
        branch: BRANCH_DATA[branch].name,
        startGrade: document.getElementById('start-grade')?.value,
        endGrade: document.getElementById('end-grade')?.value,
        date: new Date().toISOString(),
        type: `${BRANCH_DATA[branch].name} Scheme`,
        preview: content.substring(0, 200)
    });
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.savedSchemes, JSON.stringify(saved));
    alert('💾 Scheme saved to your dashboard!');
}

async function copyScheme() {
    const content = document.getElementById('scheme-content')?.innerText;
    if (!content) {
        alert('No scheme to copy. Generate one first!');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(content);
        alert('📋 Scheme copied to clipboard!');
    } catch (error) {
        console.error('Copy failed:', error);
        alert('Failed to copy. Please try again.');
    }
}

function printScheme() {
    const content = document.getElementById('scheme-content');
    if (!content) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Scheme of Work</title>
            <link rel="stylesheet" href="css/pages/scheme.css">
            <style>
                body { padding: 2rem; font-family: system-ui; }
                .scheme-section { page-break-inside: avoid; margin-bottom: 1.5rem; }
                .scheme-header { background: #6366f1 !important; color: white; padding: 1.5rem; -webkit-print-color-adjust: exact; }
            </style>
        </head>
        <body>${content.innerHTML}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

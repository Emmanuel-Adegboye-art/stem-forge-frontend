// ============================================
// SCHEME OF WORK GENERATOR
// Handles multi-grade curriculum generation
// ============================================

import { generateLessonPlan, APIError } from '../core/api.js';
import { generateLocalLessonPlan } from '../core/localGenerator.js';
import { escapeHtml, showStatus, setButtonLoading, resetButton } from '../core/utils.js';
import { CONFIG } from '../core/config.js';

let isGenerating = false;

export function init() {
    const form = document.getElementById('scheme-form');
    if (!form) return;
    
    form.addEventListener('submit', handleGenerate);
    
    const saveBtn = document.getElementById('save-scheme');
    if (saveBtn) saveBtn.addEventListener('click', saveScheme);
    
    const copyBtn = document.getElementById('copy-scheme');
    if (copyBtn) copyBtn.addEventListener('click', copyScheme);
}

async function handleGenerate(e) {
    e.preventDefault();
    
    if (isGenerating) return;
    
    // Get form data
    const formData = {
        startGrade: parseInt(document.getElementById('start-grade')?.value),
        endGrade: parseInt(document.getElementById('end-grade')?.value),
        components: getCheckedValues('Robotics Components'),
        competitions: getCheckedValues('Robotics Competitions'),
        economicActivities: getCheckedValues('Economic / Industry Activities'),
        additionalNotes: document.getElementById('scheme-notes')?.value.trim() || ''
    };
    
    // Validation
    if (!formData.startGrade || !formData.endGrade) {
        showStatus('scheme-status', 'Please select grade range', 'error');
        return;
    }
    
    if (formData.startGrade > formData.endGrade) {
        showStatus('scheme-status', 'End grade must be higher than start grade', 'error');
        return;
    }
    
    // UI state
    isGenerating = true;
    const generateBtn = document.getElementById('generate-scheme-btn');
    const originalHtml = setButtonLoading(generateBtn, '⏳ Generating Scheme...');
    showStatus('scheme-status', 'Generating scheme of work...', 'info', 0);
    
    try {
        // Try backend first
        const result = await generateLessonPlan(formData);
        renderScheme(result, formData);
        showStatus('scheme-status', '✅ Scheme generated successfully!', 'success', 3000);
        
    } catch (error) {
        console.warn('Backend failed, using local generator:', error.message);
        
        if (error instanceof APIError) {
            showStatus('scheme-status', `${error.message} Using offline template.`, 'warning', 4000);
        }
        
        // Generate locally
        const localScheme = generateLocalScheme(formData);
        renderScheme(localScheme, formData);
        showStatus('scheme-status', '✅ Scheme generated (offline mode)', 'success', 3000);
        
    } finally {
        isGenerating = false;
        resetButton(generateBtn, originalHtml);
    }
}

function getCheckedValues(labelText) {
    const labels = Array.from(document.querySelectorAll('label'));
    const targetLabel = labels.find(l => l.textContent.includes(labelText));
    if (!targetLabel) return [];
    
    const container = targetLabel.closest('.form-group') || targetLabel.parentElement;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function renderScheme(data, formData) {
    const output = document.getElementById('scheme-output');
    const content = document.getElementById('scheme-content');
    
    if (!output || !content) return;
    
    const metadata = data.metadata || {};
    
    let html = `
        <div class="scheme-header">
            <h2>${escapeHtml(metadata.title || 'Scheme of Work')}</h2>
            <div class="scheme-meta">
                <span>📚 Grades ${formData.startGrade} - ${formData.endGrade}</span>
                <span>🔧 ${formData.components.length} components</span>
                <span>🏆 ${formData.competitions.length} competitions</span>
                <span>📆 ${escapeHtml(metadata.generatedDate || new Date().toLocaleDateString())}</span>
            </div>
        </div>
    `;
    
    // If backend returned structured data
    if (data.terms && Array.isArray(data.terms)) {
        html += renderStructuredScheme(data);
    } else {
        // Local generation: build terms per grade
        html += renderLocalScheme(formData);
    }
    
    content.innerHTML = html;
    output.style.display = 'block';
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderStructuredScheme(data) {
    return data.terms.map(term => `
        <div class="term-section">
            <h3 class="term-title">${escapeHtml(term.grade)} - ${escapeHtml(term.term)}</h3>
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
                    ${(term.weeks || []).map(week => `
                        <tr>
                            <td>Week ${escapeHtml(week.week)}</td>
                            <td>${escapeHtml(week.topic)}</td>
                            <td>${escapeHtml(week.objective)}</td>
                            <td>${escapeHtml(week.activity)}</td>
                            <td>${escapeHtml(week.assessment)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `).join('');
}

function renderLocalScheme(formData) {
    const topicsByGrade = getTopicsByGrade();
    let html = '';
    
    for (let grade = formData.startGrade; grade <= formData.endGrade; grade++) {
        const topics = topicsByGrade[grade] || topicsByGrade[7];
        
        // Term 1
        html += `
            <div class="term-section">
                <h3 class="term-title">🎓 Grade ${grade} - First Term</h3>
                ${buildWeekTable(topics.slice(0, 5), formData)}
            </div>
        `;
        
        // Term 2
        html += `
            <div class="term-section">
                <h3 class="term-title">🎓 Grade ${grade} - Second Term</h3>
                ${buildWeekTable(topics.slice(0, 4).map(t => t + ' (Advanced)'), formData)}
            </div>
        `;
        
        // Term 3
        html += `
            <div class="term-section">
                <h3 class="term-title">🎓 Grade ${grade} - Third Term</h3>
                ${buildWeekTable(topics.map(t => t + ' - Capstone'), formData)}
            </div>
        `;
    }
    
    // Additional components
    if (formData.components.length > 0) {
        html += `
            <div class="scheme-additional">
                <h3>🔧 Focused Components</h3>
                <ul>${formData.components.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
            </div>
        `;
    }
    
    if (formData.competitions.length > 0) {
        html += `
            <div class="scheme-additional">
                <h3>🏆 Competition Prep</h3>
                <ul>${formData.competitions.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
            </div>
        `;
    }
    
    if (formData.economicActivities.length > 0) {
        html += `
            <div class="scheme-additional">
                <h3>🏭 Economic Applications</h3>
                <ul>${formData.economicActivities.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
            </div>
        `;
    }
    
    if (formData.additionalNotes) {
        html += `
            <div class="scheme-additional">
                <h3>📌 Additional Notes</h3>
                <p>${escapeHtml(formData.additionalNotes)}</p>
            </div>
        `;
    }
    
    return html;
}

function buildWeekTable(topics, formData) {
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
                        <td>Week ${idx + 1}</td>
                        <td>${escapeHtml(topic)}</td>
                        <td>Understand and apply ${escapeHtml(topic.toLowerCase())} concepts</td>
                        <td>Build and test ${escapeHtml(topic.toLowerCase())} project</td>
                        <td>Practical demonstration</td>
                    </tr>
                `).join('')}
                <tr>
                    <td>Week ${topics.length + 1}</td>
                    <td>Review & Assessment</td>
                    <td>Synthesize term concepts</td>
                    <td>Group presentation</td>
                    <td>Written + practical test</td>
                </tr>
            </tbody>
        </table>
    `;
}

function generateLocalScheme(formData) {
    return {
        metadata: {
            title: `📅 Robotics Scheme of Work (Grades ${formData.startGrade}-${formData.endGrade})`,
            generatedDate: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            }),
            source: 'local-template'
        }
    };
}

function getTopicsByGrade() {
    return {
        4: ['Introduction to Robots', 'Basic Electronics', 'Simple Circuits', 'LEDs and Buzzers', 'Robot Movements'],
        5: ['Sensors Introduction', 'Light and Sound Sensors', 'Basic Programming', 'Simple Movements', 'Robot Navigation'],
        6: ['Microcontrollers', 'Programming Logic', 'Motor Control', 'Obstacle Detection', 'Line Following Basics'],
        7: ['Autonomous Systems', 'Sensor Fusion', 'Line Following Robots', 'Competition Prep', 'Robot Design'],
        8: ['Advanced Programming', 'PID Control', 'Wireless Communication', 'IoT Basics', 'System Integration'],
        9: ['Robotics Design', 'System Integration', 'Capstone Projects', 'Competition Mastery', 'Innovation Lab']
    };
}

function saveScheme() {
    const content = document.getElementById('scheme-content')?.innerText;
    if (!content) {
        alert('No scheme to save. Generate one first!');
        return;
    }
    
    const title = document.querySelector('#scheme-content h2')?.innerText || 'Untitled Scheme';
    const startGrade = document.getElementById('start-grade')?.value;
    const endGrade = document.getElementById('end-grade')?.value;
    
    const saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.savedSchemes) || '[]');
    saved.push({
        title,
        grade: `${startGrade} - ${endGrade}`,
        date: new Date().toISOString(),
        type: 'Robotics Scheme',
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

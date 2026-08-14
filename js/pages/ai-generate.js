// ============================================
// AI GENERATE PAGE LOGIC (UPDATED)
// Handles tabs, additional details, and beautiful output
// ============================================

import { generateWithAI, APIError } from '../core/api.js';
import { escapeHtml } from '../core/utils.js';

let isGenerating = false;

// ============================================
// TAB MANAGEMENT
// ============================================

function initTabs() {
    const tabBtns = document.querySelectorAll('.form-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update panels
            tabPanels.forEach(panel => {
                if (panel.dataset.panel === targetTab) {
                    panel.style.display = 'block';
                    panel.classList.add('active');
                } else {
                    panel.style.display = 'none';
                    panel.classList.remove('active');
                }
            });
        });
    });
    
    // Next/Prev buttons
    document.getElementById('next-tab-btn')?.addEventListener('click', () => {
        document.querySelector('[data-tab="additional"]')?.click();
    });
    
    document.getElementById('prev-tab-btn')?.addEventListener('click', () => {
        document.querySelector('[data-tab="basic"]')?.click();
    });
}

// ============================================
// FORM COLLECTION
// ============================================

function collectFormData() {
    // Basic details
    const data = {
        grade: document.getElementById('grade-class')?.value,
        term: document.getElementById('term')?.value,
        week: document.getElementById('week')?.value.trim() || null,
        subject: document.getElementById('subject')?.value.trim(),
        topic: document.getElementById('topic')?.value.trim(),
        duration: parseInt(document.getElementById('duration')?.value) || 40,
        mode: document.getElementById('generation-mode')?.value || 'lesson-plan'
    };
    
    // Additional details (only for lesson-plan mode)
    if (data.mode === 'lesson-plan') {
        data.additionalDetails = {
            setInduction: {
                enabled: document.getElementById('opt-setInduction')?.checked,
                custom: document.getElementById('custom-setInduction')?.value.trim() || null
            },
            priorKnowledge: {
                enabled: document.getElementById('opt-priorKnowledge')?.checked,
                custom: document.getElementById('custom-priorKnowledge')?.value.trim() || null
            },
            learningObjectives: {
                enabled: document.getElementById('opt-objectives')?.checked
            },
            learningOutcomes: {
                enabled: document.getElementById('opt-outcomes')?.checked
            },
            teachingActivities: {
                enabled: document.getElementById('opt-activities')?.checked
            },
            formativeAssessment: {
                enabled: document.getElementById('opt-assessment')?.checked
            },
            closure: {
                enabled: document.getElementById('opt-closure')?.checked
            },
            differentiation: {
                enabled: document.getElementById('opt-differentiation')?.checked
            },
            instructionalMaterials: {
                enabled: document.getElementById('opt-materials')?.checked,
                custom: document.getElementById('custom-materials')?.value.trim() || null
            },
            vocabulary: {
                enabled: document.getElementById('opt-vocabulary')?.checked,
                custom: document.getElementById('custom-vocabulary')?.value.trim() || null
            },
            homework: {
                enabled: document.getElementById('opt-homework')?.checked
            },
            realWorldApplication: {
                enabled: document.getElementById('opt-realWorld')?.checked
            },
            crossCurricular: {
                enabled: document.getElementById('opt-crossCurricular')?.checked
            },
            discussionQuestions: {
                enabled: document.getElementById('opt-discussion')?.checked
            },
            safetyProtocols: {
                enabled: document.getElementById('opt-safety')?.checked
            },
            engineeringDesignProcess: {
                enabled: document.getElementById('opt-edp')?.checked
            }
        };
        
        // Advanced JSON (merge into additionalDetails)
        const customJson = document.getElementById('custom-json')?.value.trim();
        if (customJson) {
            try {
                data.additionalDetails.customFields = JSON.parse(customJson);
            } catch (e) {
                console.warn('Invalid custom JSON, ignoring:', e);
            }
        }
    }
    
    return data;
}

// ============================================
// INIT
// ============================================

export function init() {
    initTabs();
    
    const form = document.getElementById('lesson-form');
    if (!form) return;
    
    form.addEventListener('submit', handleGenerate);
    
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) copyBtn.addEventListener('click', handleCopy);
    
    const printBtn = document.getElementById('print-btn');
    if (printBtn) printBtn.addEventListener('click', handlePrint);
}

// ============================================
// GENERATE HANDLER
// ============================================

async function handleGenerate(e) {
    e.preventDefault();
    
    if (isGenerating) return;
    
    const formData = collectFormData();
    
    // Validate
    if (!formData.grade || !formData.term || !formData.subject || !formData.topic) {
        showError('Please fill in all required fields');
        return;
    }
    
    isGenerating = true;
    setLoadingState(true);
    hideError();
    showOutput('loading');
    hideCopyButton();
    
    try {
        const result = await generateWithAI(formData);
        renderBeautifulOutput(result.data, formData);
        showCopyButton();
        showPrintButton();
        console.log(`✅ Generated via ${result.source}`);
    } catch (error) {
        console.error('Generation failed:', error);
        if (error instanceof APIError) {
            showError(`${error.message}`);
        } else {
            showError('Failed to generate content. Please try again.');
        }
        showOutput('empty');
    } finally {
        isGenerating = false;
        setLoadingState(false);
    }
}

// ============================================
// ⭐ BEAUTIFUL OUTPUT RENDERER
// ============================================

function renderBeautifulOutput(data, formData) {
    const outputContent = document.getElementById('output-content');
    if (!outputContent) return;
    
    if (formData.mode === 'lesson-note') {
        outputContent.innerHTML = renderLessonNote(data);
    } else {
        outputContent.innerHTML = renderLessonPlan(data);
    }
    
    showOutput('content');
}

function renderLessonPlan(data) {
    const meta = data.metadata || {};
    
    return `
        <div class="lesson-document">
            <!-- Header -->
            <div class="lesson-header">
                <div class="lesson-icon">📚</div>
                <h1 class="lesson-title">${escapeHtml(meta.title || 'Lesson Plan')}</h1>
                <div class="lesson-meta">
                    <div class="meta-item">
                        <i class="fa-solid fa-book"></i>
                        <span><strong>Subject:</strong> ${escapeHtml(meta.subject || 'N/A')}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fa-solid fa-graduation-cap"></i>
                        <span><strong>Grade:</strong> ${escapeHtml(meta.classLevel || 'N/A')}</span>
                    </div>
                    ${meta.term ? `
                    <div class="meta-item">
                        <i class="fa-solid fa-calendar"></i>
                        <span><strong>Term:</strong> ${escapeHtml(meta.term)}</span>
                    </div>` : ''}
                    ${meta.week ? `
                    <div class="meta-item">
                        <i class="fa-solid fa-calendar-week"></i>
                        <span><strong>Week:</strong> ${escapeHtml(meta.week)}</span>
                    </div>` : ''}
                    <div class="meta-item">
                        <i class="fa-solid fa-clock"></i>
                        <span><strong>Duration:</strong> ${escapeHtml(meta.duration || 'N/A')}</span>
                    </div>
                </div>
            </div>
            
            ${renderSection('🎯 Learning Objectives', data.learningObjectives, 'list')}
            ${renderSection('📚 Learning Outcomes', data.learningOutcomes, 'list')}
            ${renderSection('📖 Prior Knowledge', data.priorKnowledge, 'list')}
            ${renderSection('🛠️ Instructional Materials', data.instructionalMaterials, 'list')}
            ${renderSetInduction(data.setInduction)}
            ${renderActivities(data.teachingActivities)}
            ${renderSection('✅ Formative Assessment / Checkpoints', data.formativeAssessment, 'list')}
            ${renderClosure(data.closure)}
            ${renderDifferentiation(data.differentiation)}
            ${renderSection('⚠️ Safety Protocols', data.safetyProtocols, 'list')}
            ${renderEDP(data.engineeringDesignProcess)}
            ${renderSection('📝 Homework / Assignment', data.homework, 'list')}
            ${renderSection('🌍 Real-World Applications', data.realWorldApplication, 'list')}
            ${renderSection('🔗 Cross-Curricular Links', data.crossCurricular, 'list')}
            ${renderVocabulary(data.vocabulary)}
            ${renderSection('💬 Discussion Questions', data.discussionQuestions, 'list')}
            ${renderCustomFields(data.customFields)}
        </div>
    `;
}

function renderLessonNote(data) {
    const meta = data.metadata || {};

    return `
        <div class="lesson-document">
            <!-- Header -->
            <div class="lesson-header">
                <div class="lesson-icon">📝</div>
                <h1 class="lesson-title">${escapeHtml(meta.title || 'Lesson Note')}</h1>
                <div class="lesson-meta">
                    ${meta.subject ? `<div class="meta-item"><span><strong>Subject:</strong> ${escapeHtml(meta.subject)}</span></div>` : ''}
                    ${meta.classLevel ? `<div class="meta-item"><span><strong>Grade:</strong> ${escapeHtml(meta.classLevel)}</span></div>` : ''}
                    ${meta.duration ? `<div class="meta-item"><span><strong>Duration:</strong> ${escapeHtml(meta.duration)}</span></div>` : ''}
                </div>
            </div>

            ${renderLNIntroduction(data.introduction)}
            ${renderLNKeyConcepts(data.keyConcepts)}
            ${renderLNDefinitions(data.definitions)}
            ${renderLNActivities(data.activities)}
            ${renderLNMaterials(data.materialsList)}
            ${renderLNVideoSuggestions(data.videoSuggestions)}
            ${renderLNImageSuggestions(data.imageSuggestions)}
        </div>
    `;
}

function renderLNIntroduction(intro) {
    if (!intro) return '';
    const text = typeof intro === 'string' ? intro : intro.text;
    const dur  = typeof intro === 'object' ? intro.duration : null;
    if (!text) return '';
    return `
        <section class="lesson-section highlight">
            <h2 class="section-title">📖 Introduction</h2>
            <div class="section-content">
                <p class="lesson-text">${escapeHtml(text)}</p>
                ${dur ? `<p class="lesson-duration"><strong>Duration:</strong> ${escapeHtml(String(dur))}</p>` : ''}
            </div>
        </section>`;
}

function renderLNKeyConcepts(concepts) {
    if (!concepts || !Array.isArray(concepts) || concepts.length === 0) return '';
    return `
        <section class="lesson-section">
            <h2 class="section-title">💡 Key Concepts</h2>
            <div class="section-content">
                <ul class="lesson-list">
                    ${concepts.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
                </ul>
            </div>
        </section>`;
}

function renderLNDefinitions(defs) {
    if (!defs || !Array.isArray(defs) || defs.length === 0) return '';
    return `
        <section class="lesson-section">
            <h2 class="section-title">📚 Definitions & Key Terms</h2>
            <div class="section-content">
                ${defs.map(d => `
                    <div class="activity-card" style="margin-bottom:1rem;">
                        <div class="activity-header">
                            <h3 class="activity-name" style="font-size:1rem;">${escapeHtml(d.term || '')}</h3>
                        </div>
                        ${d.definition ? `<p class="lesson-text">${escapeHtml(d.definition)}</p>` : ''}
                        ${d.example ? `<p class="lesson-text"><strong>Example:</strong> ${escapeHtml(d.example)}</p>` : ''}
                        ${d.suggestedImagePrompt ? `
                            <p class="lesson-text" style="color:var(--color-primary);font-style:italic;">
                                🖼️ Suggested image: ${escapeHtml(d.suggestedImagePrompt)}
                            </p>` : ''}
                    </div>`).join('')}
            </div>
        </section>`;
}

function renderLNActivities(activities) {
    if (!activities || !Array.isArray(activities) || activities.length === 0) return '';
    return `
        <section class="lesson-section">
            <h2 class="section-title">🔬 Activities</h2>
            <div class="section-content">
                ${activities.map((act, idx) => `
                    <div class="activity-card">
                        <div class="activity-header">
                            <span class="activity-number">${idx + 1}</span>
                            <h3 class="activity-name">${escapeHtml(act.name || `Activity ${idx + 1}`)}</h3>
                            ${act.duration ? `<span class="activity-duration">${escapeHtml(act.duration)}</span>` : ''}
                        </div>
                        ${act.description ? `<p class="lesson-text">${escapeHtml(act.description)}</p>` : ''}
                        ${act.materials && Array.isArray(act.materials) ? `
                            <p class="lesson-text"><strong>Materials:</strong> ${act.materials.map(escapeHtml).join(', ')}</p>` : ''}
                        ${act.steps && Array.isArray(act.steps) ? `
                            <ol class="lesson-list">
                                ${act.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                            </ol>` : ''}
                    </div>`).join('')}
            </div>
        </section>`;
}

function renderLNMaterials(list) {
    if (!list || !Array.isArray(list) || list.length === 0) return '';
    return `
        <section class="lesson-section">
            <h2 class="section-title">🛠️ Materials & Resources</h2>
            <div class="section-content">
                <ul class="lesson-list">
                    ${list.map(m => {
                        if (typeof m === 'string') return `<li>${escapeHtml(m)}</li>`;
                        const qty = m.quantity ? ` (×${m.quantity})` : '';
                        const src = m.source ? ` — <em>${escapeHtml(m.source)}</em>` : '';
                        return `<li>${escapeHtml(m.item || '')}${escapeHtml(qty)}${src}</li>`;
                    }).join('')}
                </ul>
            </div>
        </section>`;
}

function renderLNVideoSuggestions(videos) {
    if (!videos || !Array.isArray(videos) || videos.length === 0) return '';
    return `
        <section class="lesson-section">
            <h2 class="section-title">🎬 Video Suggestions</h2>
            <div class="section-content">
                ${videos.map(v => `
                    <div class="activity-card" style="margin-bottom:0.75rem;">
                        <div class="activity-header">
                            <h3 class="activity-name" style="font-size:1rem;">🎥 ${escapeHtml(v.topic || v.title || 'Video')}</h3>
                        </div>
                        ${v.searchQuery ? `
                            <p class="lesson-text">
                                <strong>🔍 Search:</strong> "${escapeHtml(v.searchQuery)}"
                            </p>` : ''}
                        ${v.description ? `<p class="lesson-text">${escapeHtml(v.description)}</p>` : ''}
                        ${v.suggestedSources && Array.isArray(v.suggestedSources) && v.suggestedSources.length > 0 ? `
                            <p class="lesson-text"><strong>📺 Recommended sources:</strong>
                                ${v.suggestedSources.map(s => {
                                    if (typeof s === 'string' && (s.startsWith('http') || s.includes('youtube') || s.includes('www'))) {
                                        return `<a href="${escapeHtml(s)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s)}</a>`;
                                    }
                                    return escapeHtml(s);
                                }).join(' &nbsp;|&nbsp; ')}
                            </p>` : ''}
                    </div>`).join('')}
            </div>
        </section>`;
}

function renderLNImageSuggestions(images) {
    if (!images || !Array.isArray(images) || images.length === 0) return '';
    return `
        <section class="lesson-section">
            <h2 class="section-title">🖼️ Image Suggestions</h2>
            <div class="section-content">
                ${images.map(img => `
                    <div class="activity-card" style="margin-bottom:0.75rem;">
                        <div class="activity-header">
                            <h3 class="activity-name" style="font-size:1rem;">📷 ${escapeHtml(img.location || img.title || 'Image')}</h3>
                        </div>
                        ${img.description ? `<p class="lesson-text">${escapeHtml(img.description)}</p>` : ''}
                        ${img.sources && Array.isArray(img.sources) && img.sources.length > 0 ? `
                            <p class="lesson-text"><strong>🔗 Sources:</strong>
                                ${img.sources.map(s => {
                                    if (typeof s === 'string' && (s.startsWith('http') || s.includes('www'))) {
                                        return `<a href="${escapeHtml(s)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s)}</a>`;
                                    }
                                    return escapeHtml(s);
                                }).join(' &nbsp;|&nbsp; ')}
                            </p>` : ''}
                    </div>`).join('')}
            </div>
        </section>`;
}

// ============================================
// SECTION RENDERERS
// ============================================

function renderSection(title, content, type = 'list') {
    if (!content || (Array.isArray(content) && content.length === 0)) return '';
    
    let body = '';
    if (type === 'list' && Array.isArray(content)) {
        body = '<ul class="lesson-list">' + 
               content.map(item => `<li>${escapeHtml(item)}</li>`).join('') + 
               '</ul>';
    } else if (typeof content === 'string') {
        body = `<p class="lesson-text">${escapeHtml(content)}</p>`;
    }
    
    return `
        <section class="lesson-section">
            <h2 class="section-title">${title}</h2>
            <div class="section-content">${body}</div>
        </section>
    `;
}

function renderSetInduction(data) {
    if (!data) return '';
    
    let content = '';
    if (typeof data === 'string') {
        content = `<p class="lesson-text">${escapeHtml(data)}</p>`;
    } else if (data.analogy || data.hook || data.recall) {
        content = `
            ${data.analogy ? `<p class="lesson-text"><strong>💡 Analogy:</strong> ${escapeHtml(data.analogy)}</p>` : ''}
            ${data.recall ? `<p class="lesson-text"><strong>🔄 Recall:</strong> ${escapeHtml(data.recall)}</p>` : ''}
            ${data.hook ? `<p class="lesson-text"><strong>🎯 Hook:</strong> ${escapeHtml(data.hook)}</p>` : ''}
            ${data.duration ? `<p class="lesson-duration"><i class="fa-solid fa-clock"></i> Duration: ${escapeHtml(data.duration)} minutes</p>` : ''}
        `;
    }
    
    return `
        <section class="lesson-section highlight">
            <h2 class="section-title">🎬 Set Induction</h2>
            <div class="section-content">${content}</div>
        </section>
    `;
}

function renderActivities(activities) {
    if (!activities || !Array.isArray(activities) || activities.length === 0) return '';
    
    return `
        <section class="lesson-section">
            <h2 class="section-title">📖 Teaching and Learning Activities</h2>
            <div class="section-content">
                ${activities.map((act, idx) => `
                    <div class="activity-card">
                        <div class="activity-header">
                            <span class="activity-number">${idx + 1}</span>
                            <h3 class="activity-name">${escapeHtml(act.name || act.phase || `Activity ${idx + 1}`)}</h3>
                            <span class="activity-duration">${escapeHtml(act.duration || '')}</span>
                        </div>
                        ${act.teacherActivity ? `
                            <div class="activity-row">
                                <div class="role-badge teacher">Teacher</div>
                                <p>${escapeHtml(act.teacherActivity)}</p>
                            </div>
                        ` : ''}
                        ${act.studentActivity ? `
                            <div class="activity-row">
                                <div class="role-badge student">Students</div>
                                <p>${escapeHtml(act.studentActivity)}</p>
                            </div>
                        ` : act.description ? `
                            <p>${escapeHtml(act.description)}</p>
                        ` : ''}
                        ${act.materials ? `<p class="activity-materials"><strong>Materials:</strong> ${escapeHtml(act.materials)}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function renderClosure(data) {
    if (!data) return '';
    
    let content = '';
    if (typeof data === 'string') {
        content = `<p class="lesson-text">${escapeHtml(data)}</p>`;
    } else {
        content = `
            ${data.recap ? `<p class="lesson-text"><strong>📝 Recap:</strong> ${escapeHtml(data.recap)}</p>` : ''}
            ${data.exitTicket ? `<p class="lesson-text"><strong>🎫 Exit Ticket:</strong> ${escapeHtml(data.exitTicket)}</p>` : ''}
            ${data.preview ? `<p class="lesson-text"><strong>👀 Preview:</strong> ${escapeHtml(data.preview)}</p>` : ''}
            ${data.duration ? `<p class="lesson-duration"><i class="fa-solid fa-clock"></i> Duration: ${escapeHtml(data.duration)} minutes</p>` : ''}
        `;
    }
    
    return `
        <section class="lesson-section highlight">
            <h2 class="section-title">🎯 Closure</h2>
            <div class="section-content">${content}</div>
        </section>
    `;
}

function renderDifferentiation(data) {
    if (!data) return '';
    
    let content = '';
    if (typeof data === 'string') {
        content = `<p class="lesson-text">${escapeHtml(data)}</p>`;
    } else {
        content = `
            ${data.advanced ? `
                <div class="diff-card advanced">
                    <h4>🌟 For Advanced Students</h4>
                    <p>${escapeHtml(data.advanced)}</p>
                </div>
            ` : ''}
            ${data.struggling ? `
                <div class="diff-card struggling">
                    <h4>🤝 For Struggling Students</h4>
                    <p>${escapeHtml(data.struggling)}</p>
                </div>
            ` : ''}
            ${data.extension ? `
                <div class="diff-card extension">
                    <h4>🚀 Extension Activity</h4>
                    <p>${escapeHtml(data.extension)}</p>
                </div>
            ` : ''}
        `;
    }
    
    return `
        <section class="lesson-section">
            <h2 class="section-title">⭐ Differentiation</h2>
            <div class="section-content">${content}</div>
        </section>
    `;
}

function renderEDP(steps) {
    if (!steps || !Array.isArray(steps) || steps.length === 0) return '';
    
    return `
        <section class="lesson-section">
            <h2 class="section-title">🔧 Engineering Design Process</h2>
            <div class="section-content">
                <div class="edp-flow">
                    ${steps.map((step, idx) => `
                        <div class="edp-step">
                            <div class="edp-number">${idx + 1}</div>
                            <div class="edp-text">${escapeHtml(step)}</div>
                        </div>
                    `).join('<div class="edp-arrow">→</div>')}
                </div>
            </div>
        </section>
    `;
}

function renderVocabulary(vocab) {
    if (!vocab) return '';
    
    let content = '';
    if (Array.isArray(vocab)) {
        content = '<div class="vocab-grid">' + 
                  vocab.map(v => `
                    <div class="vocab-item">
                        <strong>${escapeHtml(v.term || v)}</strong>
                        ${v.definition ? `<p>${escapeHtml(v.definition)}</p>` : ''}
                    </div>
                  `).join('') + '</div>';
    } else if (typeof vocab === 'string') {
        content = `<p class="lesson-text">${escapeHtml(vocab)}</p>`;
    }
    
    return `
        <section class="lesson-section">
            <h2 class="section-title">📖 Vocabulary / Key Terms</h2>
            <div class="section-content">${content}</div>
        </section>
    `;
}

function renderCustomFields(fields) {
    if (!fields || typeof fields !== 'object') return '';
    
    return Object.entries(fields).map(([key, value]) => `
        <section class="lesson-section">
            <h2 class="section-title">${escapeHtml(key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'))}</h2>
            <div class="section-content">
                ${typeof value === 'string' ? `<p>${escapeHtml(value)}</p>` : `<pre>${escapeHtml(JSON.stringify(value, null, 2))}</pre>`}
            </div>
        </section>
    `).join('');
}

// ============================================
// UI HELPERS
// ============================================

function setLoadingState(loading) {
    const btn = document.getElementById('generate-btn');
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading 
        ? '<span class="loading-spinner"></span> <span>Generating...</span>'
        : '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Document</span>';
}

function showOutput(state) {
    const empty = document.getElementById('empty-state');
    const loading = document.getElementById('loading-state');
    const content = document.getElementById('output-content');
    
    if (state === 'empty') {
        empty?.classList.remove('hidden');
        loading?.classList.add('hidden');
        content?.classList.add('hidden');
    } else if (state === 'loading') {
        empty?.classList.add('hidden');
        loading?.classList.remove('hidden');
        content?.classList.add('hidden');
    } else if (state === 'content') {
        empty?.classList.add('hidden');
        loading?.classList.add('hidden');
        content?.classList.remove('hidden');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function hideError() {
    document.getElementById('error-message')?.classList.add('hidden');
}

function showCopyButton() { document.getElementById('copy-btn')?.classList.remove('hidden'); }
function hideCopyButton() { document.getElementById('copy-btn')?.classList.add('hidden'); }
function showPrintButton() { document.getElementById('print-btn')?.classList.remove('hidden'); }

async function handleCopy() {
    const content = document.getElementById('output-content')?.innerText;
    if (!content) return;
    try {
        await navigator.clipboard.writeText(content);
        alert('📋 Copied to clipboard!');
    } catch (error) {
        alert('Failed to copy.');
    }
}

function handlePrint() {
    const content = document.getElementById('output-content');
    if (!content) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Lesson Plan</title>
            <link rel="stylesheet" href="css/pages/ai-generate.css">
            <style>body { padding: 2rem; }</style>
        </head>
        <body>${content.innerHTML}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ============================================
// AI GENERATE PAGE LOGIC
// Handles both Lesson Plan and Lesson Note modes
// ============================================

import { generateWithAI, APIError } from '../core/api.js';
import { generateLocalLessonPlan, generateLocalLessonNote } from '../core/localGenerator.js';
import { escapeHtml, showStatus } from '../core/utils.js';

let isGenerating = false;

export function init() {
    const form = document.getElementById('lesson-form');
    if (!form) return;
    
    form.addEventListener('submit', handleGenerate);
    
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', handleCopy);
    }
}

async function handleGenerate(e) {
    e.preventDefault();
    
    if (isGenerating) {
        console.warn('Generation already in progress');
        return;
    }
    
    // Get form data
    const formData = {
        grade: document.getElementById('grade-class')?.value,
        term: document.getElementById('term')?.value,
        subject: document.getElementById('subject')?.value.trim(),
        topic: document.getElementById('topic')?.value.trim(),
        mode: document.getElementById('generation-mode')?.value || 'lesson-plan'
    };
    
    // Validate
    if (!formData.grade || !formData.term || !formData.subject || !formData.topic) {
        showError('Please fill in all required fields');
        return;
    }
    
    // Start generation
    isGenerating = true;
    setLoadingState(true);
    hideError();
    showOutput('loading');
    hideCopyButton();
    
    try {
        // Try backend first
        const result = await generateWithAI(formData);
        renderOutput(result.data, formData.mode, result.source);
        showCopyButton();
        console.log(`✅ Generated via ${result.source}`);
        
    } catch (error) {
        console.warn('Backend failed, using local generator:', error.message);
        
        if (error instanceof APIError) {
            // Show warning but continue with local fallback
            showError(`${error.message} Using offline template.`);
        }
        
        // Use local generator
        try {
            const localData = formData.mode === 'lesson-note' 
                ? generateLocalLessonNote(formData)
                : generateLocalLessonPlan(formData);
            
            renderOutput(localData, formData.mode, 'local-template');
            showCopyButton();
            
        } catch (fallbackError) {
            showError('Failed to generate content. Please try again.');
            showOutput('empty');
            console.error('Fallback failed:', fallbackError);
        }
        
    } finally {
        isGenerating = false;
        setLoadingState(false);
    }
}

function renderOutput(data, mode, source) {
    const outputContent = document.getElementById('output-content');
    if (!outputContent) return;
    
    let html = '';
    
    if (mode === 'lesson-note') {
        html = renderLessonNote(data);
    } else {
        html = renderLessonPlan(data);
    }
    
    // Add source badge
    const sourceBadge = source === 'ai' 
        ? '<div class="source-badge ai">✨ AI Generated</div>'
        : '<div class="source-badge local">📋 Template Generated (Offline Mode)</div>';
    
    outputContent.innerHTML = sourceBadge + html;
    showOutput('content');
}

function renderLessonPlan(data) {
    return `
# ${escapeHtml(data.metadata?.title || 'Lesson Plan')}

**Grade:** ${escapeHtml(data.metadata?.classLevel || 'N/A')} | 
**Term:** ${escapeHtml(data.metadata?.term || 'N/A')} | 
**Duration:** ${escapeHtml(data.metadata?.duration || 'N/A')}

## 🎯 Learning Objectives
${(data.learningObjectives || []).map(obj => `- ${escapeHtml(obj)}`).join('\n')}

## 🧠 Engineering Design Process
${(data.edpSteps || []).map(step => `1. ${escapeHtml(step)}`).join('\n')}

## ⚠️ Safety Protocols
${(data.safetyProtocols || []).map(s => `- ${escapeHtml(s)}`).join('\n')}

## ⏱️ Lesson Timeline
${(data.timeline || []).map(t => `**${escapeHtml(t.phase)}** (${escapeHtml(t.duration)})
${escapeHtml(t.description)}`).join('\n\n')}

## 🧪 Experiential Activity
${escapeHtml(data.experientialActivity || 'N/A')}

## 📦 Materials & Equipment
${(data.materials || []).map(m => `- ${escapeHtml(m)}`).join('\n')}

## 📝 Assessment Methods
${(data.assessment || []).map(a => `- ${escapeHtml(a)}`).join('\n')}

${data.additionalNotes ? `\n## 📌 Additional Notes\n${escapeHtml(data.additionalNotes)}` : ''}
`;
}

function renderLessonNote(data) {
    return `
# ${escapeHtml(data.metadata?.title || 'Lesson Note')}

**Grade:** ${escapeHtml(data.metadata?.classLevel || 'N/A')} | 
**Term:** ${escapeHtml(data.metadata?.term || 'N/A')}

## 📖 Introduction
${escapeHtml(data.introduction?.text || 'N/A')}
*Duration: ${escapeHtml(data.introduction?.duration || 'N/A')}*

## 📚 Key Definitions

${(data.definitions || []).map(def => `
### ${escapeHtml(def.term)}
${escapeHtml(def.definition)}

> 💡 **Image Suggestion:** ${escapeHtml(def.suggestedImagePrompt)}
`).join('\n')}

## 🎯 Key Concepts
${(data.keyConcepts || []).map(c => `- ${escapeHtml(c)}`).join('\n')}

## 🎥 Video Resources

${(data.videoSuggestions || []).map(vid => `
### ${escapeHtml(vid.topic)}
**Search Query:** \`${escapeHtml(vid.searchQuery)}\`
**Duration:** ${escapeHtml(vid.duration)}

**Suggested Sources:**
${vid.suggestedSources.map(s => `- ${escapeHtml(s)}`).join('\n')}
`).join('\n')}

## 🖼️ Image Suggestions

${(data.imageSuggestions || []).map(img => `
### For: ${escapeHtml(img.location)}
**Description:** ${escapeHtml(img.description)}
**Specs:** ${escapeHtml(img.spec)}

**Free Sources:**
${img.sources.map(s => `- ${escapeHtml(s)}`).join('\n')}
`).join('\n')}

## 📋 Materials List

${(data.materialsList || []).map(m => `
- **${escapeHtml(m.item)}** (${escapeHtml(m.quantity)})
  - Source: ${escapeHtml(m.source)}
  - Alternative: ${escapeHtml(m.alternatives)}
`).join('\n')}

## 🎬 Activities

${(data.activities || []).map(act => `
### ${escapeHtml(act.name)} (${escapeHtml(act.duration)})
${escapeHtml(act.description)}
**Materials:** ${escapeHtml(act.materials)}
`).join('\n')}

${data.additionalNotes ? `\n## 📌 Additional Notes\n${escapeHtml(data.additionalNotes)}` : ''}
`;
}

function setLoadingState(loading) {
    const btn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    
    if (!btn) return;
    
    btn.disabled = loading;
    
    if (loading) {
        btn.innerHTML = '<span class="loading-spinner"></span> <span>Generating...</span>';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span id="btn-text">Generate Document</span>';
    }
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

function showCopyButton() {
    document.getElementById('copy-btn')?.classList.remove('hidden');
}

function hideCopyButton() {
    document.getElementById('copy-btn')?.classList.add('hidden');
}

async function handleCopy() {
    const content = document.getElementById('output-content')?.innerText;
    if (!content) return;
    
    try {
        await navigator.clipboard.writeText(content);
        alert('📋 Copied to clipboard!');
    } catch (error) {
        console.error('Copy failed:', error);
        alert('Failed to copy. Please try selecting and copying manually.');
    }
}

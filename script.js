// ============================================
// STEM Forge - Main JavaScript (script.js)
// File Reference: JFE - 1
// COMPLETE VERSION - All features in one file
// ============================================

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    API_URL: 'https://stemforge-backend.onrender.com'
};

// ============================================
// BACKEND API CALLS
// ============================================

async function generateLessonPlanFromBackend(formData) {
    const API_URL = CONFIG.API_URL;
    
    try {
        const response = await fetch(`${API_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Generation failed');
        }
        
        const result = await response.json();
        return result.data;
        
    } catch (error) {
        console.error('Backend error:', error);
        throw new Error('Cannot connect to backend. Using fallback template.');
    }
}

async function callAIGeneration(formData) {
    const API_URL = CONFIG.API_URL;
    
    try {
        const response = await fetch(`${API_URL}/api/ai-generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Response source:', result.source);
        return result.data;
        
    } catch (error) {
        console.error('AI API error:', error);
        throw error;
    }
}

// ============================================
// FALLBACK: LOCAL LESSON GENERATION
// ============================================

function generateLocalLessonPlan(formData) {
    const { classLevel, term, subject, duration, topic, additionalNotes } = formData;
    
    const classLevelMap = {
        'grade-7': 'Grade 7 (Ages 12-13)',
        'grade-8': 'Grade 8 (Ages 13-14)',
        'grade-9': 'Grade 9 (Ages 14-15)',
        'grade-10': 'Grade 10 (Ages 15-16)',
        'grade-11': 'Grade 11 (Ages 16-17)',
        'grade-12': 'Grade 12 (Ages 17-18)'
    };
    
    const termMap = {
        'term-1': 'Term 1 (Fall)',
        'term-2': 'Term 2 (Winter)',
        'term-3': 'Term 3 (Spring)',
        'term-4': 'Term 4 (Summer)'
    };
    
    const subjectMap = {
        'robotics': { icon: '🤖', name: 'Robotics & Automation' },
        'electronics': { icon: '⚡', name: 'Electronics & Circuits' },
        'programming': { icon: '💻', name: 'Programming for Robotics' },
        'mechanics': { icon: '🔩', name: 'Mechanics & Mechanisms' },
        'physics': { icon: '⚛️', name: 'Physics (Forces & Motion)' },
        'chemistry': { icon: '🧪', name: 'Chemistry (Materials Science)' },
        'engineering': { icon: '🏗️', name: 'Engineering Design' }
    };
    
    const className = classLevelMap[classLevel] || 'Grade 9-12';
    const termName = termMap[term] || 'Current Term';
    const subjectInfo = subjectMap[subject] || subjectMap['engineering'];
    const displayTopic = topic || 'Introduction to ' + subjectInfo.name;
    const durationNum = parseInt(duration) || 90;
    
    const phases = [
        { name: "Engage & Introduce", percent: 0.12 },
        { name: "EDP - Ask & Imagine", percent: 0.15 },
        { name: "Plan & Design", percent: 0.15 },
        { name: "Create & Build", percent: 0.35 },
        { name: "Test & Iterate", percent: 0.15 },
        { name: "Reflect & Share", percent: 0.08 }
    ];
    
    let currentTime = 0;
    const timeline = [];
    for (const phase of phases) {
        const phaseDuration = Math.round(durationNum * phase.percent);
        timeline.push({
            phase: phase.name,
            duration: `${phaseDuration} min`,
            start: currentTime,
            end: currentTime + phaseDuration,
            description: getPhaseDescription(phase.name)
        });
        currentTime += phaseDuration;
    }
    
    return {
        metadata: {
            title: `${subjectInfo.icon} ${displayTopic}`,
            classLevel: className,
            term: termName,
            subject: subjectInfo.name,
            duration: `${durationNum} minutes`,
            generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        },
        learningObjectives: [
            `Apply the Engineering Design Process to solve problems related to ${displayTopic}`,
            `Demonstrate understanding of ${displayTopic} through hands-on prototyping`,
            `Collaborate effectively in teams to iterate and improve designs`,
            `Master key concepts of ${subjectInfo.name.toLowerCase()}`
        ],
        edpSteps: [
            "Ask: Define the Problem",
            "Imagine: Brainstorm Solutions",
            "Plan: Design & Select",
            "Create: Build Prototype",
            "Test & Improve: Iterate"
        ],
        safetyProtocols: [
            "Follow all school laboratory safety guidelines",
            "Wear appropriate personal protective equipment (PPE)",
            "Report any accidents immediately to instructor",
            "Keep workspace clean and organized",
            "Disconnect power before adjusting wiring"
        ],
        timeline: timeline,
        experientialActivity: `🔧 HANDS-ON CHALLENGE: Students will work in teams to design and build a solution related to ${displayTopic}. They will test, iterate, and present their findings.`,
        materials: [
            "Microcontroller board (Arduino or compatible)",
            "Sensors and actuators",
            "Jumper wires and breadboard",
            "Structural materials (cardboard, 3D printed parts)",
            "Battery pack and power supply",
            "Computer with programming environment",
            "Engineering notebooks"
        ],
        assessment: [
            "Formative: Observation during build phase and team discussions",
            "Performance: Functionality of prototype against success criteria",
            "Summative: Engineering notebook documentation of complete EDP cycle",
            "Reflection: Exit ticket on one iteration made and why"
        ],
        additionalNotes: additionalNotes || ""
    };
}

function getPhaseDescription(phase) {
    const descriptions = {
        "Engage & Introduce": "Hook students with a real-world problem. Discuss relevance and spark curiosity.",
        "EDP - Ask & Imagine": "Students define the problem, ask questions, and brainstorm possible solutions.",
        "Plan & Design": "Teams select best solution, sketch designs, list materials, and plan build sequence.",
        "Create & Build": "Hands-on prototyping phase. Students construct their solution following safety protocols.",
        "Test & Iterate": "Test prototypes, collect data, identify failures, and make improvements.",
        "Reflect & Share": "Teams present their design process, challenges faced, and final outcomes."
    };
    return descriptions[phase] || "Active student-centered learning.";
}

function generateMockAILesson(topic, grade, duration, subject, instructions) {
    return {
        metadata: {
            title: `🤖 ${topic} - AI Generated Lesson Plan`,
            classLevel: grade,
            duration: `${duration} minutes`,
            subject: subject,
            generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        },
        learningObjectives: [
            `Understand the fundamental concepts of ${topic}`,
            `Apply ${topic} principles to solve real-world engineering problems`,
            `Demonstrate proficiency through hands-on prototyping activities`,
            `Collaborate effectively in team-based engineering challenges`,
            `Document and present design iterations using the Engineering Design Process`
        ],
        edpSteps: [
            "Ask: Define the Problem",
            "Imagine: Brainstorm Solutions",
            "Plan: Design & Select",
            "Create: Build Prototype",
            "Test & Improve: Iterate"
        ],
        safetyProtocols: [
            "Follow all laboratory safety guidelines",
            "Wear appropriate personal protective equipment (PPE)",
            "Report any accidents or damage immediately to instructor",
            "Keep workspace clean and organized",
            "Disconnect power sources before adjusting wiring"
        ],
        timeline: [
            { phase: "Engage & Introduce", duration: `${Math.floor(duration * 0.12)} min`, description: "Hook students with real-world relevance of " + topic },
            { phase: "EDP - Ask & Imagine", duration: `${Math.floor(duration * 0.15)} min`, description: "Define the problem and brainstorm possible solutions" },
            { phase: "Plan & Design", duration: `${Math.floor(duration * 0.15)} min`, description: "Sketch designs, select best approach, and list materials" },
            { phase: "Create & Build", duration: `${Math.floor(duration * 0.35)} min`, description: "Hands-on prototyping phase following safety protocols" },
            { phase: "Test & Iterate", duration: `${Math.floor(duration * 0.15)} min`, description: "Test prototypes, collect data, and make improvements" },
            { phase: "Reflect & Share", duration: `${Math.floor(duration * 0.08)} min`, description: "Present findings, document iterations, and reflect" }
        ],
        experientialActivity: `🔧 HANDS-ON ENGINEERING CHALLENGE: Students will work in teams of 3-4 to design and build a functional prototype using ${topic}. Teams will test their solutions against success criteria, document at least two iterations, and present their findings to the class.`,
        materials: [
            "Microcontroller board (Arduino or compatible)",
            "Sensors and actuators (specific to project)",
            "Jumper wires and breadboard",
            "Chassis and structural materials",
            "Battery pack and power supply",
            "Computer with programming environment",
            "Engineering notebooks for documentation"
        ],
        assessment: [
            "Formative: Observation during build phase and team discussions",
            "Performance: Functionality of prototype against success criteria",
            "Summative: Engineering notebook documentation of complete EDP cycle",
            "Reflection: Exit ticket on one iteration made and why",
            "Peer assessment: Team presentation feedback"
        ],
        additionalInstructions: instructions || ""
    };
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function displayLessonPlan(lessonData) {
    const lessonPlanContent = document.getElementById('lesson-plan-content');
    const lessonPlanPreview = document.getElementById('lesson-plan-preview');
    
    if (!lessonPlanContent) return;
    
    const metadata = lessonData.metadata || {};
    const objectives = lessonData.learningObjectives || [];
    const edpSteps = lessonData.edpSteps || [];
    const safety = lessonData.safetyProtocols || [];
    const timeline = lessonData.timeline || [];
    const experiential = lessonData.experientialActivity || '';
    const materials = lessonData.materials || [];
    const assessment = lessonData.assessment || [];
    
    let timelineHtml = "";
    if (timeline.length > 0) {
        timeline.forEach(item => {
            timelineHtml += `
                <div class="timeline-item-preview">
                    <div class="timeline-time-preview">${item.start || 0}-${item.end || 0} min</div>
                    <div class="timeline-content-preview">
                        <strong>${item.phase || 'Activity'}</strong> (${item.duration || 'N/A'})
                        <p>${item.description || ''}</p>
                    </div>
                </div>
            `;
        });
    }
    
    const html = `
        <div class="lesson-plan-header">
            <h2>${metadata.title || 'Lesson Plan'}</h2>
            <div class="meta-info">
                <span>📚 ${metadata.classLevel || 'N/A'}</span>
                <span>📅 ${metadata.term || 'N/A'}</span>
                <span>🔧 ${metadata.subject || 'N/A'}</span>
                <span>⏱️ ${metadata.duration || 'N/A'}</span>
                <span>📆 ${metadata.generatedDate || new Date().toLocaleDateString()}</span>
            </div>
        </div>
        
        <div class="plan-section">
            <h3>🎯 Learning Objectives</h3>
            <ul>${objectives.map(obj => `<li>${obj}</li>`).join('') || '<li>No objectives specified</li>'}</ul>
        </div>
        
        <div class="plan-section">
            <h3>🧠 Engineering Design Process</h3>
            <div class="edp-steps-preview">${edpSteps.map(step => `<span class="edp-step-preview">${step}</span>`).join('') || '<span>No EDP steps specified</span>'}</div>
        </div>
        
        <div class="plan-section">
            <h3>⚠️ Safety Protocols</h3>
            <ul class="safety-list">${safety.map(s => `<li>${s}</li>`).join('') || '<li>No safety protocols specified</li>'}</ul>
        </div>
        
        <div class="plan-section">
            <h3>⏱️ Lesson Timeline</h3>
            <div class="timeline-preview">${timelineHtml || '<p>Timeline not available</p>'}</div>
        </div>
        
        <div class="plan-section highlight">
            <h3>🧪 Experiential Activity</h3>
            <p>${experiential || 'Hands-on activity will be provided during the lesson.'}</p>
        </div>
        
        <div class="plan-section">
            <h3>📦 Materials & Equipment</h3>
            <ul><li>${materials.join('</li><li>') || 'Materials list not available'}</li></ul>
        </div>
        
        <div class="plan-section">
            <h3>📝 Assessment Methods</h3>
            <ul>${assessment.map(a => `<li>${a}</li>`).join('') || '<li>Assessment methods not available</li>'}</ul>
        </div>
        
        ${lessonData.additionalNotes ? `
        <div class="plan-section">
            <h3>📌 Additional Notes</h3>
            <p>${lessonData.additionalNotes}</p>
        </div>
        ` : ''}
    `;
    
    lessonPlanContent.innerHTML = html;
    if (lessonPlanPreview) lessonPlanPreview.style.display = "block";
    lessonPlanPreview?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function displayAILesson(lesson) {
    const aiContent = document.getElementById('ai-lesson-content');
    const aiPreview = document.getElementById('ai-lesson-preview');
    
    if (!aiContent || !aiPreview) return;

    const metadata = lesson.metadata || {};
    const objectives = lesson.learningObjectives || [];
    const edpSteps = lesson.edpSteps || [];
    const safety = lesson.safetyProtocols || [];
    const timeline = lesson.timeline || [];
    const experiential = lesson.experientialActivity || '';
    const materials = lesson.materials || [];
    const assessment = lesson.assessment || [];
    
    let timelineHtml = "";
    timeline.forEach(item => {
        timelineHtml += `
            <div class="timeline-item-preview">
                <div class="timeline-time-preview">${item.duration}</div>
                <div class="timeline-content-preview">
                    <strong>${item.phase}</strong>
                    <p>${item.description}</p>
                </div>
            </div>
        `;
    });
    
    const html = `
        <div class="lesson-plan-header">
            <h2>${metadata.title}</h2>
            <div class="meta-info">
                <span>📚 ${metadata.classLevel}</span>
                <span>⏱️ ${metadata.duration}</span>
                <span>🔧 ${metadata.subject}</span>
                <span>📆 ${metadata.generatedDate}</span>
            </div>
        </div>
        <div class="plan-section">
            <h3>🎯 Learning Objectives</h3>
            <ul>${objectives.map(obj => `<li>${obj}</li>`).join('')}</ul>
        </div>
        <div class="plan-section">
            <h3>🧠 Engineering Design Process</h3>
            <div class="edp-steps-preview">${edpSteps.map(step => `<span class="edp-step-preview">${step}</span>`).join('')}</div>
        </div>
        <div class="plan-section">
            <h3>⚠️ Safety Protocols</h3>
            <ul class="safety-list">${safety.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
        <div class="plan-section">
            <h3>⏱️ Lesson Timeline</h3>
            <div class="timeline-preview">${timelineHtml}</div>
        </div>
        <div class="plan-section highlight">
            <h3>🧪 Experiential Activity</h3>
            <p>${experiential}</p>
        </div>
        <div class="plan-section">
            <h3>📦 Materials & Equipment</h3>
            <ul><li>${materials.join('</li><li>')}</li></ul>
        </div>
        <div class="plan-section">
            <h3>📝 Assessment Methods</h3>
            <ul>${assessment.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>
        ${lesson.additionalInstructions ? `
        <div class="plan-section">
            <h3>📌 Additional Instructions</h3>
            <p>${lesson.additionalInstructions}</p>
        </div>
        ` : ''}
    `;
    
    aiContent.innerHTML = html;
    aiPreview.style.display = 'block';
    aiPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showWebSearchResults(topic) {
    const resultsList = document.getElementById('search-results-list');
    const webSearchResults = document.getElementById('web-search-results');
    
    if (!resultsList || !webSearchResults) return;
    
    resultsList.innerHTML = `
        <div class="web-result">
            <a href="#" target="_blank">📄 Complete Guide to ${topic} - STEM Education</a>
            <p>Comprehensive tutorial and lesson resources for ${topic}</p>
        </div>
        <div class="web-result">
            <a href="#" target="_blank">🎓 ${topic} Lesson Plans and Activities</a>
            <p>Free downloadable worksheets and project ideas</p>
        </div>
        <div class="web-result">
            <a href="#" target="_blank">🔧 Hands-on ${topic} Projects for Grades 4-9</a>
            <p>Project-based learning activities and assessment rubrics</p>
        </div>
        <div class="web-result">
            <a href="#" target="_blank">📺 Video Tutorial: Introduction to ${topic}</a>
            <p>Step-by-step video guide for students and teachers</p>
        </div>
    `;
    webSearchResults.style.display = 'block';
}

// ============================================
// NAVIGATION
// ============================================

function highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-btn');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ============================================
// HOME PAGE - LESSON GENERATOR HANDLERS
// ============================================

const generatorForm = document.getElementById("lesson-generator-form");
const generateBtn = document.getElementById("generate-lesson-btn");
const generationStatus = document.getElementById("generation-status");
const lessonPlanPreview = document.getElementById("lesson-plan-preview");
const lessonPlanContent = document.getElementById("lesson-plan-content");
const closePreviewBtn = document.getElementById("close-preview-btn");

const classLevel = document.getElementById("class-level");
const term = document.getElementById("term");
const subject = document.getElementById("subject");
const duration = document.getElementById("duration");
const topic = document.getElementById("topic");
const additionalNotes = document.getElementById("additional-notes");

async function handleGenerateLesson(e) {
    e.preventDefault();
    
    if (!classLevel?.value || !term?.value || !subject?.value) {
        if (generationStatus) {
            generationStatus.innerHTML = '<span style="color: #e74c4c;">❌ Please fill in all required fields</span>';
            generationStatus.style.display = "block";
            setTimeout(() => { if (generationStatus) generationStatus.style.display = "none"; }, 3000);
        }
        return;
    }
    
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Generating...';
    }
    
    if (generationStatus) {
        generationStatus.innerHTML = '<span style="color: #4aa8c9;">⚙️ Generating lesson plan...</span>';
        generationStatus.style.display = "block";
    }
    
    const formData = {
        classLevel: classLevel.value,
        term: term.value,
        subject: subject.value,
        duration: duration ? parseInt(duration.value) : 90,
        topic: topic ? topic.value : "",
        additionalNotes: additionalNotes ? additionalNotes.value : ""
    };
    
    try {
        const lessonPlan = await generateLessonPlanFromBackend(formData);
        displayLessonPlan(lessonPlan);
        
        if (generationStatus) {
            generationStatus.innerHTML = '<span style="color: #27ae60;">✅ Lesson plan generated successfully via backend!</span>';
            setTimeout(() => { if (generationStatus) generationStatus.style.display = "none"; }, 2000);
        }
    } catch (error) {
        console.warn('Backend failed, using local fallback:', error.message);
        
        if (generationStatus) {
            generationStatus.innerHTML = '<span style="color: #f39c12;">⚠️ Backend offline. Generating using offline template...</span>';
            generationStatus.style.display = "block";
        }
        
        try {
            const localLesson = generateLocalLessonPlan(formData);
            displayLessonPlan(localLesson);
            
            if (generationStatus) {
                generationStatus.innerHTML = '<span style="color: #27ae60;">✅ Lesson plan generated successfully (offline mode)!</span>';
                setTimeout(() => { if (generationStatus) generationStatus.style.display = "none"; }, 3000);
            }
        } catch (fallbackError) {
            if (generationStatus) {
                generationStatus.innerHTML = '<span style="color: #e74c4c;">❌ Failed to generate lesson plan. Please try again.</span>';
                setTimeout(() => { if (generationStatus) generationStatus.style.display = "none"; }, 4000);
            }
        }
    } finally {
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<span class="btn-icon">⚡</span> Generate Lesson Plan<span class="btn-icon">📄</span>';
        }
    }
}

if (closePreviewBtn) {
    closePreviewBtn.addEventListener("click", () => {
        if (lessonPlanPreview) lessonPlanPreview.style.display = "none";
    });
}

const copyPlanBtn = document.getElementById("copy-plan-btn");
if (copyPlanBtn) {
    copyPlanBtn.addEventListener("click", () => {
        const content = lessonPlanContent?.innerText;
        if (content) {
            navigator.clipboard.writeText(content).then(() => {
                alert("📋 Lesson plan copied to clipboard!");
            });
        }
    });
}

// ============================================
// AI GENERATOR EVENT LISTENERS
// ============================================

function saveAILesson() {
    const titleElem = document.querySelector('#ai-lesson-content h2');
    if (!titleElem) return;
    
    const title = titleElem.innerText;
    const saved = JSON.parse(localStorage.getItem('savedLessons') || '[]');
    saved.push({ 
        title: title, 
        date: new Date().toISOString(),
        type: 'AI Generated'
    });
    localStorage.setItem('savedLessons', JSON.stringify(saved));
    alert('💾 Lesson saved to your dashboard!');
}

function copyAILesson() {
    const content = document.getElementById('ai-lesson-content')?.innerText;
    if (content) {
        navigator.clipboard.writeText(content);
        alert('📋 Lesson plan copied to clipboard!');
    }
}

const aiForm = document.getElementById('ai-generator-form');
if (aiForm) {
    aiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const topic = document.getElementById('ai-topic')?.value;
        const grade = document.getElementById('ai-grade')?.value;
        const duration = document.getElementById('ai-duration')?.value;
        const subjectSelect = document.getElementById('ai-subject');
        const subject = subjectSelect?.options[subjectSelect.selectedIndex]?.text || 'Robotics';
        const instructions = document.getElementById('ai-instructions')?.value;
        const enableWebSearch = document.getElementById('enable-web-search')?.checked;
        const aiStatus = document.getElementById('ai-generation-status');
        const aiGenerateBtn = document.getElementById('ai-generate-btn');
        
        if (!topic || !grade) {
            if (aiStatus) {
                aiStatus.innerHTML = '<span style="color: #e74c4c;">❌ Please enter topic and select grade level</span>';
                aiStatus.style.display = 'block';
                setTimeout(() => { if (aiStatus) aiStatus.style.display = 'none'; }, 3000);
            }
            return;
        }
        
        if (aiGenerateBtn) {
            aiGenerateBtn.disabled = true;
            aiGenerateBtn.innerHTML = '<span class="btn-icon">⏳</span> AI is thinking... <span class="loading-spinner"></span>';
        }
        if (aiStatus) {
            aiStatus.innerHTML = '<span style="color: #4aa8c9;">🤖 AI is researching and generating your lesson plan...</span>';
            aiStatus.style.display = 'block';
        }
        
        try {
            const formData = {
                topic,
                grade,
                duration: parseInt(duration),
                subject,
                instructions,
                enableWebSearch
            };
            const lessonPlan = await callAIGeneration(formData);
            displayAILesson(lessonPlan);
            
            if (enableWebSearch) {
                showWebSearchResults(topic);
            }
            
            if (aiStatus) {
                aiStatus.innerHTML = '<span style="color: #27ae60;">✅ AI lesson plan generated successfully!</span>';
                setTimeout(() => { if (aiStatus) aiStatus.style.display = 'none'; }, 3000);
            }
        } catch (error) {
            console.error('AI Generation backend error:', error);
            if (aiStatus) {
                aiStatus.innerHTML = '<span style="color: #f39c12;">⚠️ Backend offline. Generating using offline template...</span>';
                setTimeout(() => { if (aiStatus) aiStatus.style.display = 'none'; }, 4000);
            }
            const lessonPlan = generateMockAILesson(topic, grade, duration, subject, instructions);
            displayAILesson(lessonPlan);
        } finally {
            if (aiGenerateBtn) {
                aiGenerateBtn.disabled = false;
                aiGenerateBtn.innerHTML = '<span class="btn-icon">✨</span> Generate with AI<span class="btn-icon">🤖</span>';
            }
        }
    });
}

const closeAiPreview = document.getElementById('close-ai-preview');
if (closeAiPreview) {
    closeAiPreview.addEventListener('click', () => {
        const preview = document.getElementById('ai-lesson-preview');
        if (preview) preview.style.display = 'none';
    });
}

const saveAiLessonBtn = document.getElementById('save-ai-lesson');
if (saveAiLessonBtn) {
    saveAiLessonBtn.addEventListener('click', saveAILesson);
}

const copyAiLessonBtn = document.getElementById('copy-ai-lesson');
if (copyAiLessonBtn) {
    copyAiLessonBtn.addEventListener('click', copyAILesson);
}

// ============================================
// CONTACT FORM
// ============================================

function initContactForm() {
    const contactForm = document.getElementById("contact-form");
    if (!contactForm) return;
    
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const feedback = document.getElementById("form-feedback");
        if (feedback) {
            feedback.innerHTML = '<span style="color: #27ae60;">✅ Message sent! We will respond within 24 hours.</span>';
        }
        contactForm.reset();
        setTimeout(() => { if (feedback) feedback.innerHTML = ""; }, 5000);
    });
}

// ============================================
// SERVICE BUTTONS
// ============================================

function initServiceButtons() {
    document.querySelectorAll(".package-cta").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "contact.html";
        });
    });
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
                navLinks.classList.remove('show');
            }
        });
    }
    
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.nav-dropdown-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
}

// ============================================
// ATTENDANCE SYSTEM
// ============================================

const studentsByClass = {
    JSS1: [
        { id: 1, name: "Adebayo Tunde" },
        { id: 2, name: "Okafor Chiamaka" },
        { id: 3, name: "Eze Daniel" },
        { id: 4, name: "Bello Aisha" },
        { id: 5, name: "Okonkwo Ifeanyi" }
    ],
    JSS2: [
        { id: 6, name: "Olayinka Femi" },
        { id: 7, name: "Nwachukwu Grace" },
        { id: 8, name: "Ibrahim Zainab" },
        { id: 9, name: "Adeleke David" }
    ],
    JSS3: [
        { id: 10, name: "Okoro Esther" },
        { id: 11, name: "Mohammed Ali" },
        { id: 12, name: "Ogunleye Tosin" }
    ],
    SS1: [
        { id: 13, name: "Adekunle Joshua" },
        { id: 14, name: "Ebere Victoria" }
    ],
    SS2: [
        { id: 15, name: "Balogun Samuel" }
    ]
};

let currentAttendanceStudents = [];

function loadStudentsForAttendance() {
    const className = document.getElementById('attendance-class')?.value;
    if (!className) return;
    
    currentAttendanceStudents = studentsByClass[className] || [];
    const studentListDiv = document.getElementById('student-list');
    const statsDiv = document.getElementById('attendance-stats');
    const listContainer = document.getElementById('student-list-container');
    
    if (!studentListDiv) return;
    
    studentListDiv.innerHTML = '';
    currentAttendanceStudents.forEach(student => {
        const div = document.createElement('div');
        div.className = 'student-item';
        div.innerHTML = `
            <span>👤 ${student.name}</span>
            <label style="display: flex; align-items: center; gap: 0.5rem;">
                <span>Present</span>
                <input type="checkbox" class="attendance-check" data-id="${student.id}" checked>
            </label>
        `;
        studentListDiv.appendChild(div);
    });
    
    if (statsDiv) statsDiv.style.display = 'grid';
    if (listContainer) listContainer.style.display = 'block';
    
    const dateInput = document.getElementById('attendance-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    updateAttendanceStats();
    
    document.querySelectorAll('.attendance-check').forEach(cb => {
        cb.addEventListener('change', updateAttendanceStats);
    });
}

function updateAttendanceStats() {
    const checkboxes = document.querySelectorAll('.attendance-check');
    const total = checkboxes.length;
    const present = Array.from(checkboxes).filter(cb => cb.checked).length;
    const absent = total - present;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    
    const totalElem = document.getElementById('total-students');
    const presentElem = document.getElementById('present-count');
    const absentElem = document.getElementById('absent-count');
    const percentElem = document.getElementById('attendance-percent');
    
    if (totalElem) totalElem.innerText = total;
    if (presentElem) presentElem.innerText = present;
    if (absentElem) absentElem.innerText = absent;
    if (percentElem) percentElem.innerText = `${percent}%`;
}

function saveAttendanceRecord() {
    const className = document.getElementById('attendance-class')?.value;
    const date = document.getElementById('attendance-date')?.value;
    
    if (!className || !date) {
        showAttendanceStatus('Please select class and date', 'error');
        return;
    }
    
    const attendance = [];
    document.querySelectorAll('.attendance-check').forEach(cb => {
        const student = currentAttendanceStudents.find(s => s.id == cb.dataset.id);
        if (student) {
            attendance.push({
                id: student.id,
                name: student.name,
                present: cb.checked
            });
        }
    });
    
    const attendanceData = {
        class: className,
        date: date,
        students: attendance,
        timestamp: new Date().toISOString(),
        presentCount: attendance.filter(s => s.present).length,
        absentCount: attendance.filter(s => !s.present).length
    };
    
    const allAttendance = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const existingIndex = allAttendance.findIndex(a => a.class === className && a.date === date);
    
    if (existingIndex >= 0) {
        allAttendance[existingIndex] = attendanceData;
    } else {
        allAttendance.push(attendanceData);
    }
    
    localStorage.setItem('attendanceRecords', JSON.stringify(allAttendance));
    showAttendanceStatus('✅ Attendance saved successfully!', 'success');
    loadAttendanceHistory();
}

function loadPreviousAttendanceRecord() {
    const className = document.getElementById('attendance-class')?.value;
    const date = document.getElementById('attendance-date')?.value;
    
    const allAttendance = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const record = allAttendance.find(a => a.class === className && a.date === date);
    
    if (record && record.students) {
        record.students.forEach(s => {
            const cb = document.querySelector(`.attendance-check[data-id="${s.id}"]`);
            if (cb) cb.checked = s.present;
        });
        updateAttendanceStats();
        showAttendanceStatus(`📜 Loaded attendance for ${date}`, 'success');
    } else {
        showAttendanceStatus(`No attendance record found for ${date}`, 'error');
    }
}

function loadAttendanceHistory() {
    const className = document.getElementById('attendance-class')?.value;
    if (!className) return;
    
    const allAttendance = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const classRecords = allAttendance.filter(a => a.class === className).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const historyDiv = document.getElementById('attendance-history');
    const historyList = document.getElementById('history-list');
    
    if (historyDiv && historyList) {
        if (classRecords.length > 0) {
            historyList.innerHTML = classRecords.map(record => `
                <div class="student-item">
                    <span>📅 ${record.date}</span>
                    <span>✅ ${record.presentCount || record.students.filter(s => s.present).length} present</span>
                    <span>❌ ${record.absentCount || record.students.filter(s => !s.present).length} absent</span>
                    <span>📊 ${Math.round(((record.presentCount || record.students.filter(s => s.present).length) / record.students.length) * 100)}%</span>
                </div>
            `).join('');
            historyDiv.style.display = 'block';
        } else {
            historyDiv.style.display = 'none';
        }
    }
}

function markAllStudentsPresent() {
    document.querySelectorAll('.attendance-check').forEach(cb => cb.checked = true);
    updateAttendanceStats();
    showAttendanceStatus('✅ All students marked present', 'success');
}

function showAttendanceStatus(message, type) {
    const statusDiv = document.getElementById('attendance-status');
    if (statusDiv) {
        statusDiv.innerHTML = `<span style="color: ${type === 'success' ? '#27ae60' : '#e74c4c'}">${message}</span>`;
        statusDiv.style.display = 'block';
        setTimeout(() => { statusDiv.style.display = 'none'; }, 3000);
    }
}

const attendanceClassSelect = document.getElementById('attendance-class');
if (attendanceClassSelect) {
    attendanceClassSelect.addEventListener('change', () => {
        loadStudentsForAttendance();
        loadAttendanceHistory();
    });
}

window.loadStudentsForAttendance = loadStudentsForAttendance;
window.saveAttendanceRecord = saveAttendanceRecord;
window.loadPreviousAttendanceRecord = loadPreviousAttendanceRecord;
window.markAllStudentsPresent = markAllStudentsPresent;

// ============================================
// SCHEME OF WORK GENERATOR
// ============================================

const topicsByGrade = {
    4: ['Introduction to Robots', 'Basic Electronics', 'Simple Circuits', 'LEDs and Buzzers', 'Robot Movements'],
    5: ['Sensors Introduction', 'Light and Sound Sensors', 'Basic Programming', 'Simple Movements', 'Robot Navigation'],
    6: ['Microcontrollers', 'Programming Logic', 'Motor Control', 'Obstacle Detection', 'Line Following Basics'],
    7: ['Autonomous Systems', 'Sensor Fusion', 'Line Following Robots', 'Competition Prep', 'Robot Design'],
    8: ['Advanced Programming', 'PID Control', 'Wireless Communication', 'IoT Basics', 'System Integration'],
    9: ['Robotics Design', 'System Integration', 'Capstone Projects', 'Competition Mastery', 'Innovation Lab']
};

function generateSchemeHtml(startGrade, endGrade, components, competitions, economicActivities) {
    let schemeHtml = '';
    
    for (let grade = parseInt(startGrade); grade <= parseInt(endGrade); grade++) {
        const topics = topicsByGrade[grade] || topicsByGrade[7];
        
        schemeHtml += `
            <div class="term-section">
                <h3 class="term-title">🎓 Grade ${grade} - First Term</h3>
                <table class="week-table">
                    <thead>
                        <tr><th>Week</th><th>Topic</th><th>Learning Objectives</th><th>Hands-on Activity</th><th>Assessment</th></tr>
                    </thead>
                    <tbody>
                        ${topics.slice(0, 5).map((topic, idx) => `
                            <tr>
                                <td>Week ${idx + 1}</td>
                                <td>${topic}</td>
                                <td>Understand and apply ${topic.toLowerCase()} concepts</td>
                                <td>Build and test ${topic.toLowerCase()} project</td>
                                <td>Practical demonstration</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td>Week 6</td>
                            <td>Mid-Term Assessment</td>
                            <td>Review and revise term concepts</td>
                            <td>Project refinement</td>
                            <td>Written and practical test</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="term-section">
                <h3 class="term-title">🎓 Grade ${grade} - Second Term</h3>
                <table class="week-table">
                    <thead>
                        <tr><th>Week</th><th>Topic</th><th>Learning Objectives</th><th>Hands-on Activity</th><th>Assessment</th></tr>
                    </thead>
                    <tbody>
                        ${topics.slice(5, 10).map((topic, idx) => `
                            <tr>
                                <td>Week ${idx + 1}</td>
                                <td>${topic}</td>
                                <td>Master ${topic.toLowerCase()} applications</td>
                                <td>Design and build advanced project</td>
                                <td>Project evaluation</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="term-section">
                <h3 class="term-title">🎓 Grade ${grade} - Third Term</h3>
                <table class="week-table">
                    <thead>
                        <tr><th>Week</th><th>Topic</th><th>Learning Objectives</th><th>Hands-on Activity</th><th>Assessment</th></tr>
                    </thead>
                    <tbody>
                        ${topics.map((topic, idx) => `
                            <tr>
                                <td>Week ${idx + 1}</td>
                                <td>${topic} - Advanced</td>
                                <td>Integrate ${topic.toLowerCase()} with other systems</td>
                                <td>Cross-disciplinary project</td>
                                <td>Portfolio review</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td>Week ${topics.length + 1}</td>
                            <td>End of Year Project</td>
                            <td>Demonstrate mastery of all concepts</td>
                            <td>Capstone robotics project</td>
                            <td>Final exhibition</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    
    return schemeHtml;
}

function saveScheme() {
    const startGrade = document.getElementById('start-grade')?.value;
    const endGrade = document.getElementById('end-grade')?.value;
    if (!startGrade || !endGrade) return;
    
    const saved = JSON.parse(localStorage.getItem('savedSchemes') || '[]');
    saved.push({ 
        grade: `${startGrade} - ${endGrade}`, 
        date: new Date().toISOString(),
        type: 'Robotics Scheme'
    });
    localStorage.setItem('savedSchemes', JSON.stringify(saved));
    alert('💾 Scheme saved to your dashboard!');
}

function copyScheme() {
    const content = document.getElementById('scheme-content')?.innerText;
    if (content) {
        navigator.clipboard.writeText(content);
        alert('📋 Scheme copied to clipboard!');
    }
}

const schemeForm = document.getElementById('scheme-form');
if (schemeForm) {
    schemeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const startGrade = document.getElementById('start-grade')?.value;
        const endGrade = document.getElementById('end-grade')?.value;
        const schemeOutput = document.getElementById('scheme-output');
        const schemeContent = document.getElementById('scheme-content');
        const schemeStatus = document.getElementById('scheme-status');
        
        const components = Array.from(document.querySelectorAll('input[type="checkbox"][value]'))
            .filter(cb => cb.checked && cb.closest('.form-group-generator')?.innerText.includes('Components'))
            .map(cb => cb.value);
        
        const competitions = Array.from(document.querySelectorAll('input[type="checkbox"][value]'))
            .filter(cb => cb.checked && cb.closest('.form-group-generator')?.innerText.includes('Competitions'))
            .map(cb => cb.value);
        
        const economicActivities = Array.from(document.querySelectorAll('input[type="checkbox"][value]'))
            .filter(cb => cb.checked && cb.closest('.form-group-generator')?.innerText.includes('Economic'))
            .map(cb => cb.value);
        
        if (startGrade && endGrade && schemeContent) {
            const schemeHtml = generateSchemeHtml(startGrade, endGrade, components, competitions, economicActivities);
            schemeContent.innerHTML = schemeHtml;
            if (schemeOutput) schemeOutput.style.display = 'block';
            if (schemeStatus) {
                schemeStatus.innerHTML = '<span style="color: #27ae60;">✅ Scheme of Work generated successfully!</span>';
                schemeStatus.style.display = 'block';
                setTimeout(() => { if (schemeStatus) schemeStatus.style.display = 'none'; }, 3000);
            }
            schemeOutput?.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

const saveSchemeBtn = document.getElementById('save-scheme');
if (saveSchemeBtn) {
    saveSchemeBtn.addEventListener('click', saveScheme);
}

const copySchemeBtn = document.getElementById('copy-scheme');
if (copySchemeBtn) {
    copySchemeBtn.addEventListener('click', copyScheme);
}

// ============================================
// DASHBOARD
// ============================================

function loadDashboardData() {
    const savedLessons = JSON.parse(localStorage.getItem('savedLessons') || '[]');
    const savedSchemes = JSON.parse(localStorage.getItem('savedSchemes') || '[]');
    const attendance = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    
    const lessonsCountElem = document.getElementById('saved-lessons-count');
    const schemesCountElem = document.getElementById('saved-schemes-count');
    const attendanceCountElem = document.getElementById('attendance-count');
    const lessonsListElem = document.getElementById('saved-lessons-list');
    const schemesListElem = document.getElementById('saved-schemes-list');
    const recentAttendanceElem = document.getElementById('recent-attendance');
    
    if (lessonsCountElem) lessonsCountElem.innerText = savedLessons.length;
    if (schemesCountElem) schemesCountElem.innerText = savedSchemes.length;
    if (attendanceCountElem) attendanceCountElem.innerText = attendance.length;
    
    if (lessonsListElem) {
        if (savedLessons.length > 0) {
            lessonsListElem.innerHTML = savedLessons.slice(-5).reverse().map(lesson => 
                `<div class="recent-item">📖 ${lesson.title} - ${new Date(lesson.date).toLocaleDateString()}</div>`
            ).join('');
        } else {
            lessonsListElem.innerHTML = '<div class="recent-item">No saved lessons yet. <a href="ai-generate.html">Generate one now!</a></div>';
        }
    }
    
    if (schemesListElem) {
        if (savedSchemes.length > 0) {
            schemesListElem.innerHTML = savedSchemes.slice(-5).reverse().map(scheme => 
                `<div class="recent-item">📅 ${scheme.grade} - ${new Date(scheme.date).toLocaleDateString()}</div>`
            ).join('');
        } else {
            schemesListElem.innerHTML = '<div class="recent-item">No saved schemes yet. <a href="scheme.html">Create one now!</a></div>';
        }
    }
    
    if (recentAttendanceElem) {
        if (attendance.length > 0) {
            recentAttendanceElem.innerHTML = attendance.slice(-5).reverse().map(record => 
                `<div class="recent-item">📋 ${record.class} - ${record.date} (${record.presentCount || record.students?.filter(s => s.present).length || 0}/${record.students?.length || 0} present)</div>`
            ).join('');
        } else {
            recentAttendanceElem.innerHTML = '<div class="recent-item">No attendance records yet. <a href="attendance.html">Take attendance!</a></div>';
        }
    }
}

// ============================================
// COMING SOON
// ============================================

function showComingSoon() {
    alert('🚧 This feature is coming soon! We are working hard to bring it to you. Please check back later.');
}

// ============================================
// INITIALIZE APP
// ============================================

function initializeApp() {
    highlightActiveNav();
    initContactForm();
    initServiceButtons();
    initMobileMenu();
    
    if (generatorForm) {
        generatorForm.addEventListener("submit", handleGenerateLesson);
    }
    
    if (attendanceClassSelect) {
        loadStudentsForAttendance();
        loadAttendanceHistory();
    }
    
    if (document.getElementById('saved-lessons-count')) {
        loadDashboardData();
    }
    
    const dateInput = document.getElementById('attendance-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    console.log("⚡ STEM Forge fully initialized | All features ready | Version 2.0");
}

document.addEventListener("DOMContentLoaded", initializeApp);
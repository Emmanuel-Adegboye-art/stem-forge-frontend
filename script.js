// ============================================
// STEM Forge - Main JavaScript (script.js)
// File Reference: JFE - 1
// COMPLETE VERSION - Includes all functionality for all pages
// ============================================

// CONFIGURATION
const CONFIG = {
    // Replace with your deployed backend URL (e.g., https://your-app.onrender.com)
    // For local testing on mobile, use your computer's local IP (e.g., http://192.168.1.5:3000)
    API_URL: 'http://localhost:3000'
};

// ============================================
// BACKEND API CALL
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
        throw new Error('Cannot connect to backend. Make sure server is running on http://localhost:3000');
    }
}

// ============================================
// NAVIGATION - Highlight active page
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
// DOM Elements for Home Page
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

// ============================================
// Display Lesson Plan (Shared across pages)
// ============================================
function displayLessonPlan(lessonData) {
    if (!lessonPlanContent) return;
    
    const metadata = lessonData.metadata;
    const objectives = lessonData.learningObjectives;
    const edpSteps = lessonData.edpSteps;
    const safety = lessonData.safetyProtocols;
    const timeline = lessonData.timeline;
    const experiential = lessonData.experientialActivity;
    const materials = lessonData.materials;
    const assessment = lessonData.assessment;
    
    let timelineHtml = "";
    timeline.forEach(item => {
        timelineHtml += `
            <div class="timeline-item-preview">
                <div class="timeline-time-preview">${item.start}-${item.end} min</div>
                <div class="timeline-content-preview">
                    <strong>${item.phase}</strong> (${item.duration})
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
                <span>📅 ${metadata.term}</span>
                <span>🔧 ${metadata.subject}</span>
                <span>⏱️ ${metadata.duration}</span>
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
        
        ${lessonData.additionalNotes ? `
        <div class="plan-section">
            <h3>📌 Additional Notes</h3>
            <p>${lessonData.additionalNotes}</p>
        </div>
        ` : ''}
    `;
    
    lessonPlanContent.innerHTML = html;
    lessonPlanPreview.style.display = "block";
    lessonPlanPreview.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================
// Handle Form Submission - Calls Backend
// ============================================
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
            generationStatus.innerHTML = '<span style="color: #27ae60;">✅ Lesson plan generated successfully!</span>';
            setTimeout(() => { if (generationStatus) generationStatus.style.display = "none"; }, 2000);
        }
    } catch (error) {
        if (generationStatus) {
            generationStatus.innerHTML = `<span style="color: #e74c4c;">❌ ${error.message}</span>`;
            setTimeout(() => { if (generationStatus) generationStatus.style.display = "none"; }, 4000);
        }
    } finally {
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<span class="btn-icon">⚡</span> Generate Lesson Plan<span class="btn-icon">📄</span>';
        }
    }
}

// ============================================
// Close Preview
// ============================================
if (closePreviewBtn) {
    closePreviewBtn.addEventListener("click", () => {
        if (lessonPlanPreview) lessonPlanPreview.style.display = "none";
    });
}

// ============================================
// Copy to Clipboard
// ============================================
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
// Contact Form Handler
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
// Service Package Buttons
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
// ============================================
// ============================================
// AI LESSON PLAN GENERATOR - COMPLETE CODE
// ============================================
// ============================================
// ============================================

// Student database for attendance (used across features)
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

// Topics by grade for scheme generator
const topicsByGrade = {
    4: ['Introduction to Robots', 'Basic Electronics', 'Simple Circuits', 'LEDs and Buzzers', 'Robot Movements'],
    5: ['Sensors Introduction', 'Light and Sound Sensors', 'Basic Programming', 'Simple Movements', 'Robot Navigation'],
    6: ['Microcontrollers', 'Programming Logic', 'Motor Control', 'Obstacle Detection', 'Line Following Basics'],
    7: ['Autonomous Systems', 'Sensor Fusion', 'Line Following Robots', 'Competition Prep', 'Robot Design'],
    8: ['Advanced Programming', 'PID Control', 'Wireless Communication', 'IoT Basics', 'System Integration'],
    9: ['Robotics Design', 'System Integration', 'Capstone Projects', 'Competition Mastery', 'Innovation Lab']
};

// ============================================
// AI LESSON PLAN GENERATOR FUNCTIONS
// ============================================

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

function displayAILesson(lesson) {
    const aiContent = document.getElementById('ai-lesson-content');
    const aiPreview = document.getElementById('ai-lesson-preview');
    
    if (!aiContent || !aiPreview) return;
    
    const metadata = lesson.metadata;
    const objectives = lesson.learningObjectives;
    const edpSteps = lesson.edpSteps;
    const safety = lesson.safetyProtocols;
    const timeline = lesson.timeline;
    const experiential = lesson.experientialActivity;
    const materials = lesson.materials;
    const assessment = lesson.assessment;
    
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

// ============================================
// AI GENERATOR EVENT LISTENERS
// ============================================
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
        
        // Simulate AI processing delay
        setTimeout(() => {
            const lessonPlan = generateMockAILesson(topic, grade, duration, subject, instructions);
            displayAILesson(lessonPlan);
            
            if (enableWebSearch) {
                showWebSearchResults(topic);
            }
            
            if (aiStatus) {
                aiStatus.innerHTML = '<span style="color: #27ae60;">✅ AI lesson plan generated successfully!</span>';
                setTimeout(() => { if (aiStatus) aiStatus.style.display = 'none'; }, 3000);
            }
            if (aiGenerateBtn) {
                aiGenerateBtn.disabled = false;
                aiGenerateBtn.innerHTML = '<span class="btn-icon">✨</span> Generate with AI<span class="btn-icon">🤖</span>';
            }
        }, 2000);
    });
}

// Close AI preview button
const closeAiPreview = document.getElementById('close-ai-preview');
if (closeAiPreview) {
    closeAiPreview.addEventListener('click', () => {
        const preview = document.getElementById('ai-lesson-preview');
        if (preview) preview.style.display = 'none';
    });
}

// Save and copy buttons for AI lesson
const saveAiLessonBtn = document.getElementById('save-ai-lesson');
if (saveAiLessonBtn) {
    saveAiLessonBtn.addEventListener('click', saveAILesson);
}

const copyAiLessonBtn = document.getElementById('copy-ai-lesson');
if (copyAiLessonBtn) {
    copyAiLessonBtn.addEventListener('click', copyAILesson);
}

// ============================================
// ============================================
// ============================================
// SCHEME OF WORK GENERATOR - COMPLETE CODE
// ============================================
// ============================================
// ============================================

function generateSchemeHtml(startGrade, endGrade, components, competitions, economicActivities) {
    let schemeHtml = '';
    
    for (let grade = parseInt(startGrade); grade <= parseInt(endGrade); grade++) {
        const topics = topicsByGrade[grade] || topicsByGrade[7];
        
        // Generate term-based structure (3 terms per grade)
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

// ============================================
// SCHEME GENERATOR EVENT LISTENERS
// ============================================
const schemeForm = document.getElementById('scheme-form');
if (schemeForm) {
    schemeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const startGrade = document.getElementById('start-grade')?.value;
        const endGrade = document.getElementById('end-grade')?.value;
        const schemeOutput = document.getElementById('scheme-output');
        const schemeContent = document.getElementById('scheme-content');
        const schemeStatus = document.getElementById('scheme-status');
        
        // Get selected components
        const components = Array.from(document.querySelectorAll('input[type="checkbox"][value]'))
            .filter(cb => cb.checked && cb.closest('.form-group-generator')?.innerText.includes('Components'))
            .map(cb => cb.value);
        
        // Get selected competitions
        const competitions = Array.from(document.querySelectorAll('input[type="checkbox"][value]'))
            .filter(cb => cb.checked && cb.closest('.form-group-generator')?.innerText.includes('Competitions'))
            .map(cb => cb.value);
        
        // Get selected economic activities
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

// Save and copy buttons for scheme
const saveSchemeBtn = document.getElementById('save-scheme');
if (saveSchemeBtn) {
    saveSchemeBtn.addEventListener('click', saveScheme);
}

const copySchemeBtn = document.getElementById('copy-scheme');
if (copySchemeBtn) {
    copySchemeBtn.addEventListener('click', copyScheme);
}

// ============================================
// ============================================
// ============================================
// ATTENDANCE SYSTEM - COMPLETE CODE
// ============================================
// ============================================
// ============================================

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
    
    // Add event listeners to checkboxes
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

// ============================================
// ATTENDANCE EVENT LISTENERS
// ============================================
const attendanceClassSelect = document.getElementById('attendance-class');
if (attendanceClassSelect) {
    attendanceClassSelect.addEventListener('change', () => {
        loadStudentsForAttendance();
        loadAttendanceHistory();
    });
}

// Expose attendance functions globally
window.loadStudentsForAttendance = loadStudentsForAttendance;
window.saveAttendanceRecord = saveAttendanceRecord;
window.loadPreviousAttendanceRecord = loadPreviousAttendanceRecord;
window.markAllStudentsPresent = markAllStudentsPresent;

// ============================================
// ============================================
// ============================================
// DASHBOARD - COMPLETE CODE
// ============================================
// ============================================
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
            lessonsListElem.innerHTML = '<div class="recent-item">No saved lessons yet. Generate one from AI Generate page!</div>';
        }
    }
    
    if (schemesListElem) {
        if (savedSchemes.length > 0) {
            schemesListElem.innerHTML = savedSchemes.slice(-5).reverse().map(scheme => 
                `<div class="recent-item">📅 ${scheme.grade} - ${new Date(scheme.date).toLocaleDateString()}</div>`
            ).join('');
        } else {
            schemesListElem.innerHTML = '<div class="recent-item">No saved schemes yet. Generate one from Scheme page!</div>';
        }
    }
    
    if (recentAttendanceElem) {
        if (attendance.length > 0) {
            recentAttendanceElem.innerHTML = attendance.slice(-5).reverse().map(record => 
                `<div class="recent-item">📋 ${record.class} - ${record.date} (${record.presentCount || record.students?.filter(s => s.present).length || 0}/${record.students?.length || 0} present)</div>`
            ).join('');
        } else {
            recentAttendanceElem.innerHTML = '<div class="recent-item">No attendance records yet. Take attendance from Attendance page!</div>';
        }
    }
    
    // Calculate statistics
    const totalLessons = savedLessons.length;
    const totalSchemes = savedSchemes.length;
    const totalAttendance = attendance.length;
    const recentActivity = [...savedLessons, ...savedSchemes, ...attendance].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    const statsContainer = document.getElementById('dashboard-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${totalLessons}</div>
                <div>Total Lessons</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalSchemes}</div>
                <div>Total Schemes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalAttendance}</div>
                <div>Attendance Records</div>
            </div>
        `;
    }
}

// ============================================
// COMING SOON FUNCTION
// ============================================
function showComingSoon() {
    alert('🚧 This feature is coming soon! We are working hard to bring it to you. Please check back later.');
}

// ============================================
// INITIALIZE ALL - Final function that runs on page load
// ============================================
function initializeApp() {
    // Highlight active navigation button
    highlightActiveNav();
    
    // Initialize contact form if it exists
    initContactForm();
    
    // Initialize service buttons if they exist
    initServiceButtons();
    
    // Initialize home page form if it exists
    if (generatorForm) {
        generatorForm.addEventListener("submit", handleGenerateLesson);
    }
    
    // Initialize attendance page if on that page
    if (attendanceClassSelect) {
        loadStudentsForAttendance();
        loadAttendanceHistory();
    }
    
    // Initialize dashboard if on that page
    if (document.getElementById('saved-lessons-count')) {
        loadDashboardData();
    }
    
    // Set default date for attendance
    const dateInput = document.getElementById('attendance-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    console.log("⚡ STEM Forge fully initialized | All features ready | Version 2.0");
}

// Start the app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeApp);
// ============================================
// MOBILE MENU TOGGLE
// ============================================

function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
                navLinks.classList.remove('show');
            }
        });
    }
    
    // Handle dropdown on mobile
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

// Call this in your initializeApp function
// Add initMobileMenu(); inside initializeApp()
// Replace the mock setTimeout with this
async function callAIGeneration(formData) {
    const API_URL = 'http://localhost:3000'; // Or your Render URL
    
    try {
        const response = await fetch(`${API_URL}/api/ai-generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        return result.data;
        
    } catch (error) {
        console.error('AI API error:', error);
        throw error;
    }
}
// ============================================
// STEM Forge - Main JavaScript (script.js)
// Functionality: Lesson Plan Generator, Navigation,
// Form Handling, Preview Display, Backend Ready
// File Reference: JFE - 1
// UPDATED: Backend integration at http://localhost:3000
// ============================================

// ============================================
// BACKEND API CALL (REAL INTEGRATION)
// ============================================

// This function now calls your real backend instead of using mock data
async function generateLessonPlanFromBackend(formData) {
    // Your backend URL (running locally on port 3000)
    const API_URL = 'https://stemforge-backend.onrender.com/';
    
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
// MOCK FUNCTION (KEPT AS FALLBACK - NOT USED)
// ============================================
// Note: The mock function below is kept for reference but NOT used.
// The backend API is now the primary method.

function createMockLesson(formData) {
    const subjectMap = {
        robotics: { icon: "🤖", name: "Robotics & Automation", color: "#0a5c8e" },
        electronics: { icon: "⚡", name: "Electronics & Circuits", color: "#1e88b0" },
        programming: { icon: "💻", name: "Programming for Robotics", color: "#4aa8c9" },
        mechanics: { icon: "🔩", name: "Mechanics & Mechanisms", color: "#0d6e9e" },
        physics: { icon: "⚛️", name: "Physics (Forces & Motion)", color: "#e6a017" },
        chemistry: { icon: "🧪", name: "Chemistry (Materials Science)", color: "#2c7a4d" },
        engineering: { icon: "🏗️", name: "Engineering Design", color: "#c93a3a" }
    };
    
    const classMap = {
        "grade-7": "Grade 7 (Ages 12-13)",
        "grade-8": "Grade 8 (Ages 13-14)",
        "grade-9": "Grade 9 (Ages 14-15)",
        "grade-10": "Grade 10 (Ages 15-16)",
        "grade-11": "Grade 11 (Ages 16-17)",
        "grade-12": "Grade 12 (Ages 17-18)"
    };
    
    const termMap = {
        "term-1": "Term 1 (Fall)",
        "term-2": "Term 2 (Winter)",
        "term-3": "Term 3 (Spring)",
        "term-4": "Term 4 (Summer)"
    };
    
    const selectedSubject = subjectMap[formData.subject] || subjectMap.robotics;
    const className = classMap[formData.classLevel] || "Grade 9-12";
    const termName = termMap[formData.term] || "Current Term";
    const duration = formData.duration + " minutes";
    const topic = formData.topic || getDefaultTopicFallback(formData.subject);
    const additionalNotes = formData.additionalNotes || "";
    
    const learningObjectives = getLearningObjectivesFallback(formData.subject, topic);
    const edpSteps = ["Ask: Define the Problem", "Imagine: Brainstorm Solutions", "Plan: Design & Select", "Create: Build Prototype", "Test & Improve: Iterate"];
    const safetyProtocols = getSafetyProtocolsFallback(formData.subject);
    const timeline = generateTimelineFallback(formData.duration, formData.subject);
    const experientialActivity = getExperientialActivityFallback(formData.subject, topic);
    const materials = getMaterialsListFallback(formData.subject);
    const assessment = getAssessmentFallback(formData.subject);
    
    return {
        metadata: {
            title: `${selectedSubject.icon} ${topic || selectedSubject.name} Lesson Plan`,
            classLevel: className,
            term: termName,
            subject: selectedSubject.name,
            duration: duration,
            generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        },
        learningObjectives: learningObjectives,
        edpSteps: edpSteps,
        safetyProtocols: safetyProtocols,
        timeline: timeline,
        experientialActivity: experientialActivity,
        materials: materials,
        assessment: assessment,
        additionalNotes: additionalNotes
    };
}

function getDefaultTopicFallback(subject) {
    const topics = {
        robotics: "Introduction to Autonomous Systems",
        electronics: "Basic Circuit Design with LEDs and Resistors",
        programming: "Conditional Logic for Sensor Input",
        mechanics: "Gear Ratios and Torque Calculations",
        physics: "Newton's Laws of Motion",
        chemistry: "Polymer Properties and Bioplastics",
        engineering: "The Engineering Design Process in Action"
    };
    return topics[subject] || "STEM Exploration";
}

function getLearningObjectivesFallback(subject, topic) {
    const baseObjectives = [
        "Apply the Engineering Design Process to solve a real-world problem",
        "Demonstrate understanding of key technical concepts through hands-on prototyping",
        "Collaborate effectively in teams to iterate and improve designs"
    ];
    
    const subjectSpecific = {
        robotics: [
            `Program a microcontroller to respond to ${topic.includes("Ultrasonic") ? "ultrasonic" : "sensor"} input`,
            "Troubleshoot hardware-software integration issues systematically"
        ],
        electronics: [
            "Construct functional circuits using breadboards and components",
            "Measure voltage and current using multimeters"
        ],
        programming: [
            "Write and debug conditional statements and loops",
            "Translate pseudocode into working code"
        ],
        mechanics: [
            "Calculate mechanical advantage from gear systems",
            "Build a mechanism that converts rotational to linear motion"
        ],
        physics: [
            "Apply Newton's Laws to predict motion outcomes",
            "Collect and analyze force/motion data"
        ],
        chemistry: [
            "Explain polymerization and material properties",
            "Conduct safe experiments with natural polymers"
        ],
        engineering: [
            "Document the complete EDP cycle in an engineering notebook",
            "Present design iterations with justification"
        ]
    };
    
    const specific = subjectSpecific[subject] || subjectSpecific.robotics;
    return [...baseObjectives, ...specific];
}

function getSafetyProtocolsFallback(subject) {
    const common = [
        "Follow all school laboratory safety guidelines",
        "Wear appropriate personal protective equipment (PPE)",
        "Report any accidents or damage immediately to instructor"
    ];
    
    const subjectSafety = {
        robotics: [
            "Disconnect power sources before adjusting wiring",
            "Secure loose cables to prevent tripping hazards",
            "Keep fingers away from moving gears and wheels during testing"
        ],
        electronics: [
            "Never connect components to high-voltage sources",
            "Check polarity before connecting capacitors and LEDs",
            "Use ESD-safe mats when handling sensitive components"
        ],
        programming: [
            "Ensure robots are powered off during code upload when working with moving parts",
            "Test code in simulation first when available"
        ],
        mechanics: [
            "Use tools properly; report damaged equipment",
            "Secure workpieces before cutting or drilling",
            "Wear safety glasses when working with springs or tensioned parts"
        ],
        physics: [
            "Launch projectiles only in designated safe zones",
            "Use eye protection for balloon/rocket experiments",
            "Maintain clear launch areas"
        ],
        chemistry: [
            "Wear gloves and goggles when handling chemicals",
            "Work in ventilated area",
            "Dispose of materials according to safety guidelines"
        ],
        engineering: [
            "Conduct risk assessment before each prototyping phase",
            "Use proper lifting techniques for heavy materials",
            "Maintain clean workspace to prevent accidents"
        ]
    };
    
    const specific = subjectSafety[subject] || subjectSafety.robotics;
    return [...common, ...specific];
}

function generateTimelineFallback(minutes, subject) {
    const phases = [
        { phase: "Engage & Introduce", defaultMin: 10 },
        { phase: "EDP - Ask & Imagine", defaultMin: 15 },
        { phase: "Plan & Design", defaultMin: 15 },
        { phase: "Create & Build", defaultMin: Math.floor(minutes * 0.35) },
        { phase: "Test & Iterate", defaultMin: Math.floor(minutes * 0.2) },
        { phase: "Reflect & Share", defaultMin: 10 }
    ];
    
    let remaining = minutes;
    const timeline = [];
    
    for (let i = 0; i < phases.length; i++) {
        let phaseMin = phases[i].defaultMin;
        if (i === phases.length - 1) {
            phaseMin = remaining;
        } else if (remaining - phaseMin < 5) {
            phaseMin = Math.max(5, remaining - 15);
        }
        remaining -= phaseMin;
        
        let startTime = i === 0 ? 0 : timeline[i-1].end;
        let endTime = startTime + phaseMin;
        
        let description = getPhaseDescriptionFallback(phases[i].phase, subject);
        
        timeline.push({
            phase: phases[i].phase,
            duration: `${phaseMin} min`,
            start: startTime,
            end: endTime,
            description: description
        });
    }
    
    return timeline;
}

function getPhaseDescriptionFallback(phase, subject) {
    const descriptions = {
        "Engage & Introduce": `Hook students with a real-world problem related to ${subject}. Discuss relevance and spark curiosity.`,
        "EDP - Ask & Imagine": `Students define the problem, ask questions, and brainstorm possible solutions using the Engineering Design Process.`,
        "Plan & Design": `Teams select best solution, sketch designs, list materials, and plan build sequence.`,
        "Create & Build": `Hands-on prototyping phase. Students construct their solution following safety protocols.`,
        "Test & Iterate": `Test prototypes, collect data, identify failures, and make improvements. Document iterations.`,
        "Reflect & Share": `Teams present their design process, challenges faced, and final outcomes. Peer feedback session.`
    };
    return descriptions[phase] || `${phase}: Active student-centered learning.`;
}

function getExperientialActivityFallback(subject, topic) {
    const activities = {
        robotics: `🤖 HANDS-ON CHALLENGE: Program your robot to navigate an obstacle course. Test three different sensor thresholds. Document which threshold works best and why. Iterate based on your findings.`,
        electronics: `⚡ CIRCUIT CHALLENGE: Build a circuit that lights an LED when a button is pressed. Then modify it to include a transistor as a switch. Measure voltage at each stage.`,
        programming: `💻 CODING CHALLENGE: Write a program that responds to sensor input. Add a conditional statement that changes behavior based on threshold values. Debug any errors.`,
        mechanics: `🔩 MECHANICS CHALLENGE: Build a gear train with three different gear ratios. Calculate the mechanical advantage for each and test which lifts the most weight.`,
        physics: `⚛️ PHYSICS CHALLENGE: Design an experiment to test Newton's Second Law. Vary mass or force and measure acceleration. Graph your results and identify relationships.`,
        chemistry: `🧪 CHEMISTRY CHALLENGE: Synthesize a bioplastic sample. Test its tensile strength and flexibility. Modify one variable (glycerin ratio) and compare results.`,
        engineering: `🏗️ ENGINEERING CHALLENGE: Complete one full EDP cycle. Identify a problem, brainstorm, build a prototype, test, and make at least one documented improvement.`
    };
    return activities[subject] || activities.engineering;
}

function getMaterialsListFallback(subject) {
    const materials = {
        robotics: ["Microcontroller board", "Ultrasonic/IR sensors", "Motor driver", "DC motors", "Chassis kit", "Jumper wires", "Battery pack", "Computer with IDE"],
        electronics: ["Breadboard", "LEDs", "Resistors (various values)", "Push buttons", "Transistors", "Multimeter", "Battery holder", "Jumper wires"],
        programming: ["Computer with programming environment", "Simulation software", "Example code snippets", "Debugging checklist handout"],
        mechanics: ["Gear sets", "Axles", "Cardboard/chassis material", "Hot glue guns", "Rulers", "Weights for testing", "Stopwatch"],
        physics: ["Balloons", "Straws", "Tape", "Cardboard", "Wheels (bottle caps)", "Rulers", "Stopwatch", "Spring scales"],
        chemistry: ["Cornstarch", "Water", "Glycerin", "Vinegar", "Hot plate", "Saucepan", "Molds", "Spatula", "Gloves", "Goggles"],
        engineering: ["Prototyping materials (cardboard, tape, etc.)", "Measurement tools", "Engineering notebooks", "Design software (optional)"]
    };
    return materials[subject] || materials.robotics;
}

function getAssessmentFallback(subject) {
    return [
        "Formative: Observation during build phase and team discussions",
        "Performance: Functionality of prototype against success criteria",
        "Summative: Engineering notebook documentation of complete EDP cycle",
        "Reflection: Exit ticket on one iteration made and why"
    ];
}

// ============================================
// DOM Elements and Event Handlers
// ============================================
const generatorForm = document.getElementById("lesson-generator-form");
const generateBtn = document.getElementById("generate-lesson-btn");
const generationStatus = document.getElementById("generation-status");
const lessonPlanPreview = document.getElementById("lesson-plan-preview");
const lessonPlanContent = document.getElementById("lesson-plan-content");
const closePreviewBtn = document.getElementById("close-preview-btn");

// Navigation elements
const navBtns = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

// Form fields
const classLevel = document.getElementById("class-level");
const term = document.getElementById("term");
const subject = document.getElementById("subject");
const duration = document.getElementById("duration");
const topic = document.getElementById("topic");
const additionalNotes = document.getElementById("additional-notes");

// ============================================
// Display Generated Lesson Plan
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
                <span>📆 Generated: ${metadata.generatedDate}</span>
            </div>
        </div>
        
        <div class="plan-section">
            <h3>🎯 Learning Objectives</h3>
            <ul>${objectives.map(obj => `<li>${obj}</li>`).join('')}</ul>
        </div>
        
        <div class="plan-section">
            <h3>🧠 Engineering Design Process (EDP)</h3>
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
// Handle Form Submission - Calls Real Backend
// ============================================
async function handleGenerateLesson(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!classLevel.value || !term.value || !subject.value) {
        if (generationStatus) {
            generationStatus.innerHTML = '<span style="color: #c93a3a;">❌ Please fill in all required fields (Class, Term, and Subject).</span>';
            generationStatus.style.display = "block";
            setTimeout(() => { if (generationStatus) generationStatus.style.display = "none"; }, 3000);
        }
        return;
    }
    
    // Show loading state
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Generating...';
    }
    
    if (generationStatus) {
        generationStatus.innerHTML = '<span style="color: #0a5c8e;">⚙️ Connecting to backend at http://localhost:3000...</span>';
        generationStatus.style.display = "block";
    }
    
    // Prepare form data for backend
    const formData = {
        classLevel: classLevel.value,
        term: term.value,
        subject: subject.value,
        duration: duration ? parseInt(duration.value) : 90,
        topic: topic ? topic.value : "",
        additionalNotes: additionalNotes ? additionalNotes.value : ""
    };
    
    try {
        // Call the REAL backend (not mock)
        const lessonPlan = await generateLessonPlanFromBackend(formData);
        displayLessonPlan(lessonPlan);
        
        if (generationStatus) {
            generationStatus.innerHTML = '<span style="color: #2c7a4d;">✅ Lesson plan generated successfully via backend!</span>';
            setTimeout(() => { if (generationStatus) generationStatus.style.display = "none"; }, 2000);
        }
    } catch (error) {
        console.error("Generation error:", error);
        if (generationStatus) {
            generationStatus.innerHTML = `<span style="color: #c93a3a;">❌ ${error.message}</span>`;
            setTimeout(() => { if (generationStatus) generationStatus.style.display = "none"; }, 4000);
        }
    } finally {
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<span class="btn-icon">⚡</span> Generate Lesson Plan<span class="btn-icon">📄</span>';
        }
    }
}

// Close preview
if (closePreviewBtn) {
    closePreviewBtn.addEventListener("click", () => {
        if (lessonPlanPreview) lessonPlanPreview.style.display = "none";
    });
}

// Export to PDF (placeholder - ready for backend integration)
const exportPdfBtn = document.getElementById("export-pdf-btn");
if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
        alert("📄 PDF export will be available soon. The lesson plan data is ready for export.");
    });
}

// Copy to clipboard
const copyPlanBtn = document.getElementById("copy-plan-btn");
if (copyPlanBtn) {
    copyPlanBtn.addEventListener("click", () => {
        const content = lessonPlanContent ? lessonPlanContent.innerText : "";
        if (content) {
            navigator.clipboard.writeText(content).then(() => {
                alert("📋 Lesson plan copied to clipboard!");
            }).catch(() => {
                alert("Could not copy. Please select text manually.");
            });
        }
    });
}

// ============================================
// Page Navigation
// ============================================
function switchPage(pageId) {
    pages.forEach(page => page.classList.remove("active-page"));
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) targetPage.classList.add("active-page");
    navBtns.forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-page") === pageId) btn.classList.add("active");
    });
}

function initNavigation() {
    navBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const pageId = btn.getAttribute("data-page");
            if (pageId) switchPage(pageId);
        });
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
        if (feedback) feedback.innerHTML = '<span style="color: #2c7a4d;">✅ Message sent! Our team will respond within 24 hours.</span>';
        contactForm.reset();
        setTimeout(() => { if (feedback) feedback.innerHTML = ""; }, 5000);
    });
}

function initServiceButtons() {
    document.querySelectorAll(".package-cta").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            switchPage("contact");
            const feedback = document.getElementById("form-feedback");
            if (feedback) feedback.innerHTML = '<span style="color: #0a5c8e;">📦 Please fill out the form below for package details.</span>';
            setTimeout(() => { if (feedback && feedback.innerHTML.includes("package")) feedback.innerHTML = ""; }, 4000);
        });
    });
}

// ============================================
// Initialize App
// ============================================
function initializeApp() {
    initNavigation();
    initContactForm();
    initServiceButtons();
    
    // Attach form submit handler
    if (generatorForm) {
        generatorForm.addEventListener("submit", handleGenerateLesson);
    }
    
    console.log("⚡ STEM Forge Lesson Generator initialized | Backend at http://localhost:3000 | EDP framework active");
}

// Start the app when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);

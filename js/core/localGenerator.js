// ============================================
// LOCAL FALLBACK LESSON GENERATOR
// Used when backend is unavailable
// ============================================

const SUBJECT_INFO = {
    'robotics': { icon: '🤖', name: 'Robotics & Automation' },
    'electronics': { icon: '⚡', name: 'Electronics & Circuits' },
    'programming': { icon: '💻', name: 'Programming for Robotics' },
    'mechanics': { icon: '🔩', name: 'Mechanics & Mechanisms' },
    'engineering': { icon: '🏗️', name: 'Engineering Design' },
    'physics': { icon: '⚛️', name: 'Physics' },
    'chemistry': { icon: '🧪', name: 'Chemistry' }
};

const PHASES = [
    { name: "Engage & Introduce", percent: 0.12 },
    { name: "EDP - Ask & Imagine", percent: 0.15 },
    { name: "Plan & Design", percent: 0.15 },
    { name: "Create & Build", percent: 0.35 },
    { name: "Test & Iterate", percent: 0.15 },
    { name: "Reflect & Share", percent: 0.08 }
];

export function generateLocalLessonPlan(formData) {
    const {
        classLevel = 'Grade 9',
        term = 'First Term',
        subject = 'engineering',
        duration = 90,
        topic = 'Introduction',
        additionalNotes = ''
    } = formData;
    
    const subjectInfo = SUBJECT_INFO[subject] || SUBJECT_INFO.engineering;
    const displayTopic = topic || `Introduction to ${subjectInfo.name}`;
    
    // Build timeline
    let currentTime = 0;
    const timeline = PHASES.map(phase => {
        const phaseDuration = Math.round(duration * phase.percent);
        const item = {
            phase: phase.name,
            duration: `${phaseDuration} min`,
            start: currentTime,
            end: currentTime + phaseDuration,
            description: getPhaseDescription(phase.name)
        };
        currentTime += phaseDuration;
        return item;
    });
    
    return {
        metadata: {
            title: `${subjectInfo.icon} ${displayTopic}`,
            classLevel,
            term,
            subject: subjectInfo.name,
            duration: `${duration} minutes`,
            generatedDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            source: 'local-template'
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
            "Follow all laboratory safety guidelines",
            "Wear appropriate PPE (safety glasses, gloves)",
            "Report accidents immediately to instructor",
            "Keep workspace clean and organized",
            "Disconnect power before adjusting wiring"
        ],
        timeline,
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
            "Formative: Observation during build phase",
            "Performance: Prototype functionality vs. criteria",
            "Summative: Engineering notebook documentation",
            "Reflection: Exit ticket on iterations made"
        ],
        additionalNotes
    };
}

/**
 * Local fallback for LESSON NOTE mode
 * Suggests media without generating actual files
 */
export function generateLocalLessonNote(formData) {
    const {
        classLevel = 'Grade 9',
        term = 'First Term',
        subject = 'engineering',
        topic = 'Introduction',
        additionalNotes = ''
    } = formData;
    
    const subjectInfo = SUBJECT_INFO[subject] || SUBJECT_INFO.engineering;
    const displayTopic = topic || `Introduction to ${subjectInfo.name}`;
    
    return {
        metadata: {
            title: `${subjectInfo.icon} ${displayTopic} - Lesson Note`,
            classLevel,
            term,
            subject: subjectInfo.name,
            generatedDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            source: 'local-template'
        },
        introduction: {
            text: `${displayTopic} is a fundamental concept in ${subjectInfo.name}. This lesson will explore its key principles and applications.`,
            duration: '10 minutes'
        },
        definitions: [
            {
                term: displayTopic,
                definition: `The primary concept being studied - ${displayTopic} involves understanding the basic principles and applications in real-world contexts.`,
                suggestedImagePrompt: `A clear diagram showing ${displayTopic} with labeled parts. Search for: "${displayTopic} diagram for students" or visit phet.colorado.edu for simulations.`
            },
            {
                term: 'Engineering Design Process',
                definition: 'A systematic approach to problem-solving: Ask, Imagine, Plan, Create, Test & Improve.',
                suggestedImagePrompt: `Visual flowchart of EDP steps. Visit teachengineering.org for free EDP poster.`
            }
        ],
        keyConcepts: [
            `Understanding the fundamental principles of ${displayTopic}`,
            `Practical applications in ${subjectInfo.name.toLowerCase()}`,
            `Problem-solving through hands-on experimentation`,
            `Connection to real-world engineering challenges`
        ],
        videoSuggestions: [
            {
                topic: `Introduction to ${displayTopic}`,
                searchQuery: `${displayTopic} explained for ${classLevel}`,
                suggestedSources: [
                    'YouTube: Crash Course Kids',
                    'YouTube: TED-Ed',
                    'Khan Academy (khanacademy.org)',
                    'PhET Simulations (phet.colorado.edu)'
                ],
                duration: '5-10 minutes recommended'
            },
            {
                topic: 'Real-world applications',
                searchQuery: `${displayTopic} real world examples engineering`,
                suggestedSources: [
                    'YouTube: Mark Rober',
                    'YouTube: Veritasium',
                    'National Geographic Kids'
                ],
                duration: '8-12 minutes recommended'
            }
        ],
        imageSuggestions: [
            {
                location: 'Introduction slide',
                description: `Hero image showing ${displayTopic}`,
                sources: [
                    'Unsplash.com (free high-quality photos)',
                    `Google Images: "${displayTopic} for education"`,
                    'Pexels.com (free stock photos)',
                    'NASA Image Gallery (if space-related)'
                ],
                spec: 'Landscape orientation, min 1200x600px'
            },
            {
                location: 'Key concepts section',
                description: 'Infographic summarizing main points',
                sources: [
                    'Canva.com (free templates)',
                    'Piktochart.com',
                    'Venngage.com',
                    'Search: "infographic maker for education"'
                ],
                spec: 'Vertical or square format works best'
            }
        ],
        materialsList: [
            {
                item: 'Visual aids (printed diagrams)',
                quantity: '1 set per group',
                source: 'Print from textbook or teacher resources',
                alternatives: 'Project on screen instead of printing'
            },
            {
                item: 'Notebooks & pens',
                quantity: '1 per student',
                source: 'Standard school supplies',
                alternatives: 'Digital notebooks (Google Docs, Notion)'
            },
            {
                item: 'Whiteboard/markers',
                quantity: '1 per classroom',
                source: 'Standard classroom equipment',
                alternatives: 'Smart board or projector with annotation'
            },
            {
                item: 'Hands-on materials (if applicable)',
                quantity: 'Varies by activity',
                source: 'STEM kit or improvised materials',
                alternatives: 'Virtual simulation as substitute'
            }
        ],
        activities: [
            {
                name: 'Think-Pair-Share',
                duration: '10 minutes',
                description: `Students think about ${displayTopic}, discuss with partner, then share with class`,
                materials: 'Discussion prompts'
            },
            {
                name: 'Demonstration',
                duration: '15 minutes',
                description: `Teacher demonstrates key principles of ${displayTopic}`,
                materials: 'Demo kit or video'
            },
            {
                name: 'Group Activity',
                duration: '25 minutes',
                description: 'Students apply concepts in small groups',
                materials: 'Activity sheets, hands-on materials'
            }
        ],
        additionalNotes
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

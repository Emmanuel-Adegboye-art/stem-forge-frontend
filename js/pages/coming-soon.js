// ============================================
// COMING SOON PAGE LOGIC
// Dynamically renders content based on URL parameter
// ============================================

const FEATURES = {
    exams: {
        icon: '📝',
        title: 'CBT Exam System',
        description: 'Computer-Based Testing for student assessments with auto-grading and analytics.',
        progress: 65,
        eta: 'Q3 2026',
        tags: ['📝 Multiple Question Types', '⚡ Auto-grading', '📊 Analytics Dashboard', '⏱️ Timed Tests', '🔒 Secure Browser Mode']
    },
    virtual: {
        icon: '🎥',
        title: 'Virtual Classroom',
        description: 'Live online classes with screen sharing, whiteboard, and breakout rooms.',
        progress: 40,
        eta: 'Q4 2026',
        tags: ['🎥 HD Video', '🖥️ Screen Share', '📝 Whiteboard', '👥 Breakout Rooms', '💬 Live Chat']
    },
    default: {
        icon: '🚧',
        title: 'Feature Coming Soon',
        description: "We're working hard to bring you this exciting feature.",
        progress: 45,
        eta: 'Q3 2026',
        tags: ['🎓 CBT Exams', '💰 Payment Integration', '🎥 Virtual Classroom', '☁️ Cloud Backup', '📱 Mobile App']
    }
};

export function init() {
    const container = document.getElementById('coming-soon-content');
    if (!container) return;
    
    // Get feature from URL: ?feature=exams or ?feature=virtual
    const params = new URLSearchParams(window.location.search);
    const featureKey = params.get('feature') || 'default';
    const feature = FEATURES[featureKey] || FEATURES.default;
    
    // Update page title
    document.title = `STEM Forge | ${feature.title}`;
    
    // Render content
    container.innerHTML = `
        <div class="coming-soon-icon">${feature.icon}</div>
        <h1>${feature.title}</h1>
        <p>${feature.description}</p>
        
        <div class="progress-bar">
            <div class="progress" style="width: ${feature.progress}%"></div>
        </div>
        
        <p class="eta">Estimated release: ${feature.eta}</p>
        
        <div class="feature-list">
            ${feature.tags.map(tag => `<span class="feature-tag">${tag}</span>`).join('')}
        </div>
        
        <a href="index.html" class="back-home-btn">🏠 Back to Home</a>
    `;
    
    console.log(`📄 Coming Soon page loaded: ${featureKey}`);
}

import { themeManager } from './core/theme.js';
import { navigation } from './components/nav.js';

document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
    navigation.init();
    
    // Page-specific loading
    const page = document.body.dataset.page;
    
    switch (page) {
        case 'dashboard':
            import('./pages/dashboard.js').then(m => m.init?.());
            break;
        case 'ai-generate':
            import('./pages/ai-generate.js').then(m => m.init());
            break;
        case 'scheme':
            import('./pages/scheme.js').then(m => m.init?.());
            break;
        case 'attendance':
            import('./pages/attendance.js').then(m => m.init?.());
            break;
        case 'contact':
            import('./pages/contact.js').then(m => m.init?.());
            break;
        case 'coming-soon':
            import('./pages/coming-soon.js').then(m => m.init());
            break;
    }
    
    console.log('⚡ STEM Forge ready');
});

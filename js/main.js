import { themeManager } from './core/theme.js';
import { navigation } from './components/nav.js';
import { initAuthGuard } from './core/auth-guard.js';

document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
    navigation.init();
    
    // Enforce Auth Guard across all pages
    initAuthGuard();
    
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
        case 'students':
            import('./pages/students.js').then(m => m.init?.());
            break;
        case 'register-student':
            import('./pages/register-student.js').then(m => m.init());
            break;
        case 'register-teacher':
            import('./pages/register-teacher.js').then(m => m.init());
            break;
        case 'login':
            import('./pages/login.js').then(m => m.init());
            break;
        case 'classes':
            import('./pages/classes.js').then(m => m.init?.());
            break;
        case 'attendance-reports':
            import('./pages/attendance-reports.js').then(m => m.init?.());
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

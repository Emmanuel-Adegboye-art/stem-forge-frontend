// ============================================
// THEME MANAGER
// Handles light/dark mode switching
// ============================================

const STORAGE_KEY = 'stemforge-theme';

class ThemeManager {
    constructor() {
        this.toggle = null;
        this.theme = this.getInitial();
    }
    
    init() {
        this.toggle = document.getElementById('theme-toggle');
        this.apply(this.theme);
        
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    getInitial() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.apply(this.theme);
        localStorage.setItem(STORAGE_KEY, this.theme);
    }
    
    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

export const themeManager = new ThemeManager();

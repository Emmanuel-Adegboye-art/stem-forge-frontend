// ============================================
// NAVIGATION COMPONENT
// Handles sliding sidebar, mobile menu, dropdowns, and active states
// ============================================

class Navigation {
    constructor() {
        this.dropdowns = [];
        this.sidebarToggle = null;
        this.sidebarClose = null;
        this.sidebar = null;
        this.sidebarBackdrop = null;
        this.isMobileMenuOpen = false;
    }
    
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarBackdrop = document.getElementById('sidebar-backdrop');
        this.sidebarToggle = document.getElementById('sidebar-toggle') || document.getElementById('mobile-menu-toggle');
        this.sidebarClose = document.getElementById('sidebar-close');
        
        this.initMobileSidebar();
        this.initDropdowns();
        this.initKeyboardNavigation();
        this.highlightActivePage();
        this.initUserAvatar();
    }

    // ============================================
    // SLIDING MOBILE SIDEBAR
    // ============================================
    initMobileSidebar() {
        // Toggle open on hamburger click
        const toggles = document.querySelectorAll('#sidebar-toggle, #mobile-menu-toggle, .mobile-menu-toggle');
        toggles.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openSidebar();
            });
        });

        // Close on close button click
        if (this.sidebarClose) {
            this.sidebarClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeSidebar();
            });
        }

        // Close on backdrop click
        if (this.sidebarBackdrop) {
            this.sidebarBackdrop.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // Close on mobile when clicking any link inside sidebar
        if (this.sidebar) {
            this.sidebar.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 768) {
                        this.closeSidebar();
                    }
                });
            });
        }

        // Legacy nav-links support if present
        const oldNavLinks = document.getElementById('nav-links');
        if (oldNavLinks && !this.sidebar) {
            toggles.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.isMobileMenuOpen = !this.isMobileMenuOpen;
                    oldNavLinks.classList.toggle('show', this.isMobileMenuOpen);
                    btn.setAttribute('aria-expanded', this.isMobileMenuOpen);
                });
            });
        }
    }

    openSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove('-translate-x-full');
        }
        if (this.sidebarBackdrop) {
            this.sidebarBackdrop.classList.remove('hidden');
        }
        this.isMobileMenuOpen = true;
    }

    closeSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.add('-translate-x-full');
        }
        if (this.sidebarBackdrop) {
            this.sidebarBackdrop.classList.add('hidden');
        }
        this.isMobileMenuOpen = false;
    }
    
    initDropdowns() {
        this.dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
        
        this.dropdowns.forEach(dropdown => {
            const button = dropdown.querySelector('.nav-dropdown-btn');
            if (!button) return;
            
            // Click to toggle (works on both mobile and desktop)
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown(dropdown);
            });
            
            // Keyboard accessibility
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleDropdown(dropdown);
                } else if (e.key === 'Escape') {
                    this.closeAllDropdowns();
                    button.blur();
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const clickedInsideDropdown = e.target.closest('.nav-dropdown');
            if (!clickedInsideDropdown) {
                this.closeAllDropdowns();
            }
        });
    }
    
    toggleDropdown(dropdown) {
        const isOpen = dropdown.classList.contains('active');
        this.closeAllDropdowns();
        if (!isOpen) {
            dropdown.classList.add('active');
        }
    }
    
    closeAllDropdowns() {
        this.dropdowns.forEach(d => d.classList.remove('active'));
    }
    
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
                if (this.isMobileMenuOpen) {
                    this.closeSidebar();
                }
            }
        });
    }
    
    highlightActivePage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Highlight primary nav buttons
        document.querySelectorAll('.nav-btn').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            }
        });
        
        // Highlight dropdown items
        document.querySelectorAll('.nav-dropdown-content a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
                link.closest('.nav-dropdown')?.classList.add('active');
            }
        });
    }

    // ============================================
    // USER AVATAR — show first initial of logged-in user
    // ============================================
    initUserAvatar() {
        const el = document.getElementById('user-avatar');
        if (!el) return;

        // Palette of background colours cycled by first char code
        const palette = [
            '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
            '#10b981', '#3b82f6', '#ef4444', '#14b8a6'
        ];

        const render = (name) => {
            const initial = (name || '?').trim().charAt(0).toUpperCase();
            const colour  = palette[initial.charCodeAt(0) % palette.length];
            el.innerHTML = '';
            el.style.cssText += `background:${colour};display:flex;align-items:center;justify-content:center;`;
            const span = document.createElement('span');
            span.textContent = initial;
            span.style.cssText = 'color:#fff;font-size:0.875rem;font-weight:700;line-height:1;pointer-events:none;';
            el.appendChild(span);
            el.title = name || 'Profile';
        };

        // Render from localStorage immediately if available (avoids blank/flash while Firebase loads)
        let stored = localStorage.getItem('stemforge:userName');
        if (!stored) {
            try {
                const userData = JSON.parse(localStorage.getItem('stemforge:user') || '{}');
                stored = userData.name;
            } catch (e) {}
        }

        if (stored) {
            render(stored);
        } else {
            el.innerHTML = '<span style="color:#64748b;font-size:1.1rem;">&#128100;</span>';
            el.style.cssText += 'display:flex;align-items:center;justify-content:center;';
        }

        // Try Firebase auth to get real-time info and update it if changed
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    const name = user.displayName || user.email?.split('@')[0] || 'User';
                    render(name);
                } else {
                    localStorage.removeItem('stemforge:userName');
                    el.innerHTML = '<span style="color:#64748b;font-size:1.1rem;">&#128100;</span>';
                    el.style.cssText += 'display:flex;align-items:center;justify-content:center;';
                }
            });
        }
    }
}

// Export singleton instance
export const navigation = new Navigation();

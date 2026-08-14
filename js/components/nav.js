// ============================================
// NAVIGATION COMPONENT
// Handles dropdown, mobile menu, and active states
// ============================================

class Navigation {
    constructor() {
        this.dropdowns = [];
        this.mobileToggle = null;
        this.navLinks = null;
        this.isMobileMenuOpen = false;
    }
    
    init() {
        this.mobileToggle = document.getElementById('mobile-menu-toggle');
        this.navLinks = document.getElementById('nav-links');
        
        this.initDropdowns();
        this.initMobileMenu();
        this.initOutsideClickHandler();
        this.initKeyboardNavigation();
        this.highlightActivePage();
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
    }
    
    toggleDropdown(dropdown) {
        const isOpen = dropdown.classList.contains('active');
        
        // Close all other dropdowns first
        this.closeAllDropdowns();
        
        // Toggle this one
        if (!isOpen) {
            dropdown.classList.add('active');
        }
    }
    
    closeAllDropdowns() {
        this.dropdowns.forEach(d => d.classList.remove('active'));
    }
    
    initMobileMenu() {
        if (!this.mobileToggle || !this.navLinks) return;
        
        this.mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isMobileMenuOpen = !this.isMobileMenuOpen;
            this.navLinks.classList.toggle('show', this.isMobileMenuOpen);
            this.mobileToggle.setAttribute('aria-expanded', this.isMobileMenuOpen);
        });
    }
    
    initOutsideClickHandler() {
        // THE KEY FIX: Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const clickedInsideDropdown = e.target.closest('.nav-dropdown');
            const clickedOnToggle = e.target.closest('.mobile-menu-toggle');
            const clickedInsideNavLinks = e.target.closest('.nav-links');
            
            // If click is outside any nav element, close everything
            if (!clickedInsideDropdown && !clickedOnToggle && !clickedInsideNavLinks) {
                this.closeAllDropdowns();
                if (this.isMobileMenuOpen) {
                    this.isMobileMenuOpen = false;
                    this.navLinks?.classList.remove('show');
                    this.mobileToggle?.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
    
    initKeyboardNavigation() {
        // Close on Escape key (anywhere)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
                if (this.isMobileMenuOpen) {
                    this.isMobileMenuOpen = false;
                    this.navLinks?.classList.remove('show');
                    this.mobileToggle?.setAttribute('aria-expanded', 'false');
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
                // Also open the parent dropdown
                link.closest('.nav-dropdown')?.classList.add('active');
            }
        });
    }
}

// Export singleton instance
export const navigation = new Navigation();

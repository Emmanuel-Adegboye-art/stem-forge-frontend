// ============================================
// AUTH GUARD
// Enforces page access rules based on authentication & email verification
// ============================================

const PUBLIC_PAGES = ['login.html', 'register-teacher.html', 'verify-email.html'];
const ADMIN_PAGES = ['admin-promo.html'];

export function initAuthGuard() {
    if (typeof firebase === 'undefined' || !firebase.auth) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    firebase.auth().onAuthStateChanged(async (user) => {
        const isPublicPage = PUBLIC_PAGES.includes(currentPath);

        if (!user) {
            // Unauthenticated user attempting to access protected page
            if (!isPublicPage) {
                console.warn(`🔒 Access denied to ${currentPath}. Redirecting to login.html`);
                window.location.href = 'login.html';
                return;
            }
        } else {
            // User is signed in
            // Check email verification if required
            if (!user.emailVerified && currentPath !== 'verify-email.html') {
                console.warn('⚠️ Email not verified. Redirecting to verify-email.html');
                window.location.href = 'verify-email.html';
                return;
            }

            // User is verified and signed in
            if (isPublicPage && currentPath !== 'verify-email.html') {
                // If on login or registration page, redirect to index.html
                window.location.href = 'index.html';
                return;
            }

            // Check admin pages
            if (ADMIN_PAGES.includes(currentPath)) {
                try {
                    const tokenResult = await user.getIdTokenResult();
                    const storedUser = JSON.parse(localStorage.getItem('stemforge:user') || '{}');
                    const role = tokenResult.claims.role || storedUser.role;
                    if (role !== 'org_admin') {
                        alert('Access restricted to Organization Admins only.');
                        window.location.href = 'index.html';
                        return;
                    }
                } catch (e) {
                    console.error('Failed to verify admin role:', e);
                }
            }

            // Update UI elements across page if user is logged in
            updateUserUI(user);
        }
    });
}

function updateUserUI(user) {
    // Save user info in localStorage for quick access
    const savedUser = JSON.parse(localStorage.getItem('stemforge:user') || '{}');
    const displayName = user.displayName || savedUser.name || user.email.split('@')[0];

    // Update Welcome Banner on Dashboard if element exists
    const welcomeHeader = document.querySelector('.welcome-banner h2');
    if (welcomeHeader) {
        welcomeHeader.textContent = `👋 Welcome back, ${displayName}!`;
    }

    // Add sign out button to main navigation if needed
    const navLinks = document.getElementById('nav-links');
    if (navLinks && !document.getElementById('logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'nav-btn';
        logoutBtn.style.background = 'transparent';
        logoutBtn.style.border = 'none';
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.textContent = `🚪 Logout (${displayName})`;
        logoutBtn.addEventListener('click', async () => {
            await firebase.auth().signOut();
            localStorage.removeItem('stemforge:user');
            window.location.href = 'login.html';
        });
        navLinks.appendChild(logoutBtn);
    }
}

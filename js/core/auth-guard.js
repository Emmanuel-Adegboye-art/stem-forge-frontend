// ============================================
// AUTH GUARD
// Enforces page access rules based on authentication & email verification
// ============================================

const PUBLIC_PAGES = ['login.html', 'register-teacher.html', 'register-student.html', 'verify-email.html'];
const ADMIN_PAGES = ['admin-promo.html'];

export function initAuthGuard() {
    if (typeof firebase === 'undefined' || !firebase.auth || !firebase.apps?.length) {
        console.warn('Auth guard skipped: Firebase app not initialized');
        return;
    }

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
            if (currentPath === 'login.html') {
                // If on login page, redirect to index.html
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
    localStorage.setItem('stemforge:userName', displayName);

    // Update Welcome Banner on Dashboard if element exists
    const welcomeHeader = document.getElementById('welcome-name') || document.querySelector('.welcome-banner h2');
    if (welcomeHeader) {
        welcomeHeader.textContent = `👋 Welcome back, ${displayName}!`;
    }

    // The sidebar "Log Out" link only navigates, so sign out before following it
    document.querySelectorAll('a[href="login.html"]').forEach(link => {
        if (!/log\s*out/i.test(link.textContent)) return;
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            await firebase.auth().signOut();
            localStorage.removeItem('stemforge:user');
            localStorage.removeItem('stemforge:userName');
            window.location.href = 'login.html';
        });
    });
}

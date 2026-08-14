// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Escape HTML to prevent XSS attacks
 */
export function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

/**
 * Show status message in a status div
 */
export function showStatus(elementId, message, type = 'info', duration = 3000) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const styles = {
        success: { color: 'var(--color-success)', icon: '✅' },
        error: { color: 'var(--color-error)', icon: '❌' },
        warning: { color: 'var(--color-warning)', icon: '⚠️' },
        info: { color: 'var(--color-info)', icon: '⚙️' }
    };
    
    const s = styles[type] || styles.info;
    el.innerHTML = `<span style="color: ${s.color}">${s.icon} ${escapeHtml(message)}</span>`;
    el.style.display = 'block';
    
    if (duration > 0) {
        setTimeout(() => { el.style.display = 'none'; }, duration);
    }
}

/**
 * Set button to loading state
 */
export function setButtonLoading(button, loadingText = '⏳ Loading...') {
    if (!button) return null;
    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = loadingText;
    return original;
}

/**
 * Reset button to original state
 */
export function resetButton(button, originalHtml) {
    if (!button) return;
    button.disabled = false;
    if (originalHtml) button.innerHTML = originalHtml;
}

/**
 * STEM Forge Feedback Widget
 * Injects a floating 💬 button (bottom-right) on every page.
 * Opens a modal with Name, Subject, Description, Gmail fields.
 * On submit: shows a toast, sends to POST /api/feedback.
 */

import { CONFIG } from '../core/config.js';

// ── Inject styles ─────────────────────────────────────────────────
(function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
    /* ─── Floating trigger ─────────────────────── */
    #sfb-trigger {
        position: fixed; bottom: 24px; right: 24px; z-index: 9990;
        display: flex; align-items: center; gap: 8px;
        background: #F59E0B; color: #fff;
        padding: 12px 20px 12px 16px;
        border: none; border-radius: 50px;
        font-family: 'Hanken Grotesk', sans-serif; font-weight: 700; font-size: 14px;
        cursor: pointer; box-shadow: 0 4px 20px rgba(245,158,11,.4);
        transition: transform .2s, box-shadow .2s, opacity .2s;
        user-select: none;
    }
    #sfb-trigger:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(245,158,11,.45); }
    #sfb-trigger:active { transform: translateY(0); }
    #sfb-trigger .sfb-icon { font-size: 20px; }

    /* ─── Backdrop ─────────────────────────────── */
    #sfb-backdrop {
        position: fixed; inset: 0; z-index: 9991;
        background: rgba(15,23,42,.45); backdrop-filter: blur(4px);
        opacity: 0; pointer-events: none;
        transition: opacity .25s;
    }
    #sfb-backdrop.open { opacity: 1; pointer-events: all; }

    /* ─── Modal ────────────────────────────────── */
    #sfb-modal {
        position: fixed; z-index: 9992;
        bottom: 90px; right: 24px;
        width: min(440px, calc(100vw - 32px));
        background: #fff; border-radius: 20px;
        box-shadow: 0 24px 60px rgba(0,0,0,.18);
        overflow: hidden;
        transform: translateY(20px) scale(.97);
        opacity: 0; pointer-events: none;
        transition: transform .28s cubic-bezier(.34,1.56,.64,1), opacity .22s;
    }
    #sfb-modal.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }

    .sfb-header {
        background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%);
        padding: 20px 24px 16px;
        display: flex; align-items: center; justify-content: space-between;
    }
    .sfb-header h2 { color: #F59E0B; font-weight: 800; font-size: 17px; margin: 0; font-family: 'Hanken Grotesk', sans-serif; }
    .sfb-header p  { color: rgba(255,255,255,.6); font-size: 12px; margin: 2px 0 0; font-family: 'Hanken Grotesk', sans-serif; }
    .sfb-close {
        background: rgba(255,255,255,.1); border: none; border-radius: 8px;
        color: #fff; width: 32px; height: 32px; cursor: pointer; font-size: 18px;
        display: flex; align-items: center; justify-content: center;
        transition: background .15s;
    }
    .sfb-close:hover { background: rgba(255,255,255,.2); }

    .sfb-body { padding: 20px 24px 24px; }
    .sfb-field { margin-bottom: 14px; }
    .sfb-field label { display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; font-family: 'Hanken Grotesk', sans-serif; text-transform: uppercase; letter-spacing: .04em; }
    .sfb-input {
        width: 100%; padding: 10px 14px;
        border: 1.5px solid #e5e7eb; border-radius: 10px;
        font-size: 14px; font-family: 'Hanken Grotesk', sans-serif;
        background: #f9fafb; color: #111827; outline: none;
        transition: border-color .2s, box-shadow .2s; box-sizing: border-box;
    }
    .sfb-input:focus { border-color: #F59E0B; box-shadow: 0 0 0 3px rgba(245,158,11,.12); background: #fff; }
    .sfb-textarea { min-height: 90px; resize: vertical; }

    .sfb-submit {
        width: 100%; background: #F59E0B; color: #fff; font-weight: 700;
        padding: 12px; border-radius: 10px; border: none; cursor: pointer;
        font-size: 14px; font-family: 'Hanken Grotesk', sans-serif;
        transition: opacity .2s, transform .1s; display: flex; align-items: center; justify-content: center; gap: 6px;
        margin-top: 4px;
    }
    .sfb-submit:hover:not(:disabled) { opacity: .9; }
    .sfb-submit:active:not(:disabled) { transform: scale(.98); }
    .sfb-submit:disabled { opacity: .65; cursor: not-allowed; }

    .sfb-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 10px 12px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; display: none; font-family: 'Hanken Grotesk', sans-serif; }

    /* ─── Toast ────────────────────────────────── */
    #sfb-toast {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(80px);
        z-index: 9999; background: #0F172A; color: #fff;
        padding: 14px 24px; border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,.25);
        font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; font-weight: 600;
        display: flex; align-items: center; gap: 10px;
        transition: transform .35s cubic-bezier(.34,1.56,.64,1), opacity .25s;
        opacity: 0; pointer-events: none;
        white-space: nowrap;
    }
    #sfb-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
    #sfb-toast .sfb-toast-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; flex-shrink: 0; }
    `;
    document.head.appendChild(style);
})();

// ── Build HTML ────────────────────────────────────────────────────
function buildWidget() {
    // Trigger button
    const trigger = document.createElement('button');
    trigger.id = 'sfb-trigger';
    trigger.setAttribute('aria-label', 'Send feedback');
    trigger.innerHTML = '<span class="sfb-icon">💬</span> Feedback';

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'sfb-backdrop';

    // Modal
    const modal = document.createElement('div');
    modal.id = 'sfb-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'sfb-title');
    modal.innerHTML = `
        <div class="sfb-header">
            <div>
                <h2 id="sfb-title">Send us feedback</h2>
                <p>We read every message · reply within 48 hrs</p>
            </div>
            <button class="sfb-close" id="sfb-close" aria-label="Close feedback form">✕</button>
        </div>
        <div class="sfb-body">
            <div class="sfb-error" id="sfb-error"></div>
            <form id="sfb-form" novalidate>
                <div class="sfb-field">
                    <label for="sfb-name">Your name</label>
                    <input type="text" id="sfb-name" class="sfb-input" placeholder="Jane Doe" required>
                </div>
                <div class="sfb-field">
                    <label for="sfb-email">Gmail / Email</label>
                    <input type="email" id="sfb-email" class="sfb-input" placeholder="you@gmail.com" required>
                </div>
                <div class="sfb-field">
                    <label for="sfb-subject">Subject</label>
                    <input type="text" id="sfb-subject" class="sfb-input" placeholder="e.g. Love the scheme generator!" required>
                </div>
                <div class="sfb-field">
                    <label for="sfb-desc">Description</label>
                    <textarea id="sfb-desc" class="sfb-input sfb-textarea" placeholder="Tell us what you love, what could be better, or report a bug…" required></textarea>
                </div>
                <button type="submit" class="sfb-submit" id="sfb-submit">
                    🚀 Send Feedback
                </button>
            </form>
        </div>`;

    // Toast
    const toast = document.createElement('div');
    toast.id = 'sfb-toast';
    toast.innerHTML = '<span class="sfb-toast-dot"></span> Feedback received — we\'ll reply within 48 hours!';

    document.body.append(trigger, backdrop, modal, toast);
    return { trigger, backdrop, modal };
}

// ── Open / close ──────────────────────────────────────────────────
function openModal(modal, backdrop) {
    modal.classList.add('open');
    backdrop.classList.add('open');
    document.getElementById('sfb-name')?.focus();
}

function closeModal(modal, backdrop) {
    modal.classList.remove('open');
    backdrop.classList.remove('open');
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast() {
    const t = document.getElementById('sfb-toast');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4500);
}

// ── Pre-fill from localStorage ────────────────────────────────────
function prefill() {
    try {
        const user = JSON.parse(localStorage.getItem('stemforge:user') || '{}');
        if (user.name)  document.getElementById('sfb-name').value  = user.name;
        if (user.email) document.getElementById('sfb-email').value = user.email;
    } catch (_) {}
}

// ── Submit ────────────────────────────────────────────────────────
async function handleSubmit(e, modal, backdrop) {
    e.preventDefault();
    const name    = document.getElementById('sfb-name').value.trim();
    const email   = document.getElementById('sfb-email').value.trim();
    const subject = document.getElementById('sfb-subject').value.trim();
    const desc    = document.getElementById('sfb-desc').value.trim();
    const errBox  = document.getElementById('sfb-error');
    const btn     = document.getElementById('sfb-submit');

    errBox.style.display = 'none';

    if (!name || !email || !subject || !desc) {
        errBox.textContent = 'Please fill in all fields.';
        errBox.style.display = 'block'; return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Sending…';

    try {
        const res = await fetch(`${CONFIG.API_URL}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, description: desc })
        });
        if (!res.ok) throw new Error('Server error');

        // Reset form, close modal, show toast
        document.getElementById('sfb-form').reset();
        closeModal(modal, backdrop);
        showToast();
    } catch (err) {
        errBox.textContent = '❌ Could not send feedback. Please try again.';
        errBox.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🚀 Send Feedback';
    }
}

// ── Init ──────────────────────────────────────────────────────────
export function initFeedbackWidget() {
    // Don't inject on the dedicated feedback page (it has its own form)
    if (document.body.dataset.page === 'feedback') return;

    const { trigger, backdrop, modal } = buildWidget();

    trigger.addEventListener('click', () => {
        openModal(modal, backdrop);
        prefill();
    });
    backdrop.addEventListener('click', () => closeModal(modal, backdrop));
    document.getElementById('sfb-close').addEventListener('click', () => closeModal(modal, backdrop));
    document.getElementById('sfb-form').addEventListener('submit', e => handleSubmit(e, modal, backdrop));

    // Keyboard: Escape closes modal
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(modal, backdrop);
    });
}

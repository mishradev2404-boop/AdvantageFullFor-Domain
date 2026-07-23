/**
 * app.js — AdVantage Media
 * ================================================================
 * Responsibilities:
 *   1. Page loader  — fetches each page's HTML fragment once and
 *                     injects it into the matching #page-* shell.
 *   2. Router       — shows/hides pages, updates nav active state.
 *   3. Form handler — single Formspree AJAX wrapper used by all forms.
 *   4. Playbook gates — email-capture unlock logic for resource pages.
 *
 * Adding a new page:
 *   a) Create pages/mypage.html
 *   b) Add <div id="page-mypage" class="page"></div> to index.html
 *   c) Add 'page-mypage' to PAGE_IDS below — nothing else needed.
 * ================================================================
 */

'use strict';

// ----------------------------------------------------------------
// CONFIG
// ----------------------------------------------------------------

const CONFIG = {
    /** IDs of every page shell in index.html */
    PAGE_IDS: [
        'page-home',
        'page-services',
        'page-contact',
        'page-story',
        'page-resources',
    ],

    /** Default page shown on first load */
    DEFAULT_PAGE: 'page-home',

    /** Redirect URL after a contact form submits successfully */
    CONTACT_REDIRECT_URL: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1dkXt5AzM0mty3jyZPJgmlfuQWJ9DOJrhsdpuYmuZa1QDrIDaWeYFZ_YGgq76zYaqzDlEPi07W',

    /** IDs of contact forms that should redirect on success */
    CONTACT_FORM_IDS: [
        'home-contact-form',
        'services-contact-form',
        'main-contact-form',
    ],

    /** Newsletter form */
    NEWSLETTER_FORM_ID: 'newsletter-form',

    /** Playbook gate form IDs + the unlock selector nth-index for each */
    PLAYBOOK_GATES: [
        { formId: 'playbook-gate-1', nth: 1 },
        { formId: 'playbook-gate-2', nth: 2 },
        { formId: 'playbook-gate-3', nth: 3 },
        { formId: 'playbook-gate-4', nth: 4 },
    ],
};

// ----------------------------------------------------------------
// PAGE LOADER
// Fetches each page fragment once; caches so navigation is instant.
// ----------------------------------------------------------------

const _pageCache = {};

async function loadPage(pageId) {
    if (_pageCache[pageId]) return _pageCache[pageId];

    // Derive filename from page id: "page-home" -> "pages/home.html"
    const filename = pageId.replace('page-', '');
    const url = `pages/${filename}.html`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} loading ${url}`);
        const html = await res.text();
        _pageCache[pageId] = html;
        return html;
    } catch (err) {
        console.error(`[AdVantage] Failed to load page fragment: ${url}`, err);
        return `<div style="padding:120px 24px;text-align:center;">
                  <h2>Page unavailable</h2>
                  <p>Could not load content. Please refresh the page.</p>
                </div>`;
    }
}

// ----------------------------------------------------------------
// ROUTER
// ----------------------------------------------------------------

/**
 * Show a page by id. Loads its HTML fragment if not yet loaded,
 * injects it, then swaps the .active class.
 *
 * @param {string} pageId  e.g. "page-home"
 */
async function showPage(pageId) {
    if (!CONFIG.PAGE_IDS.includes(pageId)) {
        console.warn(`[AdVantage] Unknown page id: "${pageId}"`);
        return;
    }

    const target = document.getElementById(pageId);
    if (!target) return;

    // Load & inject HTML fragment if shell is still empty
    if (!target.dataset.loaded) {
        const html = await loadPage(pageId);
        target.innerHTML = html;
        target.dataset.loaded = 'true';

        // Bind forms that live inside this page now that its DOM exists
        bindContactForms();
        bindNewsletterForm();
        bindPlaybookGates();
    }

    // Swap active class
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    target.classList.add('active');

    // Update nav active state
    document.querySelectorAll('[data-page]').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------
// FORM UTILITIES
// ----------------------------------------------------------------

/**
 * Submit a form to Formspree via fetch (no page reload).
 * Resolves on success, rejects on network/server error.
 */
async function submitToFormspree(form) {
    const data = new FormData(form);
    const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Formspree responded with status ${res.status}`);
}

/**
 * Bind a submit handler to a form element.
 * Guards against double-binding with a data attribute.
 */
function bindForm(form, onSuccess, onError) {
    if (!form || form.dataset.bound) return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn ? btn.textContent : '';

        if (btn) { btn.textContent = 'Sending\u2026'; btn.disabled = true; }

        try {
            await submitToFormspree(form);
            onSuccess();
        } catch (err) {
            console.error('[AdVantage] Form submission error:', err);
            if (onError) {
                onError(err);
            } else {
                alert('Something went wrong. Please try again or email us directly.');
            }
            if (btn) { btn.textContent = originalText; btn.disabled = false; }
        }
    });
}

// ----------------------------------------------------------------
// CONTACT FORMS
// ----------------------------------------------------------------

function bindContactForms() {
    CONFIG.CONTACT_FORM_IDS.forEach(function (formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Derive prefix: "home-contact-form" -> "home-contact"
        const prefix = formId.replace('-form', '');

        bindForm(form, function onSuccess() {
            const fields  = document.getElementById(prefix + '-fields');
            const success = document.getElementById(prefix + '-success');
            if (fields)  fields.style.display  = 'none';
            if (success) success.style.display = 'block';
            window.location.href = CONFIG.CONTACT_REDIRECT_URL;
        });
    });
}

// ----------------------------------------------------------------
// NEWSLETTER FORM
// ----------------------------------------------------------------

function bindNewsletterForm() {
    const form = document.getElementById(CONFIG.NEWSLETTER_FORM_ID);
    if (!form) return;

    bindForm(form, function onSuccess() {
        form.style.display = 'none';
        const successEl = document.getElementById('newsletter-success');
        if (successEl) successEl.style.display = 'block';
    });
}

// ----------------------------------------------------------------
// PLAYBOOK GATE FORMS
// ----------------------------------------------------------------

function bindPlaybookGates() {
    CONFIG.PLAYBOOK_GATES.forEach(function ({ formId, nth }) {
        const form = document.getElementById(formId);
        if (!form) return;

        bindForm(form, function onSuccess() {
            const gateSection = form.closest('.playbook-section');
            if (gateSection) gateSection.style.display = 'none';

            // Reveal hidden sections inside the nth playbook block
            const selector = `#page-resources .playbook-full:nth-of-type(${nth}) .playbook-section[style*="display:none"]`;
            document.querySelectorAll(selector).forEach(el => { el.style.display = ''; });
        });
    });
}

// ----------------------------------------------------------------
// INIT
// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async function () {
    await showPage(CONFIG.DEFAULT_PAGE);
});

// Expose globally so onclick="showPage(...)" attributes in HTML work
window.showPage = showPage;

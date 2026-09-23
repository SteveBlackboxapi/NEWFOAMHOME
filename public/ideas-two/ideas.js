(() => {
  'use strict';

  const init = () => {
    const storageKey = 'foam-ideas-v2';
    const ideaNumbers = ['07', '08', '09', '10'];
    const saveButtons = [...document.querySelectorAll('[data-save]')];
    const summary = document.querySelector('#saved-summary');
    const note = document.querySelector('#feedback-note');
    const copyButton = document.querySelector('#copy-picks');
    const copyStatus = document.querySelector('#copy-status');
    const initialCopyLabel = copyButton?.textContent || 'Copy my picks';
    let saved = new Set();
    let feedbackTimer;
    let copyVersion = 0;

    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (Array.isArray(stored?.picks)) {
        saved = new Set(stored.picks.filter((number) => ideaNumbers.includes(number)));
      }
      if (note && typeof stored?.note === 'string') note.value = stored.note;
    } catch {
      // Restricted or malformed storage must not prevent using the page.
    }

    const sortedPicks = () => ideaNumbers.filter((number) => saved.has(number));
    const setStatus = (message) => { if (copyStatus) copyStatus.textContent = message; };
    const persist = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ picks: sortedPicks(), note: note?.value || '' }));
      } catch {
        // Choices remain available in memory for this visit.
      }
    };
    const removeFallback = () => document.querySelector('#copy-fallback')?.remove();
    const resetCopyFeedback = () => {
      copyVersion += 1;
      clearTimeout(feedbackTimer);
      removeFallback();
      if (copyButton) copyButton.textContent = initialCopyLabel;
      setStatus('');
    };
    const renderPicks = () => {
      saveButtons.forEach((button) => {
        const number = button.dataset.save;
        const selected = saved.has(number);
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-saved', selected);
        button.textContent = selected ? 'Saved ✓' : 'Keep this idea';
        if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', `Save idea ${number}`);
      });
      if (summary) summary.textContent = sortedPicks().join(', ') || 'Choose the parts that feel like Foam.';
    };

    saveButtons.forEach((button) => button.addEventListener('click', () => {
      const number = button.dataset.save;
      if (!ideaNumbers.includes(number)) return;
      if (saved.has(number)) saved.delete(number);
      else saved.add(number);
      resetCopyFeedback();
      renderPicks();
      persist();
    }));
    note?.addEventListener('input', () => {
      resetCopyFeedback();
      persist();
    });
    document.querySelector('#clear-picks')?.addEventListener('click', () => {
      saved.clear();
      if (note) note.value = '';
      resetCopyFeedback();
      try { localStorage.removeItem(storageKey); } catch { /* The visible reset still works. */ }
      renderPicks();
      setStatus('Page two picks and notes cleared.');
    });
    renderPicks();

    const copyBySelection = (text) => {
      const temporary = document.createElement('textarea');
      temporary.value = text;
      temporary.readOnly = true;
      temporary.setAttribute('aria-label', 'Selected Foam ideas');
      temporary.style.position = 'fixed';
      temporary.style.left = '-9999px';
      document.body.append(temporary);
      temporary.select();
      let copied = false;
      try {
        copied = typeof document.execCommand === 'function' && document.execCommand('copy');
      } catch { /* Offer a visible selection below if the browser blocks copying. */ }
      temporary.remove();
      return copied;
    };

    copyButton?.addEventListener('click', async () => {
      resetCopyFeedback();
      const attempt = copyVersion;
      const picks = sortedPicks().join(', ') || 'none selected yet';
      const comments = note?.value.trim();
      const text = `Foam ideas — page two: ${picks}${comments ? `\n\n${comments}` : ''}`;
      let copied = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          copied = true;
        }
      } catch { /* The preview may not provide clipboard permissions. */ }
      if (attempt !== copyVersion) return;
      if (!copied) copied = copyBySelection(text);
      if (copied) {
        copyButton.textContent = 'Copied ✓';
        setStatus('Copied. Paste your picks and notes into our conversation.');
        copyButton.focus({ preventScroll: true });
        feedbackTimer = setTimeout(() => { copyButton.textContent = initialCopyLabel; }, 2500);
      } else {
        const fallback = document.createElement('textarea');
        fallback.id = 'copy-fallback';
        fallback.className = 'copy-fallback';
        fallback.value = text;
        fallback.readOnly = true;
        fallback.rows = comments ? 5 : 2;
        fallback.setAttribute('aria-label', 'Your page two ideas, ready to copy');
        fallback.style.width = '100%';
        // Place this outside the action row so it remains readable on mobile.
        const anchor = copyStatus || copyButton.parentElement || copyButton;
        anchor.insertAdjacentElement('afterend', fallback);
        copyButton.textContent = 'Select and copy below';
        setStatus('Automatic copying is unavailable. Select the text below and copy it.');
        fallback.focus();
        fallback.select();
      }
    });

    const navLinks = [...document.querySelectorAll('[data-nav]')];
    const sections = [...document.querySelectorAll('[data-idea]')];
    const highlight = (number) => navLinks.forEach((link) => {
      const active = link.dataset.nav === number;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    navLinks.forEach((link) => link.addEventListener('click', () => highlight(link.dataset.nav)));
    if ('IntersectionObserver' in window && sections.length) {
      const visible = new Map();
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target, entry.intersectionRatio);
          else visible.delete(entry.target);
        });
        const current = [...visible].sort((a, b) => b[1] - a[1])[0];
        if (current) highlight(current[0].dataset.idea);
      }, { rootMargin: '-12% 0px -48% 0px', threshold: [0, 0.1, 0.25, 0.5, 1] });
      sections.forEach((section) => observer.observe(section));
    }

    const wall = document.querySelector('#creator-wall');
    const wallStatus = document.querySelector('#wall-status');
    const wallButtons = [...document.querySelectorAll('[data-wall-mode]')];
    if (wall && wallButtons.length) {
      const setWallMode = (mode) => {
        if (!['colour', 'people'].includes(mode)) return;
        wall.classList.toggle('people-only', mode === 'people');
        wallButtons.forEach((button) => {
          const active = button.dataset.wallMode === mode;
          button.setAttribute('aria-pressed', String(active));
          button.classList.toggle('is-active', active);
          if (!button.hasAttribute('aria-controls')) button.setAttribute('aria-controls', 'creator-wall');
        });
        if (wallStatus) wallStatus.textContent = mode === 'people' ? 'People only.' : 'People with colour.';
      };
      wallButtons.forEach((button) => button.addEventListener('click', () => setWallMode(button.dataset.wallMode)));
      setWallMode(wall.classList.contains('people-only') ? 'people' : 'colour');
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

(() => {
  'use strict';

  const init = () => {
    const storageKey = 'foam-ideas-v1';
    const ideaNumbers = ['01', '02', '03', '04', '05', '06'];
    const saveButtons = [...document.querySelectorAll('[data-save]')];
    const summary = document.querySelector('#saved-summary');
    const note = document.querySelector('#feedback-note');
    const copyButton = document.querySelector('#copy-picks');
    let saved = new Set();
    let copyTimer;

    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      const picks = Array.isArray(stored) ? stored : stored?.picks;
      if (Array.isArray(picks)) {
        saved = new Set(picks.filter((number) => ideaNumbers.includes(number)));
      }
      if (note && typeof stored?.note === 'string') note.value = stored.note;
    } catch {
      // The page remains usable when storage is unavailable or has old data.
    }

    const sortedPicks = () => ideaNumbers.filter((number) => saved.has(number));
    const persist = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          picks: sortedPicks(),
          note: note?.value || '',
        }));
      } catch {
        // Keep this session's choices in memory if storage is restricted.
      }
    };

    const renderPicks = () => {
      saveButtons.forEach((button) => {
        const selected = saved.has(button.dataset.save);
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-saved', selected);
        button.textContent = selected ? 'Saved ✓' : 'Keep this idea';
      });
      if (summary) {
        summary.textContent = sortedPicks().join(', ') || 'Choose the parts that feel like Foam.';
      }
    };

    saveButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const number = button.dataset.save;
        if (!ideaNumbers.includes(number)) return;
        if (saved.has(number)) saved.delete(number);
        else saved.add(number);
        renderPicks();
        persist();
      });
    });
    note?.addEventListener('input', persist);
    renderPicks();

    document.querySelector('#clear-picks')?.addEventListener('click', () => {
      saved.clear();
      if (note) note.value = '';
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Clearing the visible page still works without browser storage.
      }
      document.querySelector('#copy-fallback')?.remove();
      renderPicks();
    });

    const copyWithSelection = (text) => {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.setAttribute('aria-label', 'Your selected Foam ideas');
      field.style.position = 'fixed';
      field.style.left = '-9999px';
      document.body.append(field);
      field.select();
      let copied = false;
      try {
        copied = typeof document.execCommand === 'function' && document.execCommand('copy');
      } catch {
        copied = false;
      }
      field.remove();
      return copied;
    };

    if (copyButton) {
      const originalCopyLabel = copyButton.textContent;
      copyButton.addEventListener('click', async () => {
        const picks = sortedPicks().join(', ') || 'none selected yet';
        const comments = note?.value.trim();
        const text = `Foam ideas I like: ${picks}${comments ? `\n\n${comments}` : ''}`;
        let copied = false;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            copied = true;
          }
        } catch {
          // Some preview browsers require the selection-based fallback below.
        }
        if (!copied) copied = copyWithSelection(text);
        document.querySelector('#copy-fallback')?.remove();
        clearTimeout(copyTimer);
        if (copied) {
          copyButton.textContent = 'Copied ✓';
          copyButton.focus({ preventScroll: true });
          copyTimer = setTimeout(() => { copyButton.textContent = originalCopyLabel; }, 2500);
        } else {
          const fallback = document.createElement('textarea');
          fallback.id = 'copy-fallback';
          fallback.value = text;
          fallback.readOnly = true;
          fallback.rows = comments ? 5 : 2;
          fallback.setAttribute('aria-label', 'Select and copy your Foam ideas');
          (copyButton.parentElement || copyButton).insertAdjacentElement('afterend', fallback);
          copyButton.textContent = 'Select and copy below';
          fallback.focus();
          fallback.select();
        }
      });
    }

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

    const bindPanels = (buttonAttribute, panelAttribute, onSelect) => {
      const buttons = [...document.querySelectorAll(`[${buttonAttribute}]`)];
      const panels = [...document.querySelectorAll(`[${panelAttribute}]`)];
      if (!buttons.length || !panels.length) return;
      const select = (value) => {
        if (!panels.some((panel) => panel.getAttribute(panelAttribute) === value)) return;
        buttons.forEach((button) => {
          const active = button.getAttribute(buttonAttribute) === value;
          button.setAttribute('aria-selected', String(active));
          button.classList.toggle('is-active', active);
          if (button.getAttribute('role') === 'tab') button.tabIndex = active ? 0 : -1;
        });
        panels.forEach((panel) => { panel.hidden = panel.getAttribute(panelAttribute) !== value; });
        onSelect?.(value);
      };
      buttons.forEach((button, index) => {
        button.addEventListener('click', () => select(button.getAttribute(buttonAttribute)));
        button.addEventListener('keydown', (event) => {
          let next;
          if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
          else if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = buttons.length - 1;
          else return;
          event.preventDefault();
          select(buttons[next].getAttribute(buttonAttribute));
          buttons[next].focus();
        });
      });
      const initial = buttons.find((button) => button.getAttribute('aria-selected') === 'true') || buttons[0];
      select(initial.getAttribute(buttonAttribute));
    };

    bindPanels('data-product', 'data-product-panel');
    const query = document.querySelector('#demo-query');
    const queries = {
      skincare: 'Skincare product reviews',
      style: 'Everyday outfit inspiration',
      food: 'Cooking at home',
    };
    bindPanels('data-search', 'data-search-panel', (value) => {
      if (query && queries[value]) query.textContent = queries[value];
    });

    const sendButton = document.querySelector('#play-send');
    const mailScene = document.querySelector('#mail-scene');
    const mailStatus = document.querySelector('#mail-status');
    let sendTimer;
    sendButton?.addEventListener('click', () => {
      if (!mailScene) return;
      clearTimeout(sendTimer);
      mailScene.classList.remove('is-sent');
      // Restart the short preview on every press, including Replay.
      void mailScene.offsetWidth;
      mailScene.classList.add('is-sent');
      sendButton.textContent = 'On its way ✓';
      if (mailStatus) mailStatus.textContent = 'A complete profile. Ready for the next opportunity.';
      sendTimer = setTimeout(() => { sendButton.textContent = 'Replay ↺'; }, 1400);
    });

    const motionButton = document.querySelector('#motion-toggle');
    if (motionButton) {
      let paused = document.body.classList.contains('motion-paused')
        || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const renderMotion = () => {
        document.body.classList.toggle('motion-paused', Boolean(paused));
        motionButton.setAttribute('aria-pressed', String(Boolean(paused)));
        motionButton.textContent = paused ? 'Play motion' : 'Pause motion';
      };
      motionButton.addEventListener('click', () => {
        paused = !paused;
        renderMotion();
      });
      renderMotion();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

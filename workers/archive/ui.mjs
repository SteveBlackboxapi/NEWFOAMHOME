const ARCHIVE_BASE = '/NEWFOAMHOME/archive-sept-2026/pages/';

export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>';
const styles = `
  :root{color-scheme:light;--ink:#1c2128;--muted:#5a6670;--paper:#f6f7f5;--line:#dce2e5;--blue:#c1e5ff;--lime:#e8f87e;--red:#7a0036}
  *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-underline-offset:5px}button,input{font:inherit}button,a,input{-webkit-tap-highlight-color:transparent}button,a{touch-action:manipulation}a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid #285dcc;outline-offset:4px}svg{width:24px;height:24px;stroke:currentColor;stroke-width:1.7;flex:none}
  .shell{width:min(1120px,100% - 64px);margin:0 auto}.topbar{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:28px 0;border-bottom:1px solid var(--line)}.brand{text-decoration:none;font-size:32px;line-height:1;font-weight:750;letter-spacing:-1.4px}.brand span{margin-left:14px;border-left:1px solid #bdc7cb;padding-left:16px;color:var(--muted);font-size:12px;letter-spacing:.13em;text-transform:uppercase;font-weight:600;vertical-align:middle}.topnav{display:flex;align-items:center;gap:28px;font-size:14px}.topnav a{text-decoration:none}.topnav a:hover{text-decoration:underline}.topnav a[aria-current=page]{font-weight:650;text-decoration:underline}
  main{padding:74px 0 72px}.eyebrow{font-size:12px;font-weight:650;letter-spacing:.16em;text-transform:uppercase;margin:0 0 20px;color:var(--muted)}h1{font-size:clamp(40px,5.8vw,64px);font-weight:560;letter-spacing:-.055em;line-height:1.08;margin:0 0 24px}h2{font-size:26px;letter-spacing:-.035em;line-height:1.2;margin:0 0 14px;font-weight:600}p{margin:0 0 16px}.intro{max-width:680px;font-size:18px;color:var(--muted);line-height:1.65}.signed-in{font-size:13px;color:var(--muted);overflow-wrap:anywhere}.signed-in strong{color:var(--ink);font-weight:550}.page-heading{margin-bottom:40px}.page-heading .signed-in{margin-top:24px}
  .page-cards{display:grid;grid-template-columns:1fr 1fr;gap:24px}.page-card{position:relative;min-height:276px;display:flex;flex-direction:column;align-items:flex-start;padding:32px;border-radius:24px;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease;background:var(--blue)}.page-card.managers{background:var(--lime)}.page-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px #1c21280d}.card-number{font-size:12px;font-weight:600;letter-spacing:.12em;opacity:.7}.page-card h2{font-size:42px;margin:42px 0 12px;letter-spacing:-.055em}.page-card p{max-width:85%;color:#384651;font-size:15px}.page-card .card-arrow{position:absolute;bottom:32px;right:32px}.page-card .card-arrow svg{width:32px;height:32px}.archive-note{margin:24px 0 0;color:var(--muted);font-size:14px;max-width:760px}.footer{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;border-top:1px solid var(--line);padding:24px 0 30px;color:var(--muted);font-size:12px}.footer p{margin:0}
  .access-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.25fr);gap:24px;align-items:start}.panel{background:#fff;border:1px solid var(--line);border-radius:24px;padding:30px}.invite-panel{background:#eaf4fa;border-color:#eaf4fa}.panel-copy{color:var(--muted);font-size:15px;margin-bottom:26px}label{display:block;font-size:14px;font-weight:600;margin-bottom:8px}input{display:block;width:100%;border:1px solid #bfcbd2;background:#fff;color:var(--ink);border-radius:12px;padding:13px 14px;min-height:52px}input::placeholder{color:#75818b}input[disabled]{opacity:.65}.button{display:inline-flex;justify-content:center;align-items:center;gap:20px;border:0;border-radius:999px;padding:13px 23px;min-height:50px;background:var(--ink);color:#fff;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none}.button:hover{background:#35414b}.button:disabled{cursor:wait;opacity:.6}.invite-panel .button{margin-top:16px;width:100%;justify-content:space-between}.help{font-size:13px;color:var(--muted);margin-top:18px;margin-bottom:0}.members-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px}.members-head h2{margin-bottom:8px}.member-count{white-space:nowrap;color:var(--muted);font-size:13px}.members{padding:0;margin:0;list-style:none}.member{display:flex;align-items:center;gap:14px;padding:20px 0;border-bottom:1px solid var(--line)}.member:last-child{border-bottom:0}.avatar{width:38px;height:38px;border-radius:50%;background:#eef2f4;display:grid;place-items:center;flex:none;font-size:13px;font-weight:650}.owner .avatar{background:var(--lime)}.member-info{min-width:0;flex:1}.member-email{display:block;font-size:14px;font-weight:550;overflow-wrap:anywhere}.member-role{display:block;color:var(--muted);font-size:12px;margin-top:2px}.remove{border:1px solid var(--line);background:#fff;border-radius:999px;color:var(--muted);padding:7px 12px;font-size:12px;cursor:pointer;flex:none;min-height:38px}.remove:hover{border-color:var(--red);color:var(--red)}.remove:disabled{opacity:.5;cursor:wait}.empty{font-size:14px;color:var(--muted);padding-top:18px}.notice{font-size:14px;min-height:24px;margin:16px 0 0;overflow-wrap:anywhere}.notice.error{color:var(--red)}.notice.success{color:#2e6244}.loading{color:var(--muted);font-size:14px;padding:14px 0}.retry{border:0;background:none;font:inherit;color:var(--ink);padding:0;text-decoration:underline;text-underline-offset:4px;cursor:pointer}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}[hidden]{display:none!important}
  @media(max-width:760px){.shell{width:calc(100% - 40px)}.topbar{padding:24px 0;gap:16px}.brand{font-size:28px}.brand span{font-size:10px;margin-left:9px;padding-left:10px}.topnav{gap:16px;font-size:13px}main{padding:48px 0}.page-cards,.access-grid{grid-template-columns:1fr;gap:18px}.page-card{min-height:236px;padding:28px}.page-card h2{margin-top:32px}.panel{padding:24px}.intro{font-size:17px}.page-heading{margin-bottom:30px}}
  @media(max-width:420px){.topbar{align-items:flex-start}.topnav{flex-direction:column;gap:8px;align-items:flex-end}.member{gap:10px}.avatar{width:32px;height:32px}.member-email{font-size:13px}.remove{padding:7px 10px}.member-count{font-size:12px}}
  @media(prefers-reduced-motion:reduce){.page-card{transition:none}.page-card:hover{transform:none}}
`;

function layout({ title, nonce, navigation, content, script = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="referrer" content="same-origin">
  <title>${escapeHTML(title)} · Foam archive</title>
  <style nonce="${escapeHTML(nonce)}">${styles}</style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <a class="brand" href="/" aria-label="Foam archive home">foam<span>Archive</span></a>
      <nav class="topnav" aria-label="Archive navigation">${navigation}<a href="/logout">Sign out</a></nav>
    </header>
    <main id="main">${content}</main>
    <footer class="footer"><p>Foam · Private reference archive</p><p>Saved on 29 September 2026</p></footer>
  </div>
  ${script ? `<script nonce="${escapeHTML(nonce)}">${script}</script>` : ''}
</body>
</html>`;
}

export function renderDashboard({ email, isOwner, nonce }) {
  return layout({
    title: 'Your preserved pages',
    nonce,
    navigation: isOwner ? '<a href="/access">Manage access</a>' : '',
    content: `<div class="page-heading">
      <p class="eyebrow">Your saved pages · September 2026</p>
      <h1>Kept just as they were.</h1>
      <p class="intro">The Home and Managers pages, saved before combining them. A place to revisit the design, imagery and interactions whenever you need.</p>
      <p class="signed-in">Signed in as <strong>${escapeHTML(email)}</strong></p>
    </div>
    <nav class="page-cards" aria-label="Preserved pages">
      <a class="page-card" href="${ARCHIVE_BASE}">
        <span class="card-number">01 / HOME</span>
        <h2>Home</h2>
        <p>Return to the original homepage.</p>
        <span class="card-arrow">${arrow}</span>
      </a>
      <a class="page-card managers" href="${ARCHIVE_BASE}managers/">
        <span class="card-number">02 / MANAGERS</span>
        <h2>Managers</h2>
        <p>Revisit the page for talent managers.</p>
        <span class="card-arrow">${arrow}</span>
      </a>
    </nav>
    <p class="archive-note">These are preserved copies. Changes to the main website won’t change what’s saved here.</p>`,
  });
}

export function renderAccessDenied({ email, nonce }) {
  return layout({
    title: 'Access needed',
    nonce,
    navigation: '',
    content: `<div class="page-heading">
      <p class="eyebrow">Foam · Private archive</p>
      <h1>This archive is invite-only.</h1>
      <p class="intro">You’re signed in, but this email address hasn’t been given access yet. Ask the archive owner to add you, or sign in with an address that already has access.</p>
      <p class="signed-in">Signed in as <strong>${escapeHTML(email)}</strong></p>
    </div>
    <a class="button" href="/logout">Sign in with another email ${arrow}</a>`,
  });
}

const accessScript = `
(() => {
  'use strict';
  const form = document.getElementById('access-form');
  const input = document.getElementById('email');
  const addButton = document.getElementById('add-button');
  const addLabel = document.getElementById('add-label');
  const list = document.getElementById('members');
  const count = document.getElementById('member-count');
  const empty = document.getElementById('empty');
  const loading = document.getElementById('loading');
  const retry = document.getElementById('retry');
  const status = document.getElementById('status');
  let csrfToken = '';
  let busy = false;
  let ready = false;

  function message(text, type) {
    status.textContent = text;
    status.className = 'notice' + (type ? ' ' + type : '');
  }

  function setBusy(value) {
    busy = value;
    input.disabled = value || !ready;
    addButton.disabled = value || !ready;
    list.querySelectorAll('button').forEach((button) => { button.disabled = value; });
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken } : {}),
        ...options.headers,
      },
    });
    if (response.status === 401 || response.redirected) {
      ready = false;
      throw new Error('Your sign-in has expired. Refresh this page to sign in again.');
    }
    if (!response.headers.get('content-type')?.includes('application/json')) {
      ready = false;
      throw new Error('Please refresh this page to check your sign-in and try again.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'We couldn’t complete that change. Please try again.');
    return result;
  }

  function memberRow(email, isOwner) {
    const row = document.createElement('li');
    row.className = 'member' + (isOwner ? ' owner' : '');
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = email.slice(0, 1).toUpperCase();
    const info = document.createElement('div');
    info.className = 'member-info';
    const address = document.createElement('span');
    address.className = 'member-email';
    address.textContent = email;
    const role = document.createElement('span');
    role.className = 'member-role';
    role.textContent = isOwner ? 'Owner · can manage access' : 'Viewer · can explore the archive';
    info.append(address, role);
    row.append(avatar, info);
    if (!isOwner) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove access for ' + email);
      remove.disabled = busy;
      remove.addEventListener('click', () => removeMember(email, remove));
      row.append(remove);
    }
    return row;
  }

  async function refreshMembers() {
    const result = await request('/api/access');
    if (!Array.isArray(result.members) || typeof result.ownerEmail !== 'string') {
      throw new Error('We couldn’t load the access list. Please try again.');
    }
    const members = result.members.filter((member) => typeof member.email === 'string');
    members.sort((a, b) => a.email.localeCompare(b.email));
    const fragment = document.createDocumentFragment();
    fragment.append(memberRow(result.ownerEmail, true));
    members.forEach((member) => fragment.append(memberRow(member.email, false)));
    list.replaceChildren(fragment);
    count.textContent = (members.length + 1) + ((members.length + 1) === 1 ? ' person' : ' people');
    empty.hidden = members.length > 0;
  }

  async function refreshSession() {
    const session = await request('/api/session');
    if (!session.isOwner || typeof session.csrfToken !== 'string' || !session.csrfToken) {
      ready = false;
      throw new Error('Only the archive owner can manage access.');
    }
    csrfToken = session.csrfToken;
  }

  async function removeMember(email, button) {
    if (busy || !ready) return;
    setBusy(true);
    message('');
    button.textContent = 'Removing…';
    let saved = false;
    try {
      await refreshSession();
      await request('/api/access', { method: 'DELETE', body: JSON.stringify({ email }) });
      saved = true;
      await refreshMembers();
      message('Access removed for ' + email + '.', 'success');
    } catch (error) {
      message(saved ? 'Access was removed, but the list couldn’t refresh. Refresh the page to see the latest list.' : error.message, 'error');
      button.textContent = 'Remove';
    } finally {
      setBusy(false);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy || !ready || !form.reportValidity()) return;
    const email = input.value.trim().toLowerCase();
    if (!email) return;
    setBusy(true);
    addLabel.textContent = 'Adding access…';
    message('');
    let saved = false;
    try {
      await refreshSession();
      await request('/api/access', { method: 'POST', body: JSON.stringify({ email }) });
      saved = true;
      input.value = '';
      await refreshMembers();
      message('Access added for ' + email + '. Share the archive link with them to get started.', 'success');
    } catch (error) {
      message(saved ? 'Access was added, but the list couldn’t refresh. Refresh the page to see the latest list.' : error.message, 'error');
    } finally {
      addLabel.textContent = 'Add access';
      setBusy(false);
      if (ready) input.focus();
    }
  });

  async function load() {
    if (busy) return;
    ready = false;
    setBusy(true);
    loading.hidden = false;
    retry.hidden = true;
    message('');
    try {
      await refreshSession();
      await refreshMembers();
      ready = true;
    } catch (error) {
      message(error.message || 'We couldn’t load the access list. Please try again.', 'error');
      retry.hidden = false;
    } finally {
      loading.hidden = true;
      setBusy(false);
    }
  }
  retry.addEventListener('click', load);
  load();
})();
`;

export function renderAccessPage({ email, nonce }) {
  return layout({
    title: 'Manage access',
    nonce,
    navigation: '<a href="/">Saved pages</a><a href="/access" aria-current="page">Manage access</a>',
    content: `<div class="page-heading">
      <p class="eyebrow">Your archive · Your people</p>
      <h1>A little access control.</h1>
      <p class="intro">Choose who can visit your saved pages. You’re the owner, so only you can add or remove people.</p>
      <p class="signed-in">Signed in as <strong>${escapeHTML(email)}</strong></p>
    </div>
    <div class="access-grid">
      <section class="panel invite-panel" aria-labelledby="add-title">
        <h2 id="add-title">Let someone in.</h2>
        <p class="panel-copy">Add their email address, then share the archive link. They’ll sign in with a one-time code sent to their inbox.</p>
        <form id="access-form">
          <label for="email">Email address</label>
          <input id="email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" maxlength="254" placeholder="name@example.com" aria-describedby="email-help" required disabled>
          <button id="add-button" class="button" type="submit" disabled><span id="add-label">Add access</span>${arrow}</button>
        </form>
        <p id="email-help" class="help">Everyone you add can view the archive. They can’t change the pages or manage access.</p>
        <p id="status" class="notice" role="status" aria-live="polite" aria-atomic="true"></p>
        <button id="retry" type="button" class="retry" hidden>Try loading again</button>
      </section>
      <section class="panel" aria-labelledby="members-title">
        <div class="members-head"><h2 id="members-title">Who has access</h2><span id="member-count" class="member-count"></span></div>
        <p class="panel-copy">Remove someone whenever they no longer need access.</p>
        <p id="loading" class="loading" role="status">Loading the access list…</p>
        <ul id="members" class="members" aria-label="People with archive access"></ul>
        <p id="empty" class="empty" hidden>Just you for now. Add someone when you’re ready.</p>
      </section>
    </div>`,
    script: accessScript,
  });
}

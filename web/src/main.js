import { createClient } from '@supabase/supabase-js';
import './style.css';

// Same project and public key as the old app.html. The login session is shared with
// app.html because both pages run on the same website.
const sb = createClient(
  'https://oxylqwfnfclfrdztxehc.supabase.co',
  'sb_publishable_bKOLPHV4dzHdyhQZweIwBQ_zCxE8bN6'
);
const OWNER_EMAIL = 'aboobacker@easycorecut.com';
const $ = (id) => document.getElementById(id);
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const sar = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
let isOwner = false;

// Link into a screen of the old app. open = which "➕" form to open (1 = first).
function oldApp(tab, { open, q } = {}) {
  const p = new URLSearchParams({ tab });
  if (open) p.set('open', open);
  if (q) p.set('q', q);
  return '../app.html#' + p.toString();
}

// ---------- Sections (each task within 2 taps from Home) ----------
const SECTIONS = {
  work: {
    title: '🏗️ Work', cls: 't-work', hint: 'Jobs, orders, reports, customers',
    items: [
      { ico: '🏗️', name: 'Jobs', sub: 'All jobs, status, new job', href: () => oldApp('jobs') },
      { ico: '📑', name: 'Orders', sub: 'Quotations, POs, invoices', href: () => oldApp('orders') },
      { ico: '📋', name: 'Daily reports', sub: 'Read: by month, site, crew', href: () => '#daily' },
      { ico: '🏢', name: 'Customers', sub: 'Ledger by customer and mobile', href: () => oldApp('customers') },
    ],
  },
  money: {
    title: '💰 Money', cls: 't-money', hint: 'Payments and expenses', owner: true,
    items: [
      { ico: '💵', name: 'Payment received', sub: 'Add a customer payment', href: () => oldApp('money', { open: 1 }) },
      { ico: '🧾', name: 'Expense / scan invoice', sub: 'Add an expense with photo', href: () => oldApp('money', { open: 2 }) },
      { ico: '📒', name: 'Recent payments & expenses', sub: 'Latest 30 of each', href: () => oldApp('money') },
      { ico: '🏦', name: 'Bank', sub: 'Money in and out of the bank', href: () => '#bank' },
      { ico: '👛', name: 'Cash', sub: 'Cash collected and paid', href: () => '#cash' },
      { ico: '🧮', name: 'VAT invoices', sub: 'Sales and purchase invoices, VAT', href: () => '#vat' },
    ],
  },
  people: {
    title: '👷 People', cls: 't-people', hint: 'Staff list',
    items: [
      { ico: '👷', name: 'Staff', sub: 'Names, roles, phone', href: () => oldApp('staff') },
      { ico: '🕒', name: 'Attendance', sub: 'Coming soon', soon: true },
      { ico: '💳', name: 'Salary & payslips', sub: 'Coming soon (owner only)', soon: true },
    ],
  },
  assets: {
    title: '📦 Assets', cls: 't-assets', hint: 'Documents and expiry',
    items: [
      { ico: '📄', name: 'Documents', sub: 'Iqama, CR, licences, expiry', href: () => oldApp('docs') },
      { ico: '🛠️', name: 'Equipment & rental', sub: 'Coming soon', soon: true },
      { ico: '🚚', name: 'Vehicles', sub: 'Coming soon', soon: true },
    ],
  },
  reports: {
    title: '📊 Reports', cls: 't-reports', hint: 'Profit, incentive, food', owner: true, wide: true,
    items: [
      { ico: '📊', name: 'Month summary', sub: 'Profit, incentive, food allowance', href: () => oldApp('month') },
    ],
  },
};

function renderTiles() {
  const box = $('tiles');
  box.innerHTML = '';
  Object.entries(SECTIONS).forEach(([key, s]) => {
    if (s.owner && !isOwner) return;
    const b = document.createElement('button');
    b.className = 'tile ' + s.cls + (s.wide ? ' wide' : '');
    const [ico, ...name] = s.title.split(' ');
    b.innerHTML = '<span class="ico"></span><span><span class="name"></span><span class="hint"></span></span>';
    b.querySelector('.ico').textContent = ico;
    b.querySelector('.name').textContent = name.join(' ');
    b.querySelector('.hint').textContent = s.hint;
    b.querySelector('.name').style.display = b.querySelector('.hint').style.display = 'block';
    b.onclick = () => { location.hash = key; };
    box.appendChild(b);
  });
}

function renderSection(key) {
  const s = SECTIONS[key];
  $('secTitle').textContent = s.title;
  const menu = $('secMenu');
  menu.innerHTML = '';
  s.items.forEach((it) => {
    const a = document.createElement('a');
    a.className = 'mbtn' + (it.soon ? ' soon' : '');
    if (it.href) a.href = it.href();
    a.innerHTML = '<span class="ico"></span><span><span class="n"></span><small></small></span>';
    a.querySelector('.ico').textContent = it.ico;
    a.querySelector('.n').textContent = it.name;
    a.querySelector('small').textContent = it.sub;
    menu.appendChild(a);
  });
}

// Simple screen router: #work, #money, ... ; empty = Home
function route() {
  const key = location.hash.slice(1);
  const sec = SECTIONS[key] && (!SECTIONS[key].owner || isOwner) ? key : '';
  const view = VIEWS[key] && (isOwner || VIEWS[key].any) ? key : '';
  const pwd = key === 'password';
  $('home').hidden = !!(sec || view || pwd);
  $('section').hidden = !sec;
  $('view').hidden = !view;
  $('pwd').hidden = !pwd;
  if (pwd) { $('pwdForm').reset(); $('pwdUser').value = $('who').textContent; $('pwdMsg').textContent = ''; window.scrollTo(0, 0); }
  if (sec) { renderSection(sec); window.scrollTo(0, 0); }
  if (view) { openView(view); window.scrollTo(0, 0); }
}
window.addEventListener('hashchange', route);
$('back').onclick = () => { location.hash = ''; };
$('pBack').onclick = () => { location.hash = ''; };

// ---------- Change my own password (works only while logged in) ----------
$('pwdShow').onchange = () => { $('pwd1').type = $('pwd2').type = $('pwdShow').checked ? 'text' : 'password'; };
$('pwdForm').onsubmit = async (e) => {
  e.preventDefault();
  const m = $('pwdMsg'), a = $('pwd1').value, b = $('pwd2').value;
  m.className = 'msg';
  if (a.length < 8) { m.textContent = 'Use at least 8 characters.'; return; }
  if (a !== b) { m.textContent = 'The two passwords are not the same.'; return; }
  m.className = 'msg ok'; m.textContent = 'Please wait...';
  const { error } = await sb.auth.updateUser({ password: a });
  if (error) { m.className = 'msg'; m.textContent = 'Not saved: ' + error.message; return; }
  $('pwd1').value = $('pwd2').value = '';
  m.textContent = '✅ Password changed. Use the new password next time you log in.';
};
$('vBack').onclick = () => { location.hash = 'money'; };

// ---------- Owner-only money records (read only): Bank, Cash, VAT invoices ----------
const VIEWS = {
  daily: { title: '📋 Daily reports', table: 'daily_reports', date: 'report_date', any: true, daily: true },
  bank: { title: '🏦 Bank', table: 'bank_entries', date: 'entry_date' },
  cash: { title: '👛 Cash', table: 'cash_entries', date: 'entry_date' },
  vat: { title: '🧮 VAT invoices', table: 'vat_invoices', date: 'inv_date', vat: true },
};
const sar2 = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
let curView = '', viewRows = [];

async function openView(key) {
  const v = VIEWS[key];
  curView = key;
  $('vTitle').textContent = v.title;
  $('vBack').textContent = v.daily ? '← Home' : '← Money';
  $('vBack').onclick = () => { location.hash = v.daily ? '' : 'money'; };
  $('vQ').value = '';
  if (!v.month) {
    // start on the newest month that has records
    const { data } = await sb.from(v.table).select(v.date).order(v.date, { ascending: false }).limit(1);
    v.month = (data && data[0] ? data[0][v.date] : today()).slice(0, 7);
  }
  if (curView !== key) return;
  $('vMonth').value = v.month;
  loadView();
}

async function loadView() {
  const key = curView, v = VIEWS[key];
  const [y, m] = v.month.split('-').map(Number);
  const to = m === 12 ? (y + 1) + '-01-01' : y + '-' + String(m + 1).padStart(2, '0') + '-01';
  $('vList').textContent = 'Loading...';
  const { data, error } = await sb.from(v.table).select('*').gte(v.date, v.month + '-01').lt(v.date, to)
    .order(v.date, { ascending: false }).order('id', { ascending: false }).limit(1000);
  if (curView !== key) return;
  if (error) { $('vStats').innerHTML = ''; $('vList').textContent = 'Error: ' + error.message; return; }
  viewRows = data;
  renderView();
}

function stat(label, value, cls) {
  const d = document.createElement('div');
  d.innerHTML = '<b></b><span></span>';
  d.firstChild.textContent = value; d.lastChild.textContent = label;
  if (cls) d.firstChild.className = cls;
  return d;
}

function renderView() {
  const v = VIEWS[curView];
  const q = $('vQ').value.trim().toLowerCase();
  const rows = viewRows.filter((r) => !q || [r.note, r.party, r.inv_no, r.vat_no, r.type, r.site, r.team, r.machine, r.work_done, r.issues].some((x) => (x || '').toLowerCase().includes(q)));
  const sum = (list, f) => list.reduce((a, r) => a + Number(r[f] || 0), 0);
  const stats = $('vStats'); stats.innerHTML = '';
  if (v.daily) {
    const crew = new Set(rows.flatMap((r) => String(r.team || '').split(',').map((x) => x.trim()).filter(Boolean)));
    stats.appendChild(stat('Reports', rows.length));
    stats.appendChild(stat('Crew names', crew.size));
    stats.appendChild(stat('Expenses SAR', sar2(sum(rows, 'expenses_sar'))));
  } else if (v.vat) {
    const sales = rows.filter((r) => r.type === 'Sales'), buy = rows.filter((r) => r.type !== 'Sales');
    stats.appendChild(stat('Sales (incl. VAT)', sar(sum(sales, 'total'))));
    stats.appendChild(stat('Purchases & expenses', sar(sum(buy, 'total')), 'out'));
    stats.appendChild(stat('VAT on sales − VAT paid', sar2(sum(sales, 'vat') - sum(buy, 'vat'))));
  } else {
    const inn = sum(rows.filter((r) => r.kind === 'in'), 'amount'), out = sum(rows.filter((r) => r.kind === 'out'), 'amount');
    stats.appendChild(stat('In', sar(inn)));
    stats.appendChild(stat('Out', sar(out), 'out'));
    stats.appendChild(stat('In − Out', sar(inn - out), inn - out < 0 ? 'out' : ''));
  }
  const ul = $('vList'); ul.innerHTML = '';
  rows.forEach((r) => {
    const li = document.createElement('li');
    li.innerHTML = '<div class="vr"><span class="t"></span><b></b></div><div class="s"></div>';
    const isOut = v.vat ? r.type !== 'Sales' : r.kind === 'out';
    if (v.daily) {
      li.innerHTML = '<div class="vr"><span class="t"></span><b></b></div><div class="s"></div>';
      li.querySelector('.t').textContent = (r.site || 'Site not written');
      li.querySelector('b').textContent = r.quantity || '';
      li.querySelector('.s').textContent = [r.report_date, r.team, r.machine, r.work_done, r.issues ? 'Issue: ' + r.issues : ''].filter(Boolean).join(' · ');
      ul.appendChild(li);
      return;
    }
    li.querySelector('.t').textContent = v.vat ? (r.party || r.type) : (r.note || (isOut ? 'Out' : 'In'));
    const amt = li.querySelector('b');
    amt.textContent = (isOut ? '− ' : '+ ') + sar2(v.vat ? r.total : r.amount);
    if (isOut) amt.className = 'out';
    li.querySelector('.s').textContent = v.vat
      ? [r.inv_date, r.type, r.inv_no ? 'No. ' + r.inv_no : '', 'VAT ' + sar2(r.vat), r.note].filter(Boolean).join(' · ')
      : r.entry_date;
    ul.appendChild(li);
  });
  if (!rows.length) ul.textContent = q ? 'Nothing found in this month.' : 'No records in this month.';
  $('vCount').textContent = rows.length + ' record(s)';
}
$('vMonth').onchange = () => { if (curView && $('vMonth').value) { VIEWS[curView].month = $('vMonth').value; loadView(); } };
$('vQ').oninput = renderView;

// ---------- Quick-add buttons ----------
document.querySelectorAll('.qbtn').forEach((a) => {
  a.href = oldApp(a.dataset.go, { open: a.dataset.open });
});

// ---------- Home numbers ----------
async function loadNumbers() {
  const t = today();
  const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const [jobs, orders, docs] = await Promise.all([
    sb.from('jobs').select('id', { count: 'exact', head: true }).eq('job_date', t),
    sb.from('orders').select('id', { count: 'exact', head: true }).eq('kind', 'PO').not('status', 'in', '("Paid","Cancelled")'),
    sb.from('documents').select('name, holder, expiry_date').eq('archived', false).not('expiry_date', 'is', null).lte('expiry_date', in30).order('expiry_date'),
  ]);
  $('sJobs').textContent = jobs.error || jobs.count == null ? '–' : jobs.count;
  $('sOrders').textContent = orders.error || orders.count == null ? '–' : orders.count;
  const due = docs.error ? [] : docs.data;
  $('sDocs').textContent = docs.error ? '–' : due.length;

  const alerts = $('alerts');
  alerts.innerHTML = '';
  const expired = due.filter((d) => d.expiry_date < t);
  if (due.length) {
    const a = document.createElement('a');
    a.className = 'alert' + (expired.length ? ' bad' : '');
    a.href = oldApp('docs');
    const soon = due.length - expired.length;
    const list = (expired.length ? expired : due).slice(0, 3).map((d) => d.name + (d.holder ? ' (' + d.holder + ')' : '')).join(', ');
    a.textContent = (expired.length ? '⛔ Expired: ' + expired.length : '⚠️ Expiring in 30 days: ' + soon)
      + (expired.length && soon ? ' · Expiring soon: ' + soon : '') + ' — ' + list + ((expired.length || due.length) > 3 ? '…' : '');
    alerts.appendChild(a);
  }

  if (isOwner) {
    const m1 = t.slice(0, 7) + '-01';
    const [pay, exp] = await Promise.all([
      sb.from('payments').select('amount').gte('pay_date', m1),
      sb.from('expenses').select('amount').gte('exp_date', m1),
    ]);
    $('sIn').textContent = pay.error ? '–' : sar(pay.data.reduce((s, x) => s + Number(x.amount || 0), 0));
    $('sOut').textContent = exp.error ? '–' : sar(exp.data.reduce((s, x) => s + Number(x.amount || 0), 0));
  }
}

// ---------- Global search ----------
let searchTimer;
$('q').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(search, 350); });
async function search() {
  const raw = $('q').value.trim();
  const ul = $('results');
  if (raw.length < 2) { ul.hidden = true; ul.innerHTML = ''; return; }
  const q = raw.replace(/[%,()*]/g, ' ');
  const [c, j, o] = await Promise.all([
    sb.from('customers').select('id, company_name, phone, city').or(`company_name.ilike.%${q}%,phone.ilike.%${q}%,contact_person.ilike.%${q}%`).limit(6),
    sb.from('jobs').select('id, job_date, site_name, city, customers(company_name)').ilike('site_name', `%${q}%`).order('job_date', { ascending: false }).limit(5),
    sb.from('orders').select('id, kind, ref_no, project, customers(company_name)').or(`ref_no.ilike.%${q}%,project.ilike.%${q}%`).limit(5),
  ]);
  if (q !== $('q').value.trim().replace(/[%,()*]/g, ' ')) return; // a newer search started
  ul.innerHTML = '';
  const add = (kind, title, sub, href) => {
    const li = document.createElement('li');
    li.innerHTML = '<a><span class="k"></span><span class="t"></span><span class="s"></span></a>';
    li.querySelector('a').href = href;
    li.querySelector('.k').textContent = kind;
    li.querySelector('.t').textContent = title;
    li.querySelector('.s').textContent = sub || '';
    ul.appendChild(li);
  };
  (c.data || []).forEach((x) => add('Customer', x.company_name, [x.phone, x.city].filter(Boolean).join(' · '), oldApp('customers', { q: x.phone || x.company_name })));
  (j.data || []).forEach((x) => add('Job', x.site_name || 'Job', [x.job_date, x.customers && x.customers.company_name, x.city].filter(Boolean).join(' · '), oldApp('jobs', { q: x.site_name })));
  (o.data || []).forEach((x) => add(x.kind, (x.ref_no || '') + (x.project ? ' · ' + x.project : ''), x.customers && x.customers.company_name, oldApp('orders', { q: x.ref_no || x.project })));
  if (!ul.children.length) add('', 'Nothing found', 'Try a name, mobile number, site or order number', '#');
  ul.hidden = false;
}

// ---------- Login ----------
// ---------- Customer balances (owner only, read only) ----------
async function readAll(table, cols, filter) {
  let out = [];
  for (let from = 0; ; from += 1000) {
    let q = sb.from(table).select(cols).range(from, from + 999);
    if (filter) q = filter(q);
    const { data, error } = await q;
    if (error) throw error;
    out = out.concat(data);
    if (data.length < 1000) return out;
  }
}
let balRows = [], balFilter = 'owed';
const money = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function loadBalances() {
  try {
    const [cust, jobs, pays] = await Promise.all([
      readAll('customers', 'id, company_name, phone'),
      readAll('jobs', 'customer_id, total'),
      readAll('payments', 'customer_id, amount'),
    ]);
    const billed = {}, paid = {};
    jobs.forEach((j) => { if (j.customer_id) billed[j.customer_id] = (billed[j.customer_id] || 0) + Number(j.total || 0); });
    pays.forEach((p) => { if (p.customer_id) paid[p.customer_id] = (paid[p.customer_id] || 0) + Number(p.amount || 0); });
    balRows = cust.filter((c) => billed[c.id]).map((c) => {
      const b = billed[c.id] || 0, p = paid[c.id] || 0;
      const state = p >= b - 1 ? 'paid' : p > 0 ? 'part' : 'owed';
      return { name: c.company_name || '—', phone: c.phone || '', billed: b, paid: p, owe: Math.max(b - p, 0), state };
    });
    const count = (st) => balRows.filter((r) => r.state === st).length;
    $('bPaid').textContent = count('paid');
    $('bPart').textContent = count('part');
    $('bOwed').textContent = count('owed');
    const owed = balRows.reduce((a, r) => a + r.owe, 0);
    $('bTotals').textContent = 'Still owed in total: ' + money(owed) + ' SAR · customers with jobs: ' + balRows.length;
    renderBal();
  } catch (e) {
    $('bTotals').textContent = 'Could not load: ' + (e.message || e);
  }
}

function renderBal() {
  const q = $('bSearch').value.trim().toLowerCase();
  const list = balRows
    .filter((r) => r.state === balFilter)
    .filter((r) => !q || r.name.toLowerCase().includes(q) || r.phone.includes(q))
    .sort((a, b) => b.owe - a.owe || a.name.localeCompare(b.name));
  const ul = $('bList'); ul.innerHTML = '';
  document.querySelectorAll('.bal-tile').forEach((t) => t.classList.toggle('on', t.dataset.bal === balFilter));
  list.slice(0, 200).forEach((r) => {
    const li = document.createElement('li');
    li.innerHTML = '<span class="n"></span><span class="amt"></span>';
    li.querySelector('.n').textContent = r.name;
    const sub = document.createElement('span'); sub.className = 'm';
    sub.textContent = (r.phone ? r.phone + ' · ' : '') + 'billed ' + money(r.billed) + ' · paid ' + money(r.paid);
    li.querySelector('.n').appendChild(sub);
    li.querySelector('.amt').textContent = balFilter === 'paid' ? '✓' : money(balFilter === 'part' ? r.owe : r.owe);
    ul.appendChild(li);
  });
  if (!list.length) ul.textContent = 'No customers in this group.';
}
document.querySelectorAll('.bal-tile').forEach((t) => t.onclick = () => { balFilter = t.dataset.bal; renderBal(); });
$('bSearch').oninput = renderBal;

async function show() {
  const { data: { session } } = await sb.auth.getSession();
  $('login').hidden = !!session;
  $('home').hidden = $('section').hidden = $('view').hidden = $('pwd').hidden = !session;
  if (!session) return;
  $('who').textContent = session.user.email;
  // Role comes from the database (profiles). Email check is only a fallback.
  const { data: prof } = await sb.from('profiles').select('role').eq('user_id', session.user.id).maybeSingle();
  isOwner = prof ? prof.role === 'owner' : (session.user.email || '').toLowerCase() === OWNER_EMAIL;
  document.querySelectorAll('.owner-only').forEach((el) => { el.hidden = !isOwner; });
  renderTiles();
  route();
  loadNumbers();
  if (isOwner) loadBalances();
}

$('login').onsubmit = async (e) => {
  e.preventDefault();
  $('msg').className = 'msg ok';
  $('msg').textContent = 'Please wait...';
  const { error } = await sb.auth.signInWithPassword({ email: $('email').value.trim(), password: $('pass').value });
  $('msg').className = 'msg';
  $('msg').textContent = error ? 'Wrong email or password' : '';
  show();
};
$('btnOut').onclick = async () => { await sb.auth.signOut(); location.hash = ''; show(); };

show();

// ---------- Install as a phone app (PWA) ----------
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

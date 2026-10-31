/* Kola Real Negocios — prototipo funcional (sin backend).
 * Todo se guarda en localStorage para poder hacer la demo en un teléfono.
 * En producción, cada función de "store" se reemplaza por llamadas a la API.
 */
(function () {
  'use strict';

  // ---------- Datos de ejemplo (precios ficticios, solo demo) ----------
  const CATEGORIES = ['Todos', 'Gaseosas', 'Agua', 'Energizantes', 'Deportivas', 'Jugos'];
  const PRODUCTS = [
    { id: 'kr-roja-400', name: 'Kola Real Roja 400 ml', pack: 'Paca 12 und', cat: 'Gaseosas', price: 420, color: '#c8102e' },
    { id: 'kr-roja-2l', name: 'Kola Real Roja 2 L', pack: 'Paca 6 und', cat: 'Gaseosas', price: 510, color: '#c8102e' },
    { id: 'kr-roja-3l', name: 'Kola Real Roja 3 L', pack: 'Paca 4 und', cat: 'Gaseosas', price: 480, color: '#c8102e' },
    { id: 'kr-naranja-2l', name: 'Kola Real Naranja 2 L', pack: 'Paca 6 und', cat: 'Gaseosas', price: 510, color: '#f28c00' },
    { id: 'kr-uva-2l', name: 'Kola Real Uva 2 L', pack: 'Paca 6 und', cat: 'Gaseosas', price: 510, color: '#6b2c91' },
    { id: 'kr-limon-2l', name: 'Kola Real Limón 2 L', pack: 'Paca 6 und', cat: 'Gaseosas', price: 510, color: '#3aa335' },
    { id: 'kr-negra-2l', name: 'Kola Real Negra 2 L', pack: 'Paca 6 und', cat: 'Gaseosas', price: 510, color: '#3b2314' },
    { id: 'cielo-600', name: 'Agua Cielo 600 ml', pack: 'Paca 20 und', cat: 'Agua', price: 300, color: '#2a8fd6' },
    { id: 'cielo-galon', name: 'Agua Cielo Galón', pack: 'Paca 6 und', cat: 'Agua', price: 360, color: '#2a8fd6' },
    { id: 'volt-300', name: 'Volt Energizante 300 ml', pack: 'Paca 12 und', cat: 'Energizantes', price: 540, color: '#ffcd00' },
    { id: 'sporade-500', name: 'Sporade 500 ml', pack: 'Paca 12 und', cat: 'Deportivas', price: 600, color: '#0aa4a4' },
    { id: 'cifrut-500', name: 'Cifrut 500 ml', pack: 'Paca 12 und', cat: 'Jugos', price: 480, color: '#ff7a00' },
  ];

  const EQUIPMENT = [
    { id: 'freezer', name: 'Freezer / Nevera', ico: '🧊',
      problems: ['No enfría', 'Hace mucho ruido', 'Bota agua / gotea', 'No enciende', 'Puerta / goma dañada', 'Luz interna no sirve'] },
    { id: 'letrero', name: 'Letrero', ico: '🪧',
      problems: ['Luz apagada / no enciende', 'Dañado o roto', 'Desteñido', 'Se está cayendo', 'Necesito uno nuevo'] },
    { id: 'exhibidor', name: 'Exhibidor / Rack', ico: '🗄️',
      problems: ['Roto / doblado', 'Falta pieza', 'Necesito uno nuevo'] },
    { id: 'toldo', name: 'Toldo / Sombrilla', ico: '⛱️',
      problems: ['Roto', 'Desteñido', 'Necesito uno nuevo'] },
    { id: 'mesas', name: 'Mesas y sillas', ico: '🪑',
      problems: ['Rotas', 'Faltan unidades', 'Necesito más'] },
    { id: 'otro', name: 'Otro', ico: '❓',
      problems: ['Otro problema'] },
  ];

  const ORDER_STATUS = { pendiente: 'Pendiente', confirmado: 'Confirmado', en_proceso: 'En camino', entregado: 'Entregado', cancelado: 'Cancelado' };
  const REPORT_STATUS = { abierto: 'Abierto', tecnico_asignado: 'Técnico asignado', en_proceso: 'En reparación', resuelto: 'Resuelto' };

  // Número del distribuidor para enviar copia por WhatsApp (configurable).
  const DISTRIBUTOR_WHATSAPP = '18090000000';

  // ---------- Almacenamiento ----------
  const KEY = 'kr-negocios-v1';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  let db = Object.assign({ session: null, orders: [], reports: [], cart: {} }, load());
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { toast('No se pudo guardar (almacenamiento lleno). Intenta con una foto más pequeña.'); }
  }

  // ---------- Utilidades ----------
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => 'RD$ ' + Number(n).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (iso) => new Date(iso).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' });
  const now = () => new Date().toISOString();
  const nextId = (prefix, list) => prefix + '-' + String(list.length + 1001);
  const productById = (id) => PRODUCTS.find((p) => p.id === id);
  const equipById = (id) => EQUIPMENT.find((e) => e.id === id);

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 2600);
  }

  function waLink(text) {
    return 'https://wa.me/' + DISTRIBUTOR_WHATSAPP + '?text=' + encodeURIComponent(text);
  }

  // Reduce la foto para que quepa en localStorage.
  function compressImage(file, maxSide = 900) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.7));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ---------- Navegación ----------
  const CLIENT_TABS = [
    { id: 'pedir', label: 'Pedir', ico: '🛒' },
    { id: 'pedidos', label: 'Mis pedidos', ico: '📦' },
    { id: 'reportar', label: 'Reportar', ico: '🛠️' },
    { id: 'reportes', label: 'Mis reportes', ico: '📋' },
  ];
  const ADMIN_TABS = [
    { id: 'resumen', label: 'Resumen', ico: '📊' },
    { id: 'admin-pedidos', label: 'Pedidos', ico: '📦' },
    { id: 'admin-reportes', label: 'Reportes', ico: '🛠️' },
  ];
  let currentTab = null;
  let catFilter = 'Todos';
  let reportDraft = { equipment: null, problem: '', photo: null };

  function isAdmin() { return db.session && db.session.role === 'admin'; }

  function renderTabbar() {
    const tabs = isAdmin() ? ADMIN_TABS : CLIENT_TABS;
    const cartCount = Object.values(db.cart).reduce((a, b) => a + b, 0);
    $('#tabbar').innerHTML = tabs.map((t) => {
      const badge = t.id === 'pedir' && cartCount ? `<span class="badge">${cartCount}</span>` : '';
      return `<button data-tab="${t.id}" class="${t.id === currentTab ? 'active' : ''}"><span class="ico">${t.ico}</span>${t.label}${badge}</button>`;
    }).join('');
  }

  function go(tab) {
    currentTab = tab;
    renderTabbar();
    const views = {
      pedir: viewCatalog, pedidos: viewMyOrders, reportar: viewReportForm, reportes: viewMyReports,
      resumen: viewAdminSummary, 'admin-pedidos': viewAdminOrders, 'admin-reportes': viewAdminReports,
    };
    $('#view').innerHTML = '';
    (views[tab] || viewCatalog)();
    window.scrollTo(0, 0);
  }

  // ---------- Cliente: catálogo y carrito ----------
  function cartTotal() {
    return Object.entries(db.cart).reduce((sum, [id, q]) => sum + (productById(id) ? productById(id).price * q : 0), 0);
  }

  function viewCatalog() {
    const list = PRODUCTS.filter((p) => catFilter === 'Todos' || p.cat === catFilter);
    const count = Object.values(db.cart).reduce((a, b) => a + b, 0);
    $('#view').innerHTML = `
      <h2>Hacer pedido</h2>
      <div class="chips">${CATEGORIES.map((c) => `<button class="chip ${c === catFilter ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      ${list.map((p) => {
        const q = db.cart[p.id] || 0;
        return `<div class="card row">
          <div class="product-swatch" style="background:${p.color}">${esc(p.name.split(' ')[0].slice(0, 2).toUpperCase())}</div>
          <div class="grow">
            <div><strong>${esc(p.name)}</strong></div>
            <div class="muted small">${esc(p.pack)}</div>
            <div class="price">${money(p.price)}</div>
          </div>
          <div class="qty-box">
            <button class="btn qty" data-dec="${p.id}" aria-label="Quitar">−</button>
            <span>${q}</span>
            <button class="btn qty" data-inc="${p.id}" aria-label="Agregar">+</button>
          </div>
        </div>`;
      }).join('')}
      ${count ? `<div style="height:70px"></div>
      <div class="summary-bar"><div class="inner">
        <div class="grow"><div class="muted small">${count} paca(s)</div><strong>${money(cartTotal())}</strong></div>
        <button class="btn primary" style="width:auto" id="checkout">Revisar pedido</button>
      </div></div>` : ''}
    `;
  }

  function viewCheckout() {
    const items = Object.entries(db.cart).filter(([, q]) => q > 0);
    if (!items.length) return go('pedir');
    $('#view').innerHTML = `
      <h2>Confirmar pedido</h2>
      <div class="card">
        ${items.map(([id, q]) => { const p = productById(id); return `<div class="row between" style="margin:6px 0"><span>${q} × ${esc(p.name)}</span><span>${money(p.price * q)}</span></div>`; }).join('')}
        <hr style="border:0;border-top:1px solid var(--border)">
        <div class="row between"><strong>Total estimado</strong><strong>${money(cartTotal())}</strong></div>
      </div>
      <form id="order-form">
        <label>Día de entrega preferido
          <select name="day">
            <option>Próxima visita de ruta</option><option>Lo antes posible</option>
            <option>Lunes</option><option>Martes</option><option>Miércoles</option><option>Jueves</option><option>Viernes</option><option>Sábado</option>
          </select>
        </label>
        <label>Forma de pago
          <select name="payment"><option>Efectivo al recibir</option><option>Transferencia</option><option>Crédito (clientes aprobados)</option></select>
        </label>
        <label>Nota para el distribuidor (opcional)
          <textarea name="note" placeholder="Ej: entregar por la puerta de atrás"></textarea>
        </label>
        <button class="btn primary" type="submit">Enviar pedido</button>
      </form>
      <p><button class="btn ghost small" id="back-catalog">← Seguir comprando</button></p>
    `;
  }

  function submitOrder(form) {
    const items = Object.entries(db.cart).filter(([, q]) => q > 0).map(([id, q]) => {
      const p = productById(id);
      return { id, name: p.name, qty: q, price: p.price };
    });
    const order = {
      id: nextId('PED', db.orders),
      client: { ...db.session },
      items,
      total: items.reduce((s, i) => s + i.price * i.qty, 0),
      day: form.day.value,
      payment: form.payment.value,
      note: form.note.value.trim(),
      status: 'pendiente',
      createdAt: now(),
      history: [{ status: 'pendiente', at: now() }],
    };
    db.orders.unshift(order);
    db.cart = {};
    save();
    viewOrderSent(order);
    renderTabbar();
  }

  function viewOrderSent(order) {
    const text = `Pedido ${order.id} - ${order.client.business} (${order.client.code})\n` +
      order.items.map((i) => `• ${i.qty} × ${i.name}`).join('\n') +
      `\nTotal: ${money(order.total)}\nEntrega: ${order.day}\nPago: ${order.payment}` + (order.note ? `\nNota: ${order.note}` : '');
    $('#view').innerHTML = `
      <div class="card" style="text-align:center">
        <div style="font-size:48px">✅</div>
        <h2>¡Pedido enviado!</h2>
        <p>Tu número de pedido es <strong>${esc(order.id)}</strong>.<br>Te avisaremos cuando sea confirmado.</p>
        <a class="btn primary" style="display:block;text-decoration:none;margin-bottom:8px" target="_blank" rel="noopener" href="${waLink(text)}">Enviar copia por WhatsApp</a>
        <button class="btn ghost" data-tab="pedidos">Ver mis pedidos</button>
      </div>`;
  }

  function orderCard(o, admin) {
    return `<div class="card">
      <div class="row between">
        <strong>${esc(o.id)}</strong>
        <span class="status st-${o.status}">${ORDER_STATUS[o.status]}</span>
      </div>
      ${admin ? `<div><strong>${esc(o.client.business)}</strong> <span class="muted small">${esc(o.client.code)} · ${esc(o.client.phone)}</span></div>` : ''}
      <div class="muted small">${fmtDate(o.createdAt)} · Entrega: ${esc(o.day)} · ${esc(o.payment)}</div>
      <ul style="margin:8px 0;padding-left:18px">${o.items.map((i) => `<li>${i.qty} × ${esc(i.name)}</li>`).join('')}</ul>
      ${o.note ? `<div class="small">📝 ${esc(o.note)}</div>` : ''}
      <div class="row between" style="margin-top:8px">
        <strong>${money(o.total)}</strong>
        ${admin
          ? `<select data-order-status="${o.id}" style="width:auto;margin:0">${Object.entries(ORDER_STATUS).map(([k, v]) => `<option value="${k}" ${k === o.status ? 'selected' : ''}>${v}</option>`).join('')}</select>`
          : `<button class="btn ghost small" data-reorder="${o.id}">Repetir pedido</button>`}
      </div>
    </div>`;
  }

  function viewMyOrders() {
    const mine = db.orders.filter((o) => o.client.code === db.session.code);
    $('#view').innerHTML = `<h2>Mis pedidos</h2>` +
      (mine.length ? mine.map((o) => orderCard(o, false)).join('') : `<div class="empty">Aún no has hecho pedidos.</div>`);
  }

  // ---------- Cliente: reportar equipo ----------
  function viewReportForm() {
    const eq = reportDraft.equipment ? equipById(reportDraft.equipment) : null;
    $('#view').innerHTML = `
      <h2>Reportar un problema</h2>
      <p class="muted">¿Con qué equipo tienes el inconveniente?</p>
      <div class="equip-grid">
        ${EQUIPMENT.map((e) => `<button class="equip-btn ${reportDraft.equipment === e.id ? 'active' : ''}" data-equip="${e.id}"><span class="ico">${e.ico}</span>${esc(e.name)}</button>`).join('')}
      </div>
      ${eq ? `
      <form id="report-form">
        <label>¿Qué le pasa?
          <select name="problem" required>
            <option value="">Selecciona…</option>
            ${eq.problems.map((p) => `<option ${p === reportDraft.problem ? 'selected' : ''}>${esc(p)}</option>`).join('')}
          </select>
        </label>
        <label>Código / placa del equipo (si lo tiene)
          <input name="asset" placeholder="Ej: FRZ-00231">
        </label>
        <label>¿Qué tan urgente es?
          <select name="priority">
            <option value="normal">Normal</option>
            <option value="alta">Urgente (estoy perdiendo ventas / producto)</option>
          </select>
        </label>
        <label>Describe el problema
          <textarea name="description" placeholder="Ej: Desde ayer el freezer no enfría y los refrescos están calientes."></textarea>
        </label>
        <label>Foto (opcional)
          <input type="file" name="photo" accept="image/*" capture="environment">
        </label>
        ${reportDraft.photo ? `<img class="photo-preview" src="${reportDraft.photo}" alt="Foto del equipo">` : ''}
        <button class="btn primary" type="submit" style="margin-top:12px">Enviar reporte</button>
      </form>` : ''}
    `;
  }

  function submitReport(form) {
    const eq = equipById(reportDraft.equipment);
    const report = {
      id: nextId('REP', db.reports),
      client: { ...db.session },
      equipment: eq.id,
      equipmentName: eq.name,
      problem: form.problem.value,
      asset: form.asset.value.trim(),
      priority: form.priority.value,
      description: form.description.value.trim(),
      photo: reportDraft.photo,
      status: 'abierto',
      technician: '',
      createdAt: now(),
      history: [{ status: 'abierto', at: now() }],
    };
    db.reports.unshift(report);
    save();
    reportDraft = { equipment: null, problem: '', photo: null };
    const text = `Reporte ${report.id} - ${report.client.business} (${report.client.code})\n` +
      `Equipo: ${report.equipmentName}${report.asset ? ' [' + report.asset + ']' : ''}\nProblema: ${report.problem}\n` +
      `Urgencia: ${report.priority === 'alta' ? 'URGENTE' : 'Normal'}` + (report.description ? `\nDetalle: ${report.description}` : '');
    $('#view').innerHTML = `
      <div class="card" style="text-align:center">
        <div style="font-size:48px">🛠️</div>
        <h2>Reporte recibido</h2>
        <p>Número de reporte: <strong>${esc(report.id)}</strong>.<br>Un supervisor lo revisará y te asignará un técnico.</p>
        <a class="btn primary" style="display:block;text-decoration:none;margin-bottom:8px" target="_blank" rel="noopener" href="${waLink(text)}">Enviar copia por WhatsApp</a>
        <button class="btn ghost" data-tab="reportes">Ver mis reportes</button>
      </div>`;
  }

  function reportCard(r, admin) {
    return `<div class="card">
      <div class="row between">
        <strong>${equipById(r.equipment).ico} ${esc(r.id)}</strong>
        <span class="status st-${r.status}">${REPORT_STATUS[r.status]}</span>
      </div>
      ${admin ? `<div><strong>${esc(r.client.business)}</strong> <span class="muted small">${esc(r.client.code)} · ${esc(r.client.phone)}</span></div>` : ''}
      <div><strong>${esc(r.equipmentName)}</strong>: ${esc(r.problem)} ${r.priority === 'alta' ? '<span class="prio-alta">· URGENTE</span>' : ''}</div>
      ${r.asset ? `<div class="muted small">Equipo: ${esc(r.asset)}</div>` : ''}
      ${r.description ? `<p class="small" style="margin:6px 0">${esc(r.description)}</p>` : ''}
      ${r.photo ? `<img class="photo-preview" src="${r.photo}" alt="Foto del reporte">` : ''}
      ${r.technician ? `<div class="small">👷 Técnico: <strong>${esc(r.technician)}</strong></div>` : ''}
      <ul class="timeline">${r.history.map((h) => `<li>${REPORT_STATUS[h.status]} — ${fmtDate(h.at)}${h.note ? ' · ' + esc(h.note) : ''}</li>`).join('')}</ul>
      ${admin ? `<div class="row" style="margin-top:8px;flex-wrap:wrap">
        <select data-report-status="${r.id}" style="width:auto;margin:0">${Object.entries(REPORT_STATUS).map(([k, v]) => `<option value="${k}" ${k === r.status ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <button class="btn ghost small" data-assign="${r.id}">Asignar técnico</button>
      </div>` : ''}
    </div>`;
  }

  function viewMyReports() {
    const mine = db.reports.filter((r) => r.client.code === db.session.code);
    $('#view').innerHTML = `<h2>Mis reportes</h2>` +
      (mine.length ? mine.map((r) => reportCard(r, false)).join('') : `<div class="empty">No tienes reportes. ¡Qué bien! 🎉</div>`);
  }

  // ---------- Distribuidor / Supervisor ----------
  function viewAdminSummary() {
    const pend = db.orders.filter((o) => o.status === 'pendiente').length;
    const open = db.reports.filter((r) => r.status !== 'resuelto').length;
    const urgent = db.reports.filter((r) => r.status !== 'resuelto' && r.priority === 'alta').length;
    const byEquip = EQUIPMENT.map((e) => ({ e, n: db.reports.filter((r) => r.equipment === e.id && r.status !== 'resuelto').length })).filter((x) => x.n);
    const sales = db.orders.filter((o) => o.status !== 'cancelado').reduce((s, o) => s + o.total, 0);
    $('#view').innerHTML = `
      <h2>Resumen</h2>
      <div class="stats">
        <div class="stat"><b>${pend}</b><span class="small muted">Pedidos pendientes</span></div>
        <div class="stat"><b>${open}</b><span class="small muted">Reportes abiertos</span></div>
        <div class="stat"><b class="prio-alta">${urgent}</b><span class="small muted">Urgentes</span></div>
      </div>
      <div class="card"><div class="muted small">Total en pedidos (no cancelados)</div><strong style="font-size:20px">${money(sales)}</strong></div>
      <h3>Reportes abiertos por tipo de equipo</h3>
      ${byEquip.length ? byEquip.map((x) => `<div class="card row between"><span>${x.e.ico} ${esc(x.e.name)}</span><strong>${x.n}</strong></div>`).join('') : '<div class="empty">Sin reportes abiertos.</div>'}
      <p><button class="btn ghost small" id="export-csv">Descargar reportes (CSV)</button></p>
    `;
  }

  function viewAdminOrders() {
    $('#view').innerHTML = `<h2>Pedidos recibidos</h2>` +
      (db.orders.length ? db.orders.map((o) => orderCard(o, true)).join('') : `<div class="empty">No hay pedidos todavía.</div>`);
  }

  function viewAdminReports() {
    const sorted = [...db.reports].sort((a, b) =>
      (a.status === 'resuelto') - (b.status === 'resuelto') || (b.priority === 'alta') - (a.priority === 'alta'));
    $('#view').innerHTML = `<h2>Reportes de equipos</h2>` +
      (sorted.length ? sorted.map((r) => reportCard(r, true)).join('') : `<div class="empty">No hay reportes.</div>`);
  }

  function exportCsv() {
    const rows = [['id', 'fecha', 'negocio', 'codigo', 'telefono', 'equipo', 'placa', 'problema', 'urgencia', 'estado', 'tecnico', 'descripcion']];
    db.reports.forEach((r) => rows.push([r.id, r.createdAt, r.client.business, r.client.code, r.client.phone, r.equipmentName, r.asset, r.problem, r.priority, REPORT_STATUS[r.status], r.technician, r.description]));
    const csv = rows.map((row) => row.map((v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'reportes-equipos.csv';
    a.click();
  }

  // ---------- Eventos ----------
  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('button, [data-tab]');
    if (!t) return;
    const d = t.dataset;
    if (d.tab) return go(d.tab);
    if (d.cat) { catFilter = d.cat; return viewCatalog(); }
    if (d.inc) { db.cart[d.inc] = (db.cart[d.inc] || 0) + 1; save(); renderTabbar(); return viewCatalog(); }
    if (d.dec) {
      if (db.cart[d.dec]) { db.cart[d.dec]--; if (!db.cart[d.dec]) delete db.cart[d.dec]; }
      save(); renderTabbar(); return viewCatalog();
    }
    if (t.id === 'checkout') return viewCheckout();
    if (t.id === 'back-catalog') return go('pedir');
    if (t.id === 'export-csv') return exportCsv();
    if (t.id === 'logout') { db.session = null; save(); return start(); }
    if (d.reorder) {
      const o = db.orders.find((x) => x.id === d.reorder);
      db.cart = {};
      o.items.forEach((i) => { if (productById(i.id)) db.cart[i.id] = i.qty; });
      save(); toast('Productos agregados al carrito'); return go('pedir');
    }
    if (d.equip) { reportDraft = { equipment: d.equip, problem: '', photo: null }; return viewReportForm(); }
    if (d.assign) {
      const r = db.reports.find((x) => x.id === d.assign);
      const name = prompt('Nombre del técnico asignado:', r.technician || '');
      if (name && name.trim()) {
        r.technician = name.trim();
        r.status = 'tecnico_asignado';
        r.history.push({ status: 'tecnico_asignado', at: now(), note: r.technician });
        save(); viewAdminReports(); toast('Técnico asignado');
      }
    }
  });

  document.addEventListener('change', async (ev) => {
    const el = ev.target;
    if (el.dataset.orderStatus) {
      const o = db.orders.find((x) => x.id === el.dataset.orderStatus);
      o.status = el.value; o.history.push({ status: el.value, at: now() });
      save(); toast(`${o.id}: ${ORDER_STATUS[o.status]}`); return viewAdminOrders();
    }
    if (el.dataset.reportStatus) {
      const r = db.reports.find((x) => x.id === el.dataset.reportStatus);
      r.status = el.value; r.history.push({ status: el.value, at: now() });
      save(); toast(`${r.id}: ${REPORT_STATUS[r.status]}`); return viewAdminReports();
    }
    if (el.name === 'problem') reportDraft.problem = el.value;
    if (el.name === 'photo' && el.files && el.files[0]) {
      try {
        const form = el.form;
        const keep = { problem: form.problem.value, asset: form.asset.value, priority: form.priority.value, description: form.description.value };
        reportDraft.photo = await compressImage(el.files[0]);
        viewReportForm();
        const f = $('#report-form');
        f.problem.value = keep.problem; f.asset.value = keep.asset; f.priority.value = keep.priority; f.description.value = keep.description;
      } catch (e) { toast('No se pudo cargar la foto'); }
    }
  });

  document.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const f = ev.target;
    if (f.id === 'login-form') {
      db.session = {
        code: f.code.value.trim().toUpperCase(),
        business: f.business.value.trim(),
        phone: f.phone.value.trim(),
        role: f.role.value,
      };
      save(); return start();
    }
    if (f.id === 'order-form') return submitOrder(f);
    if (f.id === 'report-form') return submitReport(f);
  });

  function start() {
    if (!db.session) {
      $('#login').classList.remove('hidden');
      $('#app').classList.add('hidden');
      return;
    }
    $('#login').classList.add('hidden');
    $('#app').classList.remove('hidden');
    $('#biz-name').textContent = db.session.business;
    $('#biz-code').textContent = (isAdmin() ? 'Distribuidor · ' : 'Cliente · ') + db.session.code;
    go(isAdmin() ? 'resumen' : 'pedir');
  }

  start();
})();

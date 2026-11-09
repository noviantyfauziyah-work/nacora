import { loadAllData, escapeHtml } from './data-store.js';
import { renderAppShell } from './components/layout.js';
import { renderHomePage } from './pages/home.js';
import { renderFormPage, attachFormPageEvents } from './pages/form.js';
import { renderResultsPage, attachResultsPageEvents } from './pages/results.js';
import { renderDetailPage, attachDetailPageEvents } from './pages/detail.js';
import { renderMixPage, attachMixPageEvents } from './pages/mix.js';
import {
  renderBookletIndexPage,
  renderBookletGroupPage,
  attachBookletGroupEvents,
} from './pages/booklet.js';
import { renderAboutPage } from './pages/about.js';

function parseHash() {
  const rawHash = window.location.hash || '#/';
  const withoutHash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
  const [pathPart, queryPart = ''] = withoutHash.split('?');
  const path = pathPart.startsWith('/') ? pathPart : '/' + pathPart;
  const queryParams = new URLSearchParams(queryPart);
  return { path, queryParams, rawQuery: queryPart };
}

function renderNotFoundPage(path) {
  return `
    <div class="page-header">
      <h1 class="page-title">Halaman Tidak Ditemukan</h1>
      <p class="page-subtitle">Rute "${escapeHtml(path)}" tidak tersedia pada aplikasi NACORA.</p>
    </div>
    <div class="card">
      <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
    </div>
  `;
}

async function handleRouteChange() {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  try {
    const data = await loadAllData();
    const { path, queryParams } = parseHash();

    let contentHtml = '';
    let postRender = null;

    if (path === '/' || path === '') {
      contentHtml = renderHomePage();
    } else if (path === '/rekomendasi') {
      contentHtml = renderFormPage(data, queryParams);
      postRender = () => attachFormPageEvents();
    } else if (path === '/hasil') {
      contentHtml = renderResultsPage(data, queryParams);
      postRender = () => attachResultsPageEvents();
    } else if (path.startsWith('/bahan/')) {
      const materialId = decodeURIComponent(path.slice('/bahan/'.length));
      contentHtml = renderDetailPage(data, materialId);
      postRender = () => attachDetailPageEvents();
    } else if (path === '/mix') {
      contentHtml = renderMixPage(data, queryParams);
      postRender = () => attachMixPageEvents(data);
    } else if (path === '/booklet') {
      contentHtml = renderBookletIndexPage(data);
    } else if (path.startsWith('/booklet/')) {
      const groupName = decodeURIComponent(path.slice('/booklet/'.length));
      contentHtml = renderBookletGroupPage(data, groupName);
      postRender = () => attachBookletGroupEvents();
    } else if (path === '/tentang') {
      contentHtml = renderAboutPage(data);
    } else {
      contentHtml = renderNotFoundPage(path);
    }

    appEl.innerHTML = renderAppShell(path, contentHtml);
    if (postRender) postRender();
    window.scrollTo({ top: 0, behavior: 'instant' });
  } catch (err) {
    console.error('Gagal memuat aplikasi NACORA:', err);
    appEl.innerHTML = `
      <div class="main-content">
        <div class="card">
          <h1>Gagal Memuat Data</h1>
          <p>Pastikan berkas data di <code>public/data/</code> sudah tersedia melalui perintah <code>npm run data</code>.</p>
        </div>
      </div>
    `;
  }
}

window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('DOMContentLoaded', handleRouteChange);
if (document.readyState !== 'loading') {
  handleRouteChange();
}

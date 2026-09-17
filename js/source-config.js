(() => {
'use strict';

const CANONICAL_URL = 'data/source/faurgs_ifsc_questoes_integrais_stage4_linhas.json';
const VERSION_URL = 'data/source/version.json';
const LEGACY_URL = 'data/source/faurgs_ifsc_questoes_integrais_stage2.json';
const VERSION_KEY = 'faurgs.simulados.bank.version';
const CHECK_INTERVAL_MS = 60000;

function requestUrl(input) {
  if (typeof input === 'string') return input;
  if (typeof Request !== 'undefined' && input instanceof Request) return input.url;
  return String(input?.url || '');
}

function isLegacySource(input) {
  const url = requestUrl(input);
  return url === LEGACY_URL || url.endsWith('/' + LEGACY_URL) || url.endsWith('faurgs_ifsc_questoes_integrais_stage2.json');
}

function resolveSource(input) {
  return isLegacySource(input) ? CANONICAL_URL : input;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CANONICAL_URL, VERSION_URL, LEGACY_URL, isLegacySource, resolveSource };
}

if (typeof window === 'undefined' || typeof document === 'undefined') return;

const nativeFetch = window.fetch.bind(window);
window.FaurgsSource = {
  url: CANONICAL_URL,
  versionUrl: VERSION_URL,
  version: null
};

// Compatibilidade temporária com o motor v1: qualquer chamada ao antigo stage2
// é redirecionada para a fonte canônica stage4. Não há mais cópia stage4 -> stage2 no deploy.
window.fetch = function faurgsFetch(input, init = {}) {
  if (!isLegacySource(input)) return nativeFetch(input, init);
  const options = { ...init, cache: 'no-store' };
  if (typeof input === 'string') return nativeFetch(CANONICAL_URL, options);
  try {
    const replacement = new Request(CANONICAL_URL, input);
    return nativeFetch(replacement, options);
  } catch {
    return nativeFetch(CANONICAL_URL, options);
  }
};

function ensureStyle() {
  if (document.getElementById('faurgs-update-style')) return;
  const style = document.createElement('style');
  style.id = 'faurgs-update-style';
  style.textContent = `
    .faurgs-update-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:760px;margin:auto;padding:14px 16px;border-radius:16px;background:#2f2238;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.24);display:flex;gap:12px;align-items:center;justify-content:space-between;font:600 14px/1.35 system-ui,sans-serif}
    .faurgs-update-banner button{border:0;border-radius:999px;padding:9px 14px;background:#fff;color:#5b2c83;font-weight:800;white-space:nowrap;cursor:pointer}
    @media(max-width:560px){.faurgs-update-banner{align-items:flex-start;flex-direction:column}.faurgs-update-banner button{width:100%}}
  `;
  document.head.appendChild(style);
}

function showUpdateBanner(version) {
  if (document.getElementById('faurgs-update-banner')) return;
  ensureStyle();
  const banner = document.createElement('div');
  banner.id = 'faurgs-update-banner';
  banner.className = 'faurgs-update-banner';
  banner.setAttribute('role', 'status');
  banner.innerHTML = '<span>Há uma versão nova do banco FAURGS. Seu progresso está salvo.</span><button type="button">Atualizar agora</button>';
  banner.querySelector('button').addEventListener('click', () => {
    try { localStorage.setItem(VERSION_KEY, version); } catch {}
    location.reload();
  });
  document.body.appendChild(banner);
}

async function checkVersion() {
  try {
    const response = await nativeFetch(VERSION_URL, { cache: 'no-store' });
    if (!response.ok) return;
    const info = await response.json();
    const current = String(info.bank_version || info.version || '').trim();
    if (!current) return;
    window.FaurgsSource.version = current;

    let previous = '';
    try { previous = localStorage.getItem(VERSION_KEY) || ''; } catch {}
    if (!previous) {
      try { localStorage.setItem(VERSION_KEY, current); } catch {}
      return;
    }
    if (previous !== current) showUpdateBanner(current);
  } catch (error) {
    console.warn('[FAURGS] Não foi possível verificar a versão do banco:', error);
  }
}

function init() {
  checkVersion();
  setInterval(checkVersion, CHECK_INTERVAL_MS);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type === 'FAURGS_UPDATE') checkVersion();
    });
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
})();

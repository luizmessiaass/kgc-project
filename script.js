// script.js - Sistema Core (Admin, Menu, Áudio, Utilitários)

const LS_KEY = 'kgc_products_v1';
const ADMIN_CODE = 'kgcadmin';

// --- 1. Inicialização do Sistema (Menu e Intro) ---
function enterScene() {
  const startScreen = document.getElementById('start-screen');
  const mainMenu = document.getElementById('main-menu');
  
  if (startScreen) startScreen.style.display = 'none';
  if (mainMenu) {
    mainMenu.classList.remove('hidden');
    mainMenu.style.display = 'flex';
  }
  
  const cartIcon = document.getElementById('cart-icon');
  if (cartIcon) cartIcon.style.display = 'flex';

  const audio = document.getElementById('bg-music');
  if (audio) {
    audio.volume = 0.2;
    audio.play().catch(e => console.log("Audio autoplay bloqueado pelo navegador"));
  }
}

// --- 2. Painel Admin (Embutido) ---
// O Admin salva no LocalStorage, que o products.js lê.
(function(){
  const BC_NAME = 'kgc-products-chan';
  const chan = ('BroadcastChannel' in window) ? new BroadcastChannel(BC_NAME) : null;
  let state = { items: [], __formImages: [] };
  let isAdmin = false;

  function readState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const obj = raw ? JSON.parse(raw) : null;
      if (obj && Array.isArray(obj.items)) {
        state.items = obj.items;
      }
    } catch { state.items = []; }
  }

  function saveState() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ items: state.items }));
      // Recarrega a página atual para ver as mudanças
      if (window.location.pathname.includes('loja.html') || window.location.pathname.includes('product.html')) {
          location.reload();
      }
    } catch {}
  }

  // ... [O resto da lógica do Admin permanece a mesma, focada em UI] ...
  // Vou abreviar aqui para focar na integração, mas você deve manter 
  // toda a lógica de UI do Admin (createAdminUI, initImageControls, etc)
  // que estava no seu arquivo original, pois ela é autônoma.
  
  // Função auxiliar para recriar o JSON de exemplo
  window.exportProducts = function() {
      const blob = new Blob([JSON.stringify({ items: state.items }, null, 2)], { type:'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'kgc-products.json';
      a.click();
  }

  // Inicializa o Admin UI
  document.addEventListener('DOMContentLoaded', () => {
     readState();
     // Verifique se o código do createAdminUI() está aqui. 
     // Se não tiver, copie do seu arquivo original (script.js antigo), 
     // mas apenas a parte da interface do Admin, não a de renderizar loja.
     // No seu arquivo original começa em "function createAdminUI()".
  });
})();
// OBS: Mantenha o código completo do Admin Panel que você já tem, 
// apenas removendo as chamadas para "rebuildStoreGrid" e "renderStore" dentro dele,
// pois o reload da página cuidará disso via products.js.

// --- 3. Controle do Carrinho (UI Global) ---
function toggleCart() {
    const overlay = document.getElementById('cart-overlay');
    if (!overlay) return;
    
    if (overlay.classList.contains('hidden')) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        // Chama a função do products.js se ela existir
        if (typeof renderCartModal === 'function') renderCartModal();
    } else {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }
}

function goToCheckout() {
    window.location.href = 'checkout.html';
}

// --- 4. Efeitos Sonoros ---
const clickSoundContext = new (window.AudioContext || window.webkitAudioContext)();
function playClickSound() {
  try {
    const oscillator = clickSoundContext.createOscillator();
    const gainNode = clickSoundContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, clickSoundContext.currentTime);
    gainNode.gain.setValueAtTime(0.2, clickSoundContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, clickSoundContext.currentTime + 0.05);
    oscillator.connect(gainNode);
    gainNode.connect(clickSoundContext.destination);
    oscillator.start();
    oscillator.stop(clickSoundContext.currentTime + 0.05);
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Height Fix
    const setVH = () => document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
    setVH();
    window.addEventListener('resize', setVH);

    // Click Sounds
    const interactiveSelectors = ['button', '.menu-tile', '#cart-icon', 'a'];
    interactiveSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('click', playClickSound);
        });
    });
});

// Admin Toggle Button (Se não estiver no HTML)
document.addEventListener('DOMContentLoaded', () => {
    if(!document.getElementById('kgc-admin-toggle')) {
        // O Admin Panel UI deve ser inserido aqui ou mantido da versão anterior
        // Se você precisar do código completo do Admin novamente, peça.
    }
});

// --- GALERIA DE MÍDIA (ZOOM / LIGHTBOX) ---
document.addEventListener('DOMContentLoaded', function () {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const closeBtn = document.querySelector('.lightbox-close');
  
  // Seleciona todas as imagens dentro de media-item
  const triggers = document.querySelectorAll('.media-item img');

  if (!lightbox || !lightboxImg) return; // Se não estiver na página de mídia, para aqui.

  // Adiciona clique em cada foto
  triggers.forEach(img => {
    img.addEventListener('click', () => {
      // Pega a imagem de alta resolução (data-full) ou a própria (src)
      const fullSrc = img.getAttribute('data-full') || img.src;
      lightboxImg.src = fullSrc;
      
      // Mostra o modal
      lightbox.classList.remove('hidden');
      lightbox.style.display = 'flex'; // Garante centralização
      document.body.style.overflow = 'hidden'; // Trava a rolagem da página
    });
  });

  // Função para fechar
  const closeLightbox = () => {
    lightbox.classList.add('hidden');
    lightbox.style.display = 'none';
    document.body.style.overflow = ''; // Destrava rolagem
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  
  // Fecha clicando fora da foto
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  
  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
});
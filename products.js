// products.js - Motor da Loja (Renderização, Carrinho e Dados)

const LS_KEY_PRODUCTS = 'kgc_products_v1';

// --- 1. Carregamento Inteligente de Dados ---
async function loadProducts() {
  try {
    // 1. Tenta carregar do LocalStorage (Edições do Admin)
    const localData = localStorage.getItem(LS_KEY_PRODUCTS);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (parsed.items && parsed.items.length > 0) {
        // Filtra apenas os ativos
        return parsed.items.filter(p => p.active !== false);
      }
    }

    // 2. Se não tiver no Admin, carrega do JSON (Backup/Original)
    const res = await fetch('products/products.json');
    if (!res.ok) throw new Error("Erro ao carregar JSON");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Erro no loadProducts:", error);
    return [];
  }
}

// --- 2. Sistema de Carrinho ---
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Atualiza ícone flutuante
    const countElements = document.querySelectorAll('.cart-count');
    countElements.forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'flex' : 'none'; // Flex para centralizar texto
    });

    // Atualiza modal do carrinho se estiver aberto
    const overlay = document.getElementById('cart-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        renderCartModal();
    }
}

function renderCartModal() {
    const listEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!listEl || !totalEl) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    listEl.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        listEl.innerHTML = '<li style="text-align:center;">Carrinho vazio</li>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            const li = document.createElement('li');
            // Exibe: Produto (Tam | Cor) xQtd
            li.innerHTML = `
                <div>
                    <span>${item.name}</span><br>
                    <small style="color:#aaa;">${item.size} | ${item.color} (x${item.quantity})</small>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-btn" onclick="removeFromCart(${index})" style="width:auto; padding:5px 8px;">X</button>
                </div>
            `;
            listEl.appendChild(li);
        });
    }
    totalEl.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Função global para remover item
window.removeFromCart = function(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Inicializa contador
document.addEventListener('DOMContentLoaded', updateCartCount);

// --- 3. Renderização da Vitrine (Loja) ---
async function renderStore() {
  const container = document.getElementById('store');
  if (!container) return;

  const products = await loadProducts();
  
  if (products.length === 0) {
    container.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

  // Ordena por data de criação (mais novos primeiro)
  products.sort((a, b) => {
      if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
  });

  container.innerHTML = products.map(p => {
      let img = 'assets/placeholder.png';
      if (p.images && p.images.length > 0) img = p.images[0];
      else if (p.image) img = p.image;
      else img = `products/${p.slug}/${p.slug}_1.png`;

      return `
        <div class="product-card">
          <a href="product.html?slug=${p.slug}">
            <img src="${img}" alt="${p.name}" onerror="this.src='assets/placeholder.png'" />
            <h3>${p.name}</h3>
            <p>R$ ${Number(p.price).toFixed(2)}</p>
          </a>
        </div>`;
  }).join('');
    
  updateCartCount();
}

// --- 4. Renderização do Produto (Detalhes) ---
let slideIndex = 1;
let currentProduct = null;
let selectedColor = null;
let selectedSize = null;

async function renderProduct() {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  
  createRetroPopup(); // Cria o HTML do popup (escondido)
  updateCartCount();

  if (!slug) return;

  const products = await loadProducts();
  const p = products.find(x => x.slug === slug);
  if (!p) {
      const detail = document.getElementById('product-detail');
      if(detail) detail.innerHTML = "<h2>Produto não encontrado.</h2><a href='loja.html'>Voltar</a>";
      return;
  }

  currentProduct = p;

  // Preenche textos
  if(document.getElementById('p-name')) document.getElementById('p-name').textContent = p.name;
  if(document.getElementById('p-price')) document.getElementById('p-price').textContent = `R$ ${Number(p.price).toFixed(2)}`;
  if(document.getElementById('p-desc')) document.getElementById('p-desc').textContent = p.description;

  // Preço Original e Desconto
  const originalPriceEl = document.getElementById('product-original-price');
  const discountBadgeEl = document.getElementById('product-discount-badge');
  
  if (p.original_price && Number(p.original_price) > Number(p.price)) {
      if(originalPriceEl) originalPriceEl.textContent = `R$ ${Number(p.original_price).toFixed(2)}`;
      if(discountBadgeEl) {
          const discount = 1 - (p.price / p.original_price);
          discountBadgeEl.textContent = `-${Math.round(discount * 100)}%`;
      }
  }

  // CORES
  const colorContainer = document.getElementById('color-options');
  if (colorContainer) {
    let colorsList = Array.isArray(p.colors) ? p.colors : (p.colors ? p.colors.split(',') : []);
    colorsList = colorsList.map(c => c.trim()).filter(Boolean);

    if (colorsList.length === 0) {
        colorContainer.innerHTML = '<span style="font-size:0.7rem; color:#777;">Única</span>';
        selectedColor = "Padrão"; 
    } else {
        selectedColor = null; 
        colorContainer.innerHTML = colorsList.map(color => 
            `<button class="option-btn color-btn" onclick="selectColor(this, '${color}')">${color}</button>`
        ).join('');
    }
  }

  // TAMANHOS
  const sizeContainer = document.getElementById('size-options');
  if (sizeContainer) {
    let sizesList = Array.isArray(p.sizes) ? p.sizes : (p.sizes ? p.sizes.split(',') : []);
    sizesList = sizesList.map(s => s.trim()).filter(Boolean);

    if (sizesList.length === 0) {
        sizeContainer.innerHTML = '<span style="font-size:0.7rem; color:#777;">Único</span>';
        selectedSize = "Único"; 
    } else {
        selectedSize = null;
        sizeContainer.innerHTML = sizesList.map(size => 
            `<button class="option-btn size-btn" onclick="selectSize(this, '${size}')">${size}</button>`
        ).join('');
    }
  }

  // Botão Adicionar
  const btnCart = document.getElementById('add-to-cart-btn');
  if (btnCart) {
      const newBtn = btnCart.cloneNode(true);
      btnCart.parentNode.replaceChild(newBtn, btnCart);
      newBtn.addEventListener('click', handleAddToCart);
  }

  renderCarousel(p);
}

// --- 5. Interação (Seleção e Adição) ---

window.selectColor = function(btn, value) {
    const container = document.getElementById('color-options');
    const buttons = container.getElementsByClassName('option-btn');
    for (let b of buttons) b.classList.remove('selected');
    btn.classList.add('selected');
    selectedColor = value;
}

window.selectSize = function(btn, value) {
    const container = document.getElementById('size-options');
    const buttons = container.getElementsByClassName('option-btn');
    for (let b of buttons) b.classList.remove('selected');
    btn.classList.add('selected');
    selectedSize = value;
}

function handleAddToCart() {
    if (!selectedSize) { showNotification("Selecione um tamanho!", true); return; }
    if (!selectedColor) { showNotification("Selecione uma cor!", true); return; }

    const cartItem = {
        id: `${currentProduct.slug}-${selectedSize}-${selectedColor}`,
        name: currentProduct.name,
        price: Number(currentProduct.price),
        slug: currentProduct.slug,
        image: (currentProduct.images && currentProduct.images.length > 0) ? currentProduct.images[0] : 'assets/placeholder.png',
        color: selectedColor,
        size: selectedSize,
        quantity: 1
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.id === cartItem.id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification("ITEM ADICIONADO AO INVENTÁRIO!");
}

// --- 6. Popup Retro (CENTRALIZADO) ---
function createRetroPopup() {
    if (document.getElementById('retro-notification')) return;
    
    // CSS Inline para garantir centralização
    const popupHtml = `
        <div id="retro-notification" style="
            display:none; 
            position:fixed; 
            top:50%; 
            left:50%; 
            transform:translate(-50%, -50%); 
            background:#111; 
            border:2px solid #f5c542; 
            padding:25px; 
            z-index:9999; 
            flex-direction:column; 
            gap:20px; 
            width: 90%;
            max-width:350px;
            box-shadow: 0 0 30px rgba(0,0,0,0.9);
            text-align: center;
        ">
            <p id="retro-msg" style="
                font-family:'Press Start 2P'; 
                font-size:0.8rem; 
                margin:0; 
                line-height:1.6;
                color: #f5c542;
            "></p>
            <button onclick="document.getElementById('retro-notification').style.display='none'" style="
                width:100%; 
                padding:12px; 
                background:#f5c542; 
                color:#000; 
                border:none; 
                font-family:'Press Start 2P'; 
                cursor:pointer;
                text-transform: uppercase;
                font-weight: bold;
            ">OK</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHtml);
}

function showNotification(msg, isError = false) {
    const popup = document.getElementById('retro-notification');
    const txt = document.getElementById('retro-msg');
    
    // Se o popup não existir, cria ele agora
    if(!popup) {
        createRetroPopup();
        setTimeout(() => showNotification(msg, isError), 100);
        return;
    }

    txt.textContent = msg;
    txt.style.color = isError ? '#ff5555' : '#f5c542';
    popup.style.display = 'flex';
}

// --- 7. Carrossel ---
function renderCarousel(p) {
    let gallery = document.getElementById('p-gallery');
    if (!gallery) return;

    let images = [];
    if (p.images && p.images.length > 0) {
        images = p.images;
    } else {
        for(let i=1; i<=5; i++) images.push(`products/${p.slug}/${p.slug}_${i}.png`);
    }

    slideIndex = 1;
    let html = `<div class="carousel-container">`;
    
    images.forEach((img, idx) => {
        const display = idx === 0 ? 'block' : 'none';
        const activeClass = idx === 0 ? 'active' : '';
        html += `
            <div class="carousel-item fade ${activeClass}" style="display:${display}">
                <img src="${img}" 
                     style="cursor: zoom-in;" 
                     onclick="openZoom('${img}')"
                     onerror="this.style.display='none'"> 
            </div>`;
    });

    html += `<a class="prev" onclick="plusSlides(-1)">&#10094;</a><a class="next" onclick="plusSlides(1)">&#10095;</a></div>`;
    gallery.innerHTML = html;
}

window.plusSlides = function(n) {
    let slides = document.getElementsByClassName("carousel-item");
    if (slides.length === 0) return;
    
    slides[slideIndex - 1].style.display = "none"; 
    slides[slideIndex - 1].classList.remove("active");
    
    slideIndex += n;
    
    if (slideIndex > slides.length) slideIndex = 1;
    if (slideIndex < 1) slideIndex = slides.length;
    
    slides[slideIndex - 1].style.display = "block"; 
    slides[slideIndex - 1].classList.add("active");
}

window.openZoom = function(src) {
    const modal = document.getElementById('img-zoom-modal');
    const target = document.getElementById('img-zoom-target');
    if(modal && target) {
        target.src = src;
        modal.style.display = 'block';
    }
}
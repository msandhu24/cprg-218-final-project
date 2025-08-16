const headerEl = document.querySelector('.header');
const searchBox = document.querySelector('.search-box');
const searchIcon = document.getElementById('search-icon');
const menuIcon = document.getElementById('menu-icon');
const navList = document.querySelector('nav ul');

window.addEventListener('scroll', () => {
  headerEl?.classList.toggle('shadow', window.scrollY > 0);
  searchBox?.classList.remove('active');
  navList?.classList.remove('active');
});

searchIcon?.addEventListener('click', () => {
  searchBox?.classList.toggle('active');
  navList?.classList.remove('active');
});

menuIcon?.addEventListener('click', () => {
  navList?.classList.toggle('active');
  searchBox?.classList.remove('active');
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      navList?.classList.remove('active');
      searchBox?.classList.remove('active');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

(function markActiveNav() {
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const links = document.querySelectorAll('nav a');
  links.forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href.endsWith(path)) a.classList.add('active');
  });
})();

const CART_KEY = 'sandhu_cart_v1';

const cartToggle = document.getElementById('cart-toggle');
const cartPanel  = document.getElementById('cart-panel');
const cartClose  = document.getElementById('cart-close');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartCountEl = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');


const cartPageItems = document.getElementById('cartpage-items');
const cartPageSubtotal = document.getElementById('cartpage-subtotal');
const cartPageTax = document.getElementById('cartpage-tax');
const cartPageShip = document.getElementById('cartpage-ship');
const cartPageTotal = document.getElementById('cartpage-total');
const placeOrderBtn = document.getElementById('place-order'); 

let cart = [];

function loadCart() {
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { cart = []; }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateBadge();
  renderCartPanel();
  renderCartPage();
}
function formatCurrency(n) { return `$${n.toFixed(2)}`; }
function updateBadge() {
  const count = cart.reduce((n, item) => n + item.qty, 0);
  if (cartCountEl) cartCountEl.textContent = count;
}

function openCart() {
  cartPanel?.classList.add('open');
  cartBackdrop?.classList.add('show');
  cartPanel?.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  cartPanel?.classList.remove('open');
  cartBackdrop?.classList.remove('show');
  cartPanel?.setAttribute('aria-hidden', 'true');
}

cartToggle?.addEventListener('click', openCart);
cartClose?.addEventListener('click', closeCart);
cartBackdrop?.addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

function addToCart(item) {
  const existing = cart.find(p => p.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart();
}
function removeFromCart(id) {
  cart = cart.filter(p => p.id !== id);
  saveCart();
}
function changeQty(id, delta) {
  const p = cart.find(x => x.id === id);
  if (!p) return;
  p.qty += delta;
  if (p.qty <= 0) removeFromCart(id);
  saveCart();
}

function renderCartPanel() {
  if (!cartItemsEl || !cartTotalEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="empty-msg">Your cart is empty.</p>`;
    cartTotalEl.textContent = '$0.00';
    return;
  }

  const frag = document.createDocumentFragment();
  let total = 0;

  cart.forEach(({ id, title, price, img, qty }) => {
    total += price * qty;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${img}" alt="${title}">
      <div>
        <h4>${title}</h4>
        <div class="price">${formatCurrency(price)}</div>
        <div class="qty">
          <button data-act="dec" data-id="${id}">-</button>
          <span>${qty}</span>
          <button data-act="inc" data-id="${id}">+</button>
        </div>
        <button class="remove-btn" data-act="remove" data-id="${id}">Remove</button>
      </div>
      <div><strong>${formatCurrency(price * qty)}</strong></div>
    `;
    frag.appendChild(row);
  });

  cartItemsEl.innerHTML = '';
  cartItemsEl.appendChild(frag);
  cartTotalEl.textContent = formatCurrency(total);
}

cartItemsEl?.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const act = btn.getAttribute('data-act');
  if (act === 'inc') changeQty(id, +1);
  if (act === 'dec') changeQty(id, -1);
  if (act === 'remove') removeFromCart(id);
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.products-container .content a');
  if (!btn) return;

  if (btn.textContent.trim().toLowerCase() === 'view') return;

  e.preventDefault();
  const box = btn.closest('.box');
  if (!box) return;

  const title = (box.querySelector('h3')?.textContent || 'Product').trim();
  const priceText = (box.querySelector('.content span')?.textContent || '$0').replace(/[^0-9.]/g, '');
  const price = parseFloat(priceText) || 0;
  const img = box.querySelector('img')?.getAttribute('src') || '';

  const id = title.toLowerCase().replace(/\s+/g, '-') + '-' + price;
  addToCart({ id, title, price, img });

  openCart();
});

function renderCartPage() {
  if (!cartPageItems || !cartPageSubtotal || !cartPageTax || !cartPageShip || !cartPageTotal) return;

  cartPageItems.innerHTML = '';
  let subtotal = 0;

  if (cart.length === 0) {
    cartPageItems.innerHTML = `<p class="empty-msg">Your cart is empty.</p>`;
  } else {
    const frag = document.createDocumentFragment();
    cart.forEach(({ id, title, price, img, qty }) => {
      subtotal += price * qty;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${img}" alt="${title}">
        <div>
          <h4>${title}</h4>
          <div class="price">${formatCurrency(price)}</div>
          <div class="qty">
            <button data-act="dec" data-id="${id}">-</button>
            <span>${qty}</span>
            <button data-act="inc" data-id="${id}">+</button>
          </div>
          <button class="remove-btn" data-act="remove" data-id="${id}">Remove</button>
        </div>
        <div><strong>${formatCurrency(price * qty)}</strong></div>
      `;
      frag.appendChild(row);
    });
    cartPageItems.appendChild(frag);
  }

  const tax = subtotal * 0.05;           
  const ship = subtotal > 60 || subtotal === 0 ? 0 : 6.99; 
  const total = subtotal + tax + ship;

  cartPageSubtotal.textContent = formatCurrency(subtotal);
  cartPageTax.textContent = formatCurrency(tax);
  cartPageShip.textContent = formatCurrency(ship);
  cartPageTotal.textContent = formatCurrency(total);
}

cartPageItems?.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const act = btn.getAttribute('data-act');
  if (act === 'inc') changeQty(id, +1);
  if (act === 'dec') changeQty(id, -1);
  if (act === 'remove') removeFromCart(id);
});

loadCart();
updateBadge();
renderCartPanel();
renderCartPage();




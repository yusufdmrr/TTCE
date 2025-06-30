const API_BASE = "https://ttce.onrender.com/api/v1/clean/admin";
const productContainer = document.getElementById("productContainer");
const categoryList = document.getElementById("categoryList");

function getJWTFromCookie() {
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  return match ? match[2] : null;
}

async function getAllProducts() {
  const response = await axios.post(`${API_BASE}/getAllProducts`, {}, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getJWTFromCookie(),
    },
  });
  return response.data;
}

async function getProductsByCategory(categoryId) {
  const response = await axios.post(`${API_BASE}/getProductsByCategory`, { categoryId }, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getJWTFromCookie(),
    },
  });
  return response.data;
}

async function getAllCategories() {
  const response = await axios.post(`${API_BASE}/getAllCategories`, {}, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getJWTFromCookie(),
    },
  });
  return response.data;
}

async function loadProducts(categoryId = null, bestSeller = false) {
  try {
    let products = categoryId
      ? await getProductsByCategory(categoryId)
      : await getAllProducts();

    if (bestSeller) products.sort((a, b) => a.stock - b.stock);

    renderProducts(products);
  } catch (err) {
    console.error("Ürünler yüklenemedi:", err);
    productContainer.innerHTML =
      "<p class='text-danger text-center'>Ürünler yüklenirken bir hata oluştu.</p>";
  }
}

function renderProducts(products) {
  productContainer.innerHTML = "";

  if (products.length === 0) {
    productContainer.innerHTML = "<p class='text-center'>Ürün bulunamadı.</p>";
    return;
  }

  products.forEach((product) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    const imageUrl = `https://ttce.onrender.com/${product.image}`;

    col.innerHTML = `
      <div class="card h-100 shadow product-card">
        <img src="${imageUrl}" class="card-img-top product-image" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description}</p>
          <h6 class="text-success">${product.price}₺</h6>
          <button onclick="addToCart('${product._id}')" class="btn btn-sm btn-primary">Sepete Ekle</button>
        </div>
      </div>
    `;

    productContainer.appendChild(col);
  });
}

// Sepete ekleme
function addToCart(productId) {
  const userId = localStorage.getItem("userId") || "guest";
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");

  if (!cart[userId]) cart[userId] = {};
  if (!cart[userId][productId]) cart[userId][productId] = 1;
  else cart[userId][productId]++;

  localStorage.setItem("cart", JSON.stringify(cart));

  Swal.fire({
    title: "Sepete Eklendi!",
    icon: "success",
    timer: 1500,
    showConfirmButton: false
  });
}
window.addToCart = addToCart;

// Kategori yükleme
async function loadCategories() {
  try {
    const categories = await getAllCategories();
    categoryList.innerHTML = `<button class="btn btn-outline-dark m-1" onclick="loadProducts()">Tümü</button>`;

    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-primary m-1";
      btn.innerText = cat.name;
      btn.onclick = () => loadProducts(cat._id);
      categoryList.appendChild(btn);
    });
  } catch (err) {
    console.error("Kategoriler yüklenemedi:", err);
    categoryList.innerHTML = "<p class='text-danger text-center'>Kategori yüklenemedi.</p>";
  }
}

// Giriş durumuna göre butonları güncelle
function updateAuthButtons() {
  const token = getJWTFromCookie();
  const userId = localStorage.getItem("userId");
  const authContainer = document.getElementById("authButtons");

  if (token && userId) {
    authContainer.innerHTML = `
      <a href="account.html" class="btn btn-outline-light btn-sm mr-2"><i class="fas fa-user"></i> Hesabım</a>
      <button onclick="logout()" class="btn btn-outline-danger btn-sm"><i class="fas fa-sign-out-alt"></i> Çıkış</button>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="register.html" class="btn btn-outline-success btn-sm mr-2">Kayıt Ol</a>
      <a href="login.html" class="btn btn-outline-light btn-sm">Giriş Yap</a>
    `;
  }
}

function logout() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  localStorage.removeItem("userId");
  Swal.fire({
    icon: "info",
    title: "Çıkış Yapıldı",
    showConfirmButton: false,
    timer: 1200
  }).then(() => {
    window.location.href = "index.html";
  });
}

document.getElementById("filterBestSeller").addEventListener("click", () => {
  loadProducts(null, true);
});

window.onload = () => {
  updateAuthButtons();
  loadCategories();
  loadProducts();
};

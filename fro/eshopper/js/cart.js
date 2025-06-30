const cart = JSON.parse(localStorage.getItem("cart") || "{}");
const userId = localStorage.getItem("userId") || "guest";
const cartItemsContainer = document.getElementById("cartItems");
const totalPriceElement = document.getElementById("totalPrice");

async function loadCartDetails() {
  if (!cart[userId] || Object.keys(cart[userId]).length === 0) {
    cartItemsContainer.innerHTML = '<tr><td colspan="5" class="text-center">Sepet boş</td></tr>';
    totalPriceElement.innerText = "0₺";
    return;
  }

  try {
    const res = await axios.post("http://localhost:3001/api/v1/clean/admin/getAllProducts", {});
    const allProducts = res.data;
    let html = "", total = 0;

    Object.keys(cart[userId]).forEach(pid => {
      const product = allProducts.find(p => p._id === pid);
      if (!product) return;
      const qty = cart[userId][pid];
      const subtotal = qty * product.price;
      total += subtotal;

      html += `
        <tr>
          <td><img src="http://localhost:3001/${product.image}" class="product-img"> ${product.name}</td>
          <td>
            <button class="btn btn-sm btn-outline-secondary me-1" onclick="decreaseQty('${pid}')">-</button>
            ${qty}
            <button class="btn btn-sm btn-outline-secondary ms-1" onclick="increaseQty('${pid}')">+</button>
          </td>
          <td>${product.price}₺</td>
          <td>${subtotal}₺</td>
          <td><button class="btn btn-sm btn-danger" onclick="removeItem('${pid}')"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    });

    cartItemsContainer.innerHTML = html;
    totalPriceElement.innerText = total + "₺";
  } catch (err) {
    console.error("Sepet yüklenemedi:", err);
    Swal.fire("Hata", "Ürünler yüklenemedi", "error");
  }
}

function removeItem(pid) {
  delete cart[userId][pid];
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartDetails();
}

function increaseQty(pid) {
  cart[userId][pid]++;
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartDetails();
}

function decreaseQty(pid) {
  if (cart[userId][pid] > 1) cart[userId][pid]--;
  else delete cart[userId][pid];
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartDetails();
}

document.getElementById("continueShoppingBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  const token = document.cookie.match(/(^| )token=([^;]+)/);
  if (token) {
    // ✅ Giriş yapmış kullanıcılar ödeme sayfasına yönlendirilsin
    window.location.href = "checkout.html";
  } else {
    // 🚫 Giriş yapılmamışsa modal aç
    const modal = new bootstrap.Modal(document.getElementById("guestOrderModal"));
    modal.show();
  }
});

document.getElementById("guestOrderForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("guestName").value.trim();
  const email = document.getElementById("guestEmail").value.trim();
  const phone = document.getElementById("guestPhone").value.trim();
  const address = document.getElementById("guestAddress").value.trim();

  const products = Object.entries(cart["guest"] || {}).map(([productId, quantity]) => ({
    productId, quantity
  }));

  try {
    const res = await axios.post("http://localhost:3001/api/v1/clean/admin/guestOrder", {
      name, email, phone, address, products
    });

    if (res.data.success) {
      Swal.fire("Başarılı", "Siparişiniz alındı", "success");
      localStorage.removeItem("cart");
      setTimeout(() => window.location.href = "index.html", 1500);
    } else {
      Swal.fire("Hata", res.data.message || "Sipariş alınamadı", "error");
    }
  } catch (err) {
    console.error("Guest sipariş hatası:", err);
    Swal.fire("Hata", "Sunucuya bağlanılamadı", "error");
  }
});

loadCartDetails();

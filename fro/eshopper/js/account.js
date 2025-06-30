const API_BASE = "http://localhost:3001/api/v1/clean/admin";

// JWT'den token alma
function getJWTFromCookie() {
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  return match ? match[2] : null;
}

// Header ayarları
const headers = {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + getJWTFromCookie(),
  },
};

// Sipariş detaylarını göster
async function showOrderDetail(orderId) {
  try {
    const res = await axios.post(`${API_BASE}/getOrderById`, { orderId }, headers);
    const order = res.data.data;

    const list = document.getElementById("orderDetailList");
    list.innerHTML = "";

    order.products.forEach(p => {
      const li = document.createElement("li");
      li.classList.add("list-group-item");
      li.innerHTML = `<b>${p.name}</b> - ${p.quantity} adet`;
      list.appendChild(li);
    });

    $('#orderDetailModal').modal('show');
  } catch (err) {
    console.error("Sipariş detayı hatası:", err);
    Swal.fire("Hata", "Sipariş detayı alınamadı", "error");
  }
}

// Profil bilgilerini getir
async function loadProfile() {
  const userId = localStorage.getItem("userId");
  if (!userId) return Swal.fire("Hata", "Giriş yapmalısınız", "error");

  try {
    const res = await axios.post(`${API_BASE}/getUser`, { userId }, headers);

    // 🔎 Kullanıcı verisini doğru şekilde al (data.data ya da direkt data olabilir)
    let user = null;
    if (res?.data?.success && res?.data?.data) {
      user = res.data.data;
    } else if (res?.data?.name) {
      user = res.data;
    } else {
      return Swal.fire("Hata", "Kullanıcı bulunamadı", "error");
    }

    // 🔄 Form alanlarını doldur
    document.getElementById("name").value = user.name || "";
    document.getElementById("surname").value = user.surname || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("address").value = user.address || "";

    // 📦 Siparişleri göster
    const tbody = document.getElementById("orderTableBody");
    tbody.innerHTML = "";

    if (user.orders && user.orders.length > 0) {
      user.orders.forEach((orderId, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${i + 1}</td>
          <td>${orderId}</td>
          <td>
            <button class="btn btn-sm btn-outline-info" onclick="showOrderDetail('${orderId}')">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        `;
        tbody.appendChild(row);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Siparişiniz yoktur.</td></tr>`;
    }

  } catch (err) {
    console.error("⚠️ Profil hatası:", err);
    Swal.fire("Hata", "Bilgiler alınamadı", "error");
  }
}

// Profili güncelle
async function updateProfile(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const surname = document.getElementById("surname").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  try {
    await axios.post(`${API_BASE}/updateProfile`, {
      user: { userId: localStorage.getItem("userId") },
      name, surname, phone, address
    }, headers);

    Swal.fire("✔️", "Güncellendi", "success");
  } catch {
    Swal.fire("Hata", "Güncellenemedi", "error");
  }
}

// Şifre değiştir
async function changePassword(e) {
  e.preventDefault();
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  try {
    const res = await axios.post(`${API_BASE}/changePassword`, {
      userId: localStorage.getItem("userId"),
      oldPassword,
      newPassword
    }, headers);

    Swal.fire("✔️", res.data.message, "success");
    document.getElementById("passwordForm").reset();
  } catch (err) {
    Swal.fire("Hata", err.response?.data?.message || "Şifre değiştirilemedi", "error");
  }
}

// Event tanımları
document.getElementById("profileForm").addEventListener("submit", updateProfile);
document.getElementById("passwordForm").addEventListener("submit", changePassword);

// Sayfa yüklendiğinde çalıştır
window.onload = () => loadProfile();

const API_BASE = "http://localhost:3001/api/v1/clean/admin";
const token = document.cookie.split("token=")[1];
const headers = { headers: { Authorization: `Bearer ${token}` } };

let selectedOrderId = null;

async function fetchOrders() {
  try {
    const res = await axios.post(`${API_BASE}/listOrders`, {}, headers);
    const orders = res.data;

    const tbody = document.getElementById("orderTableBody");
    tbody.innerHTML = "";

    const userIdList = [...new Set(orders.map(order => order.userId).filter(Boolean))];
    const userMap = {};

    for (const userId of userIdList) {
      try {
        const resUser = await axios.post(`${API_BASE}/getUser`, { userId }, headers);
        const user = resUser.data?.data || resUser.data;
        if (user && user.email) {
          userMap[userId] = user.email;
        } else {
          userMap[userId] = "Bilinmiyor";
        }
      } catch {
        userMap[userId] = "Bilinmiyor";
      }
    }

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const userEmail = order.userId ? (userMap[order.userId] || "Misafir") : "Misafir";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${userEmail}</td>
        <td>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</td>
        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="showOrderDetail('${order._id}')">
            <i class="fas fa-eye"></i> Detay
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error("fetchOrders hatası:", err);
    Swal.fire("Hata", "Siparişler alınamadı", "error");
  }
}

async function showOrderDetail(orderId) {
  selectedOrderId = orderId;
  try {
    const res = await axios.post(`${API_BASE}/getOrderById`, { orderId }, headers);
    const order = res.data.data;

    const list = document.getElementById("orderDetailList");
    list.innerHTML = "";

    let userName = "Misafir";
    if (order.userId) {
      try {
        const userRes = await axios.post(`${API_BASE}/getUser`, { userId: order.userId }, headers);
        const user = userRes.data?.data || userRes.data;
        if (user?.name && user?.surname) {
          userName = `${user.name} ${user.surname}`;
        }
      } catch (_) {}
    }

    list.innerHTML += `
      <li class="list-group-item"><strong>Kullanıcı:</strong> ${userName}</li>
      <li class="list-group-item"><strong>Adres:</strong> ${order.address}</li>
    `;

    for (const p of order.products) {
      let productName = p.productId;
      try {
        const productRes = await axios.post(`${API_BASE}/getProduct`, { productId: p.productId }, headers);
        const product = productRes.data?.data;
        productName = product?.name || p.productId;
      } catch (_) {}

      const item = document.createElement("li");
      item.className = "list-group-item";
      item.innerText = `${productName} - ${p.quantity} adet`;
      list.appendChild(item);
    }

    document.getElementById("statusSelect").value = order.status;

    const modalEl = document.getElementById("orderModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (err) {
    console.error("showOrderDetail hatası:", err);
    Swal.fire("Hata", "Detay getirilemedi", "error");
  }
}

async function updateOrderStatus() {
  const status = document.getElementById("statusSelect").value;

  if (!selectedOrderId || !status) {
    Swal.fire("Hata", "Sipariş ya da durum bilgisi eksik", "warning");
    return;
  }

  try {
    const payload = {
      orderId: selectedOrderId,
      status: status.trim()
    };

    const response = await axios.post(`${API_BASE}/updateOrderStatus`, payload, headers);

    Swal.fire("Başarılı", "Sipariş durumu güncellendi", "success");
    fetchOrders();

    const modal = bootstrap.Modal.getInstance(document.getElementById("orderModal"));
    if (modal) modal.hide();
  } catch (err) {
    console.error("updateOrderStatus hatası:", err);
    let msg = "Güncellenemedi";
    if (err.response?.data?.msg) msg = err.response.data.msg;
    Swal.fire("Hata", msg, "error");
  }
}

window.onload = fetchOrders;

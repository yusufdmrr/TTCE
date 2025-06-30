console.log("Admin panel yüklendi.");

const API = "http://localhost:3001/api/v1/clean/admin";

function getToken() {
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  return match ? match[2] : null;
}

const headers = {
  headers: {
    Authorization: "Bearer " + getToken(),
  },
};

async function fetchPendingOrders() {
  try {
    const res = await axios.post(`${API}/listOrders`, {}, headers);
    const orders = res.data.filter(o => o.status === "beklemede");

    const tbody = document.getElementById("pendingOrders");
    tbody.innerHTML = "";

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Bekleyen sipariş yok.</td></tr>`;
      return;
    }

    // 🔍 Kullanıcıları topluca al ve haritalandır
    const userIdList = [...new Set(orders.map(o => o.userId).filter(Boolean))];
    const userMap = {};

    for (const userId of userIdList) {
      try {
        const userRes = await axios.post(`${API}/getUser`, { userId }, headers);
        const user = userRes.data?.data || userRes.data;

        if (user?.name && user?.surname) {
          userMap[userId] = `${user.name} ${user.surname}`;
        } else if (user?.email) {
          userMap[userId] = user.email;
        } else {
          userMap[userId] = "Kayıtlı Kullanıcı";
        }
      } catch (err) {
        console.warn(`Kullanıcı bulunamadı: ${userId}`);
        userMap[userId] = "Kayıtlı Kullanıcı";
      }
    }

    // 🔄 Siparişleri tabloya yaz
    orders.forEach((o, i) => {
      const userText = o.userId ? (userMap[o.userId] || "Kayıtlı Kullanıcı") : "Misafir Kullanıcı";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${userText}</td>
        <td>${o.products.length}</td>
        <td><span class="badge bg-warning text-dark">${o.status}</span></td>
        <td>
          <button class="btn btn-sm btn-success" onclick="approveOrder('${o._id}')">
            <i class="fas fa-check"></i> Onayla
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Bekleyen siparişler alınamadı:", err);
    Swal.fire("Hata", "Siparişler getirilemedi.", "error");
  }
}

async function approveOrder(orderId) {
  try {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Sipariş Onayı",
      text: "Bu siparişi onaylamak istiyor musunuz?",
      showCancelButton: true,
      confirmButtonText: "Evet, Onayla",
    });
    if (!confirm.isConfirmed) return;

    await axios.post(`${API}/updateOrderStatus`, {
      orderId: orderId,
      status: "hazırlanıyor"
    }, headers);

    Swal.fire("✔️", "Sipariş hazırlanıyor durumuna alındı", "success");
    fetchPendingOrders();
  } catch (err) {
    console.error("Onaylama hatası:", err);
    Swal.fire("Hata", "Sipariş onaylanamadı.", "error");
  }
}

async function fetchTopSellingProducts() {
  try {
    const res = await axios.post(`${API}/listOrders`, {}, headers);
    const orders = res.data;

    const productCounts = {};

    for (const order of orders) {
      for (const item of order.products) {
        const id = item.productId;
        productCounts[id] = (productCounts[id] || 0) + item.quantity;
      }
    }

    const sortedProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const tbody = document.getElementById("topProductsBody");
    const labels = [];
    const data = [];

    tbody.innerHTML = "";

    for (const [productId, quantity] of sortedProducts) {
      try {
        const productRes = await axios.post(`${API}/getProduct`, { productId }, headers);
        const product = productRes.data.data;

        tbody.innerHTML += `
          <tr>
            <td>${product.name}</td>
            <td>${product.stock}</td>
          </tr>
        `;

        labels.push(product.name);
        data.push(quantity);
      } catch (err) {
        console.warn(`Ürün bilgisi alınamadı: ${productId}`);
      }
    }

    renderChart(labels, data);
  } catch (err) {
    console.error("En çok satan ürünler alınamadı:", err);
  }
}

function renderChart(labels, data) {
  const ctx = document.getElementById("productChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Satış Adedi",
        data: data,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

window.onload = () => {
  fetchPendingOrders();
  fetchTopSellingProducts(); // grafik de yüklensin
};


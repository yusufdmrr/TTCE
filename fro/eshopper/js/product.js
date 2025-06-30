const API = "https://ttce.onrender.com/api/v1/clean/admin";

function getToken() {
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  return match ? match[2] : null;
}

const headers = {
  headers: {
    Authorization: "Bearer " + getToken(),
  },
};

let categoryMap = {};

async function getAllCategories() {
  try {
    const res = await axios.post(`${API}/getAllCategories`, {}, headers);
    const select = document.getElementById("categorySelect");
    select.innerHTML = `<option value="">Kategori Seç</option>`;
    res.data.forEach(c => {
      categoryMap[c._id] = c.name;
      const opt = document.createElement("option");
      opt.value = c._id;
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  } catch {
    Swal.fire("Hata", "Kategoriler yüklenemedi", "error");
  }
}

async function getAllProducts() {
  try {
    const res = await axios.post(`${API}/getAllProducts`, {}, headers);
    const list = document.getElementById("productList");
    list.innerHTML = "";

    res.data.forEach((p, i) => {
      const categoryName = categoryMap[p.categoryId] || "Bilinmiyor";
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.price}₺</td>
        <td>${p.stock}</td>
        <td>${categoryName}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="showUpdateModal('${p._id}', \`${p.name}\`, ${p.price}, ${p.stock}, \`${p.description || ''}\`)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p._id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      list.appendChild(row);
    });
  } catch {
    Swal.fire("Hata", "Ürünler getirilemedi", "error");
  }
}

async function deleteProduct(id) {
  try {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Emin misiniz?",
      text: "Bu ürün silinecek!",
      showCancelButton: true,
      confirmButtonText: "Evet, Sil",
    });
    if (!confirm.isConfirmed) return;

    await axios.post(`${API}/deleteProduct`, { productId: id }, headers);
    await getAllProducts();
    Swal.fire("Silindi", "Ürün başarıyla silindi", "success");
  } catch {
    Swal.fire("Hata", "Silme işlemi başarısız", "error");
  }
}

async function addProduct(e) {
  e.preventDefault();
  const form = document.getElementById("productForm");
  const formData = new FormData(form);

  try {
    await axios.post(`${API}/setProduct`, formData, {
      headers: {
        Authorization: "Bearer " + getToken(),
        "Content-Type": "multipart/form-data",
      },
    });

    form.reset();
    await getAllProducts();
    Swal.fire("✔️", "Ürün başarıyla eklendi", "success");
  } catch {
    Swal.fire("Hata", "Ürün eklenemedi", "error");
  }
}

function showUpdateModal(id, name, price, stock, description) {
  document.getElementById("updateId").value = id;
  document.getElementById("updateName").value = name;
  document.getElementById("updatePrice").value = price;
  document.getElementById("updateStock").value = stock;
  document.getElementById("updateDescription").value = description;
  document.getElementById("updateImage").value = '';

  const modalEl = document.getElementById("updateModal");
  new bootstrap.Modal(modalEl).show();
}

document.getElementById("updateForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = document.getElementById("updateForm");
  const formData = new FormData(form); // ✅ productId dahil tüm alanları içerir

  try {
    await axios.post(`${API}/updateProduct`, formData, {
      headers: {
        Authorization: "Bearer " + getToken(),
        "Content-Type": "multipart/form-data",
      },
    });
    Swal.fire("✔️", "Ürün güncellendi", "success");
    bootstrap.Modal.getInstance(document.getElementById("updateModal")).hide();
    await getAllProducts();
  } catch (err) {
    console.log(err);
    Swal.fire("Hata", err.response?.data?.msg || "Ürün güncellenemedi", "error");
  }
});


document.getElementById("productForm").addEventListener("submit", addProduct);

// document.getElementById("updateForm").addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const form = document.getElementById("updateForm");
//   const formData = new FormData(form);

//   try {
//     await axios.post(`${API}/updateProduct`, formData, {
//       headers: {
//         Authorization: "Bearer " + getToken(),
//         "Content-Type": "multipart/form-data"
//       },
//     });

//     Swal.fire("✔️", "Ürün güncellendi", "success");
//     bootstrap.Modal.getInstance(document.getElementById("updateModal")).hide();
//     await getAllProducts();
//   } catch {
//     Swal.fire("Hata", "Ürün güncellenemedi", "error");
//   }
// });

window.onload = async () => {
  await getAllCategories();
  await getAllProducts();
};

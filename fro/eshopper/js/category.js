// js/category.js
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

async function getAllCategories() {
  try {
    const res = await axios.post(`${API}/getAllCategories`, {}, headers);
    const list = document.getElementById("categoryList");
    list.innerHTML = "";

    res.data.forEach((c, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${c.name}</td>
        <td>
          <button onclick="deleteCategory('${c._id}')" class="btn btn-sm btn-danger">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      list.appendChild(row);
    });
  } catch (err) {
    Swal.fire("Hata", "Kategoriler getirilemedi", "error");
  }
}

async function deleteCategory(id) {
  try {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Emin misiniz?",
      text: "Bu kategori silinecek!",
      showCancelButton: true,
      confirmButtonText: "Evet",
    });
    if (!confirm.isConfirmed) return;

    await axios.post(`${API}/deleteCategory`, { categoryId: id }, headers);
    await getAllCategories();
    Swal.fire("Silindi", "Kategori başarıyla silindi", "success");
  } catch {
    Swal.fire("Hata", "Silme işlemi başarısız", "error");
  }
}

async function addCategory(e) {
  e.preventDefault();
  const name = document.getElementById("categoryName").value;

  try {
    await axios.post(`${API}/setCategory`, { name }, headers);
    document.getElementById("categoryForm").reset();
    getAllCategories();
    Swal.fire("✔️", "Kategori eklendi", "success");
  } catch {
    Swal.fire("Hata", "Kategori eklenemedi", "error");
  }
}

document.getElementById("categoryForm").addEventListener("submit", addCategory);
window.onload = () => getAllCategories();

// js/register.js

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const surname = document.getElementById("surname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !surname || !email || !password) {
    return Swal.fire("Uyarı", "Tüm alanları doldurmalısınız.", "warning");
  }

  try {
    const response = await axios.post("https://ttce.onrender.com/api/v1/clean/admin/register", {
      name,
      surname,
      email,
      password,
    });

    if (response.data && response.data.success) {
      Swal.fire({
        icon: "success",
        title: "Kayıt Başarılı",
        text: "Giriş sayfasına yönlendiriliyorsunuz...",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        window.location.href = "login.html";
      });
    } else {
      Swal.fire("Hata", response.data.message || "Kayıt yapılamadı", "error");
    }
  } catch (error) {
    console.error("Kayıt hatası:", error);
    Swal.fire("Hata", "Bir hata oluştu. Lütfen tekrar deneyin.", "error");
  }
});

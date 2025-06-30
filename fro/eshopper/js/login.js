document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await axios.post("http://localhost:3001/api/v1/clean/admin/login", {
      email,
      password
    });

    if (response.data.success) {
      const { token, user } = response.data;

      // 🧠 Token'ı cookie'ye kaydet
      document.cookie = `token=${token}; path=/;`;

      // 🧠 userId'yi localStorage'a kaydet
      localStorage.setItem("userId", user._id);

      Swal.fire({
        icon: "success",
        title: "Giriş Başarılı",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        // 🎯 Rol kontrolü: admin ise admin.html, değilse index.html
        if (user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "index.html";
        }
      });

    } else {
      Swal.fire("Hata", response.data.message || "Giriş başarısız", "error");
    }
  } catch (err) {
    Swal.fire("Hata", "Sunucuya bağlanılamadı veya hatalı bilgi", "error");
    console.error(err);
  }
});

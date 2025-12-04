document.addEventListener("DOMContentLoaded", () => {
  const pwInput = document.getElementById("password");
  const toggleBtn = document.getElementById("toggle-login-password");
  const eyeIcon = document.getElementById("login-eye-icon");

  if (toggleBtn && pwInput && eyeIcon) {
    toggleBtn.addEventListener("click", () => {
      const show = pwInput.type === "password";
      pwInput.type = show ? "text" : "password";

      if (show) {
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
      } else {
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {

  const usernameInput = document.getElementById("username");
  const usernameStatus = document.getElementById("username-status");

  if (usernameInput && usernameStatus) {
    usernameInput.addEventListener("input", async function () {
      const username = this.value.trim();

      if (username.length < 3) {
        usernameStatus.textContent = "Username too short";
        usernameStatus.className = "text-danger";
        return;
      }

      try {
        const response = await fetch(`/check-username?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (data.available) {
          usernameStatus.textContent = "✔ Username is available";
          usernameStatus.className = "text-success";
        } else {
          usernameStatus.textContent = "✘ Username already taken";
          usernameStatus.className = "text-danger";
        }
      } catch (err) {
        console.error("Error:", err);
        usernameStatus.textContent = "Error checking username";
        usernameStatus.className = "text-danger";
      }
    });
  }

  // --- Password strength check ---
  const passwordInput = document.getElementById("password");
  const passwordStatus = document.getElementById("password-status");

  if (passwordInput && passwordStatus) {
    passwordInput.addEventListener("input", function () {
      const pw = this.value;
      const minLength = 6;
      const hasUpper = /[A-Z]/.test(pw);
      const hasLower = /[a-z]/.test(pw);
      const hasNumber = /[0-9]/.test(pw);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw);

      if (pw.length === 0) {
          passwordStatus.textContent = "";
          passwordStatus.className = "";
          return;
      }

      if (pw.length < minLength) {
        passwordStatus.textContent = `Password must be at least ${minLength} characters long`;
        passwordStatus.className = "text-danger";
        return;
      }

      if (!hasUpper) {
        passwordStatus.textContent = "Must include an uppercase letter (A–Z)";
        passwordStatus.className = "text-danger";
        return;
      }

      if (!hasLower) {
        passwordStatus.textContent = "Must include a lowercase letter (a–z)";
        passwordStatus.className = "text-danger";
        return;
      }

      if (!hasNumber) {
        passwordStatus.textContent = "Must include a number (0–9)";
        passwordStatus.className = "text-danger";
        return;
      }

      if (!hasSpecial) {
        passwordStatus.textContent = "Must include a special character (! @ # etc)";
        passwordStatus.className = "text-danger";
        return;
      }

      passwordStatus.textContent = "✔ Strong password";
      passwordStatus.className = "text-success";
    });
  }

  // --- Password visibility toggle ---
  const toggleBtn = document.getElementById("toggle-password");
  const eyeIcon = document.getElementById("eye-icon");

  if (toggleBtn && passwordInput && eyeIcon) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";

      if (isHidden) {
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
      } else {
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
      }
    });
  }

  // --- Email availability check ---
  const emailInput = document.getElementById("email");
  const emailStatus = document.getElementById("email-status");

  if (emailInput && emailStatus) {
    emailInput.addEventListener("input", async function () {
      const email = this.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (email.length === 0) {
          emailStatus.textContent = "";
          emailStatus.className = "";
          return;
      }

      if (!emailPattern.test(email)) {
        emailStatus.textContent = "Invalid email format";
        emailStatus.className = "text-danger";
        return;
      }

      try {
        const response = await fetch(`/check-email?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (data.available) {
          emailStatus.textContent = "✔ Email is available";
          emailStatus.className = "text-success";
        } else {
          emailStatus.textContent = "! Email already exists in our records";
          emailStatus.className = "text-warning";
        }
      } catch (err) {
        console.error(err);
        emailStatus.textContent = "Error checking email";
        emailStatus.className = "text-danger";
      }
    });
  }
});
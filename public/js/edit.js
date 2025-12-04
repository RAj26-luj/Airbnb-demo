  document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById("city");
    if (cityInput && cityInput.value.trim() !== "") {
      cityInput.dispatchEvent(new Event("blur"));
    }
  });
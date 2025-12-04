document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("navbar-search");
  const box = document.getElementById("search-suggestions");
  if (!input || !box) return;

  let timer = null;

  input.addEventListener("input", () => {
    const q = input.value.trim();
    clearTimeout(timer);

    if (!q) {
      box.innerHTML = "";
      box.style.display = "none";      
      return;
    }

    timer = setTimeout(async () => {
      try {
        const res = await fetch(`/listings/search/suggestions?q=${encodeURIComponent(q)}`);
        const suggestions = await res.json();

        box.innerHTML = "";
        if (!suggestions.length) {
          box.style.display = "none"; 
          return;
        }
        box.style.display = "block";

        suggestions.forEach(s => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "list-group-item list-group-item-action";
          btn.textContent = s.label;
          btn.onclick = () => {
            window.location.href = s.url;
          };
          box.appendChild(btn);
        });
      } catch (err) {
        console.error("Search suggestions error:", err);
      }
    }, 300);
  });

  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== input) {
      box.innerHTML = "";
      box.style.display = "none";     
    }
  });
});

  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("navbar-search");
    if (!input) return;

    const texts = [
      "Search destinations...",
      "Search by city...",
      "Search by country...",
      "Search by title...",
      "Search by category..."
    ];

    let index = 0;
    input.placeholder = texts[index];

    setInterval(() => {
     
      if (document.activeElement === input) return;

      index = (index + 1) % texts.length;
      input.placeholder = texts[index];
    }, 2500); 
  });

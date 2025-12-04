// TAX SWITCH FUNCTIONALITY
  const taxSwitchIndex = document.getElementById('flexSwitchCheckDefault');
  if (taxSwitchIndex) {
    taxSwitchIndex.addEventListener('change', () => {
      const taxInfoElements = document.getElementsByClassName('tax-info');
      const taxDesElements  = document.getElementsByClassName('tax-des');

      if (taxSwitchIndex.checked) {
        // show "+18% GST" (red), hide "(excl. taxes)"
        for (let el of taxInfoElements) el.style.display = 'inline';
        for (let el of taxDesElements) el.style.display  = 'none';
      } else {
        // show "(excl. taxes)", hide "+18% GST"
        for (let el of taxInfoElements) el.style.display = 'none';
        for (let el of taxDesElements) el.style.display  = 'inline';
      }
    });
  }

  // FILTER CLICK REDIRECT
  document.querySelectorAll(".filter").forEach(filter => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.category;
      window.location.href = `/listings/category/${encodeURIComponent(category)}`;
    });
  });

  // HEART ICON CLICK FUNCTIONALITY
  document.querySelectorAll('.heart-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (icon.classList.contains('fa-regular')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
      } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
      }
    });
  });
   const taxSwitchDesktop = document.getElementById("flexSwitchCheckDefault");
  const taxSwitchMobile = document.getElementById("flexSwitchCheckMobile");

  if(taxSwitchDesktop && taxSwitchMobile) {
    taxSwitchMobile.addEventListener("change", () => {
      taxSwitchDesktop.checked = taxSwitchMobile.checked;
      taxSwitchDesktop.dispatchEvent(new Event('click')); // Trigger existing tax logic
    });
    
    // Optional: Sync back if desktop one is clicked (resizing window scenario)
    taxSwitchDesktop.addEventListener("change", () => {
      taxSwitchMobile.checked = taxSwitchDesktop.checked;
    });
  }
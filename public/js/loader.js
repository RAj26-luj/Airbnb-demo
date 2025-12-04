function showLoader() {
    const loader = document.getElementById('basic-loader');
    if (!loader) return;
    loader.style.display = 'flex';
    loader.style.opacity = '1';
  }

  function hideLoader() {
    const loader = document.getElementById('basic-loader');
    if (!loader) return;
    loader.style.transition = 'opacity 0.5s ease';
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }

  // Global
  document.addEventListener('DOMContentLoaded', () => {
    // Page-load spinner: show ASAP, hide when everything loaded
    showLoader();
    window.addEventListener('load', () => {
      hideLoader();
    });

    // Show loader on normal form submits
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => {
        if (form.classList.contains('needs-validation')) return;
        showLoader();
      });
    });

    // Optional: show on link clicks with data-loader="true"
    document.querySelectorAll('a[data-loader="true"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
        showLoader();
      });
    });
  });
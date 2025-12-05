function showLoader() {
  const loader = document.getElementById('basic-loader');
  if (!loader) return;

  loader.style.display = 'flex';
  loader.style.opacity = '1';
}

function hideLoader() {
  const loader = document.getElementById('basic-loader');
  if (!loader) return;

  loader.style.transition = 'opacity 0.3s ease';
  loader.style.opacity = '0';

  setTimeout(() => {
    loader.style.display = 'none';
  }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
  // Show loader right away (before content fully loaded)
  showLoader();

  // Hide when page finished loading
  window.addEventListener('load', () => {
    hideLoader();
  });

  // Show loader on ANY form submit 
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', () => {
      showLoader();
    });
  });

  // Show loader on links you mark with data-loader="true"
  document.querySelectorAll('a[data-loader="true"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      showLoader();
    });
  });

  //  when leaving the page 
  window.addEventListener('beforeunload', () => {
    showLoader();
  });
});
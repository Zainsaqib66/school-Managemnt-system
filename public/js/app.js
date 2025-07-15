// public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const themeSwitch = document.getElementById('themeSwitch');
  const saved = localStorage.getItem('theme') || 'light';
  if (saved === 'dark') document.body.classList.add('dark-mode');
  themeSwitch?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  // Live search (tables & class lists)
  document.querySelectorAll('.search-input').forEach(input => {
    input.addEventListener('input', () => {
      const filter = input.value.toLowerCase();
      // If in a table context:
      const table = input.closest('div')?.nextElementSibling;
      if (table?.tagName === 'TABLE') {
        table.querySelectorAll('tbody tr').forEach(row => {
          row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
        });
      }
      // If in a list-group context:
      const list = document.querySelector('.list-group');
      list?.querySelectorAll('a').forEach(a => {
        a.style.display = a.textContent.toLowerCase().includes(filter) ? '' : 'none';
      });z
    });
  });
});

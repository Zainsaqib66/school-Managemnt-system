// public/js/search.js
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.search-input').forEach(input=>{
    input.addEventListener('input', ()=>{
      const filter = input.value.toLowerCase();
      const container = input.closest('.card-glass');
      // list-group filter
      const list = container.querySelector('.list-group');
      if (list) {
        list.querySelectorAll('.list-group-item').forEach(item=>{
          item.style.display = item.textContent.toLowerCase().includes(filter) ? '' : 'none';
        });
        return;
      }
      // table filter
      const table = container.querySelector('table');
      if (table) {
        table.querySelectorAll('tbody tr').forEach(row=>{
          row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
        });
      }
    });
  });
});

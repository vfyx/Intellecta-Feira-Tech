'use strict';
// Administrative services are not included in the public portfolio.
document.addEventListener('DOMContentLoaded', () => { document.querySelectorAll('[data-complaint-load-status], [data-moderation-status], [data-admin-status]').forEach(el => { el.textContent = 'Serviço privado indisponível nesta demonstração.'; }); });

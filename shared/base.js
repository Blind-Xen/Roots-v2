/* ══════════════════════════════════════════
   shared/base.js — Resolves paths from root
══════════════════════════════════════════ */
const Base = {
  get root() {
    return document.querySelector('meta[name="app-root"]')?.content || '/';
  },
  resolve(path) {
    return this.root + path.replace(/^\//, '');
  },
  resolveAll() {
    document.querySelectorAll('[data-route]').forEach(el => {
      const key = el.dataset.route;
      if (Routes[key]) el.href = this.resolve(Routes[key]);
    });
  }
};
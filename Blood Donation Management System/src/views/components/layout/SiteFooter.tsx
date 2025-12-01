const SiteFooter = () => (
  <footer className="border-t border-white/60 bg-white/60 backdrop-blur">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} Blood Donation Management System</p>
      <p className="text-slate-400">Built with React, Tailwind, and MVC-ready structure.</p>
    </div>
  </footer>
);

export default SiteFooter;



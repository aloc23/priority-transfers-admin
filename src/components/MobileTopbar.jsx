import { HamburgerIcon } from "./Icons";

export default function MobileTopbar({ sidebarOpen, setSidebarOpen, title = "Priority Transfers" }) {
  // Only show the topbar when sidebar is open on mobile
  if (!sidebarOpen) {
    return null;
  }

  return (
    <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors mobile-touch-target"
          aria-label="Close menu"
        >
          <HamburgerIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <img src="./logo.svg" alt="logo" className="w-8 h-8 rounded shadow-sm border border-slate-200 bg-white" />
          <span className="font-bold text-lg text-slate-800 tracking-tight">Priority</span>
        </div>
      </div>
    </header>
  );
}
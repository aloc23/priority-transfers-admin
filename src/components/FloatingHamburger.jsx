import { HamburgerIcon } from "./Icons";

export default function FloatingHamburger({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-3 left-3 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors duration-200 md:hidden mobile-touch-target"
      aria-label="Open menu"
      style={{
        // Ensure proper spacing from safe areas and page content
        top: 'max(12px, env(safe-area-inset-top, 0px) + 8px)',
        left: 'max(12px, env(safe-area-inset-left, 0px) + 8px)',
      }}
    >
      <HamburgerIcon className="w-5 h-5" />
    </button>
  );
}
import { HamburgerIcon } from "./Icons";

export default function FloatingHamburger({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors duration-200 md:hidden mobile-touch-target"
      aria-label="Open menu"
    >
      <HamburgerIcon className="w-6 h-6" />
    </button>
  );
}
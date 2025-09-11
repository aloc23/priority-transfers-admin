import { createPortal } from 'react-dom';

/**
 * ModalPortal component renders children in a portal outside the normal component tree
 * This ensures modals appear at the very top level with proper backdrop coverage
 */
export default function ModalPortal({ children, isOpen }) {
  const modalRoot = document.getElementById('modal-root');
  
  if (!isOpen || !modalRoot) {
    return null;
  }

  return createPortal(children, modalRoot);
}
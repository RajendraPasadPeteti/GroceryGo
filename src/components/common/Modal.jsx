import { useEffect, useRef, useCallback, useId } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

/**
 * Modal overlay component with header, body, footer, close button, and ESC key support
 * @component
 * @example
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Confirm Action"
 *   size="md"
 * >
 *   <p>Are you sure?</p>
 *   <Modal.Footer>
 *     <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *     <Button variant="danger" onClick={handleConfirm}>Confirm</Button>
 *   </Modal.Footer>
 * </Modal>
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md', closeButton = true, overlayClose = true, className = '', 'aria-describedby': ariaDescribedBy, ..._props }) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const generatedId = useId();
  const contentId = `modal-content-${generatedId}`;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && overlayClose) {
      onClose();
    }

    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [onClose, overlayClose]);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      // Focus the modal or first focusable element
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`modal-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={ariaDescribedBy || contentId}
      onClick={overlayClose ? onClose : undefined}
    >
      <div
        ref={modalRef}
        className={`modal modal--${size}`}
        role="document"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || closeButton) && (
          <header className="modal__header">
            {title && (
              <h2 id="modal-title" className="modal__title">{title}</h2>
            )}
            {closeButton && (
              <button
                type="button"
                className="modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </header>
        )}
        <div id={contentId} className="modal__body">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.displayName = 'Modal';

Modal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Modal title */
  title: PropTypes.string,
  /** Modal content */
  children: PropTypes.node.isRequired,
  /** Modal size */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  /** Show close button */
  closeButton: PropTypes.bool,
  /** Close on overlay click */
  overlayClose: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Additional aria-describedby */
  'aria-describedby': PropTypes.string,
};

Modal.defaultProps = {
  title: undefined,
  size: 'md',
  closeButton: true,
  overlayClose: true,
  className: '',
  'aria-describedby': undefined,
};

/** Modal Footer sub-component */
const Footer = ({ children, className = '', ...props }) => (
  <footer className={`modal__footer ${className}`} {...props}>
    {children}
  </footer>
);

Footer.displayName = 'Modal.Footer';
Footer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Footer.defaultProps = {
  className: '',
};

Modal.Footer = Footer;

export default Modal;
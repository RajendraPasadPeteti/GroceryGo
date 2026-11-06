import { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

/**
 * Toast notification component with types (success, error, warning, info), auto-dismiss
 * @component
 * @example
 * <Toast
 *   isOpen={showToast}
 *   onClose={setShowToast(false)}
 *   type="success"
 *   title="Success!"
 *   message="Your order has been placed."
 *   duration={5000}
 * />
 */
const Toast = ({ isOpen, onClose, type = 'info', title, message, duration = 5000, action, className = '', ...props }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setExiting(false);
      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          handleClose();
        }, duration);
      }
    } else {
      setExiting(true);
      setTimeout(() => setVisible(false), 300);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, duration]);

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  if (!visible && !exiting) return null;

  const icons = {
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  const toastContent = (
    <div
      className={`toast toast--${type} ${exiting ? 'toast--exiting' : ''} ${className}`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={() => timerRef.current && clearTimeout(timerRef.current)}
      onMouseLeave={() => {
        if (duration > 0) {
          timerRef.current = setTimeout(handleClose, duration);
        }
      }}
      {...props}
    >
      <div className="toast__icon" aria-hidden="true">
        {icons[type]}
      </div>
      <div className="toast__content">
        {title && <h4 className="toast__title">{title}</h4>}
        {message && <p className="toast__message">{message}</p>}
      </div>
      {action && (
        <div className="toast__action">
          <button className="btn btn--ghost btn--sm" onClick={action.onClick}>
            {action.label}
          </button>
        </div>
      )}
      <button
        type="button"
        className="toast__close"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );

  return createPortal(toastContent, document.body);
};

Toast.displayName = 'Toast';

Toast.propTypes = {
  /** Whether the toast is open */
  isOpen: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Toast type */
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  /** Toast title */
  title: PropTypes.string,
  /** Toast message */
  message: PropTypes.string,
  /** Auto-dismiss duration in ms (0 to disable) */
  duration: PropTypes.number,
  /** Action button */
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  /** Additional CSS classes */
  className: PropTypes.string,
};

Toast.defaultProps = {
  type: 'info',
  title: undefined,
  message: undefined,
  duration: 5000,
  action: undefined,
  className: '',
};

/** Toast container for managing multiple toasts */
let _toastId = 0;
const _toastInstances = new Map();

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((options) => {
    const id = ++_toastId;
    const newToast = { id, ...options, isOpen: true };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const closeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, closeToast };
};

Toast.useToast = useToast;

export default Toast;
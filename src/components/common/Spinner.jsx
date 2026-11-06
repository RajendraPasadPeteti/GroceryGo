import React, { useId } from 'react';
import PropTypes from 'prop-types';

/**
 * Loading spinner component
 * @component
 * @example
 * <Spinner size="md" />
 * <Spinner size="lg" label="Loading..." />
 * <Spinner size="sm" inline />
 */
const Spinner = ({
  size = 'md',
  label,
  inline = false,
  className = '',
  'aria-label': ariaLabel = 'Loading',
  ...props
}) => {
  const sizeClass = size !== 'md' ? `spinner--${size}` : '';
  const inlineClass = inline ? 'spinner--inline' : '';
  const generatedId = useId();
  const labelId = label ? `spinner-label-${generatedId}` : undefined;

  const classNames = [
    'spinner',
    sizeClass,
    inlineClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      aria-describedby={labelId}
      {...props}
    >
      {label && (
        <span id={labelId} className="spinner__label">
          {label}
        </span>
      )}
    </div>
  );
};

Spinner.displayName = 'Spinner';

Spinner.propTypes = {
  /** Spinner size */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  /** Loading label for screen readers */
  label: PropTypes.string,
  /** Display inline with text */
  inline: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Accessible label */
  'aria-label': PropTypes.string,
};

Spinner.defaultProps = {
  size: 'md',
  label: undefined,
  inline: false,
  className: '',
  'aria-label': 'Loading',
};

export default Spinner;
import { useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Increment/decrement quantity control with min/max
 * @component
 * @example
 * <QuantityControl value={quantity} onChange={setQuantity} min={1} max={99} />
 * <QuantityControl value={2} onChange={handleChange} step={1} />
 */
const QuantityControl = ({
  value = 1,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  disabled = false,
  showInput = true,
  className = '',
  'aria-label': ariaLabel = 'Quantity',
  'aria-labelledby': ariaLabelledBy,
  ...props
}) => {
  const clampedValue = Math.max(min, Math.min(max, value));

  const handleIncrement = useCallback(() => {
    if (disabled) return;
    const newValue = Math.min(max, clampedValue + step);
    onChange?.(newValue);
  }, [disabled, max, clampedValue, step, onChange]);

  const handleDecrement = useCallback(() => {
    if (disabled) return;
    const newValue = Math.max(min, clampedValue - step);
    onChange?.(newValue);
  }, [disabled, min, clampedValue, step, onChange]);

  const handleInputChange = useCallback((e) => {
    if (disabled) return;
    const inputValue = parseInt(e.target.value, 10);
    if (!isNaN(inputValue)) {
      const newValue = Math.max(min, Math.min(max, inputValue));
      onChange?.(newValue);
    }
  }, [disabled, min, max, onChange]);

  const handleBlur = useCallback((e) => {
    if (disabled) return;
    const inputValue = parseInt(e.target.value, 10);
    if (isNaN(inputValue) || inputValue < min) {
      onChange?.(min);
    } else if (inputValue > max) {
      onChange?.(max);
    }
  }, [disabled, min, max, onChange]);

  const canIncrement = clampedValue < max;
  const canDecrement = clampedValue > min;

  const classNames = [
    'quantity-control',
    disabled ? 'quantity-control--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="group" aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} {...props}>
      <button
        type="button"
        className="quantity-btn"
        onClick={handleDecrement}
        disabled={disabled || !canDecrement}
        aria-label="Decrease quantity"
        aria-disabled={disabled || !canDecrement}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {showInput && (
        <input
          type="text"
          className="quantity-value"
          value={clampedValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={!showInput}
          aria-label="Quantity value"
          min={min}
          max={max}
          step={step}
          inputMode="numeric"
          pattern="[0-9]*"
        />
      )}

      <button
        type="button"
        className="quantity-btn"
        onClick={handleIncrement}
        disabled={disabled || !canIncrement}
        aria-label="Increase quantity"
        aria-disabled={disabled || !canIncrement}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
};

QuantityControl.displayName = 'QuantityControl';

QuantityControl.propTypes = {
  /** Current quantity value */
  value: PropTypes.number,
  /** Change handler */
  onChange: PropTypes.func,
  /** Minimum value */
  min: PropTypes.number,
  /** Maximum value */
  max: PropTypes.number,
  /** Step increment */
  step: PropTypes.number,
  /** Disable the control */
  disabled: PropTypes.bool,
  /** Show the input field */
  showInput: PropTypes.bool,
  /** Container className */
  className: PropTypes.string,
  /** Accessible label */
  'aria-label': PropTypes.string,
  /** Accessible labelledby */
  'aria-labelledby': PropTypes.string,
};

QuantityControl.defaultProps = {
  value: 1,
  onChange: undefined,
  min: 0,
  max: 99,
  step: 1,
  disabled: false,
  showInput: true,
  className: '',
  'aria-label': 'Quantity',
  'aria-labelledby': undefined,
};

export default QuantityControl;
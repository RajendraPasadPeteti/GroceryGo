import { forwardRef, useId } from 'react';
import PropTypes from 'prop-types';

/**
 * Select dropdown component with options, label, and error state
 * @component
 * @example
 * <Select
 *   label="Category"
 *   options={[
 *     { value: 'fruits', label: 'Fruits' },
 *     { value: 'vegetables', label: 'Vegetables' }
 *   ]}
 *   value={category}
 *   onChange={setCategory}
 *   placeholder="Select a category"
 * />
 */
const Select = forwardRef(({
  label,
  options = [],
  value = '',
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  placeholder,
  name,
  id: providedId,
  className = '',
  selectClassName = '',
  labelClassName = '',
  multiple = false,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);
  const hasHelper = Boolean(helperText);

  const describedBy = [
    hasError && errorId,
    hasHelper && helperId,
    ariaDescribedBy
  ].filter(Boolean).join(' ') || undefined;

  const handleChange = (e) => {
    if (onChange) {
      const newValue = multiple
        ? Array.from(e.target.selectedOptions).map(opt => opt.value)
        : e.target.value;
      onChange(newValue, e);
    }
  };

  return (
    <div className={`select ${className}`}>
      {label && (
        <label htmlFor={id} className={`select__label ${required ? 'select__label--required' : ''} ${labelClassName}`}>
          {label}
          {required && <span className="select__required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="select__wrapper">
        <select
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`select__field ${hasError ? 'select__field--error' : ''} ${selectClassName}`}
          multiple={multiple}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          aria-required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="select__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {hasError && (
        <p id={errorId} className="select__error" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {hasHelper && !hasError && (
        <p id={helperId} className="select__helper">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  /** Label text */
  label: PropTypes.string,
  /** Array of options: [{ value, label }] */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  /** Current value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  /** Change handler */
  onChange: PropTypes.func,
  /** Blur handler */
  onBlur: PropTypes.func,
  /** Error message */
  error: PropTypes.string,
  /** Helper text */
  helperText: PropTypes.string,
  /** Disable the select */
  disabled: PropTypes.bool,
  /** Mark as required */
  required: PropTypes.bool,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Select name */
  name: PropTypes.string,
  /** Custom ID */
  id: PropTypes.string,
  /** Container className */
  className: PropTypes.string,
  /** Select field className */
  selectClassName: PropTypes.string,
  /** Label className */
  labelClassName: PropTypes.string,
  /** Allow multiple selections */
  multiple: PropTypes.bool,
  /** Additional aria-describedby */
  'aria-describedby': PropTypes.string,
};

Select.defaultProps = {
  label: undefined,
  options: [],
  value: '',
  onChange: undefined,
  onBlur: undefined,
  error: undefined,
  helperText: undefined,
  disabled: false,
  required: false,
  placeholder: undefined,
  name: undefined,
  id: undefined,
  className: '',
  selectClassName: '',
  labelClassName: '',
  multiple: false,
  'aria-describedby': undefined,
};

export default Select;
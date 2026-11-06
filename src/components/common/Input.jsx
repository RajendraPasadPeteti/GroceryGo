import { forwardRef, useId } from 'react';
import PropTypes from 'prop-types';

/**
 * Input component supporting text, email, password, number, and textarea
 * @component
 * @example
 * <Input label="Email" type="email" value={email} onChange={setEmail} error="Invalid email" helperText="We'll never share your email" />
 * <Input label="Bio" as="textarea" rows={4} />
 */
const Input = forwardRef(({
  label,
  type = 'text',
  as = 'input',
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
  inputClassName = '',
  labelClassName = '',
  autoComplete,
  maxLength,
  min,
  max,
  step,
  rows = 3,
  readOnly = false,
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

  const inputElement = as === 'textarea' ? (
    <textarea
      ref={ref}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      className={`input ${hasError ? 'input--error' : ''} ${inputClassName}`}
      rows={rows}
      readOnly={readOnly}
      aria-invalid={hasError}
      aria-describedby={describedBy}
      aria-required={required}
      maxLength={maxLength}
      {...props}
    />
  ) : (
    <input
      ref={ref}
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      className={`input ${hasError ? 'input--error' : ''} ${inputClassName}`}
      readOnly={readOnly}
      aria-invalid={hasError}
      aria-describedby={describedBy}
      aria-required={required}
      autoComplete={autoComplete}
      maxLength={maxLength}
      min={min}
      max={max}
      step={step}
      {...props}
    />
  );

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className={`input-label ${labelClassName}`}>
          {label}
          {required && <span className="text-danger" aria-hidden="true">*</span>}
        </label>
      )}
      {inputElement}
      {hasError && (
        <p id={errorId} className="input-error" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {hasHelper && !hasError && (
        <p id={helperId} className="input-helper">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  /** Label text */
  label: PropTypes.string,
  /** Input type */
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search']),
  /** Render as textarea instead of input */
  as: PropTypes.oneOf(['input', 'textarea']),
  /** Current value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Change handler */
  onChange: PropTypes.func,
  /** Blur handler */
  onBlur: PropTypes.func,
  /** Error message */
  error: PropTypes.string,
  /** Helper text */
  helperText: PropTypes.string,
  /** Disable the input */
  disabled: PropTypes.bool,
  /** Mark as required */
  required: PropTypes.bool,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Input name */
  name: PropTypes.string,
  /** Custom ID */
  id: PropTypes.string,
  /** Container className */
  className: PropTypes.string,
  /** Input field className */
  inputClassName: PropTypes.string,
  /** Label className */
  labelClassName: PropTypes.string,
  /** Auto-complete attribute */
  autoComplete: PropTypes.string,
  /** Maximum length */
  maxLength: PropTypes.number,
  /** Minimum value (number type) */
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Maximum value (number type) */
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Step value (number type) */
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Number of rows (textarea) */
  rows: PropTypes.number,
  /** Read-only mode */
  readOnly: PropTypes.bool,
  /** Additional aria-describedby */
  'aria-describedby': PropTypes.string,
};

Input.defaultProps = {
  label: undefined,
  type: 'text',
  as: 'input',
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
  inputClassName: '',
  labelClassName: '',
  autoComplete: undefined,
  maxLength: undefined,
  min: undefined,
  max: undefined,
  step: undefined,
  rows: 3,
  readOnly: false,
  'aria-describedby': undefined,
};

export default Input;
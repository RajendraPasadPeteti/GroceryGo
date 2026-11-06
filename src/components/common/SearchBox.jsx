import { forwardRef, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Search input with clear button
 * @component
 * @example
 * <SearchBox
 *   value={query}
 *   onChange={setQuery}
 *   onSearch={handleSearch}
 *   placeholder="Search products..."
 *   debounceMs={300}
 * />
 */
const SearchBox = forwardRef(({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  disabled = false,
  loading = false,
  debounceMs = 0,
  className = '',
  'aria-label': ariaLabel = 'Search',
  'aria-describedby': ariaDescribedBy,
  autoFocus = false,
  showClearButton = true,
  ...props
}, ref) => {
  const [_debouncedValue, _setDebouncedValue] = useState(value);
  const [showClear, setShowClear] = useState(false);

  const inputRef = useRef(null);
  const refCallback = (node) => {
    inputRef.current = node;
    if (ref) {
      if (typeof ref === 'function') ref(node);
      else ref.current = node;
    }
  };

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    setShowClear(newValue.length > 0);

    if (debounceMs > 0) {
      setDebouncedValue(newValue);
    } else {
      onSearch?.(newValue);
    }
  }, [onChange, onSearch, debounceMs]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(value);
    } else if (e.key === 'Escape') {
      handleClear();
    }
  }, [value, onSearch]);

  const handleClear = useCallback(() => {
    onChange?.('');
    onSearch?.('');
    onClear?.();
    setShowClear(false);
    inputRef.current?.focus();
  }, [onChange, onSearch, onClear, inputRef]);

  const handleBlur = useCallback(() => {
    setShowClear(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (value.length > 0) {
      setShowClear(true);
    }
  }, [value]);

  const classNames = [
    'search-box',
    loading ? 'search-box--loading' : '',
    disabled ? 'search-box--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="search" {...props}>
      <label htmlFor="search-input" className="visually-hidden">{ariaLabel}</label>
      <input
        ref={refCallback}
        type="search"
        id="search-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="search-input"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck="false"
      />
      <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      {(showClearButton && showClear && value.length > 0) && (
        <button
          type="button"
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      {loading && (
        <span className="search-spinner" aria-hidden="true" />
      )}
    </div>
  );
});

SearchBox.displayName = 'SearchBox';

SearchBox.propTypes = {
  /** Current search value */
  value: PropTypes.string,
  /** Change handler */
  onChange: PropTypes.func,
  /** Search submit handler */
  onSearch: PropTypes.func,
  /** Clear handler */
  onClear: PropTypes.func,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Disable the input */
  disabled: PropTypes.bool,
  /** Loading state */
  loading: PropTypes.bool,
  /** Debounce milliseconds */
  debounceMs: PropTypes.number,
  /** Container className */
  className: PropTypes.string,
  /** Accessible label */
  'aria-label': PropTypes.string,
  /** Additional aria-describedby */
  'aria-describedby': PropTypes.string,
  /** Auto focus on mount */
  autoFocus: PropTypes.bool,
  /** Show clear button */
  showClearButton: PropTypes.bool,
};

SearchBox.defaultProps = {
  value: '',
  onChange: undefined,
  onSearch: undefined,
  onClear: undefined,
  placeholder: 'Search...',
  disabled: false,
  loading: false,
  debounceMs: 0,
  className: '',
  'aria-label': 'Search',
  'aria-describedby': undefined,
  autoFocus: false,
  showClearButton: true,
};

export default SearchBox;
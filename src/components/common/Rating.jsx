import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Star rating display and interactive rating input
 * @component
 * @example
 * <Rating value={4.5} max={5} readonly />
 * <Rating value={rating} onChange={setRating} size="md" />
 */
const Rating = ({
  value = 0,
  max = 5,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false,
  precision = 0.5,
  className = '',
  'aria-label': ariaLabel = 'Rating',
  ...props
}) => {
  const [hoverValue, setHoverValue] = useState(null);
  const [focusIndex, setFocusIndex] = useState(-1);

  const displayValue = hoverValue !== null ? hoverValue : value;
  const fullStars = Math.floor(displayValue);
  const hasHalfStar = displayValue % 1 >= precision;
  const _emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  const handleKeyDown = useCallback((e, index) => {
    if (readonly) return;
    const starValue = index + 1;
    let newValue = value;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newValue = Math.min(max, value + precision);
        onChange?.(newValue);
        setFocusIndex(Math.min(max - 1, Math.ceil(newValue) - 1));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newValue = Math.max(0, value - precision);
        onChange?.(newValue);
        setFocusIndex(Math.max(0, Math.ceil(newValue) - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onChange?.(starValue);
        break;
      default:
        break;
    }
  }, [value, max, precision, readonly, onChange]);

  const handleClick = useCallback((index) => {
    if (readonly) return;
    const starValue = index + 1;
    onChange?.(starValue);
  }, [readonly, onChange]);

  const handleMouseEnter = useCallback((index) => {
    if (readonly) return;
    setHoverValue(index + 1);
  }, [readonly]);

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  const sizeStyle = {
    sm: { fontSize: '1rem' },
    md: { fontSize: 'var(--text-xl)' },
    lg: { fontSize: 'var(--text-2xl)' }
  };

  const classNames = [
    'rating',
    readonly ? 'rating--readonly' : 'rating--interactive',
    className
  ].filter(Boolean).join(' ');

  const stars = Array.from({ length: max }, (_, i) => {
    const starValue = i + 1;
    let fill = 'empty';

    if (starValue <= fullStars) {
      fill = 'filled';
    } else if (hasHalfStar && starValue === fullStars + 1) {
      fill = 'half';
    }

    return (
      <button
        key={i}
        type="button"
        role={readonly ? 'img' : 'radio'}
        aria-checked={readonly ? undefined : starValue === Math.round(value)}
        aria-label={`${starValue} out of ${max} stars`}
        aria-setsize={max}
        aria-posinset={starValue}
        className={`rating__star rating__star--${fill}`}
        onClick={() => handleClick(i)}
        onKeyDown={(e) => handleKeyDown(e, i)}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setFocusIndex(i)}
        onBlur={() => setFocusIndex(-1)}
        disabled={readonly}
        tabIndex={readonly ? -1 : (focusIndex === i ? 0 : -1)}
        style={sizeStyle[size]}
      >
        <svg className="rating__star-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    );
  });

  return (
    <div
      className={classNames}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={ariaLabel}
      aria-readonly={readonly}
      {...props}
    >
      <div className="rating__stars" onMouseLeave={handleMouseLeave}>
        {stars}
      </div>
      {showValue && !readonly && (
        <span className="rating__value" aria-hidden="true">
          {value.toFixed(precision === 1 ? 1 : 0)}
        </span>
      )}
    </div>
  );
};

Rating.displayName = 'Rating';

Rating.propTypes = {
  /** Current rating value */
  value: PropTypes.number,
  /** Maximum rating (number of stars) */
  max: PropTypes.number,
  /** Change handler */
  onChange: PropTypes.func,
  /** Star size */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Read-only display */
  readonly: PropTypes.bool,
  /** Show numeric value */
  showValue: PropTypes.bool,
  /** Precision (0.5 for half stars, 1 for full stars) */
  precision: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Accessible label */
  'aria-label': PropTypes.string,
};

Rating.defaultProps = {
  value: 0,
  max: 5,
  onChange: undefined,
  size: 'md',
  readonly: false,
  showValue: false,
  precision: 0.5,
  className: '',
  'aria-label': 'Rating',
};

export default Rating;
import { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Horizontal filter pills for categories
 * @component
 * @example
 * <FilterPills
 *   options={[
 *     { value: 'all', label: 'All', count: 100 },
 *     { value: 'fruits', label: 'Fruits', count: 30 },
 *     { value: 'vegetables', label: 'Vegetables', count: 25 }
 *   ]}
 *   value="fruits"
 *   onChange={setFilter}
 *   showCounts
 * />
 */
const FilterPills = ({
  options = [],
  value,
  onChange,
  showCounts = false,
  multiple = false,
  className = '',
  'aria-label': ariaLabel = 'Filter options',
  ...props
}) => {
  const selectedValues = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : (value ? [value] : []);
    }
    return value ? [value] : [];
  }, [value, multiple]);

  const isSelected = (optionValue) => selectedValues.includes(optionValue);

  const handleClick = (optionValue) => {
    if (multiple) {
      const newValues = isSelected(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
    }
  };

  const classNames = [
    'filter-pills',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="group" aria-label={ariaLabel} {...props}>
      <div className="filter-pills__list" role="listbox" aria-multiselectable={multiple}>
        {options.map((option, index) => {
          const selected = isSelected(option.value);
          const pillProps = {
            role: 'option',
            'aria-selected': selected,
            'aria-disabled': option.disabled,
            'data-value': option.value,
          };

          return (
            <button
              key={option.value || index}
              type="button"
              className={`filter-pill ${selected ? 'filter-pill--active' : ''} ${option.disabled ? 'filter-pill--disabled' : ''}`}
              onClick={() => !option.disabled && handleClick(option.value)}
              disabled={option.disabled}
              {...pillProps}
            >
              <span className="filter-pill__label">{option.label}</span>
              {showCounts && option.count !== undefined && (
                <span className="filter-pill__count" aria-hidden="true">
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

FilterPills.displayName = 'FilterPills';

FilterPills.propTypes = {
  /** Filter options: [{ value, label, count?, disabled? }] */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number,
      disabled: PropTypes.bool,
    })
  ),
  /** Current selected value(s) */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  /** Change handler */
  onChange: PropTypes.func,
  /** Show item counts */
  showCounts: PropTypes.bool,
  /** Allow multiple selections */
  multiple: PropTypes.bool,
  /** Container className */
  className: PropTypes.string,
  /** Accessible label */
  'aria-label': PropTypes.string,
};

FilterPills.defaultProps = {
  options: [],
  value: undefined,
  onChange: undefined,
  showCounts: false,
  multiple: false,
  className: '',
  'aria-label': 'Filter options',
};

export default FilterPills;
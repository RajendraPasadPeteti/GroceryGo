import PropTypes from 'prop-types';

/**
 * Badge component for status, discount, and pill variants
 * @component
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="discount">20% Off</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="outline">New</Badge>
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const variantClass = `badge--${variant}`;
  const sizeClass = size !== 'md' ? `badge--${size}` : '';

  const classNames = [
    'badge',
    variantClass,
    sizeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

Badge.propTypes = {
  /** Badge content */
  children: PropTypes.node.isRequired,
  /** Badge variant */
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info', 'discount', 'featured', 'outline']),
  /** Badge size */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

Badge.defaultProps = {
  variant: 'primary',
  size: 'md',
  className: '',
};

export default Badge;
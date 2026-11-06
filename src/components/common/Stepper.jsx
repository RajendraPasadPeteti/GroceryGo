import PropTypes from 'prop-types';

/**
 * Multi-step progress indicator for order tracking
 * @component
 * @example
 * <Stepper
 *   steps={[
 *     { label: 'Order Placed', description: 'Your order has been received' },
 *     { label: 'Processing', description: 'We are preparing your items' },
 *     { label: 'Shipped', description: 'Your order is on the way' },
 *     { label: 'Delivered', description: 'Order has been delivered' }
 *   ]}
 *   currentStep={2}
 *   orientation="horizontal"
 * />
 */
const Stepper = ({
  steps = [],
  currentStep = 0,
  orientation = 'horizontal',
  className = '',
  ...props
}) => {
  const orientationClass = orientation === 'vertical' ? 'stepper--vertical' : '';

  const classNames = [
    'stepper',
    orientationClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <nav className={classNames} aria-label="Progress steps" {...props}>
      <ol className="stepper__list" role="list" style={{ display: 'contents' }}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === steps.length - 1;

          const stepClasses = [
            'stepper__item',
            isActive ? 'stepper__item--active' : '',
            isCompleted ? 'stepper__item--completed' : '',
            !isActive && !isCompleted ? 'stepper__item--pending' : '',
          ].filter(Boolean).join(' ');

          return (
            <li key={index} className={stepClasses}>
              <div className="stepper__step">
                <span className="stepper__circle" aria-hidden="true">
                  {isCompleted ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="stepper__number">{index + 1}</span>
                  )}
                </span>
                <div className="stepper__content">
                  <span className="stepper__label">{step.label}</span>
                  {step.description && <span className="stepper__description">{step.description}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Stepper.displayName = 'Stepper';

Stepper.propTypes = {
  /** Array of step objects: [{ label, description? }] */
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
  /** Current active step index (0-based) */
  currentStep: PropTypes.number,
  /** Orientation */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

Stepper.defaultProps = {
  steps: [],
  currentStep: 0,
  orientation: 'horizontal',
  className: '',
};

export default Stepper;
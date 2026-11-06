import PropTypes from 'prop-types';

/**
 * Reusable card component with header, body, footer
 * @component
 * @example
 * <Card>
 *   <Card.Header title="Card Title" subtitle="Subtitle" action={<Button>Action</Button>} />
 *   <Card.Body>Card content goes here</Card.Body>
 *   <Card.Footer><Button>Footer Action</Button></Card.Footer>
 * </Card>
 */
const Card = ({ children, className = '', hover = false, ...props }) => {
  const hoverClass = hover ? 'card-hover' : '';

  const classNames = [
    'card',
    hoverClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <article className={classNames} {...props}>
      {children}
    </article>
  );
};

Card.displayName = 'Card';

Card.propTypes = {
  /** Card content (typically Card.Header, Card.Body, Card.Footer) */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Enable hover effect */
  hover: PropTypes.bool,
};

Card.defaultProps = {
  className: '',
  hover: false,
};

/** Card Header sub-component */
const Header = ({ title, subtitle, action, className = '', ...props }) => (
  <header className={`card__header ${className}`} {...props}>
    <div>
      {title && <h3 className="font-semibold text-lg">{title}</h3>}
      {subtitle && <p className="text-secondary text-sm mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </header>
);

Header.displayName = 'Card.Header';
Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};
Header.defaultProps = { title: undefined, subtitle: undefined, action: undefined, className: '' };

/** Card Body sub-component */
const Body = ({ children, className = '', ...props }) => (
  <div className={`card__body ${className}`} {...props}>
    {children}
  </div>
);

Body.displayName = 'Card.Body';
Body.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
Body.defaultProps = { className: '' };

/** Card Footer sub-component */
const Footer = ({ children, className = '', divided = false, ...props }) => (
  <footer className={`card__footer ${divided ? 'border-t' : ''} ${className}`} {...props}>
    {children}
  </footer>
);

Footer.displayName = 'Card.Footer';
Footer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  divided: PropTypes.bool,
};
Footer.defaultProps = { className: '', divided: false };

/** Card Image sub-component */
const Image = ({ src, alt, className = '', position = 'top', ...props }) => (
  <div className={`relative ${className}`} {...props}>
    <img src={src} alt={alt} className="w-full h-auto" />
    {position === 'cover' && <div className="absolute inset-0 bg-black/30" />}
  </div>
);

Image.displayName = 'Card.Image';
Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  position: PropTypes.oneOf(['top', 'bottom', 'cover']),
};
Image.defaultProps = { alt: '', className: '', position: 'top' };

Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;
Card.Image = Image;

export default Card;
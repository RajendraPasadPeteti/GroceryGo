import React from 'react';

const PageHeader = ({ title, subtitle, actions, breadcrumb }) => {
  return (
    <header className="page-header" role="heading" aria-level="1">
      <div className="page-header__left">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="page-header__actions">{actions}</div>
      )}
    </header>
  );
};

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb__list">
        {items.map((item, index) => (
          <li key={item.href || index} className="breadcrumb__item">
            {index > 0 && (
              <svg className="breadcrumb__separator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}
            {item.href ? (
              <a href={item.href} className="breadcrumb__link">{item.label}</a>
            ) : (
              <span className="breadcrumb__current" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol    >
    </nav>
  );
};

export default PageHeader;
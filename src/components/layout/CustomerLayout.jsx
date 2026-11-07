import React from 'react';

/**
 * CustomerLayout provides a clean wrapper for customer-facing pages.
 * Persistent customer navigation is provided by the top Navbar and bottom Footer.
 */
const CustomerLayout = ({ children }) => {
  return (
    <div className="customer-page-wrapper">
      {children}
    </div>
  );
};

export default CustomerLayout;

import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-wrapper animate-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;


import Header from '../components/Header';
import Sidebar from '../components/sidebar/Sidebar';

import React from 'react';
import { Outlet } from 'react-router';

const Layout = () => {
  return (
    <>
      <Header />
      <main className="flex h-[calc(100vh-64px)]"> {/* adjust if Header height is different */}
        <Sidebar />
        <div className="flex-1 overflow-auto p-4"> {/* <- This is important! */}
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default Layout;


////////////////////////////


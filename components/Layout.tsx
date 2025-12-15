import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-stone-100 font-serif text-gray-900">
      <main className="w-full min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
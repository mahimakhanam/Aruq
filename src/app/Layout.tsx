import React from 'react';
import { Header } from './components/Header';
import Footer from './components/Footer';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
};
'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export function HeaderWrapper() {
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && (
        <div className="hidden md:block">
          <Header />
        </div>
      )}

      {pathname === '/' && !isAdminRoute && (
        <div className="block md:hidden">
          <Header />
        </div>
      )}
    </>
  );
}

export function FooterWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) return null;

  return <Footer />;
}

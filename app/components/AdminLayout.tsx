'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Menu,
  X,
  Home,
  Bell,
  LayoutGrid,
  ShoppingCart,
  Package,
  Truck,
  Settings,
  ChevronDown,
  UserCog,
  FileText,
  UserCheck,
} from 'lucide-react';
import Image from 'next/image';
interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [openUsers, setOpenUsers] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/account/me', {
          method: 'GET',
          credentials: 'include', // Ensures cookies are sent with the request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Authentication failed');
        }

        const data = await res.json();
        console.log('Auth data:', data.role);

        if (data.role === 'ADMIN' || data.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          console.log('Not an admin user:', data.role);
          router.push(`/login?returnUrl=${encodeURIComponent('/admin')}`);
          //  router.push(`/admin`);
        }
      } catch (error) {
        console.error('Auth check failed', error);
        router.push(`/login?returnUrl=${encodeURIComponent('/admin')}`);
        // router.push(`/admin`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <LayoutGrid className="h-5 w-5" />,
      active: pathname === '/admin',
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      active: pathname.startsWith('/admin/orders'),
    },
    {
      name: 'Coupons',
      href: '/admin/coupon',
      icon: <ShoppingCart className="h-5 w-5" />,
      active: pathname.startsWith('/admin/coupon'),
    },
    {
      name: 'Users',
      href: '#',
      icon: <Users className="h-5 w-5" />,
      children: [
        {
          name: 'Customers',
          href: '/admin/customers',
          icon: <Users className="h-4 w-4" />,
          active: pathname.startsWith('/admin/customers'),
        },
        {
          name: 'Delivery Staff',
          href: '#',
          icon: <UserCheck className="h-4 w-4" />,
          active: pathname.startsWith('#'),
        },
        {
          name: 'Admin Users',
          href: '#',
          icon: <UserCog className="h-4 w-4" />,
          active: pathname.startsWith('#'),
        },
      ],
    },
    {
      name: 'Logistics',
      href: '#',
      icon: <Truck className="h-5 w-5" />,
      active: pathname.startsWith('#'),
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: <Package className="h-5 w-5" />,
      active: pathname.startsWith('/admin/products'),
    },
    {
      name: 'Notifications',
      href: '#',
      icon: <Bell className="h-5 w-5" />,
      active: pathname.startsWith('#'),
    },
    {
      name: 'Content',
      href: '/admin/reports',
      icon: <FileText className="h-5 w-5" />,
      active: pathname.startsWith('/admin/reports'),
    },
    {
      name: 'Settings',
      href: '#',
      icon: <Settings className="h-5 w-5" />,
      active: pathname.startsWith('#'),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-40 w-full bg-white p-4 shadow-sm lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden bg-black lg:flex lg:w-56 lg:flex-col">
        <div className="flex items-center justify-center border-b border-gray-200 p-4">
          <Image src={'/Group.png'} alt={'logo'} width={500} height={200} className="h-10 w-36" />
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigationItems.map(item =>
            item.children ? (
              <div key={item.name}>
                <button
                  onClick={() => setOpenUsers(!openUsers)}
                  className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium"
                >
                  <span className="flex items-center gap-2 text-gray-300">
                    {item.icon}
                    {item.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-300 transition-transform ${
                      openUsers ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openUsers && (
                  <div className="mt-1 ml-6 space-y-1">
                    {item.children.map(child => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`flex items-center rounded-md px-3 py-2 text-sm ${
                          child.active ? 'bg-primaryColor text-white' : 'text-gray-300'
                        }`}
                      >
                        <span className="mr-2">{child.icon}</span>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  item.active ? 'bg-primaryColor text-white' : 'text-gray-300'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            )
          )}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <Link
            href="/"
            className="hover:bg-primaryColor flex items-center rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            <Home className="mr-3 h-5 w-5" />
            Back to Shop
          </Link>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="bg-opacity-75 fixed inset-0 bg-gray-600"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative flex h-full w-full max-w-xs flex-col bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5">
              <h1 className="text-xl font-bold text-teal-700">Admin Dashboard</h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigationItems.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                    item.active ? 'bg-teal-100 text-teal-900' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="border-t border-gray-200 px-4 py-4">
              <Link
                href="/"
                className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="mr-3 h-5 w-5" />
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="bg-background no-scrollbar flex-1 overflow-y-auto pt-16 lg:pt-0">
          <div className="hidden bg-white shadow-sm sm:block">
            <div className="flex justify-end px-6 py-4">
              <Bell size={20} />
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

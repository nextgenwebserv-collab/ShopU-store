'use client';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-background1 text-gray-800">
      <div className="bg-white px-6 py-10 text-center sm:px-10 lg:px-20">
        {/* Newsletter Section */}
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-semibold">Join our newsletter and get</h2>
          <p className="my-2 text-sm text-black">
            Join our email subscription now to get updates on promotions and coupons.
          </p>
          <form className="mx-auto mt-6 flex max-w-lg items-center justify-center gap-2">
            <input
              type="email"
              placeholder="Your Email Address"
              className="bg-background1 w-full rounded-full border-none px-4 py-3 text-center text-white placeholder-gray-100 focus:outline-none sm:flex-1 sm:text-left"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-full border bg-white px-6 py-3 text-[#40A1A6]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block">
        <div className="mx-auto grid max-w-7xl gap-10 border-t px-6 py-10 text-center text-sm sm:grid-cols-2 sm:px-10 sm:text-left md:grid-cols-4 lg:px-20">
          {/* ShopU Logo */}
          <div className="flex flex-col items-center sm:items-start">
            <Image
              src="/Group.png"
              alt="Shopu Logo"
              width={144}
              height={40}
              className="object-contain py-2"
            />

            <div className="text-md mt-4 space-y-2 text-white">
              <Link
                href="tel:7070472634"
                className="flex items-center justify-center gap-2 sm:justify-start"
              >
                <Phone size={16} />
                Call Us: +91 7070472634
              </Link>
              <Link
                href="mailto:shipulogistics@gmail.com"
                className="flex items-center justify-center gap-2 py-1 sm:justify-start"
              >
                <Mail size={16} />
                Email: shipulogistics@gmail.com
              </Link>

              <p className="flex justify-center gap-2 py-1 sm:justify-start">
                <MapPin size={28} />
                Address: N C 105, NEAR SBI OFFICER, KANKARBAGH, <br /> Ashok Nagar (Patna),
                Sampatchak, Patna- 800020
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="text-white">
            <h3 className="mb-3 text-xl font-semibold">Categorys</h3>
            <ul className="space-y-4 py-1 font-medium">
              <li>
                <Link href="/product?category=Baby%20Care">Baby Care</Link>
              </li>
              <li>
                <Link href="/product?category=Women%20Care">Women Care</Link>
              </li>
              <li>
                <Link href="/product?category=Personal%20Care">Personal Care</Link>
              </li>
              <li>
                <Link href="/product?category=Ayurveda">Ayurveda</Link>
              </li>
              <li>
                <Link href="/product?category=Health%20Device">Health Device</Link>
              </li>
            </ul>
          </div>

          {/* Health Concern */}
          <div className="text-white">
            <h3 className="mb-3 text-xl font-semibold">Health Condition</h3>
            <ul className="space-y-4 py-1 font-medium">
              <li>Diabetes Care</li>
              <li>Elderly Care</li>
              <li>Oral Care</li>
              <li>Stomach Care</li>
              <li>Liver Care</li>
            </ul>
          </div>

          {/* Account */}
          <div className="text-white">
            <h3 className="mb-3 text-xl font-semibold">Account</h3>
            <ul className="space-y-4 py-1 font-medium">
              <li>
                <Link href="/pages/terms?tracker=footer_navlinks">Terms & conditions</Link>
              </li>
              <li>
                <Link href="/pages/shipping?tracker=footer_navlinks">Shipping & Delivery</Link>
              </li>

              <li>
                <Link href="/pages/privacy?tracker=footer_navlinks">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/pages/cancellation?tracker=footer_navlinks">
                  Cancellation & Returns
                </Link>
              </li>
              <li>
                <Link href="/account/orders?tracker=footer_navlinks">Track Order</Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Footer */}
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 border-t px-6 py-6 text-xl font-medium text-white sm:flex-row sm:justify-between sm:px-10 lg:px-20">
          <p>© 2025, All rights reserved</p>

          {/* Payment Icons */}
          <div className="flex gap-4">
            {/* Payment Icons */}
            <Image src="/visa.png" alt="Visa" width={64} height={34} />
            <Image src="/mastercard.png" alt="MasterCard" width={64} height={34} />
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 text-[#E4F3F4]">
            <Link href="https://www.facebook.com" target="_blank">
              <FaFacebookF className="cursor-pointer hover:text-gray-800" />
            </Link>

            <Link href="https://www.linkedin.com" target="_blank">
              <FaLinkedinIn className="cursor-pointer hover:text-gray-800" />
            </Link>

            <Link href="https://www.instagram.com" target="_blank">
              <FaInstagram className="cursor-pointer hover:text-gray-800" />
            </Link>

            <Link href="https://www.twitter.com" target="_blank">
              <FaTwitter className="cursor-pointer hover:text-gray-800" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        <div className="grid gap-8 border-t px-10 py-6 text-center text-sm md:grid-cols-4">
          {/* ShopU Logo */}
          <div className="flex flex-col">
            <div className="h-18 w-44">
              {/* Mobile ShopU Logo */}
              <Image
                src="/Group.png"
                alt="Shopu Logo"
                width={200}
                height={72}
                className="object-contain py-2"
              />
            </div>

            <div className="space-y-2 text-lg text-white">
              <Link href="tel:7070472634" className="flex items-center gap-2 py-2">
                <Phone size={24} />
                Call Us: +91 7070472634
              </Link>

              <Link href="mailto:shipulogistics@gmail.com" className="flex items-center gap-2 py-2">
                <Mail size={24} />
                Email: shipulogistics@gmail.com
              </Link>
              <p className="flex gap-2 py-2 text-left">
                <MapPin size={40} />
                Address: N C 105, NEAR SBI OFFICER, KANKARBAGH,
                <br /> Ashok Nagar (Patna), Sampatchak, Patna- 800020
                <br />
              </p>
            </div>
          </div>
          <hr className="text-white" />

          <div className="flex justify-between text-left">
            {/* Categories */}
            <div className="text-white">
              <h3 className="mb-3 text-xl font-semibold">Categorys</h3>
              <ul className="space-y-4 py-1 font-medium">
                <li>
                  <Link href="/product?category=Baby%20Care">Baby Care</Link>
                </li>
                <li>
                  <Link href="/product?category=Women%20Care">Women Care</Link>
                </li>
                <li>
                  <Link href="/product?category=Personal%20Care">Personal Care</Link>
                </li>
                <li>
                  <Link href="/product?category=Ayurveda">Ayurveda</Link>
                </li>
                <li>
                  <Link href="/product?category=Health%20Device">Health Device</Link>
                </li>
              </ul>
            </div>

            {/* Health Condition */}
            <div className="text-white">
              <h3 className="mb-3 text-xl font-semibold">Health Condition</h3>
              <ul className="space-y-4 py-1 font-medium">
                <li>Diabetes Care</li>
                <li>Elderly Care</li>
                <li>Oral Care</li>
                <li>Stomach Care</li>
                <li>Liver Care</li>
              </ul>
            </div>
          </div>
          <hr className="text-white" />

          <div className="flex items-center justify-between text-left">
            {/* Account */}
            <div className="text-white">
              <h3 className="mb-3 text-xl font-semibold">Account</h3>
              <ul className="space-y-4 py-1 font-medium">
                <li>
                  <Link href="/pages/terms?tracker=footer_navlinks">Terms & conditions</Link>
                </li>
                <li>
                  <Link href="/pages/shipping?tracker=footer_navlinks">Shipping & Delivery</Link>
                </li>

                <li>
                  <Link href="/pages/privacy?tracker=footer_navlinks">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/pages/cancellation?tracker=footer_navlinks">
                    Cancellation & Returns
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders?tracker=footer_navlinks">Track Order</Link>
                </li>
              </ul>
            </div>

            <div className="mt-14 w-28">
              {/* Social Icons */}
              <div className="text-primaryColor grid h-28 grid-cols-2 gap-4 p-2 text-4xl">
                <Link href="https://www.facebook.com" target="_blank">
                  <FaFacebookF className="cursor-pointer rounded-full bg-white p-2" />
                </Link>

                <Link href="https://www.linkedin.com" target="_blank">
                  <FaLinkedinIn className="cursor-pointer rounded-full bg-white p-2" />
                </Link>

                <Link href="https://www.instagram.com" target="_blank">
                  <FaInstagram className="cursor-pointer rounded-full bg-white p-2" />
                </Link>

                <Link href="https://www.twitter.com" target="_blank">
                  <FaTwitter className="cursor-pointer rounded-full bg-white p-2" />
                </Link>
              </div>

              {/* Payment Icons */}
              <div className="flex justify-center py-4">
                <Image src="/visa.png" alt="Visa" width={64} height={32} />
                <Image src="/mastercard.png" alt="MasterCard" width={64} height={32} />
              </div>
            </div>
          </div>
          <hr className="text-white" />

          {/* Bottom Footer */}
          <div className="px-6 py-4 text-xl font-medium text-white lg:px-20">
            <p>© 2025, All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

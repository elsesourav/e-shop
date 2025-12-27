import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#232323] text-gray-300 py-10 font-sans">
      <div className="w-[90%] md:w-[86%] lg:w-[84%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              E-Shop
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Perfect ecommerce platform to start your business from scratch.
              Quality products, best prices.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Linkedin, href: '#' },
                { Icon: Instagram, href: '#' },
              ].map(({ Icon, href }, index) => (
                <Link
                  key={index}
                  href={href}
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <Icon size={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                'Track Orders',
                'Shipping',
                'Wishlist',
                'My Account',
                'Order History',
                'Returns',
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Information
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                'Our Story',
                'Careers',
                'Privacy Policy',
                'Terms & Conditions',
                'Latest News',
                'Contact Us',
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact Us
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-gray-400">
                  Sector - 4, Salt Lake
                  <br />
                  Kolkata, India 700001
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <a
                  href="mailto:elsesourav@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  elsesourav@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <a
                  href="tel:+918250032643"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  +91 82500 32643
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2025 elsesourav Private Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Facebook, Twitter, Instagram, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const handlePrototypeClick = (featureName: string) => {
    alert(`${featureName} is a future feature for this prototype.`);
  };

  return (
    <footer className="bg-stone-900 text-stone-300 py-12 border-t-4 border-pal-red">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            A&apos;ruq{' '}
            <span className="font-arabic ml-1 text-pal-green">عروق</span>
          </h2>

          <p className="text-sm font-light leading-relaxed">
            A Palestinian knowledge hub preserving literature, memory, and
            heritage. We are dedicated to promoting cultural authenticity through
            digital preservation.
          </p>

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => handlePrototypeClick('Facebook sharing')}
              className="hover:text-pal-red transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handlePrototypeClick('Twitter sharing')}
              className="hover:text-pal-green transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handlePrototypeClick('Instagram sharing')}
              className="hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white mb-2 border-l-2 border-pal-green pl-2">
            Platform
          </h3>

          <Link to="/" className="hover:text-pal-red transition-colors text-sm">
            Home
          </Link>

          <Link
            to="/archive"
            className="hover:text-pal-red transition-colors text-sm"
          >
            Literary Archive
          </Link>

          <Link
            to="/dashboard"
            className="hover:text-pal-red transition-colors text-sm"
          >
            Contributor Portal
          </Link>

          <Link
            to="/events"
            className="hover:text-pal-red transition-colors text-sm"
          >
            Cultural Events
          </Link>

          <Link
            to="/about"
            className="hover:text-pal-red transition-colors text-sm"
          >
            About Us
          </Link>

          <Link
            to="/donate"
            className="hover:text-pal-red transition-colors text-sm"
          >
            Support Us
          </Link>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white mb-2 border-l-2 border-pal-black pl-2">
            Resources
          </h3>

          <button
            type="button"
            onClick={() => handlePrototypeClick('Heritage Partners')}
            className="hover:text-pal-red transition-colors text-sm text-left"
          >
            Heritage Partners
          </button>

          <button
            type="button"
            onClick={() => handlePrototypeClick('Research Access')}
            className="hover:text-pal-red transition-colors text-sm text-left"
          >
            Research Access
          </button>

          <button
            type="button"
            onClick={() => handlePrototypeClick('Copyright Policy')}
            className="hover:text-pal-red transition-colors text-sm text-left"
          >
            Copyright Policy
          </button>

          <button
            type="button"
            onClick={() => handlePrototypeClick('Privacy Policy')}
            className="hover:text-pal-red transition-colors text-sm text-left"
          >
            Privacy Policy
          </button>

          <button
            type="button"
            onClick={() => handlePrototypeClick('Terms of Service')}
            className="hover:text-pal-red transition-colors text-sm text-left"
          >
            Terms of Service
          </button>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white mb-2 border-l-2 border-pal-red pl-2">
            Contact Us
          </h3>

          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-pal-green" />
            <span>contact@aruq.com</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-pal-green" />
            <span>University of Sharjah</span>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 mt-12 pt-6 text-center text-xs text-stone-500 flex flex-col items-center">
        <p>
          &copy; {new Date().getFullYear()} A&apos;ruq Foundation. All rights
          reserved.
        </p>

        <p className="mt-2 text-[10px] uppercase tracking-widest text-pal-green opacity-60">
          Preserving Roots • Honoring Memory
        </p>
      </div>
    </footer>
  );
};

export default Footer;

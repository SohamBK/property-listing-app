const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              About Property App
            </h3>
            <p className="text-sm text-gray-400">
              Your trusted platform to buy and sell properties.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="text-sm space-y-2 text-gray-400">
              <li>
                <a href="/properties" className="hover:text-orange-500">
                  Browse Properties
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <p className="text-sm text-gray-400">Email: info@propertyapp.com</p>
            <p className="text-sm text-gray-400">Phone: +1 (555) 123-4567</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6">
          <p className="text-center text-sm text-gray-500">
            © 2026 Property App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

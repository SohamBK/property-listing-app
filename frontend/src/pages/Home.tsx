import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!location.trim()) return;

    navigate(`/properties?location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 h-[70vh] bg-gray-200 text-center px-4">
        <h1 className="text-4xl font-semibold text-gray-800 mb-6">
          Connecting People & Property
        </h1>

        {/* Search Bar */}
        <div className="flex w-full max-w-2xl bg-white rounded-full overflow-hidden shadow">
          <input
            type="text"
            placeholder="Enter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="flex-1 px-4 py-3 outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-orange-500 text-white px-6"
          >
            Search
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-white font-semibold mb-3">
                About Propertist
              </h3>
              <p className="text-sm text-gray-400">
                Your trusted platform to buy, sell, and rent properties.
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
                <li>
                  <a href="#" className="hover:text-orange-500">
                    Become an Agent
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-3">Contact</h3>
              <p className="text-sm text-gray-400">
                Email: info@propertist.com
              </p>
              <p className="text-sm text-gray-400">Phone: +1 (555) 123-4567</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 pt-6">
            <p className="text-center text-sm text-gray-500">
              © 2026 Propertist. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

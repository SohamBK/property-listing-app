import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";

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

      <Footer />
    </div>
  );
};

export default Home;

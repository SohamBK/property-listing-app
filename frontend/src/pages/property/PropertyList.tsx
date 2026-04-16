import { useEffect, useState } from "react";
import { getPropertiesApi } from "../../features/property/propertyApi";
import PropertyCard from "../../components/property/PropertyCard";
import { type Property } from "../../types/property";
import { useSearchParams } from "react-router-dom";
import Footer from "../../components/common/Footer";

const PropertyList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    location: "",
    bhk: "",
    type: "",
    owner: "",
    minPrice: "",
    maxPrice: "",
  });

  const fetchProperties = async (page = 1, customFilters = filters) => {
    try {
      setLoading(true);

      const res = await getPropertiesApi({
        ...customFilters,
        page,
        limit: 3,
      });

      setProperties(res.data.properties);
      setPagination({
        page: res.pagination.page,
        totalPages: res.pagination.totalPages,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const location = searchParams.get("location") || "";
    const bhk = searchParams.get("bhk") || "";
    const type = searchParams.get("type") || "";
    const owner = searchParams.get("owner") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const page = parseInt(searchParams.get("page") || "1");

    const newFilters = { location, bhk, type, owner, minPrice, maxPrice };
    setFilters(newFilters);
    fetchProperties(page, newFilters);
  }, [searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.location) params.set("location", filters.location);
    if (filters.bhk) params.set("bhk", filters.bhk);
    if (filters.type) params.set("type", filters.type);
    if (filters.owner) params.set("owner", filters.owner);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleReset = () => {
    setFilters({
      location: "",
      bhk: "",
      type: "",
      owner: "",
      minPrice: "",
      maxPrice: "",
    });
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow mb-6 flex items-center gap-4 overflow-hidden">
            {/* Location */}
            <input
              placeholder="Location"
              value={filters.location}
              className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => handleFilterChange("location", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            {/* BHK */}
            <input
              placeholder="BHK"
              value={filters.bhk}
              className="w-24 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => handleFilterChange("bhk", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            {/* Type */}
            <select
              value={filters.type}
              className="w-40 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">Type</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>

            {/* Min Price */}
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              className="w-36 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            {/* Max Price */}
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              className="w-36 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            {/* Search */}
            <button
              onClick={handleSearch}
              className="bg-orange-500 text-white px-5 py-2 rounded-lg whitespace-nowrap"
            >
              Search
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="border px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 whitespace-nowrap"
            >
              Reset
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center text-gray-500">
              Loading properties...
            </div>
          )}

          {/* No Results */}
          {!loading && properties.length === 0 && (
            <div className="text-center text-gray-500">
              No properties found.
            </div>
          )}

          {/* Grid */}
          {!loading && properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    pagination.page === i + 1 ? "bg-orange-500 text-white" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyList;

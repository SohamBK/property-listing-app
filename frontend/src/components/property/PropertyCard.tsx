import { type Property } from "../../types/property";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

const PropertyCard = ({ property }: { property: Property }) => {
  const navigate = useNavigate();
  const config = property.configurations[0];

  // featured image
  const featuredImage = property.media.find((item) => item.isFeatured);

  // fallback image
  const imageUrl = featuredImage
    ? `${BASE_URL}${featuredImage.url}`
    : "https://plus.unsplash.com/premium_vector-1724653697938-cc4868490f8f";

  return (
    <div
      onClick={() => navigate(`/properties/${property.id}`)}
      className="cursor-pointer bg-white border rounded-xl shadow-sm overflow-hidden"
    >
      {/* Image */}
      <img
        src={imageUrl}
        alt={property.title}
        className="w-full h-48 object-cover"
      />

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{property.title}</h3>
        <p className="text-gray-500 text-sm">{property.location}</p>

        <div className="mt-2">
          <span className="text-orange-500 font-semibold">
            ₹ {config?.price}
          </span>
          <span className="ml-2 text-sm text-gray-600">{config?.bhk} BHK</span>
        </div>

        <p className="text-sm text-gray-500 mt-2">{property.subtitle}</p>
      </div>
    </div>
  );
};

export default PropertyCard;

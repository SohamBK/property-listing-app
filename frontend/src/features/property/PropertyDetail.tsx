import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import {
  getPropertyByIdApi,
  createEnquiryApi,
  deletePropertyApi,
  getEnquiriesByPropertyApi,
} from "../../features/property/propertyApi";
import { type Enquiry } from "../../types/enquiry";
import Footer from "../../components/common/Footer";

const BASE_URL = "http://localhost:5000";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Enquiries list (for agents)
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [enquiriesError, setEnquiriesError] = useState("");

  // Enquiry form states (for non-agents)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    global: "",
  });

  const isPropertyOwner =
    isAuthenticated &&
    user?.role === "agent" &&
    (property?.agentId === user.id || property?.agent?.id === user.id);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setErrors({
        name: "",
        email: "",
        phone: "",
        message: "",
        global: "",
      });

      await createEnquiryApi({
        ...form,
        propertyId: property.id,
      });

      setErrors({ ...errors, global: "" });
      setSuccessMsg("Enquiry submitted successfully!");

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const fieldErrors: { [key: string]: string } = {};
        errorData.errors.forEach((errorMsg: string) => {
          if (errorMsg.includes("Name")) {
            fieldErrors.name = errorMsg;
          } else if (errorMsg.includes("Email")) {
            fieldErrors.email = errorMsg;
          } else if (errorMsg.includes("Phone")) {
            fieldErrors.phone = errorMsg;
          } else if (errorMsg.includes("Message")) {
            fieldErrors.message = errorMsg;
          }
        });
        setErrors({ ...errors, ...fieldErrors, global: "" });
      } else {
        setErrors({
          ...errors,
          global: errorData?.message || "Failed to submit enquiry",
        });
      }
      setSuccessMsg("");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await getPropertyByIdApi(id!);
      setProperty(res.data.property);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    if (!id || !isPropertyOwner) return;

    try {
      setEnquiriesLoading(true);
      setEnquiriesError("");
      const res = await getEnquiriesByPropertyApi(id);
      setEnquiries(res.data.enquiries || []);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to load enquiries";
      setEnquiriesError(errorMsg);
      console.error(err);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      setDeleteError("");
      await deletePropertyApi(id!);
      navigate("/properties?owner=me");
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete property.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (property) {
      fetchEnquiries();
    }
  }, [property, isPropertyOwner]);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!property) {
    return <div className="text-center mt-10">Property not found</div>;
  }

  const config = property.configurations[0];

  const featuredImage = property.media.find((item: any) => item.isFeatured);

  const imageUrl = featuredImage
    ? `${BASE_URL}${featuredImage.url}`
    : "https://plus.unsplash.com/premium_vector-1724653697938-cc4868490f8f";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 py-6">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow overflow-hidden">
          {/* Image */}
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-100 object-cover"
          />

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h1 className="text-2xl font-semibold mb-2">{property.title}</h1>

            <p className="text-gray-500 mb-4">{property.subtitle}</p>

            {/* Price + BHK */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-orange-500 text-xl font-semibold">
                ₹ {config?.price}
              </span>
              <span className="text-gray-600">{config?.bhk} BHK</span>
              <span className="text-gray-600">{config?.unitSize}</span>
            </div>

            {/* Location */}
            <p className="text-gray-700 mb-4">📍 {property.location}</p>

            {/* Description */}
            <div
              className="text-gray-600 mb-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: property.description }}
            />

            {isAuthenticated &&
              user?.role === "agent" &&
              (property.agentId === user.id ||
                property.agent?.id === user.id) && (
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <button
                    onClick={() => navigate(`/edit-property/${property.id}`)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-60"
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                  {deleteError && (
                    <span className="text-sm text-red-500">{deleteError}</span>
                  )}
                </div>
              )}

            {/* Agent Enquiries Table or User Enquiry Form */}
            <div className="border-t mt-6 pt-6">
              {isPropertyOwner ? (
                // AGENT VIEW - Show enquiries table
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Enquiries Received
                  </h3>

                  {enquiriesError && (
                    <p className="text-red-500 text-sm mb-4">
                      {enquiriesError}
                    </p>
                  )}

                  {enquiriesLoading ? (
                    <p className="text-gray-600">Loading enquiries...</p>
                  ) : enquiries.length === 0 ? (
                    <p className="text-gray-500">
                      No enquiries received yet for this property.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b">
                          <tr>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              Name
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              Email
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              Phone
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              Message
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {enquiries.map((enquiry) => (
                            <tr
                              key={enquiry.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="px-4 py-3">{enquiry.name}</td>
                              <td className="px-4 py-3 text-blue-600">
                                <a href={`mailto:${enquiry.email}`}>
                                  {enquiry.email}
                                </a>
                              </td>
                              <td className="px-4 py-3 text-blue-600">
                                <a href={`tel:${enquiry.phone}`}>
                                  {enquiry.phone}
                                </a>
                              </td>
                              <td className="px-4 py-3 max-w-xs truncate">
                                {enquiry.message || "—"}
                              </td>
                              <td className="px-4 py-3 text-gray-600 text-xs">
                                {formatDate(enquiry.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                // NON-AGENT VIEW - Show enquiry form
                <div>
                  <h3 className="text-lg font-semibold mb-4">Enquire Now</h3>

                  {errors.global && (
                    <p className="text-red-500 text-sm mb-4">{errors.global}</p>
                  )}

                  {successMsg && (
                    <p className="text-green-600 mb-3">{successMsg}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                      <input
                        name="name"
                        placeholder="Your Name"
                        value={form.name}
                        className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.name ? "border-red-500" : ""
                        }`}
                        onChange={handleChange}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-1">
                      <input
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.email ? "border-red-500" : ""
                        }`}
                        onChange={handleChange}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <input
                        name="phone"
                        placeholder="Phone"
                        value={form.phone}
                        className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.phone ? "border-red-500" : ""
                        }`}
                        onChange={handleChange}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <textarea
                        name="message"
                        placeholder="Message"
                        value={form.message}
                        className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 h-24 ${
                          errors.message ? "border-red-500" : ""
                        }`}
                        onChange={handleChange}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit Enquiry"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetail;

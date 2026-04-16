import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import {
  getPropertyByIdApi,
  updatePropertyApi,
} from "../../features/property/propertyApi";

interface PropertyForm {
  title: string;
  subtitle: string;
  description: string;
  location: string;
  possessionDate: string;
  type: "RESIDENTIAL" | "COMMERCIAL";
  listingType: "SALE" | "RESALE" | "NEW_LAUNCH";
}

interface ConfigurationItem {
  id: string;
  bhk: string;
  price: string;
  unitSize: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  type?: string;
  listingType?: string;
  configurations?: string;
  images?: string;
  global?: string;
}

const createUUID = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [form, setForm] = useState<PropertyForm>({
    title: "",
    subtitle: "",
    description: "",
    location: "",
    possessionDate: "",
    type: "RESIDENTIAL",
    listingType: "SALE",
  });
  const [configurations, setConfigurations] = useState<ConfigurationItem[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [propertyOwnerId, setPropertyOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getPropertyByIdApi(id);
        const property = res.data.property;

        setForm({
          title: property.title || "",
          subtitle: property.subtitle || "",
          description: property.description || "",
          location: property.location || "",
          possessionDate: property.possessionDate
            ? property.possessionDate.split("T")[0]
            : "",
          type: property.type || "RESIDENTIAL",
          listingType: property.listingType || "SALE",
        });

        setConfigurations(
          property.configurations.map((config: any) => ({
            id: createUUID(),
            bhk: String(config.bhk),
            price: String(config.price),
            unitSize: config.unitSize,
          })),
        );

        setExistingMedia(
          property.media?.map(
            (media: any) => `http://localhost:5000${media.url}`,
          ) || [],
        );
        setPropertyOwnerId(property.agentId || property.agent?.id || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (
      !loading &&
      propertyOwnerId &&
      isAuthenticated &&
      user?.role === "agent"
    ) {
      const loggedInId = user.id;
      if (propertyOwnerId !== loggedInId) {
        navigate("/properties");
      }
    }
  }, [loading, propertyOwnerId, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (images.length === 0) {
      setNewImagePreviews([]);
      return;
    }
    const previews = images.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(previews);

    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [images]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      global: undefined,
    }));
  };

  const handleConfigChange = (
    id: string,
    field: keyof Omit<ConfigurationItem, "id">,
    value: string,
  ) => {
    setConfigurations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
    setErrors((current) => ({
      ...current,
      configurations: undefined,
      global: undefined,
    }));
  };

  const addConfiguration = () => {
    setConfigurations((current) => [
      ...current,
      { id: createUUID(), bhk: "", price: "", unitSize: "" },
    ]);
  };

  const removeConfiguration = (configId: string) => {
    setConfigurations((current) =>
      current.filter((item) => item.id !== configId),
    );
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(files);
    setErrors((current) => ({
      ...current,
      images: undefined,
      global: undefined,
    }));
  };

  const validateForm = () => {
    const validationErrors: FormErrors = {};

    if (!form.title.trim()) validationErrors.title = "Title is required.";
    if (!form.description.trim())
      validationErrors.description = "Description is required.";
    if (!form.location.trim())
      validationErrors.location = "Location is required.";
    if (!form.type) validationErrors.type = "Property type is required.";
    if (!form.listingType)
      validationErrors.listingType = "Listing type is required.";

    if (configurations.length === 0) {
      validationErrors.configurations =
        "At least one configuration is required.";
    } else if (
      configurations.some(
        (config) =>
          !config.bhk.trim() || !config.price.trim() || !config.unitSize.trim(),
      )
    ) {
      validationErrors.configurations =
        "All configuration fields are required.";
    }

    if (existingMedia.length === 0 && images.length === 0) {
      validationErrors.images = "Please upload at least one image.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !id) return;

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("subtitle", form.subtitle.trim());
    formData.append("description", form.description.trim());
    formData.append("location", form.location.trim());
    formData.append("possessionDate", form.possessionDate);
    formData.append("type", form.type);
    formData.append("listingType", form.listingType);
    formData.append(
      "configurations",
      JSON.stringify(
        configurations.map((config) => ({
          bhk: Number(config.bhk),
          price: Number(config.price),
          unitSize: config.unitSize.trim(),
        })),
      ),
    );

    images.forEach((file) => formData.append("images", file));

    try {
      setSubmitting(true);
      setErrors({});
      setSuccessMessage("");

      await updatePropertyApi(id, formData);
      setSuccessMessage("Property updated successfully.");
      navigate(`/properties/${id}`);
    } catch (error: any) {
      setErrors({
        global:
          error?.response?.data?.message ||
          "Unable to update property. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading property...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow p-8">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Property
            </h1>
            <p className="text-gray-600">
              Update listing details, configurations, and optional images.
            </p>
          </div>

          {errors.global && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              {errors.global}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
              {successMessage}
            </div>
          )}

          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-gray-700">Title</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Property title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-sm text-gray-700">Subtitle</span>
                <input
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Short subtitle"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm text-gray-700">Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="Describe the property"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm text-gray-700">Location</span>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="City or area"
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location}</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-sm text-gray-700">Possession Date</span>
                <input
                  name="possessionDate"
                  type="date"
                  value={form.possessionDate}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-gray-700">Type</span>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-gray-700">Listing Type</span>
                <select
                  name="listingType"
                  value={form.listingType}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="SALE">Sale</option>
                  <option value="RESALE">Resale</option>
                  <option value="NEW_LAUNCH">New Launch</option>
                </select>
                {errors.listingType && (
                  <p className="text-sm text-red-500">{errors.listingType}</p>
                )}
              </label>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Configurations
                </h2>
                <button
                  type="button"
                  onClick={addConfiguration}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
                >
                  Add Configuration
                </button>
              </div>
              {errors.configurations && (
                <p className="mb-4 text-sm text-red-500">
                  {errors.configurations}
                </p>
              )}
              <div className="space-y-4">
                {configurations.map((config, index) => (
                  <div
                    key={config.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-center justify-between mb-4 gap-4">
                      <span className="font-medium text-gray-700">
                        Configuration {index + 1}
                      </span>
                      {configurations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeConfiguration(config.id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="space-y-2">
                        <span className="text-sm text-gray-700">BHK</span>
                        <input
                          type="number"
                          min="0"
                          value={config.bhk}
                          onChange={(event) =>
                            handleConfigChange(
                              config.id,
                              "bhk",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                          placeholder="2"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-gray-700">Price</span>
                        <input
                          type="number"
                          min="0"
                          value={config.price}
                          onChange={(event) =>
                            handleConfigChange(
                              config.id,
                              "price",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                          placeholder="7500000"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm text-gray-700">Unit Size</span>
                        <input
                          value={config.unitSize}
                          onChange={(event) =>
                            handleConfigChange(
                              config.id,
                              "unitSize",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                          placeholder="1200 sqft"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <label className="space-y-2">
                <span className="text-sm text-gray-700">Upload Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-700"
                />
                {errors.images && (
                  <p className="text-sm text-red-500">{errors.images}</p>
                )}
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Uploading new images will replace existing media for this
                listing.
              </p>
              {existingMedia.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Existing Images
                  </p>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {existingMedia.map((src, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl border border-gray-200"
                      >
                        <img
                          src={src}
                          alt={`existing-${index}`}
                          className="h-24 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {newImagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    New Images
                  </p>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {newImagePreviews.map((src, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl border border-gray-200"
                      >
                        <img
                          src={src}
                          alt={`new-${index}`}
                          className="h-24 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(`/properties/${id}`)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-orange-500 px-6 py-2 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Updating..." : "Update Property"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;

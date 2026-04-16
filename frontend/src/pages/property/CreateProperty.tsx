import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactQuill from "react-quill-new";
import { type RootState } from "../../app/store";
import { createPropertyApi } from "../../features/property/propertyApi";

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
  possessionDate?: string;
  type?: string;
  listingType?: string;
  configurations?: string;
  images?: string;
  global?: string;
}

const initialFormState: PropertyForm = {
  title: "",
  subtitle: "",
  description: "",
  location: "",
  possessionDate: "",
  type: "RESIDENTIAL",
  listingType: "SALE",
};

const createUUID = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const initialConfiguration: ConfigurationItem = {
  id: createUUID(),
  bhk: "",
  price: "",
  unitSize: "",
};

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
];

const CreateProperty = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const [form, setForm] = useState<PropertyForm>(initialFormState);
  const [configurations, setConfigurations] = useState<ConfigurationItem[]>([
    { ...initialConfiguration },
  ]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "agent") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (images.length === 0) {
      setImagePreviews([]);
      return;
    }

    const urls = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);

    return () => {
      urls.forEach(URL.revokeObjectURL);
    };
  }, [images]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
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
      {
        id: crypto.randomUUID(),
        bhk: "",
        price: "",
        unitSize: "",
      },
    ]);
  };

  const removeConfiguration = (id: string) => {
    setConfigurations((current) => current.filter((item) => item.id !== id));
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

    if (!form.title.trim()) {
      validationErrors.title = "Title is required.";
    }
    if (!form.description.trim()) {
      validationErrors.description = "Description is required.";
    }
    if (!form.location.trim()) {
      validationErrors.location = "Location is required.";
    }
    if (!form.possessionDate.trim()) {
      validationErrors.possessionDate = "Possession date is required.";
    }
    if (!form.type) {
      validationErrors.type = "Property type is required.";
    }
    if (!form.listingType) {
      validationErrors.listingType = "Listing type is required.";
    }
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
    if (images.length === 0) {
      validationErrors.images = "Please upload at least one image.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

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

    images.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setSubmitting(true);
      setErrors({});
      setSuccessMessage("");

      await createPropertyApi(formData);
      setSuccessMessage(
        "Property created successfully. Redirecting to My Listings...",
      );

      setTimeout(() => {
        navigate("/properties?owner=me");
      }, 900);
    } catch (error: any) {
      setErrors({
        global:
          error?.response?.data?.message ||
          "Unable to create property. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow p-8">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Create Property
            </h1>
            <p className="text-gray-600">
              Add a new listing with property details, configuration, and media.
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

            <div className="space-y-2">
              <span className="text-sm text-gray-700">Description</span>
              <div className="bg-white overflow-visible">
                <ReactQuill
                  theme="snow"
                  value={form.description}
                  onChange={(value) => {
                    setForm((current) => ({ ...current, description: value }));
                    setErrors((current) => ({
                      ...current,
                      description: undefined,
                      global: undefined,
                    }));
                  }}
                  modules={modules}
                  formats={formats}
                  className="h-40 mb-12"
                />
              </div>
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

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
                {errors.possessionDate && (
                  <p className="text-sm text-red-500">
                    {errors.possessionDate}
                  </p>
                )}
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
                          name="bhk"
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
                          name="price"
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
                          name="unitSize"
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

              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {imagePreviews.map((src, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-xl border border-gray-200"
                    >
                      <img
                        src={src}
                        alt={`preview-${index}`}
                        className="h-24 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/properties?owner=me")}
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
                {submitting ? "Creating..." : "Create Property"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;

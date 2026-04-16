import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { registerApi } from "../features/auth/authApi";
import { setUser } from "../features/auth/authSlice";
import Footer from "../components/common/Footer";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    businessName: "",
    address: "",
    location: "",
    expertise: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    businessName: "",
    address: "",
    location: "",
    expertise: "",
    global: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear field-specific error on change
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setErrors({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
        businessName: "",
        address: "",
        location: "",
        expertise: "",
        global: "",
      });

      let payload = { ...form };

      if (form.role === "user") {
        delete payload.businessName;
        delete payload.address;
        delete payload.location;
        delete payload.expertise;
      }

      const res = await registerApi(payload);

      dispatch(setUser(res.data.user));
      navigate("/");
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const fieldErrors: { [key: string]: string } = {};
        errorData.errors.forEach((errorMsg: string) => {
          const match = errorMsg.match(/"(\w+)"/);
          if (match) {
            const field = match[1];
            const capitalizedField =
              field.charAt(0).toUpperCase() + field.slice(1);
            fieldErrors[field] = `${capitalizedField} is required`;
          }
        });
        setErrors({ ...errors, ...fieldErrors, global: "" });
      } else {
        setErrors({
          ...errors,
          global: errorData?.message || "Registration failed",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

          {errors.global && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {errors.global}
            </p>
          )}

          <div className="mb-4">
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.name ? "border-red-500" : ""
              }`}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
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
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
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
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.password ? "border-red-500" : ""
              }`}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div className="mb-4">
            <select
              name="role"
              value={form.role}
              className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.role ? "border-red-500" : ""
              }`}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="agent">Agent</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* Agent Fields */}
          {form.role === "agent" && (
            <>
              <div className="mb-4">
                <input
                  name="businessName"
                  placeholder="Business Name"
                  value={form.businessName}
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.businessName ? "border-red-500" : ""
                  }`}
                  onChange={handleChange}
                />
                {errors.businessName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <input
                  name="address"
                  placeholder="Address"
                  value={form.address}
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.address ? "border-red-500" : ""
                  }`}
                  onChange={handleChange}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div className="mb-4">
                <input
                  name="location"
                  placeholder="Location"
                  value={form.location}
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.location ? "border-red-500" : ""
                  }`}
                  onChange={handleChange}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div className="mb-4">
                <select
                  name="expertise"
                  value={form.expertise}
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.expertise ? "border-red-500" : ""
                  }`}
                  onChange={handleChange}
                >
                  <option value="">Select Expertise</option>
                  <option value="NEW_LAUNCH">New Launch</option>
                  <option value="RENT">Rent</option>
                  <option value="RESALE">Resale</option>
                </select>
                {errors.expertise && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.expertise}
                  </p>
                )}
              </div>
            </>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 mt-4"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;

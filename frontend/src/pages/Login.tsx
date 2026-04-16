import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginApi } from "../features/auth/authApi";
import { setUser } from "../features/auth/authSlice";
import Footer from "../components/common/Footer";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    global: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrors({ email: "", password: "", global: "" });

      const res = await loginApi(form);

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
        setErrors({ ...errors, global: errorData?.message || "Login failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

          {errors.global && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {errors.global}
            </p>
          )}

          <div className="mb-4">
            <input
              type="email"
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

          <div className="mb-6">
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

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;

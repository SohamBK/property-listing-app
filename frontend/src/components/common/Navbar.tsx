import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { logoutApi } from "../../features/auth/authApi";

const Navbar = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const ownerParam = searchParams.get("owner");
  const isPropertiesActive =
    location.pathname === "/properties" && ownerParam !== "me";
  const isMyListingsActive =
    location.pathname === "/properties" && ownerParam === "me";
  const isCreatePropertyActive = location.pathname === "/create-property";
  const isLoginActive = location.pathname === "/login";
  const isRegisterActive = location.pathname === "/register";

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {}

    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <h1
        className="text-xl font-semibold text-orange-500 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Property App
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/properties")}
          className={`px-3 py-2 rounded-lg ${
            isPropertiesActive
              ? "bg-orange-500 text-white"
              : "text-gray-700 hover:text-orange-500"
          }`}
        >
          Properties
        </button>

        {isAuthenticated && user?.role === "agent" && (
          <>
            <button
              onClick={() => navigate("/properties?owner=me")}
              className={`px-3 py-2 rounded-lg ${
                isMyListingsActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:text-orange-500"
              }`}
            >
              My Listings
            </button>

            <button
              onClick={() => navigate("/create-property")}
              className={`px-3 py-2 rounded-lg ${
                isCreatePropertyActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:text-orange-500"
              }`}
            >
              Create Property
            </button>
          </>
        )}

        {!isAuthenticated ? (
          <>
            <button
              onClick={() => navigate("/login")}
              className={`px-3 py-2 rounded-lg ${
                isLoginActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:text-orange-500"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className={`px-3 py-2 rounded-lg ${
                isRegisterActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:text-orange-500"
              }`}
            >
              Register
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <span className="text-gray-700 text-sm">
                {user?.name} ({user?.role === "agent" ? "Agent" : "User"})
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/common/Navbar";
import { refreshAuthApi } from "./features/auth/authApi";
import { setUser, logout } from "./features/auth/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await refreshAuthApi();
        dispatch(setUser(res.data.user));
      } catch (error) {
        dispatch(logout());
      }
    };

    void restoreSession();
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <AppRoutes />
    </>
  );
}

export default App;

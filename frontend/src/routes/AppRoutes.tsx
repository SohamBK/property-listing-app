import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PropertyList from "../pages/property/PropertyList";
import CreateProperty from "../pages/property/CreateProperty";
import EditProperty from "../pages/property/EditProperty";
import PropertyDetail from "../features/property/PropertyDetail";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/properties" element={<PropertyList />} />
      <Route path="/create-property" element={<CreateProperty />} />
      <Route path="/edit-property/:id" element={<EditProperty />} />
      <Route path="/properties/:id" element={<PropertyDetail />} />
    </Routes>
  );
};

export default AppRoutes;

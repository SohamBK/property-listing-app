import api from "../../services/axios";

export const getPropertiesApi = async (params: any) => {
  const response = await api.get("/properties", { params });
  return response.data;
};

export const createPropertyApi = async (data: FormData) => {
  const res = await api.post("/properties", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updatePropertyApi = async (id: string, data: FormData) => {
  const res = await api.put(`/properties/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deletePropertyApi = async (id: string) => {
  const res = await api.delete(`/properties/${id}`);
  return res.data;
};

export const getPropertyByIdApi = async (id: string) => {
  const res = await api.get(`/properties/${id}`);
  return res.data;
};

export const createEnquiryApi = async (data: any) => {
  const res = await api.post("/enquiries", data);
  return res.data;
};

export const getEnquiriesByPropertyApi = async (propertyId: string) => {
  const res = await api.get(`/enquiries/property/${propertyId}`);
  return res.data;
};

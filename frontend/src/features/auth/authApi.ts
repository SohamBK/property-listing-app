import api from "../../services/axios";
import { API_ENDPOINTS } from "../../services/endpoints";

export const loginApi = async (data: { email: string; password: string }) => {
  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);
  return response.data;
};

export const registerApi = async (data: any) => {
  const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
  return response.data;
};

export const logoutApi = async () => {
  const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  return response.data;
};

export const refreshAuthApi = async () => {
  const response = await api.post(API_ENDPOINTS.AUTH.REFRESH);
  return response.data;
};

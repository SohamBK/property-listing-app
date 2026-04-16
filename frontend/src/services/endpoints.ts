export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  PROPERTY: {
    LIST: "/properties",
    DETAIL: (id: string) => `/properties/${id}`,
    CREATE: "/properties",
  },
  ENQUIRY: {
    CREATE: "/enquiries",
  },
};

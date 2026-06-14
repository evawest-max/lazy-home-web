// api.js

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

const APISub = import.meta.env.VITE_BACKEND_URL;

// ================== INTERCEPTORS ==================

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ======================================================
// ====================== AUTH ==========================
// ======================================================

export const registerUser = (data) =>
  API.post("/api/v1/auth/register", data);

export const loginUser = (data) =>
  API.post("/api/v1/auth/login", data);

export const verifyEmail = (token) =>
  API.post(`/api/v1/verification/verify-email/${token}`);

export const resendVerificationEmail = (email) =>
  API.post("/api/v1/verification/resend-verification-email", {
    email,
  });

export const sendOTP = ({ phone }) =>
  API.post("/api/v1/verification/send-otp", {
    phone,
  });

export const verifyOTP = ({ phone, otp }) =>
  API.post("/api/v1/verification/verify-otp", {
    phone,
    otp,
  });

export const forgotPassword = (email) =>
  API.post("/api/v1/auth/forgot-password", {
    email,
  });

export const resetPassword = (token, password) =>
  API.post(`/api/v1/auth/reset-password/${token}`, { password });

export const changePassword = (
  currentPassword,
  newPassword
) =>
  API.post("/api/v1/auth/change-password", {
    currentPassword,
    newPassword,
  });

export const googleSignIn = (idToken) =>
  API.post("/api/v1/auth/google-login", { token: idToken });

// ======================================================
// ====================== USER ==========================
// ======================================================

export const getCurrentUser = () =>
  API.get("/api/v1/users/me");

export const updateProfile = (formData, id) =>
  API.patch(`/api/v1/users/profile/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });




// ======================================================
// ================== VERIFICATION ======================
// ======================================================

export const submitVerification = (formData) =>
  API.post("/api/v1/verifications", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getVerificationStatus = () =>
  API.get("/api/v1/verifications/status");

// ======================================================
// ===================== PROPERTIES =====================
// ======================================================

export const createProperty = (formData) =>
  API.patch("/api/v1/properties", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateProperty = (
  id,
  formData
) =>
  API.put(
    `/api/v1/properties/${id}`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

export const deleteProperty = (id) =>
  API.delete(`/api/v1/properties/${id}`);

export const getAllProperties = () =>
  API.get("/api/v1/properties");

export const getSingleProperty = (id) =>
  API.get(`/api/v1/properties/${id}`);

export const getUserProperties = () =>
  API.get("/api/v1/properties/user/my-properties");

export const uploadPropertyMedia = (
  id,
  formData
) =>
  API.post(
    `/api/v1/properties/${id}/media`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

// ======================================================
// ================= PROPERTY SEARCH ====================
// ======================================================

export const advancedPropertySearch = (
  params
) =>
  API.get(
    "/api/v1/properties/search/advanced",
    {
      params,
    }
  );

export const nearbyProperties = (
  lng,
  lat,
  radius
) =>
  API.get("/api/v1/properties/nearby", {
    params: {
      lng,
      lat,
      radius,
    },
  });

export const getTrendingProperties = () =>
  API.get("/api/v1/properties/trending");

export const getRecommendedProperties =
  () =>
    API.get(
      "/api/v1/properties/recommendations"
    );

export const saveProperty = (id) =>
  API.post(
    `/api/v1/properties/${id}/save`
  );

export const getAnalyticsDashboard =
  () =>
    API.get(
      "/api/v1/properties/analytics/dashboard"
    );

// ======================================================
// ==================== PAYMENTS ========================
// ======================================================

export const initializeEscrowPayment = (
  propertyId
) =>
  API.post(
    "/api/v1/payments/initialize",
    {
      propertyId,
    }
  );

export const verifyEscrowPayment = (
  reference
) =>
  API.get(
    `/api/v1/payments/verify/${reference}`
  );

export const confirmInspection = (
  transactionId
) =>
  API.post(
    `/api/v1/payments/confirm-inspection/${transactionId}`
  );

// ======================================================
// =================== TRANSACTIONS =====================
// ======================================================

export const getUserTransactions =
  () =>
    API.get(
      "/api/v1/transactions/my-transactions"
    );

export const getSingleTransaction = (
  id
) =>
  API.get(
    `/api/v1/transactions/${id}`
  );

// ======================================================
// ===================== DISPUTES =======================
// ======================================================

export const createDispute = (
  data
) =>
  API.post("/api/v1/disputes", data);

export const uploadDisputeEvidence = (
  disputeId,
  formData
) =>
  API.post(
    `/api/v1/disputes/${disputeId}/evidence`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

export const resolveDispute = (
  disputeId,
  resolution
) =>
  API.patch(
    `/api/v1/disputes/${disputeId}/resolve`,
    {
      resolution,
    }
  );

// ======================================================
// ====================== REPORTS =======================
// ======================================================

export const reportUser = (data) =>
  API.post("/api/v1/reports", data);

// ======================================================
// ===================== MESSAGES =======================
// ======================================================

export const sendMessage = (data) =>
  API.post("/api/v1/messages", data);

export const getMessages = (userId) =>
  API.get(
    `/api/v1/messages/${userId}`
  );

// ======================================================
// ================== NOTIFICATIONS =====================
// ======================================================

export const getNotifications =
  () =>
    API.get(
      "/api/v1/notifications"
    );

export const markNotificationAsRead =
  (id) =>
    API.patch(
      `/api/v1/notifications/${id}/read`
    );

// ======================================================
// ====================== ADMIN =========================
// ======================================================

export const getAdminDashboard =
  () =>
    API.get(
      "/api/v1/admin/dashboard"
    );

export const moderateProperty = (
  propertyId,
  data
) =>
  API.patch(
    `/api/v1/admin/properties/${propertyId}/moderate`,
    data
  );

export const suspendUser = (
  userId,
  reason
) =>
  API.patch(
    `/api/v1/admin/users/${userId}/suspend`,
    {
      reason,
    }
  );

export const reviewVerification = (
  verificationId,
  data
) =>
  API.patch(
    `/api/v1/admin/verifications/${verificationId}/review`,
    data
  );

// ======================================================
// ====================== HEALTH ========================
// ======================================================

export const checkBackendHealth =
  () => API.get("/health");

// ======================================================
// ===================== WEBHOOKS =======================
// ======================================================

export const paystackWebhookTest =
  (payload) =>
    API.post(
      "/api/v1/webhooks/paystack",
      payload
    );

// ======================================================
// ====================== SOCKET ========================
// ======================================================

export const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL;
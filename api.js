// api.js

import axios from "axios";

// const API = axios.create({
//   baseURL: import.meta.env.VITE_BACKEND_URL,
// });
const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
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
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      try {
        // Call refresh endpoint with cookies
        const { data } = await API.post( "/api/v1/auth/refresh-token");
        const newToken = data?.data?.accessToken;

        if (newToken) {
          localStorage.setItem("token", newToken);
          error.config.headers["Authorization"] = `Bearer ${newToken}`;
          return API(error.config); // retry original request
        }
      } catch (refreshError) {
        // Refresh failed → logout
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
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

export const loginOutUser = (data) =>
  API.post("/api/v1/auth/logout");

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

export const setupTwoFactor = (idToken) =>
  API.post("/api/v1/twofactor/setup");

export const verifyTwoFactor = (idToken) =>
  API.post("/api/v1/twofactor/verify", { token: idToken });

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
  API.post("/api/v1/properties", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateProperty = (
  id,
  formData
) =>
  API.post(
    `/api/v1/properties/update-property`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
// export const updateProperty = (id, formData) => 
// API.post(`/api/v1/properties/update-property`, formData); 

export const deleteProperty = (id) =>
  API.delete(`/api/v1/properties/delete/${id}`);

export const getAllProperties = () =>
  API.get("/api/v1/properties");

export const getFeaturedProperties = () =>
  API.get("/api/v1/properties/featured");

export const getSingleProperty = (id) =>
  API.get(`/api/v1/properties/${id}`);

export const increaseViewAndStoreHistory = (id) =>
  API.get(`/api/v1/properties/viewsAndHistory/${id}`);

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

export const advancedPropertySearch = (params) =>
  API.get("/api/v1/properties/search/advanced", { params });

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

export const getAnalyticsDashboardAndProperties =
  () =>
    API.get(
      `/api/v1/properties/analytics/dashboard`
    );

// ======================================================
// ==================== PAYMENTS ========================
// ======================================================

export const getBankcodes = (
) =>
  API.get(
    `/api/v1/payments/banks/codes`
  );


export const initializeFundwallet = (
  amount
) =>
  API.post(
    "/api/v1/wallet/fund",
    {
      amount: amount,
    }
  );

export const getwallet = (
) =>
  API.get(
    `/api/v1/wallet/get-wallet`
  );

export const getwalletTransactions = (
  data
) =>
  API.get(
    `/api/v1/wallet/transactions`, data
  );

export const payRent = (
  data
) =>
  API.post(
    "/api/v1/escrow/pay-rent", data
  );

export const releaseKeys = (
  id
) =>
  API.post(
    `/api/v1/escrow/confirm-handover/${id}`
  );

export const confirmInspection = (
  escrowId
) =>
  API.post(
    `/api/v1/escrow/confirm-inspection`, { escrowId }
  );

export const releaseFunds = (
  escrowId, releaseCode, otp
) =>
  API.post(
    "/api/v1/escrow/confirm-release", { escrowId, releaseCode, otp }
  );

export const refundEscrow = (
  id,
  reason,
  authCode
) =>
  API.post(
    `/api/v1/escrow/${id}/refund`, { reason, authCode }
  );

// API call helper
export const downloadTenancyDoc = (escrowId) => {
  return API.get(`/api/v1/escrow/tenancy/${escrowId}/download`);
};

export const adminFinalizeTransferController = (
  transferCode, otp,
) =>
  API.post(
    "/api/v1/escrow/confirm-release", { transferCode, otp, }
  );

export const getAllEscrowPayments = ({ page = 1, limit = 10 }) =>
  API.get("/api/v1/escrow/payments", {
    params: { page, limit }
  });



export const getSingleEscrowPayment = (
) =>
  API.get(
    "/api/v1/escrow/payments/:id", data
  );


// ======================================================
// =================== bank verification =====================
// ======================================================

export const getActiveSettlementAccount = (
) =>
  API.get(
    `/api/v1/settlementAccount/settlement-account/active`
  );

export const verifyBankAccount = (accountNumber, bankCode,
) =>
  API.post(
    `/api/v1/settlementAccount/settlement-account/resolve`, { accountNumber, bankCode }
  );

export const confirmAccount = (verificationToken
) =>
  API.post(
    `/api/v1/settlementAccount/settlement-account/confirm`, { verificationToken }
  );

// ======================================================
// =================== withdrawal =====================
// ======================================================
export const requestWalletWithdrawal = (
  amount, authpin
) =>
  API.post("/api/v1/withdrawals/wallet/withdraw", { amount, authpin });

export const finalizeWalletWithdrawal = (
  withdrawalId, otp
) =>
  API.post("/api/v1/withdrawals/wallet/withdraw/finalize", { withdrawalId, otp });



// ======================================================
// =================== TRANSACTIONS =====================
// ======================================================

// export const getUserTransactions =
//   () =>
//     API.get(
//       "/api/v1/transactions/my-transactions"
//     );

export const getSingleTransaction = (
  id
) =>
  API.get(
    `/api/v1/wallet/${id}/single-transaction`
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

export const markAllAsRead =
  () =>
    API.patch(
      `/api/v1/notifications/read-all`
    );

export const markNotificationAsRead =
  (id) =>
    API.patch(
      `/api/v1/notifications/${id}/read`
    );

export const getUnreadCount =
  () =>
    API.patch(
      `/api/v1/notifications/unread-count`
    );
// ======================================================
// ====================== ADMIN =========================
// ======================================================

//Admin financial API
export const getfinancialSummary =
  () =>
    API.get(
      "/api/v1/admin/finance/summary"
    );
export const getWithdrawals =
  () =>
    API.get(
      "/api/v1/admin/finance/withdrawals"
    );
export const getWithdrawal =
  (withdrawalId) =>
    API.get(
      `/api/v1/admin/finance/withdrawals/${withdrawalId}`
    );
export const getEscrows =
  () =>
    API.get(
      "/api/v1/admin/finance/escrows"
    );
export const getEscrow =
  (escrowId) =>
    API.get(
      `/api/v1/admin/finance/escrows/${escrowId}`
    );

export const getFinanceReconcilation =
  () =>
    API.get(
      "/api/v1/admin/finance/reconciliation"
    );

//Admin Other API
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
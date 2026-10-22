import api from "./api";

export const getTransactionSummary = async () => {
  const response = await api.get("/transactions/summary");
  return response.data;
};

export const getMonthlySummary = async () => {
  const response = await api.get("/transactions/monthly-summary");
  return response.data;
};

export const getCategorySummary = async () => {
  const response = await api.get("/transactions/category-summary");
  return response.data;
};

export const getRecentTransactions = async () => {
  const response = await api.get("/transactions", {
    params: {
      page: 1,
      limit: 5,
      sortBy: "transaction_date",
      sortOrder: "desc",
    },
  });

  return response.data;
};

export const getTransactions = async (params = {}) => {
  const response = await api.get("/transactions", { params });

  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await api.post("/transactions", transactionData);

  return response.data;
};

export const updateTransaction = async (id, transactionData) => {
  const response = await api.put(`/transactions/${id}`, transactionData);

  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);

  return response.data;
};

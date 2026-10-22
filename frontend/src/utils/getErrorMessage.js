const getErrorMessage = (error, fallbackMessage) => {
  const responseData = error.response?.data;

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors
      .map((item) => item.msg || item.message)
      .filter(Boolean)
      .join(" ");
  }

  //Request was sent but no response was received
  if (typeof error.message === "string" && !error.response) {
    return "Unable to connect to the server. Please check your connection.";
  }

  // Unexpected error
  return fallbackMessage;
};

export default getErrorMessage;

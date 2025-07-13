const normalizeError = (err) => {
  const errorObj = {
    type: "generic",
    message: "Something went wrong. Please try again.",
  };



  const msg = err?.message?.toLowerCase() || "";
  const status = err?.response?.status;

  if (status >= 500) {
    return { type: "server", message: "Server error occurred" };
  }

  if (status === 408 || err.code === "ECONNABORTED") {
    return { type: "timeout", message: "Request timed out" };
  }

  if (!navigator.onLine || msg.includes("offline")) {
    errorObj.type = "offline";
    errorObj.message =
      "You appear to be offline. Please check your internet connection.";
  } else if (
    err.name === "AbortError" ||
    err.code === "ECONNABORTED" ||
    msg.includes("timeout")
  ) {
    errorObj.type = "timeout";
    errorObj.message = "Request timed out. Please check your connection.";
  } else if (err.response?.status >= 500) {
    errorObj.type = "server";
    errorObj.message = "Temporary server error. Please try again later.";
  } else if (msg.includes("network") || msg.includes("failed to fetch")) {
    errorObj.type = "network";
    errorObj.message = "Network error. Please check your internet.";
  }

  return errorObj;
};

export default normalizeError;

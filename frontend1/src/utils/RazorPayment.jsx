import axios from "axios";
import API_BASE_URL from "../api";

const RazorPayment = async ({ cartItems, deliveryfee, user, mobileNumber }) => {
  try {
    // 1️⃣ Send cart + delivery fee to backend to calculate amount
    const res = await axios.post(`${API_BASE_URL}/api/payment/create-order`, {
      cartItems,
      deliveryfee,
    });

    const order = res.data; // { id, amount, currency }
    console.log("✅ Order Created. Amount:", order.amount);

    // 2️⃣ Wrap in a Promise to return Razorpay response
    return new Promise((resolve, reject) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // 🧠 from .env
        amount: order.amount,
        currency: order.currency,
        name: "Shopique",
        description: "Test Transaction",
        order_id: order.id,
        handler: function (response) {
          console.log("💰 Payment Success:", response);

          resolve(response.razorpay_payment_id);
        },
        prefill: {
          name: user.username,
          email: user.email,
          contact: mobileNumber,
        },
        theme: {
          color: "#007AFF",
        },
        modal: {
          ondismiss: function () {
            console.log("🛑 Payment popup closed");
            reject("Payment Cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  } catch (error) {
    console.error("❌ Payment Error:", error);
    alert("Something went wrong with the payment!");
    return null;
  }
};

export default RazorPayment;

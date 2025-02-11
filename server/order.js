const express = require("express");
const router = express.Router();
const Order = require("./models/orderschema");


router.post("/add", async (req, res) => {
  console.log("hi")
  const {
    userId,
    cartItems, 
    totalPrice,
    mobileNumber,
    deliveryAddress,
    paymentMethod,
  } = req.body;

  if (
    !userId ||
    !cartItems ||
    !totalPrice ||
    !mobileNumber ||
    !deliveryAddress ||
    !paymentMethod
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Create a new order
    const newOrder = new Order({
      userId,
      OrderedItems: cartItems, // Properly mapping cartItems to OrderedItems
      totalPrice,
      mobileNumber,
      deliveryAddress,
      paymentMethod,
    });

    await newOrder.save();
    return res.status(201).json({
      message: "Order placed successfully!",
      orderId: newOrder._id, 
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json({ message: "Failed to place order. Please try again." });
  }
});

router.get("/fetch/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("orders fetching...")
  console.log(userId)

  try {
    const MyOrders = await Order.find({ userId });
    if(MyOrders){
      return res.status(201).json({
        message: "Order fetched successfully!", data: MyOrders,
       })
    }else{
      return res.status(201).json({
        message: "No Orders found",
       })
    }
    
  } catch (error) {
    console.error("Error fetching orders:", error); 
  }
});

module.exports = router;

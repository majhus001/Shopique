const express = require("express");
const router = express.Router();
const Cart = require("../models/CartSchema");
const mongoose = require("mongoose");

// 👉 POST: Add product to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId or productId.",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity: quantity || 1 }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({ productId, quantity: quantity || 1 });
      }
    }

    await cart.save();

    res.status(201).json({
      success: true,
      message: "Product added to cart successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 👉 GET: Fetch cart by userId
router.get("/fetch", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required to fetch the cart.",
    });
  }

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    return res.status(200).json({
      success: true,
      cart: cart || { items: [] },
    });
  } catch (error) {
    console.error("Error fetching cart data:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the cart data.",
      error: error.message,
    });
  }
});

// 👉 GET: Check if product exists in user's cart
router.get("/check", async (req, res) => {
  const { userId, productId } = req.query;

  try {
    const cart = await Cart.findOne({ userId });

    const exists = cart?.items.some(
      (item) => item.productId.toString() === productId
    );

    res.json({ exists: !!exists });
  } catch (error) {
    console.error("Error checking item in cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add this new route to your cart router
router.post("/check-multiple", async (req, res) => {
  const { userId, productIds } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    const status = {};
    productIds.forEach((productId) => {
      const exists = cart?.items.some(
        (item) => item.productId.toString() === productId
      );
      status[productId] = !!exists;
    });

    res.json({ status });
  } catch (error) {
    console.error("Error checking multiple items in cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 👉 PUT: Update quantity of item in cart
router.put("/update-quantity", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity || quantity < 1) {
    return res.status(400).json({
      message:
        "Invalid input. Please provide userId, productId, and quantity >= 1.",
    });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart." });
    }

    item.quantity = quantity;

    await cart.save();

    return res.status(200).json({
      message: "Cart item quantity updated successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return res.status(500).json({
      message: "Failed to update item quantity. Please try again.",
    });
  }
});

// 👉 DELETE: Remove a product from cart
router.delete("/delete/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    res.status(200).json({ message: "Item removed from cart." });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// 👉 DELETE: Clear entire cart for a user
router.delete("/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    cart.items = [];
    await cart.save();

    res.json({ success: true, message: "Cart cleared successfully!" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
});

module.exports = router;

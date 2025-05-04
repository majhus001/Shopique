import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Billing.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";
import BillPreviewTemplate from "./BillPreviewTemplate";
import API_BASE_URL from "../../api";
import {
  FiSearch,
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiPrinter,
  FiDownload,
  FiXCircle,
  FiDollarSign,
  FiCreditCard,
  FiUser,
  FiPhone,
  FiHome,
  FiBarChart2,
  FiLogOut,
  FiSave,
  FiMail,
  FiGrid,
  FiList,
  FiPackage,
  FiShoppingBag,
  FiSmartphone,
  FiFilter,
} from "react-icons/fi";
import RecentBills from "./RecentBills";

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;
  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [billingPage, setBillingPage] = useState(true);

  // Billing specific states
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customer, setCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18); // Default tax rate (%)
  const [note, setNote] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [recentBills, setRecentBills] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    mobile: "",
    username: "",
    email: "",
    address: "",
  });
  const [searchByMobile, setSearchByMobile] = useState(true); // Toggle between mobile and name search

  // Notification system
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });

    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    setInvoiceNumber(`INV-${year}${month}${day}-${random}`);
  };

  // Fetch user data if not available in state
  useEffect(() => {
    if (!user) {
      fetchUserData();
    }
  }, [user]);

  // Fetch product data from backend
  useEffect(() => {
    fetchProductData();
  }, []);

  // Fetch recent bills
  useEffect(() => {
    const fetchRecentBills = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/billing/fetch`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setRecentBills(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching recent bills:", error);
      }
    };

    fetchRecentBills();
  }, []);

  // Initialize invoice number
  useEffect(() => {
    generateInvoiceNumber();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);

        // First try to fetch from customers API
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/customers/fetch`,
            {
              withCredentials: true,
            }
          );
          setCustomers(response.data.data);
          console.log(
            "Customers fetched successfully:",
            response.data.data.length
          );
        } catch (customerError) {
          console.log(
            "Customer API not available yet, falling back to users API"
          );

          // Fallback to users API if customer API is not yet available
          const response = await axios.get(`${API_BASE_URL}/api/auth/fetch`);
          setCustomers(response.data.data);
          console.log("Users fetched as customers:", response.data.data.length);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        showNotification("Failed to load customers", "error");
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Get category counts dynamically
  const getCategoryCounts = () => {
    // Start with 'all' category
    const counts = {
      all: products.length
    };

    // Dynamically count products by category
    products.forEach(product => {
      if (product.category) {
        if (!counts[product.category]) {
          counts[product.category] = 0;
        }
        counts[product.category]++;
      }
    });

    return counts;
  };

  // Get the category counts (used directly in the render)

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/checkvaliduser`,
        {
          withCredentials: true,
        }
      );

      if (!response.data.user) {
        navigate("/login");
        return;
      }

      const userId = response.data.user.userId;
      const userRes = await axios.get(
        `${API_BASE_URL}/api/auth/fetch/${userId}`
      );
      setUser(userRes.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Fetch product data from backend
  const fetchProductData = async () => {
    try {
      setLoadingProducts(true);
      const productres = await axios.get(`${API_BASE_URL}/api/products/fetchAll`);

      if (productres.data.data) {
        setProducts(productres.data.data);
        console.log("Products fetched successfully:", productres.data.data.length);
      } else {
        console.log("No products found or invalid response format");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handle sidebar collapse state change
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      console.log(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Handle adding product to cart
  const addToCart = (product) => {
    // Check if product is out of stock
    if (product.stock <= 0) {
      showNotification(`${product.name} is out of stock`, "error");
      return;
    }

    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      // Check if adding more would exceed stock
      if (existingItem.quantity >= product.stock) {
        showNotification(
          `Cannot add more ${product.name}. Stock limit reached.`,
          "warning"
        );
        return;
      }

      // Update quantity if product already in cart
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      showNotification(`Added another ${product.name} to cart`);
    } else {
      // Add new product to cart
      setCart([...cart, { ...product, quantity: 1 }]);
      showNotification(`${product.name} added to cart`);
    }
  };

  // Handle removing product from cart
  const removeFromCart = (productId) => {
    const productToRemove = cart.find((item) => item._id === productId);
    if (productToRemove) {
      showNotification(`${productToRemove.name} removed from cart`, "info");
    }
    setCart(cart.filter((item) => item._id !== productId));
  };

  // Handle quantity change
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const product = cart.find((item) => item._id === productId);

    // Check if new quantity exceeds stock
    if (product && newQuantity > product.stock) {
      showNotification(
        `Cannot add more ${product.name}. Only ${product.stock} in stock.`,
        "warning"
      );
      return;
    }

    setCart(
      cart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Calculate tax amount
  const calculateTaxAmount = () => {
    return (calculateSubtotal() * tax) / 100;
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  // Calculate grand total
  const calculateTotal = () => {
    return (
      calculateSubtotal() + calculateTaxAmount() - calculateDiscountAmount()
    );
  };

  // Handle customer selection
  const selectCustomer = (selectedCustomer) => {
    setCustomer(selectedCustomer);
    setShowCustomerSearch(false);
    setCustomerSearch("");
  };

  // Filter customers based on search (mobile or name)
  const filteredCustomers =
    customerSearch.trim() === ""
      ? []
      : customers.filter((c) => {
          if (searchByMobile) {
            // Search by mobile number (exact or partial match)
            return c.mobile?.includes(customerSearch);
          } else {
            // Search by name or email
            return (
              c.username
                ?.toLowerCase()
                .includes(customerSearch.toLowerCase()) ||
              c.email?.toLowerCase().includes(customerSearch.toLowerCase())
            );
          }
        });

  // Handle new customer form input change
  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle creating a new customer
  const handleCreateCustomer = async () => {
    // Validate required fields
    if (!newCustomer.mobile || !newCustomer.username) {
      showNotification("Mobile number and name are required", "error");
      return;
    }

    try {
      setLoading(true);

      // Create new customer in the database
      const response = await axios.post(
        `${API_BASE_URL}/api/customers/add`,
        newCustomer,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Add the new customer to the local state
        const createdCustomer = response.data.customer;
        setCustomers((prev) => [...prev, createdCustomer]);

        // Select the new customer
        setCustomer(createdCustomer);

        // Reset form and hide it
        setNewCustomer({
          mobile: "",
          username: "",
          email: "",
          address: "",
        });
        setShowNewCustomerForm(false);

        showNotification("Customer created successfully", "success");

        // Add to recent activity
        try {
          await axios.post(`${API_BASE_URL}/api/user/reactivity/add`, {
            name: user.username,
            activity: `added a new customer: ${createdCustomer.username}`,
          });
        } catch (error) {
          console.error("Error adding recent activity:", error);
        }
      } else {
        showNotification(
          response.data.message || "Failed to create customer",
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating customer:", error);

      // Check for specific error types
      if (error.response) {
        if (error.response.status === 400) {
          showNotification(
            error.response.data.message ||
              "Customer with this mobile already exists",
            "error"
          );
        } else {
          showNotification("Server error. Please try again.", "error");
        }
      } else {
        showNotification("Error creating customer. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle search mode between mobile and name
  const toggleSearchMode = () => {
    setSearchByMobile(!searchByMobile);
    setCustomerSearch("");
    setShowCustomerSearch(false);
  };

  // Handle view all bills
  const handleViewAllBills = () => {
    setBillingPage(false);
  };

  // Save bill to database and then print
  const printInvoice = async () => {
    if (cart.length === 0) {
      showNotification("Please add products to the cart", "error");
      return;
    }

    if (!customer) {
      showNotification("Please select a customer", "error");
      return;
    }

    try {
      setLoading(true);

      // Prepare bill data
      const billData = {
        billNumber: invoiceNumber,
        customerId: customer._id,
        customerName: customer.username,
        customerMobile: customer.mobile || "",
        customerEmail: customer.email || "",
        customerAddress: customer.address || "",
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          unitPrice: item.price,
          total: item.price * item.quantity,
        })),
        subtotal: calculateSubtotal(),
        taxRate: tax,
        taxAmount: calculateTaxAmount(),
        discountRate: discount,
        discountAmount: calculateDiscountAmount(),
        grandTotal: calculateTotal(),
        paymentMethod,
        paymentStatus: "Paid",
        notes: note,
        createdBy: user._id,
        createdAt: new Date(),
      };
      // Save bill to database
      const response = await axios.post(
        `${API_BASE_URL}/api/billing/savebill`,
        billData,
        { withCredentials: true }
      );

      if (response.data.success) {
        showNotification("Bill saved successfully", "success");

        // Update recent bills with data from the server
        setRecentBills(response.data.recentbills || []);

        window.print();
        generateInvoiceNumber();
      } else {
        showNotification(
          response.data.message || "Failed to save bill",
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving bill:", error);
      showNotification("Error saving bill. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <p>{notification.message}</p>
        </div>
      )}
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div
        className={`admin-container ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Sidebar
          user={user}
          orders={orders}
          onCollapsedChange={handleSidebarCollapse}
        />

        <div className="main-content">
          <header className="admin-header">
            <div className="header-greeting">
              <h1>Billing System</h1>
              <p className="date-display">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="admin-info">
              <button className="logout-btn-billing" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          {billingPage ? (
            <div className="billing-container">
              <div className="billing-left-panel">
                <div className="product-search-section">
                  <div className="search-container">
                    <FiSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search products by name, brand, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input-bill"
                    />
                  </div>

                  <div className="category-tabs">
                    {/* Always show "All Products" tab */}
                    <button
                      className={`category-tab ${
                        selectedCategory === "all" ? "active" : ""
                      }`}
                      onClick={() => setSelectedCategory("all")}
                    >
                      <FiPackage /> All Products
                      <span className="count">{getCategoryCounts().all}</span>
                    </button>

                    {/* Dynamically generate category tabs */}
                    {Object.entries(getCategoryCounts())
                      .filter(([category]) => category !== "all") // Skip "all" as it's already added
                      .map(([category, count]) => {
                        // Choose icon based on category name
                        let CategoryIcon = FiPackage; // Default icon
                        let categoryLabel = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter

                        // Assign specific icons based on category name
                        if (category === "mobiles") {
                          CategoryIcon = FiSmartphone;
                          categoryLabel = "Mobiles";
                        } else if (category === "clothings") {
                          CategoryIcon = FiShoppingBag;
                          categoryLabel = "Clothing";
                        } else if (category === "hoappliances") {
                          CategoryIcon = FiHome;
                          categoryLabel = "Appliances";
                        }

                        return (
                          <button
                            key={category}
                            className={`category-tab ${
                              selectedCategory === category ? "active" : ""
                            }`}
                            onClick={() => setSelectedCategory(category)}
                          >
                            <CategoryIcon /> {categoryLabel}
                            <span className="count">{count}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="product-count">
                  <span className="count-text">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "product" : "products"} found
                  </span>
                  <div className="view-options">
                    <button className="view-option active" title="Grid View">
                      <FiGrid />
                    </button>
                    <button className="view-option" title="List View">
                      <FiList />
                    </button>
                  </div>
                </div>

                <div className="products-grid">
                  {loadingProducts ? (
                    <div className="loading-products">
                      <div className="loading-spinner"></div>
                      <p>Loading products...</p>
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className={`product-card ${
                          product.stock <= 0 ? "out-of-stock" : ""
                        }`}
                        onClick={() => product.stock > 0 && addToCart(product)}
                      >
                        <div className="product-image">
                          {product.images && product.images.length > 0 && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/150?text=No+Image";
                              }}
                            />
                          ) : product.image ? (
                            // Support for products with a single 'image' property instead of 'images' array
                            <img
                              src={product.image}
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/150?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="image-placeholder">
                              <FiBarChart2 />
                            </div>
                          )}
                        </div>
                        <div className="product-details-simple">
                          <h3 title={product.name}>{product.name}</h3>
                          <div className="product-price-simple">
                            ₹{product.price}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-products">
                      <div className="no-products-icon">
                        <FiPackage />
                      </div>
                      <p>
                        No products found. Try a different search or category.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="billing-right-panel">
                <div className="invoice-header">
                  <h2>Current Bill</h2>
                  <div className="invoice-number">#{invoiceNumber}</div>
                </div>

                <div className="customer-section">
                  <div className="section-header">
                    <h3>
                      <FiUser /> Customer Information
                    </h3>
                    {customer ? (
                      <button
                        className="change-customer-btn"
                        onClick={() => setShowCustomerSearch(true)}
                      >
                        Change
                      </button>
                    ) : null}
                  </div>

                  {customer ? (
                    <div className="customer-details">
                      <div className="customer-name">{customer.username}</div>
                      <div className="customer-contact">
                        <FiPhone className="contact-icon" />{" "}
                        {customer.mobile || "No phone number"}
                      </div>
                      <div className="customer-address">
                        <FiHome className="address-icon" />{" "}
                        {customer.address || "No address"}
                      </div>
                    </div>
                  ) : loadingCustomers ? (
                    <div className="customer-loading">
                      <div className="loading-spinner"></div>
                      <p>Loading customers...</p>
                    </div>
                  ) : showNewCustomerForm ? (
                    <div className="new-customer-form">
                      <h4>Add New Customer</h4>
                      <div className="form-group">
                        <label>Mobile Number*</label>
                        <input
                          type="text"
                          name="mobile"
                          value={newCustomer.mobile}
                          onChange={handleNewCustomerChange}
                          placeholder="Enter mobile number"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Customer Name*</label>
                        <input
                          type="text"
                          name="username"
                          value={newCustomer.username}
                          onChange={handleNewCustomerChange}
                          placeholder="Enter customer name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={newCustomer.email}
                          onChange={handleNewCustomerChange}
                          placeholder="Enter email (optional)"
                        />
                      </div>
                      <div className="form-group">
                        <label>Address</label>
                        <textarea
                          name="address"
                          value={newCustomer.address}
                          onChange={handleNewCustomerChange}
                          placeholder="Enter address (optional)"
                        ></textarea>
                      </div>
                      <div className="form-actions">
                        <button
                          className="cancel-btn"
                          onClick={() => setShowNewCustomerForm(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="save-btn"
                          onClick={handleCreateCustomer}
                        >
                          Save Customer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="customer-search">
                      <div className="search-mode-toggle">
                        <button
                          className={`toggle-btn ${
                            searchByMobile ? "active" : ""
                          }`}
                          onClick={() => toggleSearchMode()}
                        >
                          <FiPhone /> Search by Mobile
                        </button>
                        <button
                          className={`toggle-btn ${
                            !searchByMobile ? "active" : ""
                          }`}
                          onClick={() => toggleSearchMode()}
                        >
                          <FiUser /> Search by Name
                        </button>
                      </div>

                      <div className="search-container">
                        <FiSearch className="search-icon" />
                        <input
                          type="text"
                          placeholder={
                            searchByMobile
                              ? "Enter customer mobile number..."
                              : "Search customer by name or email..."
                          }
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setShowCustomerSearch(true);
                          }}
                          className="search-input-bill"
                        />
                      </div>

                      {showCustomerSearch && customerSearch.trim() !== "" && (
                        <div className="customer-search-results">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((c) => (
                              <div
                                key={c._id}
                                className="customer-search-item"
                                onClick={() => selectCustomer(c)}
                              >
                                <div className="customer-name">{c.username}</div>
                                <div className="customer-info">
                                  {c.mobile && (
                                    <span>
                                      <FiPhone /> {c.mobile}
                                    </span>
                                  )}
                                  {c.email && (
                                    <span>
                                      <FiMail /> {c.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="no-customers-found">
                              <p>
                                No customers found with this{" "}
                                {searchByMobile ? "mobile number" : "name"}.
                              </p>
                              <button
                                className="add-new-customer-btn"
                                onClick={() => {
                                  if (searchByMobile && customerSearch.trim()) {
                                    setNewCustomer((prev) => ({
                                      ...prev,
                                      mobile: customerSearch.trim(),
                                    }));
                                  }
                                  setShowNewCustomerForm(true);
                                }}
                              >
                                <FiPlus /> Add New Customer
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {!showCustomerSearch && (
                        <button
                          className="add-new-customer-btn full-width"
                          onClick={() => setShowNewCustomerForm(true)}
                        >
                          <FiPlus /> Add New Customer
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="cart-section">
                  <h3>
                    <FiShoppingCart /> Cart Items
                  </h3>

                  {cart.length > 0 ? (
                    <div className="cart-items">
                      <table className="cart-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item) => (
                            <tr key={item._id}>
                              <td className="item-name">{item.name}</td>
                              <td className="item-price">₹{item.price}</td>
                              <td className="item-quantity">
                                <div className="quantity-control">
                                  <button
                                    className="quantity-btn"
                                    onClick={() =>
                                      updateQuantity(item._id, item.quantity - 1)
                                    }
                                  >
                                    <FiMinus />
                                  </button>
                                  <span>{item.quantity}</span>
                                  <button
                                    className="quantity-btn"
                                    onClick={() =>
                                      updateQuantity(item._id, item.quantity + 1)
                                    }
                                  >
                                    <FiPlus />
                                  </button>
                                </div>
                              </td>
                              <td className="item-total">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </td>
                              <td className="item-remove">
                                <button
                                  className="remove-btn"
                                  onClick={() => removeFromCart(item._id)}
                                >
                                  <FiTrash2 />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-cart">
                      <p>No items in cart. Add products from the left panel.</p>
                    </div>
                  )}
                </div>

                <div className="invoice-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>

                  <div className="tax-discount-section">
                    <div className="tax-input">
                      <label>Tax (%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={tax}
                        onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="discount-input">
                      <label>Discount (%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>

                  <div className="summary-row">
                    <span>Tax Amount:</span>
                    <span>₹{calculateTaxAmount().toFixed(2)}</span>
                  </div>

                  <div className="summary-row">
                    <span>Discount Amount:</span>
                    <span>₹{calculateDiscountAmount().toFixed(2)}</span>
                  </div>

                  <div className="summary-row total">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="payment-section">
                  <h3>Payment Method</h3>
                  <div className="payment-methods">
                    <button
                      className={`payment-method-btn ${
                        paymentMethod === "cash" ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <FiDollarSign /> Cash
                    </button>
                    <button
                      className={`payment-method-btn ${
                        paymentMethod === "card" ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <FiCreditCard /> Card
                    </button>
                    <button
                      className={`payment-method-btn ${
                        paymentMethod === "upi" ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod("upi")}
                    >
                      <FiCreditCard /> UPI
                    </button>
                  </div>
                </div>

                <div className="invoice-notes">
                  <label>Notes:</label>
                  <textarea
                    placeholder="Add notes to this invoice (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>

                <div className="invoice-actions">
                  <button
                    className="cancel-bill-btn"
                    onClick={() => {
                      setCart([]);
                      setCustomer(null);
                      setNote("");
                      generateInvoiceNumber();
                    }}
                  >
                    <FiXCircle /> Cancel
                  </button>
                  <button className="print-invoice-btn" onClick={printInvoice}>
                    <FiPrinter /> Print Bill
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <RecentBills setBillingPage={setBillingPage} />
          )}

          {billingPage && recentBills.length > 0 && (
            <div className="recent-invoices-section">
              <div className="section-header">
                <h2>Recent Bills</h2>
                <h3>Tax Percentage {tax}%</h3>
                <button className="view-all-btn" onClick={handleViewAllBills}>
                  View All
                </button>
              </div>

              <div className="recent-invoices">
                <table className="invoices-table">
                  <thead>
                    <tr>
                      <th>Bill number #</th>
                      <th>Customer name</th>
                      <th>Mobile no</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Subtotal</th>
                      <th>Discount</th>
                      <th>Grand Total</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBills.slice(0, 5).map((bill, index) => (
                      <tr key={index}>
                        <td>{bill.billNumber}</td>
                        <td>{bill.customerName}</td>
                        <td>
                          {bill.customerMobile}
                        </td>
                        <td>
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(bill.createdAt).toLocaleTimeString()}
                        </td>
                        <td>₹{bill.subtotal.toFixed(2)}</td>
                        <td>₹{bill.discountAmount.toFixed(2)}</td>
                        <td>₹{bill.grandTotal.toFixed(2)}</td>
                        <td>
                          <span className="status-badge paid">{bill.paymentStatus}/{bill.paymentMethod}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  <button className="show-all-btn"
                  onClick={handleViewAllBills}
                  >Show more {recentBills.length > 5 ? recentBills.length - 5 : 0}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bill Preview Template - only visible when printing */}
      <BillPreviewTemplate
        invoiceNumber={invoiceNumber}
        customer={customer}
        cart={cart}
        paymentMethod={paymentMethod}
        tax={tax}
        discount={discount}
        note={note}
        calculateSubtotal={calculateSubtotal}
        calculateTaxAmount={calculateTaxAmount}
        calculateDiscountAmount={calculateDiscountAmount}
        calculateTotal={calculateTotal}
      />
    </div>
  );
};

export default Billing;
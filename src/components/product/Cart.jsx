import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Cart.css";

const ShoppingCart = ({ userId }) => {
  const [cartData, setCartData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rentalDate, setRentalDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderCode, setOrderCode] = useState(null);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token xác thực");

      const response = await axios.get(
        "https://hireyourstyle-backend.onrender.com/cart/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data.data || response.data || [];
      setCartData(data);
      setSelectedItems(data.map((item) => item._id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setCartData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartData.map((item) => item._id));
    }
  };

  const getRentalDays = () => {
    if (!rentalDate || !returnDate) return 1;
    const startDate = new Date(rentalDate);
    const endDate = new Date(returnDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const rentalDays = getRentalDays();

  const getItemTotal = (item) => (item.price || 0) * item.quantity * rentalDays;

  const getSubtotal = () => {
    return cartData.reduce((total, item) => {
      return selectedItems.includes(item._id)
        ? total + getItemTotal(item)
        : total;
    }, 0);
  };

  const subtotal = getSubtotal();
  const shipping = selectedItems.length > 0 ? 30000 : 0;
  const total = subtotal + shipping;

  const checkPaymentStatus = async (orderCode) => {
    try {
      const response = await axios.get(
        `https://hireyourstyle-backend.onrender.com/payos/check-payment/${orderCode}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setPaymentStatus(response.data.status);
      if (response.data.status === "completed") {
        setOrderCode(null);
        fetchCartData();
        alert("Thanh toán thành công! Đơn thuê của bạn đã được tạo.");
      } else if (response.data.status === "failed") {
        alert(
          response.data.message || "Thanh toán thất bại. Vui lòng thử lại."
        );
        setOrderCode(null);
      }
    } catch (error) {
      console.error("Check payment status error:", error);
    }
  };

  const handlePayment = async () => {
    try {
      if (!rentalDate || !returnDate) {
        alert("Vui lòng chọn ngày thuê và ngày trả");
        return;
      }

      if (new Date(rentalDate) >= new Date(returnDate)) {
        alert("Ngày trả phải sau ngày thuê");
        return;
      }

      const selectedCartItems = cartData.filter((item) =>
        selectedItems.includes(item._id)
      );

      const rentalData = {
        items: selectedCartItems.map((item) => ({
          productId: item.productId || item._id,
          storeId: item.storeId,
          size: item.size,
          quantity: item.quantity,
        })),
        rentalDate: new Date(rentalDate),
        returnDate: new Date(returnDate),
        totalAmount: total,
        cartItemIds: selectedItems,
      };

      const order = {
        amount: total,
        description: `HireYourStyle Thuê ${rentalDays} ngày`,
        orderCode: Date.now(),
        returnUrl: `https://hire-your-style-frontend.vercel.app/cart`,
        cancelUrl: `https://hire-your-style-frontend.vercel.app/cart`,
        rentalData: rentalData,
      };

      setOrderCode(order.orderCode);
      setPaymentStatus("pending");

      const response = await axios.post(
        "https://hireyourstyle-backend.onrender.com/payos",
        order,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const checkoutUrl = response.data?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Lỗi khi xử lý thanh toán. Vui lòng thử lại sau.");
      setOrderCode(null);
      setPaymentStatus(null);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [userId]);

  useEffect(() => {
    let interval;
    if (orderCode && paymentStatus === "pending") {
      interval = setInterval(() => checkPaymentStatus(orderCode), 5000);
    }
    return () => clearInterval(interval);
  }, [orderCode, paymentStatus]);

  const updateQuantity = async (itemId, change) => {
    const item = cartData.find((item) => item._id === itemId);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + change);

    setCartData((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      await axios.put(
        `https://hireyourstyle-backend.onrender.com/cart/update-quantity/${itemId}`,
        { quantity: newQuantity },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      setCartData((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, quantity: item.quantity } : item
        )
      );
    }
  };

  const handleQuantityInputChange = async (itemId, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1);

    setCartData((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: quantity } : item
      )
    );

    try {
      await axios.put(
        `https://hireyourstyle-backend.onrender.com/cart/update-quantity/${itemId}`,
        { quantity: quantity },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (itemId) => {
    setCartData((prev) => prev.filter((item) => item._id !== itemId));
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));

    await axios.delete(
      `https://hireyourstyle-backend.onrender.com/cart/delete/${itemId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);

  if (loading) {
    return <div className="text-center">Đang tải giỏ hàng...</div>;
  }

  if (paymentStatus === "pending") {
    return <div className="text-center">Đang xử lý thanh toán...</div>;
  }

  return (
    <div className="container-fluid bg-light py-5">
      <div className="container">
        <h1 className="text-center mb-4">Giỏ Hàng</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Sản phẩm ({cartData.length})</h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleSelectAll}
                >
                  {selectedItems.length === cartData.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </button>
              </div>

              {cartData.length > 0 ? (
                <div className="card-body p-0">
                  {cartData.map((item, index) => (
                    <div
                      key={item._id}
                      className={`p-3 ${
                        index < cartData.length - 1 ? "border-bottom" : ""
                      }`}
                    >
                      <div className="d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleCheckboxChange(item._id)}
                        />
                        <img
                          src={
                            item.image ||
                            `https://picsum.photos/100?random=${index}`
                          }
                          alt={item.name}
                          className="img-thumbnail me-3"
                          style={{ width: "100px", height: "120px" }}
                        />
                        <div className="flex-grow-1">
                          <h6>{item.name}</h6>
                          <p className="mb-1 text-muted">Size: {item.size}</p>
                          <div className="mb-1">
                            <strong>{formatPrice(item.price)}/ngày</strong>
                          </div>
                          {rentalDays > 1 && (
                            <small className="text-info">
                              Tổng {rentalDays} ngày:{" "}
                              {formatPrice(item.price * rentalDays)}
                            </small>
                          )}
                        </div>

                        <div
                          className="me-3 d-flex align-items-center"
                          style={{ minWidth: "120px" }}
                        >
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => updateQuantity(item._id, -1)}
                            disabled={item.quantity <= 1}
                            style={{ width: "30px", height: "30px" }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityInputChange(
                                item._id,
                                e.target.value
                              )
                            }
                            className="form-control mx-2 text-center"
                            style={{
                              width: "50px",
                              height: "30px",
                              fontSize: "14px",
                            }}
                          />
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => updateQuantity(item._id, 1)}
                            style={{ width: "30px", height: "30px" }}
                          >
                            +
                          </button>
                        </div>

                        <div
                          className="me-3 text-end"
                          style={{ minWidth: "100px" }}
                        >
                          <strong className="text-success">
                            {formatPrice(getItemTotal(item))}
                          </strong>
                          {rentalDays > 1 && (
                            <div>
                              <small className="text-muted">
                                {item.quantity} × {rentalDays} ngày
                              </small>
                            </div>
                          )}
                        </div>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeItem(item._id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-body text-center">Giỏ hàng trống.</div>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card mb-4">
              <div className="card-header">Tổng đơn hàng</div>
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    marginRight: "-0.75rem",
                    marginLeft: "-0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      flex: "0 0 50%",
                      maxWidth: "50%",
                      paddingRight: "0.75rem",
                      paddingLeft: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <label
                      style={{ display: "block", marginBottom: "0.25rem" }}
                    >
                      Ngày thuê: *
                    </label>
                    <input
                      type="date"
                      value={rentalDate}
                      onChange={(e) => setRentalDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        marginTop: "0.25rem",
                        transition: "border-color 0.3s ease",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#007bff";
                        e.target.style.boxShadow =
                          "0 0 5px rgba(0, 123, 255, 0.3)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#dee2e6";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: "0 0 50%",
                      maxWidth: "50%",
                      paddingRight: "0.75rem",
                      paddingLeft: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <label
                      style={{ display: "block", marginBottom: "0.25rem" }}
                    >
                      Ngày trả: *
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={rentalDate || new Date().toISOString().split("T")[0]}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        marginTop: "0.25rem",
                        transition: "border-color 0.3s ease",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#007bff";
                        e.target.style.boxShadow =
                          "0 0 5px rgba(0, 123, 255, 0.3)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#dee2e6";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {rentalDays > 1 && (
                  <div className="alert alert-info py-2 mb-3">
                    <small>
                      <i className="fas fa-info-circle me-1"></i>
                      Thuê trong {rentalDays} ngày
                    </small>
                  </div>
                )}

                <p className="d-flex justify-content-between">
                  <span>Tạm tính:</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </p>
                <p className="d-flex justify-content-between">
                  <span>Phí vận chuyển:</span>
                  <strong>{formatPrice(shipping)}</strong>
                </p>
                <hr />
                <p className="d-flex justify-content-between">
                  <span>Tổng cộng:</span>
                  <strong className="text-success">{formatPrice(total)}</strong>
                </p>
                <button
                  className={`btn btn-block ${
                    selectedItems.length === 0 || !rentalDate || !returnDate
                      ? "btn-secondary disabled"
                      : "btn-primary"
                  }`}
                  onClick={handlePayment}
                  disabled={
                    selectedItems.length === 0 || !rentalDate || !returnDate
                  }
                >
                  Thanh toán
                </button>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">Thống kê giỏ hàng</div>
              <div className="card-body text-center">
                <p>
                  <strong>{cartData.length}</strong> loại sản phẩm
                </p>
                <p>
                  <strong>
                    {cartData.reduce((sum, item) => sum + item.quantity, 0)}
                  </strong>{" "}
                  tổng số lượng
                </p>
                {rentalDays > 1 && (
                  <p>
                    <strong>{rentalDays}</strong> ngày thuê
                  </p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <button className="btn btn-outline-primary btn-sm me-2">
                  <i className="fas fa-heart me-1"></i> Lưu giỏ hàng
                </button>
                <button className="btn btn-outline-secondary btn-sm me-2">
                  <i className="fas fa-share-alt me-1"></i> Chia sẻ
                </button>
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={fetchCartData}
                >
                  <i className="fas fa-sync-alt me-1"></i> Làm mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Cart.css"; // Import your custom CSS for styling

const ShoppingCart = ({ userId }) => {
  const [cartData, setCartData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState([]);

  // Thêm state cho rental dates
  const [rentalDate, setRentalDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Tính số ngày thuê
  const getRentalDays = () => {
    if (!rentalDate || !returnDate) return 0;
    const start = new Date(rentalDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token xác thực");

      const response = await axios.get("http://localhost:9999/cart/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data.data || response.data || [];
      setCartData(data);
      setSelectedItems(data.map((item) => item._id)); // chọn tất cả mặc định
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setCartData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token xác thực");

      const response = await axios.get("http://localhost:9999/store/listall", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data.data || response.data || [];
      setStoreData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setStoreData([]);
    } finally {
      setLoading(false);
    }
  };

  console.log("Cart Data:", cartData);

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

  const getItemTotal = (item) => {
    const rentalDays = getRentalDays();
    const dailyPrice = item.price || 0;
    const totalDays = rentalDays > 0 ? rentalDays : 1; // Ít nhất 1 ngày
    return item.quantity * dailyPrice * totalDays;
  };

  const getSubtotal = () => {
    return cartData.reduce((total, item) => {
      return selectedItems.includes(item._id)
        ? total + getItemTotal(item)
        : total;
    }, 0);
  };

  const subtotal = getSubtotal();
  const shipping = 0;
  const total = subtotal + shipping;

  const handlePayment = async () => {
    try {
      // Validate rental dates
      if (!rentalDate || !returnDate) {
        alert("Vui lòng chọn ngày thuê và ngày trả");
        return;
      }

      if (new Date(rentalDate) >= new Date(returnDate)) {
        alert("Ngày trả phải sau ngày thuê");
        return;
      }

      // Chuẩn bị dữ liệu rental
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
        depositAmount: Math.round(total * 0.5), // 30% deposit
        cartItemIds: selectedItems, // Để xóa khỏi cart sau khi thành công
      };

      const order = {
        amount: total,
        description: "Hire Your Style - Rental Payment",
        orderCode: Date.now(),
        returnUrl: `http://localhost:5173/cart?success=true&rentalData=${encodeURIComponent(
          JSON.stringify(rentalData)
        )}`,
        cancelUrl: "http://localhost:5173/cart?success=false",
        rentalData: rentalData, // Gửi kèm dữ liệu rental
      };

      const response = await axios.post("http://localhost:9999/payos", order, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const checkoutUrl = response.data?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Lỗi khi xử lý thanh toán. Vui lòng thử lại sau.");
    }
  };

  // Kiểm tra payment success từ URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const rentalDataParam = urlParams.get("rentalData");

    if (success === "true" && rentalDataParam) {
      try {
        const rentalData = JSON.parse(decodeURIComponent(rentalDataParam));
        handlePaymentSuccess(rentalData);
      } catch (error) {
        console.error("Error parsing rental data:", error);
      }
    }
  }, []);

  const handlePaymentSuccess = async (rentalData) => {
    try {
      // Tạo rental record
      await axios.post("http://localhost:9999/rental/create", rentalData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Xóa items đã thanh toán khỏi cart
      for (const itemId of rentalData.cartItemIds) {
        await axios.delete(`http://localhost:9999/cart/delete/${itemId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      alert("Thanh toán thành công! Đơn thuê của bạn đã được tạo.");
      fetchCartData(); // Refresh cart

      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Error creating rental:", error);
      alert("Có lỗi xảy ra khi tạo đơn thuê. Vui lòng liên hệ hỗ trợ.");
    }
  };

  useEffect(() => {
    fetchCartData();
    fetchStoreData();
  }, [userId]);

  const updateQuantity = async (itemId, change) => {
    const item = cartData.find((item) => item._id === itemId);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + change);

    setCartData((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    await axios.put(
      `http://localhost:9999/cart/update-quantity/${itemId}`,
      { quantity: newQuantity },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  };

  // Hàm xử lý nhập số lượng trực tiếp
  const handleQuantityInputChange = async (itemId, value) => {
    const quantity = parseInt(value) || 1;
    const finalQuantity = Math.max(1, quantity);

    setCartData((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: finalQuantity } : item
      )
    );

    try {
      await axios.put(
        `http://localhost:9999/cart/update-quantity/${itemId}`,
        { quantity: finalQuantity },
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

    await axios.delete(`http://localhost:9999/cart/delete/${itemId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);

  if (loading) {
    return <div className="text-center">Đang tải giỏ hàng...</div>;
  }

  const rentalDays = getRentalDays();

  return (
    <div className="container-fluid bg-light py-5">
      <div className="container">
        <h1 className="text-center mb-4">Giỏ Hàng</h1>

        <div className="row">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="col-lg-8 mb-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  Sản phẩm ({cartData.length})
                  {rentalDays > 0 && (
                    <span className="text-muted ms-2">
                      - {rentalDays} ngày thuê
                    </span>
                  )}
                </h5>
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
                          <p className="mb-1 text-muted">
                            Store:{" "}
                            {storeData.find(
                              (store) => store._id === item.storeId
                            )?.name || "Không rõ"}
                          </p>
                          <p className="mb-1 text-muted">Size: {item.size}</p>
                          <div>
                            <strong>{formatPrice(item.price)}/ngày</strong>
                            {rentalDays > 0 && (
                              <div className="text-muted small">
                                {rentalDays} ngày × {formatPrice(item.price)} ={" "}
                                {formatPrice(item.price * rentalDays)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="me-3 d-flex align-items-center">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => updateQuantity(item._id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="form-control mx-2 text-center"
                            style={{ width: "60px" }}
                            value={item.quantity}
                            min="1"
                            onChange={(e) =>
                              handleQuantityInputChange(
                                item._id,
                                e.target.value
                              )
                            }
                            onBlur={(e) => {
                              if (!e.target.value || e.target.value < 1) {
                                handleQuantityInputChange(item._id, "1");
                              }
                            }}
                          />
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => updateQuantity(item._id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="me-3 text-end">
                          <strong>{formatPrice(getItemTotal(item))}</strong>
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

          {/* TỔNG ĐƠN HÀNG + THỐNG KÊ */}
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

                {rentalDays > 0 && (
                  <div className="alert alert-info small mb-3">
                    <strong>Thời gian thuê:</strong> {rentalDays} ngày
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
                <p className="d-flex justify-content-between text-muted">
                  <span>Tiền cọc (50%):</span>
                  <span>{formatPrice(Math.round(total * 0.5))}</span>
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

            {/* THỐNG KÊ */}
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
                {rentalDays > 0 && (
                  <p>
                    <strong>{rentalDays}</strong> ngày thuê
                  </p>
                )}
              </div>
            </div>

            {/* HÀNH ĐỘNG */}
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

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Cart.css"; // Import your custom CSS for styling
const ShoppingCart = ({ userId }) => {
  const [cartData, setCartData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const getItemTotal = (item) => item.quantity * (item.price || 0);

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

  const handlePayment = async () => {
    try {
      const order = {
        amount: total,
        description: "Hire Your Style",
        orderCode: Date.now(),
        returnUrl: "http://localhost:5173/cart?success=true",
        cancelUrl: "http://localhost:5173/cart?success=false",
      };

      const response = await axios.post("http://localhost:9999/payos", order, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const checkoutUrl = response.data?.checkoutUrl;
      if (checkoutUrl) window.location.href = checkoutUrl;
      else throw new Error("Không nhận được URL thanh toán.");
    } catch (error) {
      alert("Lỗi khi xử lý thanh toán. Vui lòng thử lại sau.");
    }
  };

  useEffect(() => {
    fetchCartData();
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

  return (
    <div className="container-fluid bg-light py-5">
      <div className="container">
        <h1 className="text-center mb-4">Giỏ Hàng</h1>

        <div className="row">
          {/* DANH SÁCH SẢN PHẨM */}
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
                          <strong>{formatPrice(item.price)}</strong>
                        </div>
                        <div className="me-3 d-flex align-items-center">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => updateQuantity(item._id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => updateQuantity(item._id, 1)}
                          >
                            +
                          </button>
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
                    selectedItems.length === 0
                      ? "btn-secondary disabled"
                      : "btn-primary"
                  }`}
                  onClick={handlePayment}
                  disabled={selectedItems.length === 0}
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

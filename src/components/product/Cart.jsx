import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Cart.css"; // Import your custom CSS for styling
import { useNavigate } from "react-router-dom";

const ShoppingCart = ({ userId }) => {
  const [cartData, setCartData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // Lưu toàn bộ item object
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null); // Store đã chọn
  const [notification, setNotification] = useState(""); // Thông báo
  const user = JSON.parse(localStorage.getItem("user")) || userId;
  // Thêm state cho rental dates
  const [rentalDate, setRentalDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const navigate = useNavigate();

  // Tính số ngày thuê
  const getRentalDays = () => {
    if (!rentalDate || !returnDate) return 0;
    const start = new Date(rentalDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Nhóm sản phẩm theo store
  const groupedCartData = cartData.reduce((acc, item) => {
    const storeId = item.storeId;
    if (!acc[storeId]) {
      acc[storeId] = [];
    }
    acc[storeId].push(item);
    return acc;
  }, {});

  // Hiển thị thông báo tạm thời
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

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
      setSelectedItems([]); // Reset selected items
      setSelectedStoreId(null); // Reset selected store
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

      const response = await axios.get(
        "https://hireyourstyle-backend.onrender.com/store/listall",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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
  console.log("selectedItems:", selectedItems);
  console.log("selectedStoreId:", selectedStoreId);

  const handleCheckboxChange = (item) => {
    // Kiểm tra xem có thể chọn item này không
    if (selectedStoreId && selectedStoreId !== item.storeId) {
      const currentStoreName =
        storeData.find((store) => store._id === selectedStoreId)?.name ||
        "Không rõ";
      const itemStoreName =
        storeData.find((store) => store._id === item.storeId)?.name ||
        "Không rõ";
      showNotification(
        `Bạn chỉ có thể chọn sản phẩm từ cùng một cửa hàng trong một đơn hàng. Hiện tại bạn đang chọn sản phẩm từ "${currentStoreName}". Không thể chọn sản phẩm từ "${itemStoreName}".`
      );
      return;
    }

    setSelectedItems((prev) => {
      const isSelected = prev.some(
        (selectedItem) => selectedItem._id === item._id
      );

      if (isSelected) {
        // Bỏ chọn item
        const newSelected = prev.filter(
          (selectedItem) => selectedItem._id !== item._id
        );
        // Nếu không còn item nào được chọn thì reset selectedStoreId
        if (newSelected.length === 0) {
          setSelectedStoreId(null);
        }
        return newSelected;
      } else {
        // Chọn item
        if (!selectedStoreId) {
          setSelectedStoreId(item.storeId);
        }
        return [...prev, item];
      }
    });
  };

  const handleSelectAllStore = (storeId) => {
    const storeItems = groupedCartData[storeId];
    const allStoreItemsSelected = storeItems.every((item) =>
      selectedItems.some((selected) => selected._id === item._id)
    );

    if (allStoreItemsSelected) {
      // Bỏ chọn tất cả items của store này
      setSelectedItems((prev) =>
        prev.filter((item) => item.storeId !== storeId)
      );
      setSelectedStoreId(null);
    } else {
      // Kiểm tra xem có store khác đã được chọn chưa
      if (selectedStoreId && selectedStoreId !== storeId) {
        const currentStoreName =
          storeData.find((store) => store._id === selectedStoreId)?.name ||
          "Không rõ";
        const targetStoreName =
          storeData.find((store) => store._id === storeId)?.name || "Không rõ";
        showNotification(
          `Bạn chỉ có thể chọn sản phẩm từ cùng một cửa hàng. Hiện tại bạn đang chọn sản phẩm từ "${currentStoreName}". Không thể chọn sản phẩm từ "${targetStoreName}".`
        );
        return;
      }

      // Chọn tất cả items của store này
      setSelectedItems((prev) => {
        const otherStoreItems = prev.filter((item) => item.storeId !== storeId);
        return [...otherStoreItems, ...storeItems];
      });
      setSelectedStoreId(storeId);
    }
  };

  const getItemTotal = (item) => {
    const rentalDays = getRentalDays();
    const dailyPrice = item.price || 0;
    const totalDays = rentalDays > 0 ? rentalDays : 1; // Ít nhất 1 ngày
    return item.quantity * dailyPrice * totalDays;
  };

  const getSubtotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + getItemTotal(item);
    }, 0);
  };

  const subtotal = getSubtotal();
  const shipping = 0;
  const totalRental = subtotal + shipping;
  const deposit = Math.round(totalRental * 0.5);
  const total = totalRental + deposit;

  const tempRental = new URLSearchParams({
    userId: user._id,
    items: encodeURIComponent(JSON.stringify(selectedItems)), // ✅ encode an toàn hơn
    rentalDate,
    returnDate,
    totalAmount: total.toString(),
    depositAmount: Math.round(total * 0.5).toString(),
    status: "pending",
  });

  console.log("user:", user._id);
  console.log("tempRental:", tempRental.toString());

  const handlePayment = async () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token xác thực");

      const orderData = {
        amount: Math.round(total),
        description: `HireYourStyle Thuê ${rentalDays} ngày`,
        orderCode: Date.now(),
        returnUrl: `https://hire-your-style-frontend.vercel.app/payment/success?${tempRental.toString()}`,
        cancelUrl: "https://hire-your-style-frontend.vercel.app/payment/cancel",
        selectedItems: selectedItems, // Gửi toàn bộ thông tin items đã chọn
        rentalDate,
        returnDate,
        rentalDays,
      };

      const response = await axios.post(
        "https://hireyourstyle-backend.onrender.com/payos",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Nếu tạo thành công, chuyển hướng đến trang thanh toán
      window.location.href = response.data.checkoutUrl;
    } catch (err) {
      console.error("Lỗi khi tạo link thanh toán:", err);
      setError(err.response?.data?.error || "Tạo link thanh toán thất bại");
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

    // Cập nhật cartData
    setCartData((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Cập nhật selectedItems nếu item đó đã được chọn
    setSelectedItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

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
  };

  // Hàm xử lý nhập số lượng trực tiếp
  const handleQuantityInputChange = async (itemId, value) => {
    const quantity = parseInt(value) || 1;
    const finalQuantity = Math.max(1, quantity);

    // Cập nhật cartData
    setCartData((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: finalQuantity } : item
      )
    );

    // Cập nhật selectedItems nếu item đó đã được chọn
    setSelectedItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: finalQuantity } : item
      )
    );

    try {
      await axios.put(
        `https://hireyourstyle-backend.onrender.com/cart/update-quantity/${itemId}`,
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
    setSelectedItems((prev) => {
      const newSelected = prev.filter((item) => item._id !== itemId);
      // Nếu không còn item nào được chọn thì reset selectedStoreId
      if (newSelected.length === 0) {
        setSelectedStoreId(null);
      }
      return newSelected;
    });

    await axios.delete(
      `https://hireyourstyle-backend.onrender.com/cart/delete/${itemId}`,
      {
        headers: {
          "Content-Type": "application/json",
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

  const rentalDays = getRentalDays();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  return (
    <div className="container-fluid bg-light py-5">
      <div className="container">
        <h1 className="text-center mb-4">Giỏ Hàng</h1>

        {/* Thông báo */}
        {notification && (
          <div
            className="alert alert-warning alert-dismissible fade show"
            role="alert"
          >
            {notification}
            <button
              type="button"
              className="btn-close"
              onClick={() => setNotification("")}
            ></button>
          </div>
        )}

        <div className="row">
          {/* DANH SÁCH SẢN PHẨM THEO STORE */}
          <div className="col-lg-8 mb-4">
            {Object.keys(groupedCartData).length > 0 ? (
              Object.keys(groupedCartData).map((storeId) => {
                const storeItems = groupedCartData[storeId];
                const storeName =
                  storeData.find((store) => store._id === storeId)?.name ||
                  "Không rõ";
                const allStoreItemsSelected = storeItems.every((item) =>
                  selectedItems.some((selected) => selected._id === item._id)
                );
                const someStoreItemsSelected = storeItems.some((item) =>
                  selectedItems.some((selected) => selected._id === item._id)
                );

                return (
                  <div key={storeId} className="card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={allStoreItemsSelected}
                          ref={(input) => {
                            if (input)
                              input.indeterminate =
                                someStoreItemsSelected &&
                                !allStoreItemsSelected;
                          }}
                          onChange={() => handleSelectAllStore(storeId)}
                        />
                        <h5 className="mb-0">
                          🏪 {storeName} ({storeItems.length} sản phẩm)
                          {rentalDays > 0 && (
                            <span className="text-muted ms-2">
                              - {rentalDays} ngày thuê
                            </span>
                          )}
                        </h5>
                      </div>
                      {selectedStoreId && selectedStoreId !== storeId && (
                        <small className="text-muted">
                          Không thể chọn (đã chọn cửa hàng khác)
                        </small>
                      )}
                    </div>

                    <div className="card-body p-0">
                      {storeItems.map((item, index) => (
                        <div
                          key={item._id}
                          className={`p-3 ${
                            index < storeItems.length - 1 ? "border-bottom" : ""
                          } ${
                            selectedStoreId && selectedStoreId !== storeId
                              ? "opacity-50"
                              : ""
                          }`}
                        >
                          <div className="d-flex align-items-center">
                            <input
                              type="checkbox"
                              className="form-check-input me-3"
                              checked={selectedItems.some(
                                (selectedItem) => selectedItem._id === item._id
                              )}
                              onChange={() => handleCheckboxChange(item)}
                              disabled={
                                selectedStoreId && selectedStoreId !== storeId
                              }
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
                                Size: {item.size}
                              </p>
                              <div>
                                <strong>{formatPrice(item.price)}/ngày</strong>
                                {rentalDays > 0 && (
                                  <div className="text-muted small">
                                    {rentalDays} ngày ×{" "}
                                    {formatPrice(item.price)} ={" "}
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
                  </div>
                );
              })
            ) : (
              <div className="card">
                <div className="card-body text-center">Giỏ hàng trống.</div>
              </div>
            )}
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
                      min={tomorrowStr}
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

                {selectedStoreId && (
                  <div className="alert alert-success small mb-3">
                    <strong>Cửa hàng đã chọn:</strong>{" "}
                    {storeData.find((store) => store._id === selectedStoreId)
                      ?.name || "Không rõ"}
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
                  <span>Tổng tiền thuê:</span>
                  <strong className="text-success">
                    {formatPrice(totalRental)}
                  </strong>
                </p>
                <p className="d-flex justify-content-between text-muted">
                  <span>Tiền cọc (50%):</span>
                  <span>{formatPrice(deposit)}</span>
                </p>
                <hr />
                <p className="d-flex justify-content-between text-muted">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(total)}</span>
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
                  <strong>{Object.keys(groupedCartData).length}</strong> cửa
                  hàng
                </p>
                <p>
                  <strong>{cartData.length}</strong> loại sản phẩm
                </p>
                <p>
                  <strong>
                    {cartData.reduce((sum, item) => sum + item.quantity, 0)}
                  </strong>{" "}
                  tổng số lượng
                </p>
                <p>
                  <strong>{selectedItems.length}</strong> sản phẩm đã chọn
                </p>
                <p>
                  <strong>
                    {selectedItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                  </strong>{" "}
                  số lượng đã chọn
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

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Cart.css";
import AdminSidebar from "./AdminSidebar";

const RentalDashboard = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRentalHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token xác thực");

      const response = await axios.get("http://localhost:9999/rental/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRentals(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "badge bg-warning text-dark",
      confirmed: "badge bg-primary",
      cancelled: "badge bg-danger",
      completed: "badge bg-success",
    };
    const statusText = {
      pending: "Đang chờ",
      confirmed: "Đã xác nhận",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
    };
    return (
      <span className={statusClasses[status]}>
        {statusText[status] || status}
      </span>
    );
  };

  useEffect(() => {
    fetchRentalHistory();
  }, []); // Không dùng userId nữa

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar />

      <div
        style={{
          marginLeft: "250px",
          width: "100%",
          padding: "30px",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <h1 className="text-center mb-4">Đơn Thuê</h1>

        {loading ? (
          <div className="text-center py-5">Đang tải lịch sử thuê...</div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : rentals.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <h4>Chưa có đơn thuê nào</h4>
              <p className="text-muted">
                Hãy kiểm tra lại hoặc đợi khách hàng thuê sản phẩm.
              </p>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-12">
              {rentals.map((rental) => (
                <div key={rental._id} className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Mã đơn thuê: {rental._id}</strong>
                      <span className="ms-3">
                        {getStatusBadge(rental.status)}
                      </span>
                    </div>
                    <div className="text-muted">
                      <small>Ngày tạo: {formatDate(rental.createdAt)}</small>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <p>
                          <strong>Ngày thuê:</strong>{" "}
                          {formatDate(rental.rentalDate)}
                        </p>
                        <p>
                          <strong>Ngày trả:</strong>{" "}
                          {formatDate(rental.returnDate)}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p>
                          <strong>Tổng tiền:</strong>{" "}
                          {formatPrice(rental.totalAmount)}
                        </p>
                        <p>
                          <strong>Tiền cọc:</strong>{" "}
                          {formatPrice(rental.depositAmount)}
                        </p>
                      </div>
                    </div>

                    <h5 className="mb-3">Sản phẩm đã thuê:</h5>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Người thuê</th>
                            <th>Sản phẩm</th>
                            <th>Cửa hàng</th>
                            <th>Size</th>
                            <th>Số lượng</th>
                            <th>Giá thuê/ngày</th>
                            <th>Tổng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rental.items.map((item, index) => {
                            const product = item.productId || {};
                            const rentalStore = item.storeId || {};
                            const rentalDays = Math.ceil(
                              (new Date(rental.returnDate) -
                                new Date(rental.rentalDate)) /
                                (1000 * 60 * 60 * 24)
                            );
                            const itemTotal =
                              (product.price || 0) * item.quantity * rentalDays;

                            return (
                              <tr key={index}>
                                <td>
                                  {rental.userId?.name ||
                                    rental.userId?.email ||
                                    "Không rõ"}
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={
                                        product.image ||
                                        `https://picsum.photos/80?random=${index}`
                                      }
                                      alt={product.name}
                                      className="img-thumbnail me-3"
                                      style={{
                                        width: "60px",
                                        height: "80px",
                                      }}
                                    />
                                    <div>
                                      <h6 className="mb-0">{product.name}</h6>
                                      <small className="text-muted">
                                        {product.category}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>{rentalStore.name}</td>
                                <td>{item.size}</td>
                                <td>{item.quantity}</td>
                                {/* <td>{formatPrice(product.price)}</td>
                                <td>{formatPrice(itemTotal)}</td> */}
                                <td>{110000}</td>
                                <td>{110000}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalDashboard;

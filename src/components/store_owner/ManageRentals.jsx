import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Alert,
  Form,
  FormSelect,
} from "react-bootstrap";
import axios from "axios";
import "../css/Cart.css";
import StoreOwnerSidebar from "./StoreOwnerSidebar";

const ManageRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchStore = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:9999/store/by-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStore(res.data.data || null);
    } catch (err) {
      console.error("Lỗi khi lấy store:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
    }
  };

  const fetchRentalHistory = async (storeId) => {
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

      // Lọc các đơn thuê có items[0].storeId._id trùng với storeId
      const filteredRentals = (response.data.data || []).filter(
        (rental) => rental.items[0]?.storeId?._id === storeId
      );

      setRentals(filteredRentals);
      setFilteredRentals(filteredRentals);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setRentals([]);
      setFilteredRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (rentalId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:9999/rental/update-status/${rentalId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Cập nhật trạng thái thành công:", response.data);
      alert("Cập nhật trạng thái thành công!");
      fetchRentalHistory(store?._id); // Gọi lại với storeId
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật trạng thái:",
        error.response?.data || error.message
      );
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const handleStatusFilterChange = (e) => {
    const selectedStatus = e.target.value;
    setStatusFilter(selectedStatus);

    if (selectedStatus === "all") {
      setFilteredRentals(rentals);
    } else {
      setFilteredRentals(
        rentals.filter((rental) => rental.status === selectedStatus)
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchStore(user._id); // Chờ lấy store trước
    };
    loadData();
  }, [user._id]);

  // Gọi fetchRentalHistory khi store đã được lấy
  useEffect(() => {
    if (store?._id) {
      fetchRentalHistory(store._id);
    }
  }, [store]);

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
      confirmed: "badge bg-info text-dark",
      received: "badge bg-primary",
      returning: "badge bg-secondary",
      returned: "badge bg-dark",
      completed: "badge bg-success",
      cancelled: "badge bg-danger",
    };

    const statusText = {
      pending: "Chờ xác nhận",
      confirmed: "Đang giao hàng",
      received: "Đã nhận trang phục",
      returning: "Đang trả trang phục",
      returned: "Đã trả trang phục",
      completed: "Hoàn tất",
      cancelled: "Khách hàng đã hủy đơn",
    };

    return (
      <Badge
        className={statusClasses[status]}
        style={{ borderRadius: "0.5rem", padding: "0.4rem 0.8rem" }}
      >
        {statusText[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <StoreOwnerSidebar />
        <div style={{ marginLeft: "250px", padding: "30px", width: "100%" }}>
          <Container className="text-center py-5">
            <div
              className="spinner-border"
              style={{ color: "#8A784E" }}
              role="status"
            >
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex" }}>
        <StoreOwnerSidebar />
        <div style={{ marginLeft: "250px", padding: "30px", width: "100%" }}>
          <Container className="py-5">
            <Alert variant="danger" className="rounded-4 text-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <StoreOwnerSidebar />
      <div style={{ marginLeft: "250px", padding: "30px", width: "100%" }}>
        <section style={{ backgroundColor: "#F2F2F2", padding: "3rem 0" }}>
          <Container>
            <Form.Group className="mb-4" style={{ maxWidth: "300px" }}>
              <Form.Label className="fw-semibold" style={{ color: "#8A784E" }}>
                <i className="fas fa-filter me-2"></i>Lọc theo trạng thái
              </Form.Label>
              <FormSelect
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="rounded-4"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đang giao hàng</option>
                <option value="received">Đã nhận trang phục</option>
                <option value="returning">Đang trả trang phục</option>
                <option value="returned">Đã trả trang phục</option>
                <option value="completed">Hoàn tất</option>
                <option value="cancelled">Khách hàng đã hủy đơn</option>
              </FormSelect>
            </Form.Group>

            {filteredRentals.length === 0 ? (
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="text-center py-5">
                  <h4 className="fw-semibold">Không tìm thấy đơn thuê nào</h4>
                  <p className="text-muted lead">
                    {statusFilter === "all"
                      ? "Không có đơn thuê nào phù hợp với cửa hàng của bạn"
                      : "Không có đơn hàng nào với trạng thái này"}
                  </p>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                <Col lg={12}>
                  {filteredRentals.map((rental) => (
                    <Card
                      key={rental._id}
                      className="border-0 shadow-sm rounded-4 mb-4"
                    >
                      <Card.Header
                        className="d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#f1f1f0" }}
                      >
                        <div>
                          <strong>Mã đơn thuê: {rental._id}</strong>
                          <span className="ms-3">
                            {getStatusBadge(rental.status)}
                          </span>
                        </div>
                        <div className="text-muted">
                          <small>
                            Ngày tạo: {formatDate(rental.rentalDate)}
                          </small>
                        </div>
                      </Card.Header>

                      <Card.Body>
                        <Row className="mb-3">
                          <Col md={6}>
                            <p>
                              <strong>Ngày thuê:</strong>{" "}
                              {formatDate(rental.rentalDate)}
                            </p>
                            <p>
                              <strong>Ngày trả:</strong>{" "}
                              {formatDate(rental.returnDate)}
                            </p>
                          </Col>
                          <Col md={6}>
                            <p>
                              <strong>Tổng tiền:</strong>{" "}
                              {formatPrice(rental.totalAmount)}
                            </p>
                            <p>
                              <strong>Tiền cọc:</strong>{" "}
                              {formatPrice(rental.depositAmount)}
                            </p>
                          </Col>
                        </Row>

                        <h5
                          className="mb-3 fw-semibold"
                          style={{ color: "#8A784E" }}
                        >
                          Sản phẩm đã thuê:
                        </h5>
                        <div className="table-responsive">
                          <Table>
                            <thead>
                              <tr>
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
                                  (product.price || 0) *
                                  item.quantity *
                                  rentalDays;

                                return (
                                  <tr key={index}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <img
                                          src={
                                            product.image ||
                                            `https://picsum.photos/80?random=${index}`
                                          }
                                          alt={product.name}
                                          className="img-thumbnail me-3 rounded-4"
                                          style={{
                                            width: "60px",
                                            height: "80px",
                                            objectFit: "cover",
                                          }}
                                        />
                                        <div>
                                          <h6 className="mb-0 fw-semibold">
                                            {product.name}
                                          </h6>
                                          <small className="text-muted">
                                            {product.category}
                                          </small>
                                        </div>
                                      </div>
                                    </td>
                                    <td>{rentalStore.name}</td>
                                    <td>{item.size}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatPrice(product.price)}</td>
                                    <td>{formatPrice(itemTotal)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>

                      <Card.Footer className="text-end">
                        {rental.status === "pending" && (
                          <>
                            <Button
                              variant="info" // Tương ứng với 'confirmed' (bg-info text-dark)
                              className="rounded-4 me-2 text-dark"
                              onClick={() => {
                                handleUpdateStatus(rental._id, "confirmed");
                              }}
                            >
                              Đã giao hàng cho shipper
                            </Button>

                            <Button
                              variant="danger" // Tương ứng với 'cancelled' (bg-danger)
                              className="rounded-4 me-2"
                              onClick={() => {
                                handleUpdateStatus(rental._id, "cancelled");
                              }}
                            >
                              Hủy đơn hàng
                            </Button>
                          </>
                        )}

                        {rental.status === "returning" && (
                          <Button
                            variant="dark" // Tương ứng với 'returned' (bg-dark)
                            className="rounded-4 me-2"
                            onClick={() => {
                              handleUpdateStatus(rental._id, "returned");
                            }}
                          >
                            Đã nhận được trang phục
                          </Button>
                        )}
                      </Card.Footer>
                    </Card>
                  ))}
                </Col>
              </Row>
            )}
          </Container>
        </section>
      </div>
    </div>
  );
};

export default ManageRentals;

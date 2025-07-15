import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Alert,
  Spinner,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import HeaderAdmin from "./HeaderAdmin";
import AdminSidebar from "./AdminSidebar";

const DepositDashboard = () => {
  const [deposits, setDeposits] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Định nghĩa ánh xạ trạng thái sang tiếng Việt
  const statusDisplay = {
    pending: "Đang chờ",
    confirmed: "Đã xác nhận",
    received: "Đã nhận",
    returning: "Đang trả",
    returned: "Đã trả",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
  };

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://hireyourstyle-backend.onrender.com/apiDeposit/deposits",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDeposits(response.data.data);
        setFilteredDeposits(response.data.data); // Khởi tạo filteredDeposits
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message || "Lỗi khi tải danh sách đặt cọc"
        );
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  useEffect(() => {
    // Lọc deposits dựa trên statusFilter
    if (statusFilter === "all") {
      setFilteredDeposits(deposits);
    } else {
      setFilteredDeposits(
        deposits.filter((deposit) => deposit.status === statusFilter)
      );
    }
  }, [statusFilter, deposits]);

  const formatAddress = (address) => {
    if (!address) return "N/A";
    const { street, ward, district, city } = address;
    return `${street}, ${ward}, ${district}, ${city}`;
  };

  const handleUpdateStatus = async (rentalId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://hireyourstyle-backend.onrender.com/apiDeposit/deposits/${rentalId}/status`,
        { newStatus: "completed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDeposits((prev) =>
        prev.map((d) =>
          d._id === rentalId ? { ...d, status: "completed" } : d
        )
      );
    } catch (error) {
      alert(
        "Cập nhật trạng thái thất bại: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f7fa",
      }}
    >
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: "250px" }}>
        <HeaderAdmin />
        <Container className="mt-5" style={{ maxWidth: "1200px" }}>
          <h2
            style={{
              color: "#00d4ff",
              marginBottom: "30px",
              fontWeight: "bold",
              background: "linear-gradient(90deg, #00d4ff, #007bff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              fontSize: "2rem",
              letterSpacing: "1px",
              transition: "all 0.3s ease",
            }}
          >
            Quản lý tiền đặt cọc
          </h2>
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group controlId="statusFilter">
                <Form.Label>Lọc theo trạng thái</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Đang chờ</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="received">Đã nhận</option>
                  <option value="returning">Đang trả</option>
                  <option value="returned">Đã trả</option>
                  <option value="completed">Hoàn tất</option>
                  <option value="cancelled">Đã hủy</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {loading ? (
            <div className="text-center py-5">
              <Spinner
                animation="border"
                variant="primary"
                style={{ width: "3rem", height: "3rem" }}
              />
            </div>
          ) : error ? (
            <Alert
              variant="danger"
              style={{ borderRadius: "8px", fontWeight: 500 }}
            >
              {error}
            </Alert>
          ) : filteredDeposits.length === 0 ? (
            <Alert
              variant="info"
              style={{ borderRadius: "8px", fontWeight: 500 }}
            >
              Không có giao dịch đặt cọc nào phù hợp với bộ lọc.
            </Alert>
          ) : (
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
                padding: "20px",
              }}
            >
              <Table
                hover
                responsive
                style={{
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  fontSize: "0.95rem",
                }}
              >
                <thead
                  style={{
                    backgroundColor: "#1e1e2f",
                    color: "#fff",
                    textTransform: "uppercase",
                    fontWeight: "600",
                  }}
                >
                  <tr>
                    <th style={{ padding: "15px" }}>Tên khách hàng</th>
                    <th style={{ padding: "15px" }}>Số điện thoại</th>
                    <th style={{ padding: "15px" }}>Địa chỉ</th>
                    <th style={{ padding: "15px" }}>Số tiền đặt cọc</th>
                    <th style={{ padding: "15px" }}>Ngày thuê</th>
                    <th style={{ padding: "15px" }}>Trạng thái</th>
                    <th style={{ padding: "15px" }}>Ngày trả</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeposits.map((deposit) => (
                    <tr key={deposit._id}>
                      <td style={{ padding: "15px" }}>{deposit.name}</td>
                      <td style={{ padding: "15px" }}>{deposit.phone}</td>
                      <td style={{ padding: "15px" }}>
                        {formatAddress(deposit.address)}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          color: "#28a745",
                          fontWeight: "500",
                        }}
                      >
                        {deposit.depositAmount.toLocaleString()} VND
                      </td>
                      <td style={{ padding: "15px" }}>
                        {new Date(deposit.rentalDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td style={{ padding: "15px" }}>
                        <div
                          style={{
                            marginBottom:
                              deposit.status === "returned" ? "8px" : "0",
                          }}
                        >
                          <span
                            style={{
                              backgroundColor:
                                deposit.status === "completed"
                                  ? "#28a745"
                                  : deposit.status === "cancelled"
                                  ? "#6c757d"
                                  : deposit.status === "pending"
                                  ? "#ffc107"
                                  : "#dc3545",
                              color: "#fff",
                              padding: "5px 10px",
                              borderRadius: "12px",
                              fontSize: "0.85rem",
                              display: "inline-block",
                              width: "120px",
                              textAlign: "center",
                            }}
                          >
                            {statusDisplay[deposit.status] || deposit.status}
                          </span>
                        </div>
                        {deposit.status === "returned" && (
                          <div>
                            <button
                              onClick={() => handleUpdateStatus(deposit._id)}
                              style={{
                                backgroundColor: "#007bff",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                                marginTop: "4px",
                              }}
                            >
                              Xác nhận hoàn tất
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {new Date(deposit.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default DepositDashboard;

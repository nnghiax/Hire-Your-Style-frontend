import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  Table,
} from "react-bootstrap";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import HeaderAdmin from "./HeaderAdmin";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [storeOwnerCount, setStoreOwnerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:9999/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const {
          totalUsers,
          customerCount,
          storeOwnerCount,
          users: userData,
        } = response.data.data;
        setTotalUsers(totalUsers);
        setCustomerCount(customerCount);
        setStoreOwnerCount(storeOwnerCount);
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleUserAvailability = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:9999/admin/users/availability",
        { userId, isAvailable: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isAvailable: !currentStatus } : user
        )
      );
    } catch (error) {
      setError("Không thể cập nhật trạng thái người dùng.");
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
        <div className="ms-2">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div
        style={{
          marginLeft: "250px",
          flexGrow: 1,
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <HeaderAdmin />
        <Container fluid className="px-4 py-4">
          <Row className="mb-4">
            <Col>
              <h5 className="fw-bold">📋 Quản lý người dùng</h5>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Title>Tổng số người dùng</Card.Title>
                  <h3>{totalUsers}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Title>Số khách hàng</Card.Title>
                  <h3>{customerCount}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Title>Số chủ cửa hàng</Card.Title>
                  <h3>{storeOwnerCount}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Title>Danh sách người dùng</Card.Title>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>{user.isAvailable ? "Hoạt động" : "Đã khóa"}</td>
                          <td>
                            <Button
                              variant={user.isAvailable ? "danger" : "success"}
                              onClick={() =>
                                toggleUserAvailability(
                                  user._id,
                                  user.isAvailable
                                )
                              }
                            >
                              {user.isAvailable ? "Khóa" : "Mở khóa"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default AdminUsers;

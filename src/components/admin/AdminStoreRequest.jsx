import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import HeaderAdmin from './HeaderAdmin';

const customStyles = `
  .shadow-sm {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .table-dark th {
    background-color: #343a40;
    color: #fff;
  }
`;

function AdminStoreRequest() {
  const [storeRequests, setStoreRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const parseUser = user ? JSON.parse(user) : null;

    if (!parseUser || parseUser.role !== 'admin') {
      navigate('/error');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:9999/request/list', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('API Response:', response.data);
        setStoreRequests(response.data.data);
      } catch (error) {
        console.error('Error fetching store requests:', error);
        setError('Không thể tải dữ liệu yêu cầu cửa hàng. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleDeleteRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:9999/request/delete/${selectedRequestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStoreRequests(requests => requests.filter(r => r._id !== selectedRequestId));
      setSuccessMessage('Xóa yêu cầu thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowDeleteModal(false);
      setSelectedRequestId(null);
    } catch (error) {
      console.error('Error deleting request:', error);
      setError(error.response?.data?.message || 'Lỗi khi xóa yêu cầu.');
    }
  };

  const handleShowDeleteModal = (requestId) => {
    setSelectedRequestId(requestId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRequestId(null);
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div style={{ marginLeft: '250px', flexGrow: 1, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <HeaderAdmin />
        <Container fluid className="px-4">
          <style>{customStyles}</style>
          <Row className="mb-3">
            <Col>
              <h5 className="fw-bold">📋 Quản lý yêu cầu mở cửa hàng</h5>
            </Col>
          </Row>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Table hover responsive className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Tên người dùng</th>
                    <th>Email</th>
                    <th>Tên cửa hàng</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <div>Đang tải dữ liệu...</div>
                      </td>
                    </tr>
                  ) : storeRequests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        Không có yêu cầu mở cửa hàng nào.
                      </td>
                    </tr>
                  ) : (
                    storeRequests.map((request, index) => (
                      <tr key={request._id}>
                        <td>{index + 1}</td>
                        <td>{request.name}</td>
                        <td>{request.email}</td>
                        <td>{request.store}</td>
                        <td>
                          <span
                            className={`badge ${
                              request.status === 'pending'
                                ? 'bg-warning'
                                : request.status === 'approved'
                                ? 'bg-success'
                                : 'bg-danger'
                            }`}
                          >
                            {request.status === 'pending'
                              ? 'Đang chờ'
                              : request.status === 'approved'
                              ? 'Đã duyệt'
                              : 'Từ chối'}
                          </span>
                        </td>
                        <td>{new Date(request.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => navigate(`/admin/request/${request._id}`)}
                          >
                            Chi tiết
                          </Button>
                          
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Xác nhận xóa</Modal.Title>
            </Modal.Header>
            <Modal.Body>Bạn có chắc chắn muốn xóa yêu cầu này?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Hủy
              </Button>
              <Button variant="danger" onClick={handleDeleteRequest}>
                Xóa
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
}

export default AdminStoreRequest;
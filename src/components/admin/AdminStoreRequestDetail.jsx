import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import HeaderAdmin from './HeaderAdmin';

const customStyles = `
  .shadow-sm {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .detail-label {
    font-weight: bold;
    color: #343a40;
  }
`;

function AdminStoreRequestDetail() {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

        const response = await axios.get(`http://localhost:9999/request/detail/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('API Response:', response.data);
        setRequest(response.data.data);
      } catch (error) {
        console.error('Error fetching request details:', error);
        setError(error.response?.data?.message || 'Không thể tải chi tiết yêu cầu. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, requestId]);

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:9999/request/approve/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Yêu cầu đã được duyệt thành công!');
      setRequest({ ...request, status: 'approved' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error approving request:', error);
      setError(error.response?.data?.message || 'Lỗi khi duyệt yêu cầu.');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:9999/request/reject/${requestId}`,
        {},
        { Authorization: `Bearer ${token}` } 
      );
      setSuccessMessage('Yêu cầu đã bị từ chối thành công!');
      setRequest({ ...request, status: 'rejected' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError(error.response?.data?.message || 'Lỗi khi từ chối yêu cầu.');
    }
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
              <h5 className="fw-bold">📜 Chi tiết yêu cầu mở cửa hàng</h5>
            </Col>
          </Row>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Card className="shadow-sm border-0">
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <div>Đang tải dữ liệu...</div>
                </div>
              ) : request ? (
                <div>
                  <Row className="mb-3">
                    <Col>
                      <span className="detail-label">Tên cửa hàng:</span> {request.name}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col>
                      <span className="detail-label">Mô tả:</span> {request.description || 'Không có mô tả'}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col>
                      <span className="detail-label">Địa chỉ:</span>{' '}
                      {`${request.address.street}, ${request.address.ward}, ${request.address.district}, ${request.address.city}`}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col>
                      <span className="detail-label">Số điện thoại:</span> {request.phone}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col>
                      <span className="detail-label">Trạng thái:</span>{' '}
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
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col>
                      <span className="detail-label">Ngày tạo:</span>{' '}
                      {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </Col>
                  </Row>
                  {request.status === 'pending' && (
                    <Row>
                      <Col>
                        <Button
                          variant="success"
                          className="me-2"
                          onClick={handleApprove}
                        >
                          Duyệt
                        </Button>
                        <Button
                          variant="danger"
                          onClick={handleReject}
                        >
                          Từ chối
                        </Button>
                      </Col>
                    </Row>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted">Không tìm thấy thông tin yêu cầu.</p>
              )}
            </Card.Body>
          </Card>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => navigate('/admin/request')}
          >
            Return to List
          </Button>
        </Container>
      </div>
    </div>
  );
}

export default AdminStoreRequestDetail;
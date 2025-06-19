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

function AdminProduct() {
  const [lowRatedProducts, setLowRatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

        const lowRatedRes = await axios.get('http://localhost:9999/admin/products/low-rated', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } }));

        console.log('API Response:', lowRatedRes.data);
        setLowRatedProducts(lowRatedRes.data.data);
      } catch (error) {
        console.error('Error fetching low-rated products:', error);
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleToggleVisibility = async (productId, isAvailable) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:9999/admin/products/${productId}/visibility`,
        { isAvailable: !isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLowRatedProducts(products =>
        products.map(p =>
          p._id === productId ? { ...p, isAvailable: !isAvailable } : p
        )
      );
      setSuccessMessage(`Sản phẩm đã được ${isAvailable ? 'ẩn' : 'hiển thị'} thành công!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      setError(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái sản phẩm.');
    }
  };

  const handleShowDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
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
              <h5 className="fw-bold">📉 Quản lý sản phẩm có đánh giá thấp</h5>
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
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Đánh giá trung bình</th>
                    <th>Số lượt đánh giá</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <div>Đang tải dữ liệu...</div>
                      </td>
                    </tr>
                  ) : lowRatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        Không có sản phẩm nào có đánh giá thấp.
                      </td>
                    </tr>
                  ) : (
                    lowRatedProducts.map((product, index) => (
                      <tr key={product._id}>
                        <td>{index + 1}</td>
                        <td>{product.name}</td>
                        <td>{product.price.toLocaleString()} VNĐ</td>
                        <td>{product.avgRating?.toFixed(2) || 'N/A'}</td>
                        <td>{product.reviewCount}</td>
                        <td>{product.isAvailable ? 'Có sẵn' : 'Đã ẩn'}</td>
                        <td>
                          <Button
                            variant={product.isAvailable ? 'warning' : 'success'}
                            size="sm"
                            onClick={() => handleToggleVisibility(product._id, product.isAvailable)}
                          >
                            {product.isAvailable ? 'Ẩn' : 'Hiện'}
                          </Button>
                        </td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleShowDetails(product)}
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
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Chi tiết sản phẩm</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedProduct && (
                <div>
                  <h6>Tên chủ hàng: {selectedProduct.storeName || 'N/A'}</h6>
                  <h6>Bình luận:</h6>
                  <ul>
                    {selectedProduct.comments && selectedProduct.comments.length > 0 ? (
                      selectedProduct.comments.map((comment, idx) => (
                        <li key={idx}>{comment || 'Không có bình luận'}</li>
                      ))
                    ) : (
                      <li>Không có bình luận nào.</li>
                    )}
                  </ul>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
}

export default AdminProduct;
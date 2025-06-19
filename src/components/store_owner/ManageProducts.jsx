import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import StoreOwnerSidebar from './StoreOwnerSidebar';
import HeaderStoreOwner from './HeaderStoreOwner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Thêm CSS tùy chỉnh
const customStyles = `
  .custom-modal .modal-dialog {
    max-width: 1000px;
  }
`;

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); 

  const navigate = useNavigate();


  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    const parseUser = user ? JSON.parse(user) : null;

    if (!parseUser || parseUser.role !== 'store_owner') {
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

        const [storeRes, productRes, categoryRes] = await Promise.all([
          axios.get('http://localhost:9999/store/list', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { data: [] } })),
          axios.get('http://localhost:9999/product/list', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { data: [] } })),
          axios.get('http://localhost:9999/cate/list', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { data: [] } })),
        ]);

        const userStore = storeRes.data.data.find(store => store.userId === parseUser._id);
        if (!userStore) {
          setError('Bạn chưa có cửa hàng. Vui lòng tạo cửa hàng trước.');
          setLoading(false);
          return;
        }

        setStoreId(userStore._id);
        setFormData(prev => ({ ...prev, storeId: userStore._id }));
        setProducts(productRes.data.data.filter(p => p.storeId === userStore._id));
        setCategories(categoryRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const [formData, setFormData] = useState({
    storeId: '',
    categoryId: '',
    name: '',
    description: '',
    sizes: [],
    quantity: 0,
    price: 0,
    color: '',
    isAvailable: true,
    image: null,
  });

  const handleAddProduct = () => {
    if (!storeId) {
      setError('Không tìm thấy cửa hàng. Vui lòng tạo cửa hàng trước.');
      return;
    }
    setIsEdit(false);
    setFormData({
      storeId,
      categoryId: '',
      name: '',
      description: '',
      sizes: [],
      quantity: 0,
      price: 0,
      color: '',
      isAvailable: true,
      image: null,
    });
    setShowModal(true);
    setError('');
  };

  const handleEditProduct = (product) => {
    setIsEdit(true);
    setSelectedProduct(product);
    setFormData({
      storeId: product.storeId,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description || '',
      sizes: product.sizes || [],
      quantity: product.quantity || 0,
      price: product.price || 0,
      color: product.color || '',
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
      image: null,
    });
    setShowModal(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.storeId || !formData.categoryId) {
      setError('Vui lòng chọn cửa hàng và danh mục.');
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'sizes') {
        form.append(key, JSON.stringify(formData[key]));
      } else if (key === 'image' && formData[key]) {
        form.append(key, formData[key]);
      } else {
        form.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      if (isEdit) {
        const res = await axios.put(`http://localhost:9999/product/update/${selectedProduct._id}`, form, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setProducts(products.map(p => (p._id === selectedProduct._id ? res.data.data : p)));
        showSuccessMessage('Cập nhật sản phẩm thành công!'); 
      } else {
        const res = await axios.post('http://localhost:9999/product/create', form, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setProducts([...products, res.data.data]);
        showSuccessMessage('Thêm sản phẩm thành công!'); 
      }
      setShowModal(false);
      setError('');
    } catch (error) {
      console.error('Error submitting product:', error);
      setError(error.response?.data?.message || 'Lỗi khi lưu sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (proId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này không?')) {
      try {
        await axios.delete(`http://localhost:9999/product/delete/${proId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProducts(products.filter(p => p._id !== proId));
        showSuccessMessage('Xóa sản phẩm thành công!');
      } catch (error) {
        console.error('Error deleting product:', error);
        setError(error.response?.data?.message || 'Lỗi khi xóa sản phẩm. Vui lòng thử lại.');
      }
    }
  };

  if (error && !storeId) {
    return (
      <div className="d-flex">
        <StoreOwnerSidebar />
        <div style={{ marginLeft: '250px', flexGrow: 1, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <HeaderStoreOwner />
          <Container fluid className="px-4">
            <Alert variant="danger">{error}</Alert>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <StoreOwnerSidebar />
      <div style={{ marginLeft: '250px', flexGrow: 1, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <HeaderStoreOwner />
        <Container fluid className="px-4">
          <style>{customStyles}</style>
          <Row className="mb-3">
            <Col>
              <h5 className="fw-bold">📦 Danh sách sản phẩm</h5>
              <Button variant="primary" onClick={handleAddProduct} disabled={!storeId}>
                Thêm sản phẩm
              </Button>
            </Col>
          </Row>
          {successMessage && <Alert variant="success">{successMessage}</Alert>} 
          {error && <Alert variant="danger">{error}</Alert>}
          <Card className="shadow-sm border-0">
            <Card.Body className="p-3">
              <Table hover responsive className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Trạng thái</th>
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
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        Không có sản phẩm nào.
                      </td>
                    </tr>
                  ) : (
                    products.map((product, index) => (
                      <tr key={product._id}>
                        <td>{index + 1}</td>
                        <td>
                          <img
                            src={product.image || '/images/default-product.png'}
                            alt={product.name}
                            width={50}
                            height={50}
                            style={{ objectFit: 'cover' }}
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>{product.price.toLocaleString()} VNĐ</td>
                        <td>{product.quantity}</td>
                        <td>{product.isAvailable ? 'Có sẵn' : 'Hết hàng'}</td>
                        <td>
                          <Button variant="info text-white" size="sm" className="me-2" onClick={() => handleEditProduct(product)}>
                            Sửa
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(product._id)}>
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
         
          <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="custom-modal">
            <Modal.Header closeButton>
              <Modal.Title>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Tên sản phẩm</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Kích thước (XS, S, M, L, XL, XXL)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.sizes.join(',')}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="VD: XS,S,M"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Giá</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Màu sắc</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Có sẵn"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Hình ảnh</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  {isEdit ? 'Cập nhật' : 'Thêm'}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    </div>
  );
}

export default ManageProducts;
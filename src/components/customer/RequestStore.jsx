import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

const RequestStore = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      ward: '',
      district: '',
      city: ''
    },
    phone: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(response.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        setErrors(prev => ({ ...prev, 'address.city': 'Không thể tải danh sách tỉnh/thành phố' }));
      }
    };
    fetchProvinces();
  }, []);
  useEffect(() => {
    if (formData.address.city) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(`https://provinces.open-api.vn/api/p/${formData.address.city}?depth=2`);
          setDistricts(response.data.districts || []);
          setWards([]); 
          setFormData(prev => ({
            ...prev,
            address: { ...prev.address, district: '', ward: '' }
          }));
        } catch (error) {
          console.error('Error fetching districts:', error);
          setErrors(prev => ({ ...prev, 'address.district': 'Không thể tải danh sách quận/huyện' }));
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.address.city]);

  // Fetch wards when a district is selected
  useEffect(() => {
    if (formData.address.district) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(`https://provinces.open-api.vn/api/d/${formData.address.district}?depth=2`);
          setWards(response.data.wards || []);
          setFormData(prev => ({
            ...prev,
            address: { ...prev.address, ward: '' }
          }));
        } catch (error) {
          console.error('Error fetching wards:', error);
          setErrors(prev => ({ ...prev, 'address.ward': 'Không thể tải danh sách phường/xã' }));
        }
      };
      fetchWards();
    } else {
      setWards([]);
    }
  }, [formData.address.district]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên cửa hàng là bắt buộc';
    }
    
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Địa chỉ đường/phố là bắt buộc';
    }
    
    if (!formData.address.ward) {
      newErrors['address.ward'] = 'Phường/xã là bắt buộc';
    }
    
    if (!formData.address.district) {
      newErrors['address.district'] = 'Quận/huyện là bắt buộc';
    }
    
    if (!formData.address.city) {
      newErrors['address.city'] = 'Tỉnh/thành phố là bắt buộc';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setSubmitStatus('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://hireyourstyle-backend.onrender.com/request/create', {
        ...formData,
        address: {
          ...formData.address,
          city: provinces.find(p => p.code === formData.address.city)?.name || formData.address.city,
          district: districts.find(d => d.code === formData.address.district)?.name || formData.address.district,
          ward: wards.find(w => w.code === formData.address.ward)?.name || formData.address.ward
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 201) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          description: '',
          address: { street: '', ward: '', district: '', city: '' },
          phone: ''
        });
        navigate("/");
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={{ backgroundColor: "#F2F2F2", padding: "3rem 0" }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 p-4">
              <Card.Body>
                <div className="text-center mb-4">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <i className="fas fa-store fa-2x text-primary me-2"></i>
                    <h2 className="fw-semibold text-uppercase" style={{ color: "#8A784E" }}>
                      Trở Thành Người Bán
                    </h2>
                  </div>
                  <p className="text-muted lead">
                    Gia nhập cộng đồng bán hàng và phát triển kinh doanh cùng chúng tôi
                  </p>
                </div>

                {submitStatus === 'success' && (
                  <Alert variant="success" className="rounded-4 d-flex align-items-center">
                    <i className="fas fa-check-circle fa-2x me-3"></i>
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fw-semibold">Đăng ký thành công!</h5>
                      <p className="mb-0">Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.</p>
                    </div>
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => setSubmitStatus('')}
                      aria-label="Close"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </Alert>
                )}

                {submitStatus === 'error' && (
                  <Alert variant="danger" className="rounded-4 d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle fa-2x me-3"></i>
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fw-semibold">Có lỗi xảy ra!</h5>
                      <p className="mb-0">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
                    </div>
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => setSubmitStatus('')}
                      aria-label="Close"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </Alert>
                )}

                <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                  <h4 className="fw-semibold mb-4" style={{ color: "#8A784E" }}>
                    <i className="fas fa-store me-2"></i>Thông tin cửa hàng
                  </h4>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-tag me-2"></i>Tên Cửa Hàng <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập tên cửa hàng của bạn"
                      isInvalid={!!errors.name}
                      className="rounded-4"
                    />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-align-left me-2"></i>Mô Tả Cửa Hàng
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả về cửa hàng, sản phẩm kinh doanh, điểm mạnh của bạn..."
                      className="rounded-4"
                    />
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Không bắt buộc - giúp khách hàng hiểu rõ hơn về cửa hàng của bạn
                    </Form.Text>
                  </Form.Group>
                </Card>

                <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                  <h4 className="fw-semibold mb-4" style={{ color: "#8A784E" }}>
                    <i className="fas fa-map-marker-alt me-2"></i>Địa chỉ cửa hàng
                  </h4>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-map me-2"></i>Tỉnh/Thành phố <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          isInvalid={!!errors['address.city']}
                          className="rounded-4"
                        >
                          <option value="">Chọn tỉnh/thành phố</option>
                          {provinces.map(province => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors['address.city']}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-city me-2"></i>Quận/Huyện <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="address.district"
                          value={formData.address.district}
                          onChange={handleInputChange}
                          isInvalid={!!errors['address.district']}
                          className="rounded-4"
                          disabled={!formData.address.city}
                        >
                          <option value="">Chọn quận/huyện</option>
                          {districts.map(district => (
                            <option key={district.code} value={district.code}>
                              {district.name}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors['address.district']}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-building me-2"></i>Phường/Xã <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="address.ward"
                          value={formData.address.ward}
                          onChange={handleInputChange}
                          isInvalid={!!errors['address.ward']}
                          className="rounded-4"
                          disabled={!formData.address.district}
                        >
                          <option value="">Chọn phường/xã</option>
                          {wards.map(ward => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors['address.ward']}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-road me-2"></i>Số nhà, đường/phố <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          placeholder="VD: 123 Đường Nguyễn Văn A"
                          isInvalid={!!errors['address.street']}
                          className="rounded-4"
                        />
                        <Form.Control.Feedback type="invalid">{errors['address.street']}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card>

                <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                  <h4 className="fw-semibold mb-4" style={{ color: "#8A784E" }}>
                    <i className="fas fa-phone me-2"></i>Thông tin liên hệ
                  </h4>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-mobile-alt me-2"></i>Số Điện Thoại <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="VD: 0901234567"
                      isInvalid={!!errors.phone}
                      className="rounded-4"
                    />
                    <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Số điện thoại để khách hàng và chúng tôi liên hệ trực tiếp
                    </Form.Text>
                  </Form.Group>
                </Card>

                <div className="text-center">
                  <Button
                    variant="primary"
                    className="rounded-4 px-4 py-2 mb-3"
                    disabled={isLoading}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Đang Xử Lý...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Gửi Đăng Ký
                      </>
                    )}
                  </Button>
                  <div>
                    <Button
                      variant="link"
                      className="text-decoration-none"
                      style={{ color: "#8A784E" }}
                      onClick={() => navigate('/')}
                    >
                      <i className="fas fa-home me-2"></i>
                      Quay Về Trang Chủ
                    </Button>
                  </div>
                </div>

                <Card className="border-0 shadow-sm rounded-4 p-4 mt-4">
                  <h5 className="fw-semibold mb-3" style={{ color: "#8A784E" }}>
                    <i className="fas fa-lightbulb me-2"></i>Lưu Ý Quan Trọng
                  </h5>
                  <Row>
                    <Col md={6}>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="fas fa-clock text-success me-2"></i>
                          Xem xét trong vòng 24-48 giờ
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-phone-alt text-info me-2"></i>
                          Có thể liên hệ xác minh thông tin
                        </li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          Được duyệt là có thể bán hàng ngay
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-shield-alt text-warning me-2"></i>
                          Cung cấp thông tin chính xác
                        </li>
                      </ul>
                    </Col>
                  </Row>
                </Card>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default RequestStore;
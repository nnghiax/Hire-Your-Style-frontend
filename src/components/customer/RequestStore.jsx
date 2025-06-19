import React, { useState } from 'react';
import axios from 'axios';

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
    
    if (!formData.address.ward.trim()) {
      newErrors['address.ward'] = 'Phường/xã là bắt buộc';
    }
    
    if (!formData.address.district.trim()) {
      newErrors['address.district'] = 'Quận/huyện là bắt buộc';
    }
    
    if (!formData.address.city.trim()) {
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
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.post('http://localhost:9999/request/create', formData, config);
      
      if (response.status === 201) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          description: '',
          address: { street: '', ward: '', district: '', city: '' },
          phone: ''
        });
        console.log('Success:', response.data.message);
      }
    } catch (error) {
      setSubmitStatus('error');
      
      if (error.response) {
        console.error('Error Response:', error.response.data);
        if (error.response.status === 400) {
          console.log('Already submitted request');
        }
      } else if (error.request) {
        console.error('No Response:', error.request);
      } else {
        console.error('Error:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const customStyles = `
    .form-container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .form-container:hover {
      transform: translateY(-5px);
      box-shadow: 0 25px 80px rgba(0,0,0,0.15);
    }
    .header-section {
      background: linear-gradient(135deg, #007bff, #0056b3);
      padding: 3rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header-section::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    .form-input {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }
    .form-input:focus {
      border-color: #007bff;
      background: white;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
      transform: translateY(-2px);
    }
    .form-input.is-invalid {
      border-color: #dc3545;
      background: #fff5f5;
    }
    .form-input.is-invalid:focus {
      box-shadow: 0 0 0 0.2rem rgba(220,53,69,0.25);
    }
    .form-label {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
    }
    .form-section {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 15px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid #dee2e6;
      transition: all 0.3s ease;
    }
    .form-section:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .submit-btn {
      background: linear-gradient(135deg, #007bff, #0056b3);
      border: none;
      border-radius: 15px;
      padding: 1rem 3rem;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0,123,255,0.3);
      position: relative;
      overflow: hidden;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,123,255,0.4);
      background: linear-gradient(135deg, #0056b3, #003d82);
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }
    .submit-btn:hover::before {
      left: 100%;
    }
    .alert-custom {
      border: none;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      animation: slideInDown 0.5s ease;
    }
    @keyframes slideInDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .alert-success-custom {
      background: linear-gradient(135deg, #d4edda, #c3e6cb);
      color: #155724;
      border-left: 4px solid #28a745;
    }
    .alert-danger-custom {
      background: linear-gradient(135deg, #f8d7da, #f1b0b7);
      color: #721c24;
      border-left: 4px solid #dc3545;
    }
    .info-card {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border-radius: 15px;
      padding: 1.5rem;
      border-left: 4px solid #2196f3;
      margin-top: 2rem;
    }
    .invalid-feedback {
      display: block;
      font-size: 0.875rem;
      color: #dc3545;
      margin-top: 0.25rem;
      font-weight: 500;
    }
    .icon-wrapper {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #007bff, #0056b3);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      color: white;
      font-size: 1.2rem;
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div className="bg-light min-vh-100">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="form-container">
                <div className="header-section text-white">
                  <div className="position-relative">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div className="icon-wrapper me-3">
                        <i className="fas fa-store"></i>
                      </div>
                      <h1 className="display-4 font-weight-bold mb-0">Trở Thành Người Bán</h1>
                    </div>
                    <p className="lead mb-0 opacity-90">
                      Gia nhập cộng đồng bán hàng và phát triển kinh doanh cùng chúng tôi
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  {submitStatus === 'success' && (
                    <div className="alert alert-success-custom alert-custom d-flex align-items-center">
                      <i className="fas fa-check-circle fa-2x me-3 text-success"></i>
                      <div className="flex-grow-1">
                        <h5 className="mb-1 font-weight-bold">Đăng ký thành công!</h5>
                        <p className="mb-0">Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.</p>
                      </div>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setSubmitStatus('')}
                      ></button>
                    </div>
                  )}
                  
                  {submitStatus === 'error' && (
                    <div className="alert alert-danger-custom alert-custom d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle fa-2x me-3 text-danger"></i>
                      <div className="flex-grow-1">
                        <h5 className="mb-1 font-weight-bold">Có lỗi xảy ra!</h5>
                        <p className="mb-0">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
                      </div>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setSubmitStatus('')}
                      ></button>
                    </div>
                  )}

                  <div className="form-section">
                    <div className="d-flex align-items-center mb-4">
                      <div className="icon-wrapper">
                        <i className="fas fa-store"></i>
                      </div>
                      <h4 className="mb-0 font-weight-bold text-dark">Thông tin cửa hàng</h4>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label">
                        <i className="fas fa-tag text-primary me-2"></i>
                        Tên Cửa Hàng <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control form-input ${errors.name ? 'is-invalid' : ''}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nhập tên cửa hàng của bạn"
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        <i className="fas fa-align-left text-primary me-2"></i>
                        Mô Tả Cửa Hàng
                      </label>
                      <textarea
                        className="form-control form-input"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Mô tả về cửa hàng, sản phẩm kinh doanh, điểm mạnh của bạn..."
                      ></textarea>
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Không bắt buộc - giúp khách hàng hiểu rõ hơn về cửa hàng của bạn
                      </small>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="d-flex align-items-center mb-4">
                      <div className="icon-wrapper">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      <h4 className="mb-0 font-weight-bold text-dark">Địa chỉ cửa hàng</h4>
                    </div>
                    
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">
                          <i className="fas fa-road text-primary me-2"></i>
                          Số nhà, đường/phố <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-input ${errors['address.street'] ? 'is-invalid' : ''}`}
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          placeholder="VD: 123 Đường Nguyễn Văn A"
                        />
                        {errors['address.street'] && <div className="invalid-feedback">{errors['address.street']}</div>}
                      </div>
                      
                      <div className="col-md-4">
                        <label className="form-label">
                          <i className="fas fa-building text-primary me-2"></i>
                          Phường/Xã <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-input ${errors['address.ward'] ? 'is-invalid' : ''}`}
                          name="address.ward"
                          value={formData.address.ward}
                          onChange={handleInputChange}
                          placeholder="VD: Phường 1"
                        />
                        {errors['address.ward'] && <div className="invalid-feedback">{errors['address.ward']}</div>}
                      </div>
                      
                      <div className="col-md-4">
                        <label className="form-label">
                          <i className="fas fa-city text-primary me-2"></i>
                          Quận/Huyện <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-input ${errors['address.district'] ? 'is-invalid' : ''}`}
                          name="address.district"
                          value={formData.address.district}
                          onChange={handleInputChange}
                          placeholder="VD: Quận 1"
                        />
                        {errors['address.district'] && <div className="invalid-feedback">{errors['address.district']}</div>}
                      </div>
                      
                      <div className="col-md-4">
                        <label className="form-label">
                          <i className="fas fa-map text-primary me-2"></i>
                          Tỉnh/Thành phố <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-input ${errors['address.city'] ? 'is-invalid' : ''}`}
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          placeholder="VD: TP.HCM"
                        />
                        {errors['address.city'] && <div className="invalid-feedback">{errors['address.city']}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="d-flex align-items-center mb-4">
                      <div className="icon-wrapper">
                        <i className="fas fa-phone"></i>
                      </div>
                      <h4 className="mb-0 font-weight-bold text-dark">Thông tin liên hệ</h4>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label">
                        <i className="fas fa-mobile-alt text-primary me-2"></i>
                        Số Điện Thoại <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control form-input ${errors.phone ? 'is-invalid' : ''}`}
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="VD: 0901234567"
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Số điện thoại để khách hàng và chúng tôi liên hệ trực tiếp
                      </small>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-lg text-white submit-btn"
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
                    </button>
                  </div>

                  <div className="info-card">
                    <div className="d-flex align-items-start">
                      <i className="fas fa-lightbulb fa-2x text-primary me-3 mt-1"></i>
                      <div>
                        <h5 className="font-weight-bold text-primary mb-3">
                          Lưu Ý Quan Trọng
                        </h5>
                        <div className="row">
                          <div className="col-md-6">
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
                          </div>
                          <div className="col-md-6">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RequestStore;
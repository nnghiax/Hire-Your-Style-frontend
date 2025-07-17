import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [variant, setVariant] = useState('danger');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Vui lòng nhập email.');
      setVariant('danger');
      return;
    }

    try {
      const res = await axios.post('https://hireyourstyle-backend.onrender.com/auth/forgot-password', { email });
      setMessage(res.data.message);
      setVariant('success');
      setTimeout(() => navigate('/reset-password'), 2000);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Đã xảy ra lỗi';
      setMessage(errMsg);
      setVariant('danger');
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center beige-bg">
      <Row className="w-100 shadow rounded-5 overflow-hidden" style={{ maxWidth: '900px' }}>
        <Col md={6} className="p-5 d-flex flex-column justify-content-center form-bg">
          <div>
            <h2 className="text-center mb-4 text-brown fw-bold">Quên mật khẩu</h2>
            {message && <Alert variant={variant}>{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label className="fw-semibold text-brown" style={{ float: 'left' }}>
                  Email
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-pill px-3 py-2"
                />
              </Form.Group>

              <Button
                type="submit"
                className="w-100 rounded-pill py-2 text-white"
                style={{ backgroundColor: '#7b4b27', border: 'none' }}
              >
                Gửi mã xác thực
              </Button>

              <div className="text-center mt-3">
                <small className="text-muted">Đã có tài khoản? </small>
                <span
                  className="text-brown fw-semibold"
                  role="button"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/login')}
                >
                  Đăng nhập
                </span>
              </div>
            </Form>
          </div>
        </Col>
        <Col md={6} className="d-none d-md-block p-0">
          <Image
            src="https://res.cloudinary.com/dj2liaz6d/image/upload/v1752235125/bvtpgmlfhckynwadrxr7.jpg"
            alt="Forgot Password illustration"
            fluid
            style={{
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.92)'
            }}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPasswordPage;
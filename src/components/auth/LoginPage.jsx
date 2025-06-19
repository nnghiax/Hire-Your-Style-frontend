import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [variant, setVariant] = useState('danger');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      setVariant('danger');
      return;
    }

    try {
      const res = await axios.post('http://localhost:9999/auth/login', { email, password });
      if (res.status === 200) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.accessToken);
        setMessage('Đăng nhập thành công!');
        setVariant('success');
        const userRole = res.data.user.role;
        setTimeout(() => {
          if (userRole === 'customer') {
            navigate('/');
          } else if (userRole === 'admin') {
            navigate('/admin/dashboard');
          } else if (userRole === 'store_owner') {
            navigate('/store-owner/dashboard');
          } else {
            navigate('/'); 
          }
        }, 1500);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Lỗi không xác định';
      setMessage(errMsg);
      setVariant('danger');
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center beige-bg">
      <Row className="w-100 shadow rounded-5 overflow-hidden" style={{ maxWidth: '900px' }}>
        <Col md={6} className="p-5 d-flex flex-column justify-content-center form-bg">
          <div>
            <h2 className="text-center mb-4 text-brown fw-bold">Hire Your Style</h2>
            {message && <Alert variant={variant}>{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label className="fw-semibold text-brown" style={{ float: 'left' }}>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-pill px-3 py-2"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label className="fw-semibold text-brown" style={{ float: 'left' }}>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-pill px-3 py-2"
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check type="checkbox" label="Ghi nhớ" />
                <a href="#" className="text-decoration-none small text-brown">Quên mật khẩu?</a>
              </div>

              <Button
                type="submit"
                className="w-100 rounded-pill py-2 text-white"
                style={{ backgroundColor: '#7b4b27', border: 'none' }}
              >
                Đăng nhập
              </Button>

              <div className="text-center mt-3">
                <small className="text-muted">Chưa có tài khoản?</small>{' '}
                <span
                  className="text-brown fw-semibold"
                  role="button"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/register')}
                >
                  Đăng ký
                </span>
              </div>
            </Form>
          </div>
        </Col>
        <Col md={6} className="d-none d-md-block p-0">
          <Image
            src="https://res.cloudinary.com/dj2liaz6d/image/upload/v1749124630/a3qciixtems6x9unhhe9.webp"
            alt="Login illustration"
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

export default Login;
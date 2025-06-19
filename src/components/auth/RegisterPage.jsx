import axios from 'axios';
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [variant, setVariant] = useState('danger');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            setMessage('Vui lòng nhập đầy đủ thông tin.');
            setVariant('danger');
            return;
        }

        if (password.length < 6) {
            setMessage('Mật khẩu phải chứa ít nhất 6 ký tự.');
            setVariant('danger');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Mật khẩu và xác nhận mật khẩu không khớp.');
            setVariant('danger');
            return;
        }

        try {
            const response = await axios.post('https://hireyourstyle-backend.onrender.com/auth/register', {
                name,
                email,
                password,
                confirmPassword
            });

            if (response.status === 201) {
                setMessage('Đăng ký thành công.');
                setVariant('success');
                setTimeout(() => navigate('/login'), 2000);
            }
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
                        <h2 className="text-center mb-4 text-brown fw-bold">Đăng ký tài khoản</h2>
                        {message && <Alert variant={variant}>{message}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formName">
                                <Form.Label className="fw-semibold text-brown" style={{ float: 'left' }}>Họ và tên</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập họ và tên"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="rounded-pill px-3 py-2"
                                />
                            </Form.Group>

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

                            <Form.Group className="mb-4" controlId="formConfirmPassword">
                                <Form.Label className="fw-semibold text-brown" style={{ float: 'left' }}>Xác nhận mật khẩu</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="rounded-pill px-3 py-2"
                                />
                            </Form.Group>

                            <Button
                                type="submit"
                                className="w-100 rounded-pill py-2 text-white"
                                style={{ backgroundColor: '#7b4b27', border: 'none' }}
                            >
                                Đăng ký
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
                        src="https://res.cloudinary.com/dj2liaz6d/image/upload/v1749124629/vbyvjehrppu7ownqbfoe.jpg"
                        alt="Register illustration"
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

export default Register;

import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Image,
  InputGroup,
} from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmNewPassword: false,
  });
  const [message, setMessage] = useState(null);
  const [variant, setVariant] = useState("danger");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.email ||
      !formData.verificationCode ||
      !formData.newPassword ||
      !formData.confirmNewPassword
    ) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      setVariant("danger");
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage("Mật khẩu mới phải chứa ít nhất 6 ký tự.");
      setVariant("danger");
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      setVariant("danger");
      return;
    }

    try {
      const res = await axios.post(
        "https://hireyourstyle-backend.onrender.com/auth/reset-password",
        formData
      );
      setMessage(res.data.message);
      setVariant("success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Đã xảy ra lỗi";
      setMessage(errMsg);
      setVariant("danger");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center beige-bg"
    >
      <Row
        className="w-100 shadow rounded-5 overflow-hidden"
        style={{ maxWidth: "900px" }}
      >
        <Col
          md={6}
          className="p-5 d-flex flex-column justify-content-center form-bg"
        >
          <div>
            <h2 className="text-center mb-4 text-brown fw-bold">
              Đặt lại mật khẩu
            </h2>
            {message && <Alert variant={variant}>{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label
                  className="fw-semibold text-brown"
                  style={{ float: "left" }}
                >
                  Email
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-pill px-3 py-2"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formVerificationCode">
                <Form.Label
                  className="fw-semibold text-brown"
                  style={{ float: "left" }}
                >
                  Mã xác thực
                </Form.Label>
                <Form.Control
                  type="text"
                  name="verificationCode"
                  placeholder="Nhập mã xác thực"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  className="rounded-pill px-3 py-2"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formNewPassword">
                <Form.Label
                  className="fw-semibold text-brown"
                  style={{ float: "left" }}
                >
                  Mật khẩu mới
                </Form.Label>
                <InputGroup className="mb-2">
                  <Form.Control
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Nhập mật khẩu mới"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="rounded-pill px-3 py-2"
                    style={{ borderRight: "none" }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => toggleShowPassword("newPassword")}
                    className="rounded-pill"
                    style={{ marginLeft: "8px", padding: "0 12px" }}
                  >
                    {showPasswords.newPassword ? <EyeSlash /> : <Eye />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formConfirmNewPassword">
                <Form.Label
                  className="fw-semibold text-brown"
                  style={{ float: "left" }}
                >
                  Xác nhận mật khẩu mới
                </Form.Label>
                <InputGroup className="mb-2">
                  <Form.Control
                    type={
                      showPasswords.confirmNewPassword ? "text" : "password"
                    }
                    name="confirmNewPassword"
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    className="rounded-pill px-3 py-2"
                    style={{ borderRight: "none" }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => toggleShowPassword("confirmNewPassword")}
                    className="rounded-pill"
                    style={{ marginLeft: "8px", padding: "0 12px" }}
                  >
                    {showPasswords.confirmNewPassword ? <EyeSlash /> : <Eye />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button
                type="submit"
                className="w-100 rounded-pill py-2 text-white"
                style={{ backgroundColor: "#7b4b27", border: "none" }}
              >
                Đặt lại mật khẩu
              </Button>

              <div className="text-center mt-3">
                <small className="text-muted">Đã có tài khoản? </small>
                <span
                  className="text-brown fw-semibold"
                  role="button"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </span>
              </div>
            </Form>
          </div>
        </Col>
        <Col md={6} className="d-none d-md-block p-0">
          <Image
            src="https://res.cloudinary.com/dj2liaz6d/image/upload/v1752234977/kdxnmgh7ni5oyqcswsrk.jpg"
            alt="Reset Password illustration"
            fluid
            style={{
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.92)",
            }}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default ResetPasswordPage;

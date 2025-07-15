import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleBackToCart = () => {
    navigate("/cart");
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f7f5",
        minHeight: "100vh",
        paddingTop: "80px",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card
              className="shadow-sm rounded-4"
              style={{
                border: "none",
                backgroundColor: "#fff8f8",
                padding: "2rem",
              }}
            >
              <Card.Body className="text-center">
                <i className="fas fa-times-circle fa-4x text-danger mb-4"></i>
                <Card.Title
                  className="mb-3"
                  style={{ fontWeight: "600", fontSize: "1.5rem" }}
                >
                  Thanh toán thất bại hoặc bị hủy!
                </Card.Title>
                <Card.Text className="text-muted mb-4">
                  Có lỗi xảy ra trong quá trình thanh toán. Đơn hàng của bạn
                  chưa được xử lý. Vui lòng kiểm tra lại hoặc thử lại sau.
                </Card.Text>
                <Button
                  variant="outline-primary"
                  onClick={handleBackToCart}
                  className="rounded-4 px-4"
                  style={{
                    color: "#8A784E",
                    borderColor: "#8A784E",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-arrow-left me-2"></i>Quay về giỏ hàng
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PaymentCancel;

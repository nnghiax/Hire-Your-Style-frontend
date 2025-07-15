import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const PaymentSuccess = () => {
  const query = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const items = JSON.parse(decodeURIComponent(query.get("items"))) || [];

  console.log("Items from query:", items);

  const rentalData = {
    userId: query.get("userId"),
    rentalDate: query.get("rentalDate"),
    returnDate: query.get("returnDate"),
    totalAmount: Number(query.get("totalAmount")) || 0,
    depositAmount: Number(query.get("depositAmount")) || 0,
    status: "pending",
    items: items.map((item) => ({
      productId: item.productId,
      storeId: item.storeId,
      size: item.size,
      quantity: item.quantity,
    })),
    storeId: items[0]?.storeId || "",
  };

  const handleViewOrder = async () => {
    if (!saved) {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.post(
          "http://localhost:9999/rental/create",
          rentalData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Rental saved:", res.data);
        setSaved(true);

        // ✅ XÓA các sản phẩm khỏi giỏ hàng theo productId
        for (const item of items) {
          try {
            await axios.delete(
              `http://localhost:9999/cart/delete/${item._id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log(`Đã xóa sản phẩm ${item.productId} khỏi giỏ hàng`);
          } catch (err) {
            console.error(
              `Lỗi khi xóa sản phẩm ${item.productId}:`,
              err.message
            );
          }
        }
      } catch (error) {
        console.error(
          "Lỗi khi lưu đơn thuê:",
          error.response?.data || error.message
        );
        return;
      }
    }

    navigate("/rental-history");
  };

  return (
    <Container fluid className="d-flex vh-100 bg-light">
      <Row className="justify-content-center align-items-center w-100">
        <Col xs={12} md={8} lg={6}>
          <Card className="text-center p-4 border-0 shadow">
            <Card.Body>
              <FaCheckCircle
                style={{
                  fontSize: "5rem",
                  color: "#28a745",
                  marginBottom: "1.5rem",
                }}
              />
              <h2 className="mb-3">Thanh toán thành công!</h2>
              <p className="text-muted mb-4">
                Cảm ơn bạn đã thuê đồ. Đơn hàng của bạn đã được xử lý thành
                công.
              </p>

              <div className="mb-4">
                <p className="fw-bold fs-5 mb-1">
                  Mã đơn hàng: #{rentalData.userId?.slice(-6) || "123456"}
                </p>
                <p className="text-muted">
                  Tổng thanh toán: {rentalData.totalAmount.toLocaleString()} VNĐ
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleViewOrder}
                className="w-100 py-3 mb-3 fw-bold"
              >
                Xem trạng thái đơn hàng
              </Button>

              {items.length > 0 && (
                <div className="mt-4 text-start">
                  <h5 className="mb-3">Sản phẩm đã thuê:</h5>
                  <ul className="list-unstyled">
                    {items.map((item, index) => (
                      <li key={index} className="mb-2">
                        {item.name} - {item.quantity} x{" "}
                        {item.price.toLocaleString()} VNĐ
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccess;

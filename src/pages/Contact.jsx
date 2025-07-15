import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();

  const customStyles = `
    .contact-container {
      background-image: url('https://res.cloudinary.com/dj2liaz6d/image/upload/v1748015469/hfi8c2ljhjhz0u2vcacd.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      min-height: 100vh;
      padding: 60px 20px;
      width: 100vw;
      margin: 0;
      position: absolute;
      top: 0;
      left: 0;
    }

    .contact-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
      background: rgba(255, 255, 255, 0.9);
      padding: 30px;
      max-width: 600px;
      margin: 0 auto;
    }

    .contact-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1a2a44;
      text-align: center;
      margin-bottom: 30px;
      text-transform: uppercase;
      letter-spacing: 2px;
      position: relative;
    }

    .contact-title::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 4px;
      background: #4a90e2;
      border-radius: 2px;
    }

    .contact-description {
      font-size: 1.1rem;
      color: #34495e;
      line-height: 1.8;
      margin-bottom: 30px;
      text-align: center;
    }

    .contact-info {
      font-size: 1rem;
      color: #34495e;
      margin-bottom: 30px;
      text-align: center;
    }

    .contact-info p {
      margin: 5px 0;
    }

    .btn-back {
      background: #e74c3c;
      border: none;
      border-radius: 25px;
      padding: 8px 20px;
      font-weight: 500;
      transition: all 0.3s ease;
      color: #fff;
      margin-bottom: 20px;
    }

    .btn-back:hover {
      background: #c0392b;
      transform: translateY(-2px);
    }
  `;

  return (
    <Container fluid className="contact-container">
      <style>{customStyles}</style>
      <Button className="btn-back" onClick={() => navigate(-1)}>
        Quay lại
      </Button>
      <Card className="contact-card">
        <h2 className="contact-title">Liên hệ với chúng tôi</h2>
        <div className="contact-description">
          Chào mừng bạn đến với dịch vụ cho thuê trang phục cao cấp tại Hà Nội!
          Tại đây, chúng tôi mang đến cho bạn những mẫu trang phục độc đáo, được tuyển chọn kỹ lưỡng từ các thiết kế kết hợp giữa nét đẹp văn hóa Việt Nam và phong cách hiện đại, tinh tế.

          Với cam kết về chất lượng, sự sáng tạo và trải nghiệm khách hàng, chúng tôi cung cấp dịch vụ thuê trang phục linh hoạt, từ váy dạ hội, áo dài, suit cho đến những bộ outfit thời thượng, giúp bạn tỏa sáng trong mọi dịp – từ lễ cưới, tiệc tối, sự kiện công sở đến buổi chụp hình nghệ thuật.

          Không cần sở hữu, chỉ cần chọn - và bạn sẽ có được diện mạo đẳng cấp, thanh lịch trong từng đường nét.
        </div>
        <div className="contact-info">
          <p><strong>Địa chỉ:</strong> Km29 Đại Lộ Thăng Long, Hòa Lạc, Hà Nội, Việt Nam</p>
          <p><strong>Email:</strong> contact@thanglongfashion.com</p>
          <p><strong>Điện thoại:</strong> +84 123 456 789</p>
        </div>
      </Card>
    </Container>
  );
}
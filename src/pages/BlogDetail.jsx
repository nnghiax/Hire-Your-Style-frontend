import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import axios from 'axios';

export default function BlogDetail() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:9999/blog/detail/${blogId}`);
        setBlog(res.data.data);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết bài viết:', error);
        setError('Không thể tải chi tiết bài viết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetail();
  }, [blogId]);

  const customStyles = `
    .detail-container {
      background: linear-gradient(135deg, #f5f7fa 0%, #e3e8f0 100%);
      min-height: 100vh;
      padding: 60px 20px;
      width: 100vw;
      margin: 0;
      position: absolute;
      top: 0;
      left: 0;
    }

    .detail-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
      background: #ffffff;
      overflow: hidden;
      transition: all 0.4s ease;
    }

    .detail-image {
      width: 100%;
      height: 450px;
      object-fit: cover;
      border-radius: 15px 15px 0 0;
    }

    .detail-title {
      font-size: 2.8rem;
      font-weight: 800;
      color: #1a2a44;
      margin-top: 20px;
      margin-bottom: 15px;
    }

    .detail-content {
      font-size: 1.1rem;
      color: #34495e;
      line-height: 1.8;
      margin-bottom: 20px;
    }

    .detail-meta {
      font-size: 0.95rem;
      color: #7f8c8d;
      margin-bottom: 25px;
    }

    .btn-custom {
      background: #4a90e2;
      border: none;
      border-radius: 25px;
      padding: 10px 25px;
      font-weight: 600;
      transition: all 0.3s ease;
      color: #fff;
    }

    .btn-custom:hover {
      background: #357abd;
      transform: translateY(-3px);
    }

    .alert-custom {
      background: #e74c3c;
      color: #fff;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
    }
  `;

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (error) return <div className="alert-custom py-5">{error}</div>;
  if (!blog) return <div className="text-center py-5">Bài viết không tồn tại.</div>;

  return (
    <Container fluid className="detail-container">
      <style>{customStyles}</style>
      <Card className="detail-card">
        <img
          src={blog.image || 'https://via.placeholder.com/600x450'}
          alt={blog.title}
          className="detail-image"
        />
        <Card.Body>
          <Card.Title className="detail-title">{blog.title}</Card.Title>
          <Card.Text className="detail-content">
            {blog.content}
          </Card.Text>
          <Card.Text className="detail-meta">
            <small>Ngày tạo: {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</small>
          </Card.Text>
          <Button className="btn-custom" onClick={() => navigate('/blog')}>
            Quay lại
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
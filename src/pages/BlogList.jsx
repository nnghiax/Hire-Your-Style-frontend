import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    'https://res.cloudinary.com/dj2liaz6d/image/upload/v1752160928/anh-bia-thoi-trang_2_1.jpg',
    'https://res.cloudinary.com/dj2liaz6d/image/upload/v1752160927/anh-cua-hang-thoi-trang-12-1.jpg',
    'https://res.cloudinary.com/dj2liaz6d/image/upload/v1752160928/dich-vu-chup-anh-thoi-trang-cho-shop-quan-ao-dep-gia-re.jpg',
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        console.log('Fetching blogs from http://localhost:9999/blog/public');
        const res = await axios.get('http://localhost:9999/blog/public');
        console.log('API Response:', res.data);
        if (res.data && Array.isArray(res.data.data)) {
          setBlogs(res.data.data);
        } else {
          setBlogs([]);
          setError('Dữ liệu trả về không đúng định dạng.');
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách bài viết:', error);
        setError(
          error.response?.data?.message ||
          'Không thể tải danh sách bài viết. Vui lòng thử lại sau.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2500);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  const handleViewDetail = (blogId) => {
    navigate(`/blog/detail/${blogId}`);
  };

  const customStyles = `
    .blog-container {
      background: linear-gradient(135deg, #f5f7fa 0%, #e3e8f0 100%);
      min-height: 100vh;
      padding: 60px 20px;
      width: 100vw;
      margin: 0;
      position: absolute;
      top: 0;
      left: 0;
    }

    .slider-container {
      width: 100%;
      height: 600px;
      overflow: hidden;
      position: relative;
      margin-bottom: 40px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .slider-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
    }

    .slider-image.active {
      opacity: 1;
    }

    .blog-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1a2a44;
      text-align: center;
      margin-bottom: 40px;
      text-transform: uppercase;
      letter-spacing: 2px;
      position: relative;
    }

    .blog-title::after {
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

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 30px;
    }

    .blog-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      background: #ffffff;
      overflow: hidden;
      transition: all 0.4s ease;
      height: 100%;
    }

    .blog-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
    }

    .blog-image {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 15px 15px 0 0;
      transition: opacity 0.3s ease;
    }

    .blog-card:hover .blog-image {
      opacity: 0.9;
    }

    .blog-content {
      padding: 20px;
      background: linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%);
    }

    .blog-title-card {
      font-size: 1.4rem;
      font-weight: 600;
      color: #1a2a44;
      margin-bottom: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .blog-excerpt {
      font-size: 0.95rem;
      color: #7f8c8d;
      margin-bottom: 15px;
      height: 60px;
      overflow: hidden;
    }

    .btn-custom {
      background: #4a90e2;
      border: none;
      border-radius: 25px;
      padding: 8px 20px;
      font-weight: 500;
      transition: all 0.3s ease;
      color: #fff;
    }

    .btn-custom:hover {
      background: #357abd;
      transform: translateY(-2px);
    }

    .btn-home {
      background: #e74c3c;
      border: none;
      border-radius: 25px;
      padding: 8px 20px;
      font-weight: 500;
      transition: all 0.3s ease;
      color: #fff;
      margin-bottom: 20px;
    }

    .btn-home:hover {
      background: #c0392b;
      transform: translateY(-2px);
    }

    .alert-custom {
      background: #e74c3c;
      color: #fff;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
    }
  `;

  return (
    <Container fluid className="blog-container">
      <style>{customStyles}</style>
      <div style={{ marginBottom: "1.5rem" }}>
        <a
          href="/"
          style={{
            color: "#8A784E",
            fontSize: "1.1rem",
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
        >
          <i
            className="fas fa-home me-2"
            style={{ marginRight: "0.5rem" }}
          ></i>
          Trang chủ
        </a>
      </div>
      <div className="slider-container">
        {slides.map((slide, index) => (
          <img
            key={index}
            src={slide}
            alt={`Slide ${index + 1}`}
            className={`slider-image ${index === currentSlide ? 'active' : ''}`}
          />
        ))}
      </div>
      <h2 className="blog-title">Danh sách bài viết</h2>
      {error && <div className="alert-custom">{error}</div>}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div>Đang tải...</div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-5 text-muted">Không có bài viết nào.</div>
      ) : (
        <div className="blog-grid">
          {blogs.map((blog) => (
            <Card key={blog._id} className="blog-card">
              <img
                src={blog.image || 'https://via.placeholder.com/320x220'}
                alt={blog.title}
                className="blog-image"
              />
              <Card.Body className="blog-content">
                <Card.Title className="blog-title-card">{blog.title}</Card.Title>
                <Card.Text className="blog-excerpt">
                  {blog.content && blog.content.length > 100
                    ? `${blog.content.substring(0, 100)}...`
                    : blog.content || 'Nội dung không có'}
                </Card.Text>
                <Button
                  className="btn-custom"
                  onClick={() => handleViewDetail(blog._id)}
                >
                  Xem chi tiết
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
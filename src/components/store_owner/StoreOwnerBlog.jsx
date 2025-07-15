import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import StoreOwnerSidebar from "./StoreOwnerSidebar";
import HeaderStoreOwner from "./HeaderStoreOwner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";

const customStyles = `
  .dashboard-container {
    margin-left: 250px;
    flex-grow: 1;
    background: linear-gradient(135deg, #f5f7fa 0%, #e3e8f0 100%);
    min-height: 100vh;
    padding: 30px 20px;
    transition: all 0.3s ease;
  }

  .header-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1a2a44;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .action-buttons .btn {
    padding: 10px 20px;
    font-weight: 600;
    border-radius: 25px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .action-buttons .btn-primary {
    background-color: #4a90e2;
    border-color: #4a90e2;
    color: #fff;
  }

  .action-buttons .btn-primary:hover {
    background-color: #357abd;
    border-color: #357abd;
    transform: translateY(-2px);
  }

  .action-buttons .btn-secondary {
    background-color: #95a5a6;
    border-color: #95a5a6;
    color: #fff;
  }

  .action-buttons .btn-secondary:hover {
    background-color: #7f8c8d;
    border-color: #7f8c8d;
    transform: translateY(-2px);
  }

  .blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .blog-card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    background: #ffffff;
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
  }

  .blog-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .blog-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 15px 15px 0 0;
  }

  .blog-content {
    padding: 15px;
  }

  .blog-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1a2a44;
    margin-bottom: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .blog-meta {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin-bottom: 10px;
  }

  .blog-status {
    font-weight: 500;
    color: #2ecc71;
  }

  .blog-status.draft {
    color: #e74c3c;
  }

  .blog-actions .icon-btn {
    padding: 6px 10px;
    font-size: 1rem;
    border-radius: 20px;
    margin-right: 5px;
    background: none;
    border: none;
    cursor: pointer;
    color: #fff;
  }

  .blog-actions .icon-btn.edit {
    background-color: #3498db;
  }

  .blog-actions .icon-btn.edit:hover {
    background-color: #2980b9;
  }

  .blog-actions .icon-btn.delete {
    background-color: #e74c3c;
  }

  .blog-actions .icon-btn.delete:hover {
    background-color: #c0392b;
  }


  .custom-modal .modal-content {
    border-radius: 15px;
    border: none;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .custom-modal .modal-header {
    background: linear-gradient(90deg, #4a90e2, #2e6da4);
    border-bottom: none;
    border-radius: 15px 15px 0 0;
    color: #fff;
  }

  .custom-modal .modal-title {
    font-weight: 600;
  }

  .form-label {
    font-weight: 500;
    color: #1a2a44;
  }

  .form-control {
    border-radius: 10px;
    border-color: #dfe6e9;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .form-control:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 8px rgba(74, 144, 226, 0.3);
  }

  .alert-success {
    background-color: #2ecc71;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 10px 15px;
  }

  .alert-danger {
    background-color: #e74c3c;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 10px 15px;
  }
`;

function StoreOwnerBlog() {
  const [blogs, setBlogs] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const [storeRes, blogRes] = await Promise.all([
        axios
          .get("https://hireyourstyle-backend.onrender.com/store/list", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: { data: [] } })),
        axios
          .get("https://hireyourstyle-backend.onrender.com/blog/list", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: { data: [] } })),
      ]);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userStore = storeRes.data.data.find(
        (store) => store.userId === user._id
      );
      if (!userStore) {
        setError("Bạn chưa có cửa hàng. Vui lòng tạo cửa hàng trước.");
        setLoading(false);
        return;
      }

      setStoreId(userStore._id);
      setStores(
        storeRes.data.data.filter((store) => store.userId === user._id)
      );
      setBlogs(blogRes.data.data);
      console.log("Fetched blogs:", blogRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc đăng nhập lại."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    const parseUser = user ? JSON.parse(user) : null;

    if (!parseUser || parseUser.role !== "store_owner") {
      navigate("/error");
      return;
    }
    fetchData();
  }, [navigate]);

  const [formData, setFormData] = useState({
    storeId: "",
    title: "",
    content: "",
    isPublished: true,
    image: null,
  });

  const handleAddBlog = () => {
    if (!storeId) {
      setError("Không tìm thấy cửa hàng. Vui lòng tạo cửa hàng trước.");
      return;
    }
    setIsEdit(false);
    setFormData({
      storeId,
      title: "",
      content: "",
      isPublished: true,
      image: null,
    });
    setShowModal(true);
    setError("");
  };

  const handleEditBlog = (blog) => {
    setIsEdit(true);
    setSelectedBlog(blog);
    setFormData({
      storeId: blog.storeId,
      title: blog.title,
      content: blog.content,
      isPublished: blog.isPublished,
      image: null,
    });
    setShowModal(true);
    setError("");
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.storeId) {
      setError("Vui lòng chọn cửa hàng.");
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "image" && formData[key]) {
        form.append(key, formData[key]);
      } else {
        form.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem("token");
      if (isEdit) {
        const res = await axios.put(
          `https://hireyourstyle-backend.onrender.com/blog/update/${selectedBlog._id}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setBlogs(
          blogs.map((b) => (b._id === selectedBlog._id ? res.data.data : b))
        );
        showSuccessMessage("Cập nhật bài viết thành công!");
      } else {
        const res = await axios.post(
          "https://hireyourstyle-backend.onrender.com/blog/create",
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setBlogs([...blogs, res.data.data]);
        showSuccessMessage("Thêm bài viết thành công!");
      }
      setShowModal(false);
      setError("");
      await fetchData();
    } catch (error) {
      console.error("Error submitting blog:", error);
      setError(
        error.response?.data?.message ||
          "Lỗi khi lưu bài viết. Vui lòng thử lại."
      );
    }
  };

  const handleDelete = async (blogId) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này không?")) {
      try {
        await axios.delete(
          `https://hireyourstyle-backend.onrender.com/blog/delete/${blogId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setBlogs(blogs.filter((b) => b._id !== blogId));
        showSuccessMessage("Xóa bài viết thành công!");
        await fetchData();
      } catch (error) {
        console.error("Error deleting blog:", error);
        setError(
          error.response?.data?.message ||
            "Lỗi khi xóa bài viết. Vui lòng thử lại."
        );
      }
    }
  };

  if (error && !storeId) {
    return (
      <div className="d-flex">
        <StoreOwnerSidebar />
        <div className="dashboard-container">
          <HeaderStoreOwner />
          <Container fluid className="px-4">
            <Alert variant="danger">{error}</Alert>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <StoreOwnerSidebar />
      <div className="dashboard-container">
        <HeaderStoreOwner />
        <Container fluid className="px-4">
          <style>{customStyles}</style>
          <Row className="mb-3">
            <Col>
              <div className="header-title">
                📝 <span>Danh sách bài viết</span>
              </div>
              <div className="action-buttons">
                <Button
                  variant="primary"
                  onClick={handleAddBlog}
                  disabled={!storeId}
                >
                  Thêm bài viết
                </Button>
              </div>
            </Col>
          </Row>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="blog-grid">
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <div>Đang tải dữ liệu...</div>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center text-muted py-4">
                Không có bài viết nào.
              </div>
            ) : (
              blogs.map((blog, index) => (
                <Card key={blog._id} className="blog-card">
                  <img
                    src={blog.image || "/images/default-blog.png"}
                    alt={blog.title}
                    className="blog-image"
                  />
                  <Card.Body className="blog-content">
                    <div className="blog-title">{blog.title}</div>
                    <div className="blog-meta">
                      Ngày tạo: {formatDate(blog.createdAt)}
                    </div>
                    <div
                      className={`blog-status ${
                        !blog.isPublished ? "draft" : ""
                      }`}
                    >
                      {blog.isPublished ? "Công khai" : "Nháp"}
                    </div>
                    <div className="blog-actions">
                      <button
                        className="icon-btn edit"
                        onClick={() => handleEditBlog(blog)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="icon-btn delete"
                        onClick={() => handleDelete(blog._id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>

          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            centered
            size="lg"
            className="custom-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {isEdit ? "Sửa bài viết" : "Thêm bài viết"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Cửa hàng</Form.Label>
                  <Form.Select
                    value={formData.storeId}
                    onChange={(e) =>
                      setFormData({ ...formData, storeId: e.target.value })
                    }
                    required
                    disabled={stores.length <= 1}
                  >
                    <option value="">Chọn cửa hàng</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Tiêu đề</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Nội dung</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Trạng thái</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Công khai"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Hình ảnh</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.files[0] })
                    }
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  {isEdit ? "Cập nhật" : "Thêm"}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    </div>
  );
}

export default StoreOwnerBlog;

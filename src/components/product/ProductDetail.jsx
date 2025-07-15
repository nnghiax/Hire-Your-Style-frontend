import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Tabs,
  Tab,
  Form,
  Alert,
} from "react-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ProductDetail = () => {
  const [product, setProduct] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const { productId, storeId } = useParams();
  const navigate = useNavigate();
  const [showCalculator, setShowCalculator] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("male");
  const [size, setSize] = useState("");
  const [store, setStore] = useState({});

  const calculateSize = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w) || h === 0) return setSize("Dữ liệu không hợp lệ");

    const bmi = w / (h * h);
    let result = "";

    if (gender === "male") {
      if (height < 160)
        result = bmi < 18.5 ? "XS" : bmi < 25 ? "S" : bmi < 30 ? "M" : "L";
      else if (height < 170)
        result = bmi < 18.5 ? "S" : bmi < 25 ? "M" : bmi < 30 ? "L" : "XL";
      else if (height < 180)
        result = bmi < 18.5 ? "M" : bmi < 25 ? "L" : bmi < 30 ? "XL" : "XXL";
      else
        result = bmi < 18.5 ? "L" : bmi < 25 ? "XL" : bmi < 30 ? "XXL" : "XXXL";
    } else {
      if (height < 155)
        result = bmi < 18.5 ? "XXS" : bmi < 25 ? "XS" : bmi < 30 ? "S" : "M";
      else if (height < 165)
        result = bmi < 18.5 ? "XS" : bmi < 25 ? "S" : bmi < 30 ? "M" : "L";
      else if (height < 175)
        result = bmi < 18.5 ? "S" : bmi < 25 ? "M" : bmi < 30 ? "L" : "XL";
      else result = bmi < 18.5 ? "M" : bmi < 25 ? "L" : bmi < 30 ? "XL" : "XXL";
    }

    setSize(result);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `https://hireyourstyle-backend.onrender.com/product/detail/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProduct(res.data.data);
        setSelectedImage(res.data.data.image);
        if (res.data.data.sizes && res.data.data.sizes.length > 0) {
          setSelectedSize(res.data.data.sizes[0]);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `https://hireyourstyle-backend.onrender.com/review/product/${productId}`
        );
        setReviews(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải đánh giá:", error);
      }
    };

    const fetchStore = async () => {
      try {
        const res = await axios.get(
          `https://hireyourstyle-backend.onrender.com/store/detail/${storeId}`
        );
        setStore(res.data.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin cửa hàng:", error);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchProduct(), fetchReviews(), fetchStore()]);
      setLoading(false);
    };

    loadData();
  }, [productId]);

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      alert("Vui lòng chọn kích thước!");
      return;
    }

    if (quantity > product.quantity) {
      alert(`Chỉ còn ${product.quantity} sản phẩm trong kho!`);
      return;
    }

    setAddingToCart(true);

    try {
      const response = await axios.post(
        "http://localhost:9999/cart/add-to-cart",
        {
          productId: productId,
          storeId: storeId,
          size: selectedSize,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
        navigate("/cart");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      alert(
        error.response?.data.message || "Có lỗi xảy ra khi thêm vào giỏ hàng!"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1
      )
    : 0;

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="spinner-border"
          style={{ color: "#8A784E" }}
          role="status"
        >
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </Container>
    );
  }

  return (
    <section style={{ backgroundColor: "#F2F2F2", padding: "3rem 0" }}>
      <Container>
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Card.Img
                src={product.image}
                alt={product.name}
                style={{
                  height: "80vh",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-4 p-4">
              <Card.Body>
                <Card.Title
                  className="text-uppercase fs-4 fw-semibold mb-3"
                  style={{ color: "#8A784E" }}
                >
                  {product.name}
                </Card.Title>
                <Card.Title className="text-uppercase fs-6 fw-semibold mb-3">
                  <span style={{ color: "#6c757d" }}>cửa hàng:</span>{" "}
                  <span style={{ color: "#8A784E" }}>{store.name}</span>
                </Card.Title>

                <div className="d-flex align-items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star ${
                        i < Math.round(averageRating)
                          ? "text-warning"
                          : "text-muted"
                      } me-1`}
                    ></i>
                  ))}
                  <small className="text-muted ms-2">
                    ({reviews.length} đánh giá, {averageRating} sao)
                  </small>
                </div>
                <h4 className="fw-bold mb-3" style={{ color: "#8A784E" }}>
                  {formatPrice(product.price)}
                </h4>
                <Alert variant="light" className="border-0 rounded-4 mb-4">
                  {product.description}
                </Alert>

                <div className="mb-4">
                  <h5 className="fw-semibold mb-3" style={{ color: "#8A784E" }}>
                    <i className="fas fa-ruler me-2"></i>Kích thước{" "}
                    <span className="text-danger">*</span>
                  </h5>
                  <div className="d-flex gap-2 flex-wrap">
                    {product.sizes &&
                      product.sizes.map((size) => (
                        <Button
                          key={size}
                          variant={
                            selectedSize === size
                              ? "primary"
                              : "outline-secondary"
                          }
                          className="rounded-4 px-3 py-1"
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </Button>
                      ))}
                    <Button
                      variant="link"
                      className="text-decoration-none p-0"
                      style={{ color: "#8A784E" }}
                      onClick={() => setShowCalculator(!showCalculator)}
                    >
                      <i className="fas fa-lightbulb me-1"></i>Tính size
                    </Button>
                  </div>
                </div>

                {showCalculator && (
                  <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#8A784E" }}
                    >
                      Dự đoán Size Quần Áo
                    </h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Giới tính:</Form.Label>
                      <Form.Select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Chiều cao (cm):</Form.Label>
                      <Form.Control
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="VD: 170"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Cân nặng (kg):</Form.Label>
                      <Form.Control
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="VD: 65"
                      />
                    </Form.Group>
                    <Button
                      variant="primary"
                      className="rounded-4 px-4"
                      onClick={calculateSize}
                    >
                      Tính Size
                    </Button>
                    {size && (
                      <Alert variant="success" className="mt-3 rounded-4">
                        👉 Size phù hợp: <strong>{size}</strong>
                      </Alert>
                    )}
                  </Card>
                )}

                <div className="mb-4">
                  <h5 className="fw-semibold mb-3" style={{ color: "#8A784E" }}>
                    <i className="fas fa-shopping-basket me-2"></i>Số lượng
                  </h5>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="input-group me-3"
                      style={{ width: "150px" }}
                    >
                      <Button
                        variant="outline-secondary"
                        className="rounded-4"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </Button>
                      <Form.Control
                        type="text"
                        className="text-center"
                        value={quantity}
                        readOnly
                      />
                      <Button
                        variant="outline-secondary"
                        className="rounded-4"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.quantity}
                      >
                        <i className="fas fa-plus"></i>
                      </Button>
                    </div>
                    <small className="text-muted">
                      Còn lại: <strong>{product.quantity}</strong> sản phẩm
                    </small>
                  </div>
                  <Button
                    variant="primary"
                    className="rounded-4 px-4 py-2 w-100"
                    onClick={handleAddToCart}
                    disabled={
                      addingToCart ||
                      !product.isAvailable ||
                      product.quantity <= 0
                    }
                  >
                    {addingToCart ? (
                      <>
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shopping-cart me-2"></i>
                        Thêm vào giỏ hàng
                      </>
                    )}
                  </Button>
                  {!product.isAvailable && (
                    <Alert variant="warning" className="mt-3 rounded-4">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Sản phẩm hiện tại không có sẵn
                    </Alert>
                  )}
                  {product.quantity <= 0 && (
                    <Alert variant="danger" className="mt-3 rounded-4">
                      <i className="fas fa-times-circle me-2"></i>
                      Sản phẩm đã hết hàng
                    </Alert>
                  )}
                </div>

                <div className="border-top pt-3">
                  <h5 className="fw-semibold mb-3" style={{ color: "#8A784E" }}>
                    <i className="fas fa-share-alt me-2"></i>Chia sẻ
                  </h5>
                  <div className="d-flex gap-2">
                    {[
                      { icon: "fab fa-facebook-f", bg: "#3b5998" },
                      { icon: "fab fa-twitter", bg: "#1da1f2" },
                      { icon: "fab fa-linkedin-in", bg: "#0077b5" },
                      { icon: "fab fa-pinterest-p", bg: "#bd081c" },
                    ].map((social, index) => (
                      <Button
                        key={index}
                        variant="outline-secondary"
                        className="rounded-circle"
                        style={{
                          background: social.bg,
                          color: "white",
                          width: "40px",
                          height: "40px",
                        }}
                      >
                        <i className={social.icon}></i>
                      </Button>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <Card className="border-0 shadow-sm rounded-4">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="border-0"
                style={{ background: "#f1f1f0" }}
              >
                <Tab
                  eventKey="description"
                  title={
                    <>
                      <i className="fas fa-align-left me-2"></i>Mô tả
                    </>
                  }
                >
                  <Card.Body>
                    <h4
                      className="fw-semibold mb-4"
                      style={{ color: "#8A784E" }}
                    >
                      <i className="fas fa-tag me-2"></i>Chi tiết sản phẩm
                    </h4>
                    <Card
                      className="border-0 rounded-4 p-4"
                      style={{ background: "#f1f1f0" }}
                    >
                      <p className="lead">{product.description}</p>
                      <Row>
                        <Col md={6}>
                          <h5
                            className="fw-semibold mb-3"
                            style={{ color: "#8A784E" }}
                          >
                            <i className="fas fa-check-circle me-2"></i>Đặc điểm
                            nổi bật
                          </h5>
                          <ul className="list-unstyled">
                            {[
                              "Thiết kế xẻ tà lệch độc đáo",
                              "Phong cách truyền thống kết hợp hiện đại",
                              "Tông màu thanh lịch",
                              "Tôn lên vẻ trang nhã và mạnh mẽ",
                            ].map((item, index) => (
                              <li key={index} className="mb-2">
                                <i className="fas fa-check text-success me-2"></i>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </Col>
                        <Col md={6}>
                          <h5
                            className="fw-semibold mb-3"
                            style={{ color: "#8A784E" }}
                          >
                            <i className="fas fa-info-circle me-2"></i>Hướng dẫn
                            bảo quản
                          </h5>
                          <ul className="list-unstyled">
                            {[
                              "Giặt ở nhiệt độ dưới 40°C",
                              "Không sử dụng chất tẩy",
                              "Phơi nơi thoáng mát",
                              "Ủi nhiệt độ trung bình",
                            ].map((item, index) => (
                              <li key={index} className="mb-2">
                                <i className="fas fa-water text-info me-2"></i>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </Col>
                      </Row>
                    </Card>
                  </Card.Body>
                </Tab>
                <Tab
                  eventKey="info"
                  title={
                    <>
                      <i className="fas fa-info-circle me-2"></i>Thông tin
                    </>
                  }
                >
                  <Card.Body>
                    <h4
                      className="fw-semibold mb-4"
                      style={{ color: "#8A784E" }}
                    >
                      <i className="fas fa-clipboard-list me-2"></i>Thông tin
                      sản phẩm
                    </h4>
                    <Row>
                      {[
                        {
                          label: "Số lượng còn lại",
                          value: product.quantity,
                          icon: "fas fa-boxes",
                        },
                        {
                          label: "Tình trạng",
                          value: product.isAvailable ? "Còn hàng" : "Hết hàng",
                          icon: "fas fa-check-circle",
                        },
                        {
                          label: "Ngày thêm",
                          value: new Date(product.createdAt).toLocaleDateString(
                            "vi-VN"
                          ),
                          icon: "fas fa-calendar-plus",
                        },
                        {
                          label: "Cập nhật lần cuối",
                          value: new Date(product.updatedAt).toLocaleDateString(
                            "vi-VN"
                          ),
                          icon: "fas fa-sync-alt",
                        },
                      ].map((item, index) => (
                        <Col key={index} md={6} className="mb-4">
                          <Card className="border-0 shadow-sm rounded-4 p-3">
                            <div className="d-flex align-items-center">
                              <i
                                className={`${item.icon} me-2`}
                                style={{ color: "#8A784E" }}
                              ></i>
                              <div>
                                <small className="text-muted text-uppercase">
                                  {item.label}
                                </small>
                                <h5
                                  className="mb-0"
                                  style={{ color: "#8A784E" }}
                                >
                                  {item.value}
                                </h5>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Tab>
                <Tab
                  eventKey="review"
                  title={
                    <>
                      <i className="fas fa-star me-2"></i>Đánh giá
                    </>
                  }
                >
                  <Card.Body>
                    {reviews.length === 0 ? (
                      <div className="text-center">
                        <i className="fas fa-comments fa-4x text-muted mb-3"></i>
                        <h4
                          className="fw-semibold mb-3"
                          style={{ color: "#8A784E" }}
                        >
                          Chưa có đánh giá nào
                        </h4>
                        <p className="text-muted lead">
                          Hãy là người đầu tiên đánh giá sản phẩm này và chia sẻ
                          trải nghiệm của bạn.
                        </p>
                        <Button
                          variant="primary"
                          className="rounded-4 px-4 py-2"
                        >
                          <i className="fas fa-edit me-2"></i>Viết đánh giá đầu
                          tiên
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h4
                          className="fw-semibold mb-4"
                          style={{ color: "#8A784E" }}
                        >
                          <i className="fas fa-star me-2"></i>Đánh giá từ khách
                          hàng
                        </h4>
                        {reviews.map((review) => (
                          <Card
                            key={review._id}
                            className="border-0 shadow-sm rounded-4 mb-3"
                          >
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                  <strong>
                                    {review.userId?.name ||
                                      "Khách hàng ẩn danh"}
                                  </strong>
                                  <div>
                                    {[...Array(5)].map((_, i) => (
                                      <i
                                        key={i}
                                        className={`fas fa-star ${
                                          i < review.rating
                                            ? "text-warning"
                                            : "text-muted"
                                        } me-1`}
                                      ></i>
                                    ))}
                                  </div>
                                </div>
                                <small className="text-muted">
                                  {formatDate(review.createdAt)}
                                </small>
                              </div>
                              <p className="mb-0">
                                {review.comment || "Không có bình luận"}
                              </p>
                            </Card.Body>
                          </Card>
                        ))}
                      </>
                    )}
                  </Card.Body>
                </Tab>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ProductDetail;

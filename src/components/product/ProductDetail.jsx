import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ProductDetail = () => {
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:9999/product/detail/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProduct(res.data.data);
        setSelectedImage(res.data.data.image);
        // Tự động chọn size đầu tiên nếu có
        if (res.data.data.sizes && res.data.data.sizes.length > 0) {
          setSelectedSize(res.data.data.sizes[0]);
        }
        console.log("Product data:", res.data.data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleAddToCart = async () => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    // Kiểm tra xem đã chọn size chưa
    if (!selectedSize) {
      alert("Vui lòng chọn kích thước!");
      return;
    }

    // Kiểm tra số lượng
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
        // Chuyển hướng đến trang giỏ hàng
        navigate("/cart");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);

      if (error.response) {
        // Server trả về lỗi
        alert(
          error.response.data.message || "Có lỗi xảy ra khi thêm vào giỏ hàng!"
        );
      } else if (error.request) {
        // Không có phản hồi từ server
        alert("Không thể kết nối đến server!");
      } else {
        // Lỗi khác
        alert("Có lỗi xảy ra!");
      }
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

  const customStyles = `
    .product-image-main {
      transition: transform 0.3s ease;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .product-image-main:hover {
      transform: scale(1.02);
    }
    .product-thumbnail {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 10px;
      border: 2px solid #e9ecef;
    }
    .product-thumbnail:hover {
      border-color: #007bff;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,123,255,0.2);
    }
    .product-thumbnail.active {
      border-color: #007bff;
      box-shadow: 0 5px 15px rgba(0,123,255,0.3);
    }
    .size-option {
      transition: all 0.3s ease;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      cursor: pointer;
      background: white;
    }
    .size-option:hover {
      border-color: #007bff;
      background: #f8f9ff;
      transform: translateY(-1px);
    }
    .size-option.active {
      border-color: #007bff;
      background: #007bff;
      color: white;
    }
    .quantity-btn {
      transition: all 0.2s ease;
      border-radius: 8px;
    }
    .quantity-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 3px 10px rgba(0,123,255,0.3);
    }
    .add-to-cart-btn {
      background: linear-gradient(135deg, #007bff, #0056b3);
      border: none;
      border-radius: 12px;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0,123,255,0.3);
    }
    .add-to-cart-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,123,255,0.4);
      background: linear-gradient(135deg, #0056b3, #003d82);
    }
    .add-to-cart-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .wishlist-btn {
      border: 2px solid #dee2e6;
      border-radius: 12px;
      transition: all 0.3s ease;
      background: white;
    }
    .wishlist-btn:hover {
      border-color: #dc3545;
      color: #dc3545;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(220,53,69,0.2);
    }
    .social-btn {
      border-radius: 10px;
      transition: all 0.3s ease;
      border: none;
      color: white;
      width: 45px;
      height: 45px;
    }
    .social-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .tab-content-section {
      min-height: 300px;
      border-radius: 15px;
      background: white;
      box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    }
    .tab-button {
      border: none;
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
      border-radius: 8px 8px 0 0;
    }
    .tab-button:hover {
      background: #f8f9fa;
      border-bottom-color: #dee2e6;
    }
    .tab-button.active {
      background: white;
      border-bottom-color: #007bff;
      color: #007bff;
      font-weight: 600;
    }
    .feature-list {
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid #28a745;
    }
    .info-card {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
      border: 1px solid #dee2e6;
      transition: transform 0.3s ease;
    }
    .info-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .breadcrumb-custom {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 10px;
      border: none;
    }
    .price-tag {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      border-radius: 10px;
      display: inline-block;
      box-shadow: 0 3px 10px rgba(0,123,255,0.3);
    }
  `;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="bg-light min-vh-100">
        <div className="container py-5">
          <div className="row">
            {/* Image Gallery */}
            <div className="col-lg-6 mb-5">
              <div className="mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-fluid product-image-main"
                  style={{
                    height: "80vh", // chiều cao lớn
                    width: "auto", // chiều rộng tự động để giữ tỉ lệ gốc
                    objectFit: "contain", // đảm bảo toàn bộ ảnh hiển thị
                    display: "block",
                    margin: "0 auto", // căn giữa nếu cần
                  }}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="col-lg-6">
              <div className="mb-4">
                <h1 className="display-5 font-weight-bold text-dark mb-3">
                  {product.name}
                </h1>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    {[...Array(4)].map((_, i) => (
                      <i key={i} className="fas fa-star text-warning"></i>
                    ))}
                    <i className="far fa-star text-muted"></i>
                  </div>
                  <small className="text-muted">(100 đánh giá)</small>
                </div>
                <div className="price-tag p-3 mb-4">
                  <h2 className="mb-0 font-weight-bold">
                    {formatPrice(product.price)}
                  </h2>
                </div>
              </div>

              <div
                className="alert alert-info border-0"
                style={{
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
                }}
              >
                <p className="mb-0 text-dark">{product.description}</p>
              </div>

              {/* Size Selection */}
              <div className="mb-4">
                <h5 className="font-weight-bold text-dark mb-3">
                  <i className="fas fa-ruler me-2 text-primary"></i>Kích thước
                  <span className="text-danger">*</span>
                </h5>
                <div className="d-flex gap-3">
                  {product.sizes &&
                    product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`btn size-option px-4 py-2 font-weight-bold ${
                          selectedSize === size ? "active" : ""
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                </div>
              </div>

              {/* Color */}
              <div className="mb-4">
                <h5 className="font-weight-bold text-dark mb-3">
                  <i className="fas fa-palette me-2 text-primary"></i>Màu sắc
                </h5>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle me-3 border"
                    style={{
                      width: "35px",
                      height: "35px",
                      background: product.color === "Trắng" ? "white" : "black",
                    }}
                  ></div>
                  <span className="font-weight-semibold">{product.color}</span>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="mb-4">
                <h5 className="font-weight-bold text-dark mb-3">
                  <i className="fas fa-shopping-basket me-2 text-primary"></i>Số
                  lượng
                </h5>
                <div className="d-flex align-items-center mb-3">
                  <div className="input-group me-4" style={{ width: "150px" }}>
                    <button
                      className="btn btn-primary quantity-btn"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <input
                      type="text"
                      className="form-control text-center font-weight-bold"
                      value={quantity}
                      readOnly
                    />
                    <button
                      className="btn btn-primary quantity-btn"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.quantity}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <small className="text-muted">
                    Còn lại: <strong>{product.quantity}</strong> sản phẩm
                  </small>
                </div>

                <div className="d-flex gap-3">
                  <button
                    className="btn btn-primary btn-lg add-to-cart-btn flex-fill py-3"
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
                          <span className="sr-only">Loading...</span>
                        </div>
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shopping-cart me-2"></i>
                        Thêm vào giỏ hàng
                      </>
                    )}
                  </button>
                </div>

                {/* Thông báo trạng thái sản phẩm */}
                {!product.isAvailable && (
                  <div className="alert alert-warning mt-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Sản phẩm hiện tại không có sẵn
                  </div>
                )}

                {product.quantity <= 0 && (
                  <div className="alert alert-danger mt-3">
                    <i className="fas fa-times-circle me-2"></i>
                    Sản phẩm đã hết hàng
                  </div>
                )}
              </div>

              {/* Share */}
              <div className="border-top pt-4">
                <h5 className="font-weight-bold text-dark mb-3">
                  <i className="fas fa-share-alt me-2 text-primary"></i>Chia sẻ
                </h5>
                <div className="d-flex gap-2">
                  <button
                    className="btn social-btn"
                    style={{ background: "#3b5998" }}
                  >
                    <i className="fab fa-facebook-f"></i>
                  </button>
                  <button
                    className="btn social-btn"
                    style={{ background: "#1da1f2" }}
                  >
                    <i className="fab fa-twitter"></i>
                  </button>
                  <button
                    className="btn social-btn"
                    style={{ background: "#0077b5" }}
                  >
                    <i className="fab fa-linkedin-in"></i>
                  </button>
                  <button
                    className="btn social-btn"
                    style={{ background: "#bd081c" }}
                  >
                    <i className="fab fa-pinterest-p"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="tab-content-section p-0">
                <nav>
                  <div
                    className="nav nav-tabs border-0 bg-light"
                    style={{ borderRadius: "15px 15px 0 0" }}
                  >
                    {[
                      {
                        id: "description",
                        label: "Mô tả",
                        icon: "fas fa-align-left",
                      },
                      {
                        id: "info",
                        label: "Thông tin",
                        icon: "fas fa-info-circle",
                      },
                      { id: "review", label: "Đánh giá", icon: "fas fa-star" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`nav-link tab-button px-4 py-3 ${
                          activeTab === tab.id ? "active" : ""
                        }`}
                      >
                        <i className={`${tab.icon} me-2`}></i>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </nav>

                <div className="p-5">
                  {activeTab === "description" && (
                    <div>
                      <h3 className="font-weight-bold text-dark mb-4">
                        <i className="fas fa-tag me-2 text-primary"></i>
                        Chi tiết sản phẩm
                      </h3>
                      <div className="feature-list p-4 mb-4">
                        <p className="text-dark mb-4 lead">
                          {product.description}
                        </p>
                        <div className="row">
                          <div className="col-md-6">
                            <h5 className="font-weight-bold text-success mb-3">
                              <i className="fas fa-check-circle me-2"></i>
                              Đặc điểm nổi bật
                            </h5>
                            <ul className="list-unstyled">
                              <li className="mb-2">
                                <i className="fas fa-check text-success me-2"></i>
                                Thiết kế xẻ tà lệch độc đáo
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check text-success me-2"></i>
                                Phong cách truyền thống kết hợp hiện đại
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check text-success me-2"></i>
                                Tông màu thanh lịch
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check text-success me-2"></i>
                                Tôn lên vẻ trang nhã và mạnh mẽ
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6">
                            <h5 className="font-weight-bold text-info mb-3">
                              <i className="fas fa-info-circle me-2"></i>
                              Hướng dẫn bảo quản
                            </h5>
                            <ul className="list-unstyled">
                              <li className="mb-2">
                                <i className="fas fa-water text-info me-2"></i>
                                Giặt ở nhiệt độ dưới 40°C
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-ban text-info me-2"></i>
                                Không sử dụng chất tẩy
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-wind text-info me-2"></i>
                                Phơi nơi thoáng mát
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-thermometer-half text-info me-2"></i>
                                Ủi nhiệt độ trung bình
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "info" && (
                    <div>
                      <h3 className="font-weight-bold text-dark mb-4">
                        <i className="fas fa-clipboard-list me-2 text-primary"></i>
                        Thông tin sản phẩm
                      </h3>
                      <div className="row">
                        {[
                          {
                            label: "Số lượng còn lại",
                            value: product.quantity,
                            color: "success",
                            icon: "fas fa-boxes",
                          },
                          {
                            label: "Tình trạng",
                            value: product.isAvailable
                              ? "Còn hàng"
                              : "Hết hàng",
                            color: product.isAvailable ? "success" : "danger",
                            icon: "fas fa-check-circle",
                          },
                          {
                            label: "Ngày thêm",
                            value: new Date(
                              product.createdAt
                            ).toLocaleDateString("vi-VN"),
                            color: "info",
                            icon: "fas fa-calendar-plus",
                          },
                          {
                            label: "Cập nhật lần cuối",
                            value: new Date(
                              product.updatedAt
                            ).toLocaleDateString("vi-VN"),
                            color: "secondary",
                            icon: "fas fa-sync-alt",
                          },
                        ].map((item, index) => (
                          <div key={index} className="col-md-6 mb-4">
                            <div className="info-card p-4 h-100">
                              <div className="d-flex align-items-center mb-2">
                                <i
                                  className={`${item.icon} text-${item.color} me-2`}
                                ></i>
                                <small className="text-muted text-uppercase font-weight-bold">
                                  {item.label}
                                </small>
                              </div>
                              <h4
                                className={`text-${item.color} font-weight-bold mb-0`}
                              >
                                {item.value}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "review" && (
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="fas fa-comments fa-4x text-muted mb-3"></i>
                        <h3 className="font-weight-bold text-dark">
                          Chưa có đánh giá nào
                        </h3>
                        <p className="text-muted lead">
                          Hãy là người đầu tiên đánh giá sản phẩm này và chia sẻ
                          trải nghiệm của bạn.
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-lg px-5 py-3"
                        style={{ borderRadius: "12px" }}
                      >
                        <i className="fas fa-edit me-2"></i>
                        Viết đánh giá đầu tiên
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;

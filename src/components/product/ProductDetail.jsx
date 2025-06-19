import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Light.css"
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
  const [showCalculator, setShowCalculator] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [size, setSize] = useState('');
  const [rentDate, setRentDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const calculateSize = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w) || h === 0) return setSize("Dữ liệu không hợp lệ");

    const bmi = w / (h * h);
    let result = '';

    if (gender === 'male') {
      if (height < 160) result = bmi < 18.5 ? 'XS' : bmi < 25 ? 'S' : bmi < 30 ? 'M' : 'L';
      else if (height < 170) result = bmi < 18.5 ? 'S' : bmi < 25 ? 'M' : bmi < 30 ? 'L' : 'XL';
      else if (height < 180) result = bmi < 18.5 ? 'M' : bmi < 25 ? 'L' : bmi < 30 ? 'XL' : 'XXL';
      else result = bmi < 18.5 ? 'L' : bmi < 25 ? 'XL' : bmi < 30 ? 'XXL' : 'XXXL';
    } else {
      if (height < 155) result = bmi < 18.5 ? 'XXS' : bmi < 25 ? 'XS' : bmi < 30 ? 'S' : 'M';
      else if (height < 165) result = bmi < 18.5 ? 'XS' : bmi < 25 ? 'S' : bmi < 30 ? 'M' : 'L';
      else if (height < 175) result = bmi < 18.5 ? 'S' : bmi < 25 ? 'M' : bmi < 30 ? 'L' : 'XL';
      else result = bmi < 18.5 ? 'M' : bmi < 25 ? 'L' : bmi < 30 ? 'XL' : 'XXL';
    }

    setSize(result);
  };

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
          size: selectedSize,
          quantity: quantity,
          rentDate: rentDate,
          returnDate: returnDate,
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

      if (error.response) {
        alert(
          error.response.data.message || "Có lỗi xảy ra khi thêm vào giỏ hàng!"
        );
      } else if (error.request) {
        alert("Không thể kết nối đến server!");
      } else {
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
    .date-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      font-size: 16px;
      margin-top: 5px;
      transition: border-color 0.3s ease;
    }
    .date-input:focus {
      border-color: #007bff;
      outline: none;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
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
            <div className="col-lg-6 mb-5">
              <div className="mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-fluid product-image-main"
                  style={{
                    height: "80vh",
                    width: "auto",
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </div>
            </div>

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
                <div className="size-section">
                  <div className="d-flex gap-3">
                    {product.sizes &&
                      product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`btn size-option px-4 py-2 font-weight-bold ${selectedSize === size ? "active" : ""
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                  </div>
                  <button
                    className="lightbulb-btn"
                    onClick={() => setShowCalculator(!showCalculator)}
                    title="Tính size"
                  >
                    💡
                  </button>
                </div>
              </div>

              {showCalculator && (
                <div className="calculator-card">
                  <h2>Dự đoán Size Quần Áo</h2>

                  <label>Giới tính:</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>

                  <label>Chiều cao (cm):</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="VD: 170"
                  />

                  <label>Cân nặng (kg):</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="VD: 65"
                  />

                  <button onClick={calculateSize} className="submit-btn">
                    Tính Size
                  </button>

                  {size && <div className="result">👉 Size phù hợp: <strong>{size}</strong></div>}
                </div>
              )}

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

                {/* Rental Dates */}
                <div className="mb-4">
                  <h5 className="font-weight-bold text-dark mb-3">
                    <i className="fas fa-calendar-alt me-2 text-primary"></i>Thời gian thuê
                  </h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label>Ngày thuê:</label>
                      <input
                        type="date"
                        className="date-input"
                        value={rentDate}
                        onChange={(e) => setRentDate(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>Ngày trả:</label>
                      <input
                        type="date"
                        className="date-input"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <button
                    className="btn btn-primary btn-lg add-to-cart-btn flex-fill py-3"
                    onClick={handleAddToCart}
                    disabled={
                      addingToCart ||
                      !product.isAvailable ||
                      product.quantity <= 0 ||
                      !rentDate ||
                      !returnDate
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
                        className={`nav-link tab-button px-4 py-3 ${activeTab === tab.id ? "active" : ""
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
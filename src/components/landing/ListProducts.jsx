import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Badge,
  Collapse,
} from "react-bootstrap";

// Các chính sách
const Featured = () => {
  const features = [
    {
      icon: "fa-check",
      title: "Sản phẩm chất lượng",
    },
    {
      icon: "fa-shipping-fast",
      title: "Miễn phí vận chuyển",
    },
    {
      icon: "fa-exchange-alt",
      title: "Thao tác nhanh chóng",
    },
    {
      icon: "fa-phone-volume",
      title: "Hỗ trợ 24/7",
    },
  ];

  return (
    <Container fluid className="pt-5">
      <Row className="px-xl-5 pb-3">
        {features.map((feature, index) => (
          <Col key={index} lg={3} md={6} sm={12} className="pb-1">
            <div
              className="d-flex align-items-center border mb-4"
              style={{ padding: "30px" }}
            >
              <h1
                className={`fa ${feature.icon}  m-0 me-3`}
                style={{ color: "#B6B09F" }}
              ></h1>
              <h5 className="font-weight-semi-bold m-0">{feature.title}</h5>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

// Mũi tên slider tuỳ chỉnh
function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "block",
        background: "rgba(0,0,0,0.5)",
        right: "10px",
      }}
      onClick={onClick}
    />
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "block",
        background: "rgba(0,0,0,0.5)",
        left: "10px",
        zIndex: 1,
      }}
      onClick={onClick}
    />
  );
}

function TopbarNavbar() {
  // Cấu hình slider react-slick
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  return (
    <div>
      <Container fluid className="mb-5" style={{ backgroundColor: "#f1f1f0" }}>
        <Row>
          <Col className="d-none d-lg-block">
            <Card></Card>
          </Col>
          <Col>
            <Slider {...sliderSettings}>
              {/* Slide 1 */}
              <div>
                <div style={{ position: "relative" }}>
                  <img
                    src="/img/carousel-1.jpg"
                    alt="Slide 1"
                    style={{
                      width: "100%",
                      height: "700px",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      padding: "20px",
                      borderRadius: "5px",
                      textAlign: "center",
                      color: "#fff",
                    }}
                  >
                    <h3>
                      Phong cách cho mọi giới – Tỏa sáng trong từng khoảnh khắc
                    </h3>
                    <p>
                      Khám phá bộ sưu tập trang phục đa dạng cho cả nam và nữ –
                      từ vest lịch lãm, áo dài truyền thống đến váy dạ hội lộng
                      lẫy và trang phục biểu diễn nổi bật.
                    </p>
                  </div>
                </div>
              </div>

              {/* Slide 2 */}
              <div>
                <div style={{ position: "relative" }}>
                  <img
                    src="/img/carousel-2.jpg"
                    alt="Slide 2"
                    style={{
                      width: "100%",
                      height: "700px",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      padding: "20px",
                      borderRadius: "5px",
                      textAlign: "center",
                      color: "#000",
                    }}
                  >
                    <h3>Biến hóa phong cách – Tỏa sáng mọi sự kiện</h3>
                    <p>
                      Thuê trang phục dễ dàng, nhanh chóng với hàng trăm mẫu đa
                      dạng cho kỷ yếu, lễ hội, biểu diễn và tiệc tùng.
                    </p>
                  </div>
                </div>
              </div>
            </Slider>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

const ListProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  const handleViewAll = (categoryId) => {
    const filteredProducts = products.filter(
      (p) => p.categoryId === categoryId
    );
    const category = categories.find((c) => c._id === categoryId);

    navigate(
      `/filter-product?search=&category=${encodeURIComponent(
        category?.name || ""
      )}`,
      {
        state: { products: filteredProducts },
      }
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "https://hireyourstyle-backend.onrender.com/product/list",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProducts(res.data.data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "https://hireyourstyle-backend.onrender.com/cate/list",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCategories(res.data.data);
        console.log("Danh mục:", res.data.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          right: "-35px",
          zIndex: 2,
          top: "50%",
          transform: "translateY(-50%)",
          width: "40px",
          height: "40px",
          background: "#ffffff",
          borderRadius: "50%",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClick}
      >
        <i className="bi bi-chevron-right fs-5 text-dark"></i>
      </div>
    );
  };

  const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          left: "-35px",
          zIndex: 2,
          top: "50%",
          transform: "translateY(-50%)",
          width: "40px",
          height: "40px",
          background: "#ffffff",
          borderRadius: "50%",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClick}
      >
        <i className="bi bi-chevron-left fs-5 text-dark"></i>
      </div>
    );
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <section
      id="best-sellers"
      style={{
        backgroundColor: "#F2F2F2",
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      className=" pb-5"
    >
      <TopbarNavbar cate={categories} />
      <Featured />
      <Container>
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
          <h4 className="text-uppercase" style={{ color: "#8A784E" }}>
            Áo Dài
          </h4>
          <Button
            variant="link"
            className="text-decoration-none p-0"
            style={{ color: "#8A784E" }}
            onClick={() => handleViewAll("682835c1b3ac70579bc4ccf6")} // ID danh mục Áo Dài
          >
            Xem tất cả sản phẩm
          </Button>
        </div>
        <Slider {...settings} className="product-carousel">
          {products
            .filter((p) => p.categoryId === "682835c1b3ac70579bc4ccf6")
            .map((product) => (
              <div key={product.id} className="px-3">
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div
                    className="position-relative"
                    style={{
                      aspectRatio: "3/4",
                      overflow: "hidden",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <Card.Body className="px-3 pt-3 pb-4 d-flex flex-column justify-content-between">
                    <Card.Title
                      className="text-uppercase fs-6 mb-2 fw-semibold text-truncate"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Button
                        variant="link"
                        className="text-dark text-decoration-none p-0"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {product.name}
                      </Button>
                    </Card.Title>
                    <Button
                      variant="link"
                      size="sm"
                      className=" text-decoration-none p-0 mt-1 text-start"
                      onClick={() =>
                        navigate(
                          `/product-detail/${product._id}/${product.storeId}`
                        )
                      }
                      style={{ color: "#8A784E" }}
                    >
                      Xem chi tiết
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ))}
        </Slider>

        <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
          <h4 className="text-uppercase" style={{ color: "#8A784E" }}>
            Vest
          </h4>
          <Button
            variant="link"
            className="text-decoration-none p-0"
            style={{ color: "#8A784E" }}
            onClick={() => handleViewAll("6839b61a5c80c624e38683ab")} // ID danh mục Vest
          >
            Xem tất cả sản phẩm
          </Button>
        </div>
        <Slider {...settings} className="product-carousel">
          {products
            .filter((p) => p.categoryId === "6839b61a5c80c624e38683ab")
            .map((product) => (
              <div key={product.id} className="px-3">
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div
                    className="position-relative"
                    style={{
                      aspectRatio: "3/4",
                      overflow: "hidden",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <Card.Body className="px-3 pt-3 pb-4 d-flex flex-column justify-content-between">
                    <Card.Title
                      className="text-uppercase fs-6 mb-2 fw-semibold text-truncate"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Button
                        variant="link"
                        className="text-dark text-decoration-none p-0"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {product.name}
                      </Button>
                    </Card.Title>
                    <Button
                      variant="link"
                      size="sm"
                      className=" text-decoration-none p-0 mt-1 text-start"
                      onClick={() =>
                        navigate(
                          `/product-detail/${product._id}/${product.storeId}`
                        )
                      }
                      style={{ color: "#8A784E" }}
                    >
                      Xem chi tiết
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ))}
        </Slider>

        <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
          <h4 className="text-uppercase" style={{ color: "#8A784E" }}>
            Trang Phục Truyền Thống Dân Tộc
          </h4>
          <Button
            variant="link"
            className="text-decoration-none p-0"
            style={{ color: "#8A784E" }}
            onClick={() => handleViewAll("682835f03bae4dfdf16522c5")} // ID danh mục Áo Dài
          >
            Xem tất cả sản phẩm
          </Button>
        </div>
        <Slider {...settings} className="product-carousel">
          {products
            .filter((p) => p.categoryId === "682835f03bae4dfdf16522c5")
            .map((product) => (
              <div key={product.id} className="px-3">
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div
                    className="position-relative"
                    style={{
                      aspectRatio: "3/4",
                      overflow: "hidden",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <Card.Body className="px-3 pt-3 pb-4 d-flex flex-column justify-content-between">
                    <Card.Title
                      className="text-uppercase fs-6 mb-2 fw-semibold text-truncate"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Button
                        variant="link"
                        className="text-dark text-decoration-none p-0"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {product.name}
                      </Button>
                    </Card.Title>
                    <Button
                      variant="link"
                      size="sm"
                      className=" text-decoration-none p-0 mt-1 text-start"
                      onClick={() =>
                        navigate(
                          `/product-detail/${product._id}/${product.storeId}`
                        )
                      }
                      style={{ color: "#8A784E" }}
                    >
                      Xem chi tiết
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ))}
        </Slider>

        <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
          <h4 className="text-uppercase" style={{ color: "#8A784E" }}>
            Váy Cưới
          </h4>
          <Button
            variant="link"
            className="text-decoration-none p-0"
            style={{ color: "#8A784E" }}
            onClick={() => handleViewAll("682835e33bae4dfdf16522c1")} // ID danh mục Áo Dài
          >
            Xem tất cả sản phẩm
          </Button>
        </div>
        <Slider {...settings} className="product-carousel">
          {products
            .filter((p) => p.categoryId === "682835e33bae4dfdf16522c1")
            .map((product) => (
              <div key={product.id} className="px-3">
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div
                    className="position-relative"
                    style={{
                      aspectRatio: "3/4",
                      overflow: "hidden",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <Card.Body className="px-3 pt-3 pb-4 d-flex flex-column justify-content-between">
                    <Card.Title
                      className="text-uppercase fs-6 mb-2 fw-semibold text-truncate"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Button
                        variant="link"
                        className="text-dark text-decoration-none p-0"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {product.name}
                      </Button>
                    </Card.Title>
                    <Button
                      variant="link"
                      size="sm"
                      className=" text-decoration-none p-0 mt-1 text-start"
                      onClick={() =>
                        navigate(
                          `/product-detail/${product._id}/${product.storeId}`
                        )
                      }
                      style={{ color: "#8A784E" }}
                    >
                      Xem chi tiết
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ))}
        </Slider>
      </Container>
    </section>
  );
};

export default ListProducts;

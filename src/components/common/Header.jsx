import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  Badge,
  Dropdown,
  Image,
  NavbarText,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [activeSearchValue, setActiveSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:9999/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("User data:", res.data);
        const userData = {
          ...res.data.data,
          avatar:
            res.data.data.avatar ||
            "https://res.cloudinary.com/dh4vnrtg5/image/upload/v1747473243/avatar_user_orcdde.jpg",
        };
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setUser(null);
          navigate("/login");
        }
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:9999/cate/list", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Categories data:", res.data);
        setCategories(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        setCategories([]);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:9999/product/list", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Products data:", res.data);
        setProducts(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setProducts([]);
      }
    };

    if (localStorage.getItem("token")) {
      fetchUser();
    }
    fetchCategories();
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  function removeVietnameseTones(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }

  const handleSearch = () => {
    const currentSearchValue = searchValue;
    const currentSelectedCategory = selectedCategory;
    setActiveSearchValue(currentSearchValue);

    const filterSearch = products.filter((rep) => {
      let matchesSearch = true;
      let matchesCategory = true;

      if (currentSearchValue) {
        const keyword = removeVietnameseTones(currentSearchValue.toLowerCase());
        const productName = removeVietnameseTones(
          String(rep?.name).toLowerCase()
        );
        matchesSearch = productName.includes(keyword);
      }

      if (currentSelectedCategory) {
        matchesCategory =
          String(rep.categoryId) === String(currentSelectedCategory);
      }

      return matchesSearch && matchesCategory;
    });

    navigate(
      `/filter-product?search=${encodeURIComponent(
        currentSearchValue
      )}&category=${encodeURIComponent(currentSelectedCategory || "")}`,
      {
        state: { products: filterSearch },
      }
    );
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setOpen(false);

    const currentActiveSearchValue = activeSearchValue;
    const currentSelectedCategory = categoryId;

    const filterSearch = products.filter((rep) => {
      let matchesSearch = true;
      let matchesCategory = true;

      if (currentActiveSearchValue) {
        const keyword = removeVietnameseTones(
          currentActiveSearchValue.toLowerCase()
        );
        const productName = removeVietnameseTones(
          String(rep?.name).toLowerCase()
        );
        matchesSearch = productName.includes(keyword);
      }

      if (currentSelectedCategory) {
        matchesCategory =
          String(rep.categoryId) === String(currentSelectedCategory);
      }

      return matchesSearch && matchesCategory;
    });

    // Luôn navigate, không cần kiểm tra điều kiện
    navigate(
      `/filter-product?search=${encodeURIComponent(
        currentActiveSearchValue || ""
      )}&category=${encodeURIComponent(currentSelectedCategory || "")}`,
      {
        state: { products: filterSearch },
      }
    );
  };

  return (
    <div style={{ backgroundColor: "#f1f1f0", color: "#000" }}>
      <Container fluid>
        <Row className="py-2 px-xl-5" style={{ backgroundColor: "#e9e9e9" }}>
          <Col lg={6} className="d-none d-lg-block">
            <div className="d-inline-flex align-items-center">
              <a href="#" style={{ textDecoration: "none", color: "#000000" }}>
                Câu hỏi thường gặp
              </a>
              <span className="px-2" style={{ color: "#B6B09F" }}>
                |
              </span>
              <a href="#" style={{ textDecoration: "none", color: "#000000" }}>
                Trợ giúp
              </a>
              <span className="px-2" style={{ color: "#B6B09F" }}>
                |
              </span>
              <a href="#" style={{ textDecoration: "none", color: "#000000" }}>
                Hỗ trợ
              </a>
            </div>
          </Col>
          <Col lg={6} className="text-center text-lg-right">
            <div className="d-flex w-100 justify-content-end align-items-center">
              <a
                href="#"
                className="px-2"
                style={{ textDecoration: "none", color: "#B6B09F" }}
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className="px-2"
                style={{ textDecoration: "none", color: "#B6B09F" }}
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className="px-2"
                style={{ textDecoration: "none", color: "#B6B09F" }}
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a
                href="#"
                className="px-2"
                style={{ textDecoration: "none", color: "#B6B09F" }}
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="#"
                className="pl-2"
                style={{ textDecoration: "none", color: "#B6B09F" }}
              >
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </Col>
        </Row>

        <Row
          className="align-items-center py-3 px-xl-5"
          style={{ backgroundColor: "#f1f1f0" }}
        >
          <Col lg={3} className="d-none d-lg-block">
            <Button
              onClick={() => navigate("/")}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: 0,
                boxShadow: "none",
              }}
            >
              <h1
                className="m-0 display-5 font-weight-semi-bold"
                style={{ color: "#B6B09F", textDecoration: "none" }}
              >
                Hire Your Style
              </h1>
            </Button>
          </Col>
          <Col lg={6} xs={6} className="text-left">
            <Form
              className="d-flex"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <Form.Control
                type="text"
                placeholder="Tìm kiếm sản phẩm"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{ backgroundColor: "#fff" }}
              />
              <Button
                variant="primary"
                className="ml-2"
                type="submit"
                style={{ backgroundColor: "#B6B09F" }}
              >
                <i className="fas fa-search"></i>
              </Button>
            </Form>
          </Col>
          <Col lg={3} xs={6} className="text-right">
            <Button
              variant="light"
              className="border"
              onClick={() => navigate(`/cart`)}
              style={{ backgroundColor: "#B6B09F" }}
            >
              <i className="fas fa-shopping-cart" style={{ color: "#fff" }}></i>

              {/* <Badge variant="danger" className="ml-1">
                0
              </Badge> */}
            </Button>
          </Col>
        </Row>
      </Container>
      <Container fluid style={{ backgroundColor: "#f1f1f0" }}>
        <Row className="border-top px-xl-5">
          <Col lg={3} className="d-none d-lg-block position-relative">
            <Button
              variant="primary"
              className="d-flex align-items-center justify-content-between w-100 shadow-none"
              style={{
                height: "65px",
                marginTop: "-1px",
                padding: "0 30px",
                backgroundColor: "#B6B09F",
              }}
              onClick={() => setOpen(!open)}
              aria-expanded={open}
            >
              <h6 className="m-0 text-white">Danh mục</h6>
              <i
                className={`fa fa-angle-${open ? "up" : "down"} text-dark`}
              ></i>
            </Button>
            {open && (
              <nav
                className="navbar navbar-vertical navbar-light align-items-start p-0 border border-top-0 border-bottom-0"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 1050,
                  width: "100%",
                  maxHeight: "410px",
                  overflowY: "auto",
                  backgroundColor: "#fff",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Nav className="flex-column w-100">
                  <Nav.Link
                    key={0}
                    href="#"
                    className={`text-dark ${
                      selectedCategory === "" ? "fw-bold" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategorySelect("");
                    }}
                  >
                    Tất cả danh mục
                  </Nav.Link>
                  {categories.map((category, index) => (
                    <Nav.Link
                      key={index + 1}
                      href="#"
                      className={`text-dark ${
                        selectedCategory === category._id ? "fw-bold" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleCategorySelect(category._id);
                      }}
                    >
                      {category.name}
                    </Nav.Link>
                  ))}
                </Nav>
              </nav>
            )}
          </Col>
          <Col lg={9}>
            <Navbar
              bg="light"
              expand="lg"
              className="py-3 py-lg-0 px-0"
              style={{ height: "60px" }}
            >
              <Navbar.Brand href="#" className="d-block d-lg-none">
                <h1 className="m-0 display-5 font-weight-semi-bold">
                  <span className="text-primary font-weight-bold border px-3 mr-1">
                    Hire
                  </span>
                  Your Style
                </h1>
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="navbarCollapse" />
              <Navbar.Collapse
                id="navbarCollapse"
                className="justify-content-between"
              >
                <Nav className="mr-auto py-0">
                  <Nav.Link href="/" className="text-dark">
                    Trang chủ
                  </Nav.Link>
                  <Nav.Link href="/shop" className="text-dark">
                    Cửa hàng
                  </Nav.Link>
                  <Nav.Link href="/detail" className="text-dark">
                    Chi tiết sản phẩm
                  </Nav.Link>
                  <NavDropdown
                    title="Trang"
                    id="nav-dropdown-pages"
                    className="text-dark"
                  >
                    <NavDropdown.Item href="/cart">Giỏ hàng</NavDropdown.Item>
                    <NavDropdown.Item href="/checkout">
                      Thanh toán
                    </NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Link href="/contact" className="text-dark">
                    Liên hệ
                  </Nav.Link>
                </Nav>
                <Nav className="ml-auto py-0">
                  {isLoggedIn ? (
                    <Dropdown
                      show={showDropdown}
                      onToggle={() => setShowDropdown(!showDropdown)}
                    >
                      <Dropdown.Toggle
                        variant="link"
                        id="avatar-dropdown"
                        className="p-0 d-flex align-items-center"
                        style={{ lineHeight: 0 }}
                      >
                        {user && (
                          <>
                            <Navbar.Text>Chào, {user.name}</Navbar.Text>
                            <Image
                              src={user.avatar || "/images/default-avatar.png"}
                              roundedCircle
                              width={36}
                              height={36}
                              alt="avatar"
                              style={{ objectFit: "cover" }}
                            />
                          </>
                        )}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item href="/profile">Hồ sơ</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>
                          Đăng xuất
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <>
                      <Nav.Link
                        onClick={() => navigate("/login")}
                        className="text-dark"
                      >
                        Đăng nhập
                      </Nav.Link>
                      <Nav.Link
                        onClick={() => navigate("/register")}
                        className="text-dark"
                      >
                        Đăng ký
                      </Nav.Link>
                    </>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Navbar>
          </Col>
        </Row>
        <Row
          style={{
            height: "5vh",
            position: "relative", // cần nếu dùng position: absolute bên trong
            justifyContent: "center",
            alignItems: "center",
          }}
        ></Row>
      </Container>
    </div>
  );
}

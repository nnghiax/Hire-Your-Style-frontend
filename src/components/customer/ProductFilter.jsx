import {
  Col,
  Row,
  Form,
  Badge,
  Card,
  Button,
  Pagination,
  Dropdown,
  FormControl,
  InputGroup,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaEye, FaShoppingCart } from "react-icons/fa";
import "../css/ProductFilter.css"; // Assuming you have a CSS file for styles
import { useNavigate } from "react-router-dom";

function ProductFilter({ headerProducts }) {
  const [products, setProducts] = useState(headerProducts || []);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("latest");

  // Filter states
  const [selectedPriceRanges, setSelectedPriceRanges] = useState(["all"]);
  const [selectedColors, setSelectedColors] = useState(["all"]);
  const [selectedSizes, setSelectedSizes] = useState(["all"]);

  const itemsPerPage = 12;
  const navigate = useNavigate();

  // Initial loading of products
  // Updated price options for VND
  const priceOptions = [
    { id: "all", label: "Tất cả giá", count: 1000, checked: true },
    { id: "100000-300000", label: "100,000₫ - 300,000₫", count: 150 },
    { id: "300000-500000", label: "300,000₫ - 500,000₫", count: 295 },
    { id: "500000-700000", label: "500,000₫ - 700,000₫", count: 246 },
    { id: "700000-900000", label: "700,000₫ - 900,000₫", count: 145 },
    { id: "900000-1000000", label: "900,000₫ - 1,000,000₫", count: 168 },
  ];

  const colorOptions = [
    { id: "all", label: "All Color", count: 1000, checked: true },
    { id: "Trắng", label: "Trắng", count: 295 },
    { id: "Xanh lá", label: "Xanh lá", count: 168 },
    { id: "Đỏ", label: "Đỏ", count: 246 },
    { id: "Be", label: "Be", count: 120 },
    { id: "Đen", label: "Đen", count: 150 },
    { id: "Tím", label: "Tím", count: 90 },
  ];

  const sizeOptions = [
    { id: "all", label: "All Size", count: 1000, checked: true },
    { id: "xs", label: "XS", count: 150 },
    { id: "s", label: "S", count: 295 },
    { id: "m", label: "M", count: 246 },
    { id: "l", label: "L", count: 145 },
    { id: "xl", label: "XL", count: 168 },
  ];

  // Helper function to format VND currency
  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter functions
  const filterByPrice = (product, priceRanges) => {
    if (priceRanges.includes("all")) return true;

    const price = product.price || 0;
    return priceRanges.some((range) => {
      const [min, max] = range.split("-").map(Number);
      return price >= min && price <= max;
    });
  };

  const filterByColor = (product, colors) => {
    if (colors.includes("all")) return true;

    // Giả sử product có thuộc tính color hoặc colors (array)
    const productColors = product.color
      ? [product.color.toLowerCase()]
      : product.colors
      ? product.colors.map((c) => c.toLowerCase())
      : [];

    return colors.some((color) => productColors.includes(color.toLowerCase()));
  };

  const filterBySize = (product, sizes) => {
    if (sizes.includes("all")) return true;

    // Giả sử product có thuộc tính size hoặc sizes (array)
    const productSizes = product.size
      ? [product.size.toLowerCase()]
      : product.sizes
      ? product.sizes.map((s) => s.toLowerCase())
      : [];

    return sizes.some((size) => productSizes.includes(size.toLowerCase()));
  };

  const filterBySearch = (product, searchTerm) => {
    if (!searchTerm) return true;

    const productName = product.name ? product.name.toLowerCase() : "";
    return productName.includes(searchTerm.toLowerCase());
  };

  const sortProducts = (products, sortOption) => {
    const sortedProducts = [...products];

    switch (sortOption) {
      case "latest":
        return sortedProducts.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      case "popularity":
        return sortedProducts.sort(
          (a, b) => (b.popularity || 0) - (a.popularity || 0)
        );
      case "rating":
        return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "price-low":
        return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-high":
        return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      default:
        return sortedProducts;
    }
  };

  // Filter effect
  useEffect(() => {
    let filtered = [...products];

    // Apply filters
    filtered = filtered.filter(
      (product) =>
        filterByPrice(product, selectedPriceRanges) &&
        filterByColor(product, selectedColors) &&
        filterBySize(product, selectedSizes) &&
        filterBySearch(product, searchTerm)
    );

    // Apply sorting
    filtered = sortProducts(filtered, sortOption);

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [
    products,
    selectedPriceRanges,
    selectedColors,
    selectedSizes,
    searchTerm,
    sortOption,
  ]);

  // Handle filter changes
  const handlePriceFilterChange = (priceId, checked) => {
    if (priceId === "all") {
      setSelectedPriceRanges(checked ? ["all"] : []);
    } else {
      const newRanges = checked
        ? [...selectedPriceRanges.filter((id) => id !== "all"), priceId]
        : selectedPriceRanges.filter((id) => id !== priceId);

      setSelectedPriceRanges(newRanges.length === 0 ? ["all"] : newRanges);
    }
  };

  const handleColorFilterChange = (colorId, checked) => {
    if (colorId === "all") {
      setSelectedColors(checked ? ["all"] : []);
    } else {
      const newColors = checked
        ? [...selectedColors.filter((id) => id !== "all"), colorId]
        : selectedColors.filter((id) => id !== colorId);

      setSelectedColors(newColors.length === 0 ? ["all"] : newColors);
    }
  };

  const handleSizeFilterChange = (sizeId, checked) => {
    if (sizeId === "all") {
      setSelectedSizes(checked ? ["all"] : []);
    } else {
      const newSizes = checked
        ? [...selectedSizes.filter((id) => id !== "all"), sizeId]
        : selectedSizes.filter((id) => id !== sizeId);

      setSelectedSizes(newSizes.length === 0 ? ["all"] : newSizes);
    }
  };

  const FilterSection = ({
    title,
    options,
    namePrefix,
    selectedItems,
    onFilterChange,
  }) => (
    <div className="border-bottom mb-4 pb-4">
      <h5 className="fw-semibold mb-4">{title}</h5>
      <Form>
        {options.map(({ id, label, count }) => (
          <div
            key={id}
            className="d-flex align-items-center justify-content-between mb-3"
          >
            <Form.Check
              type="checkbox"
              id={`${namePrefix}-${id}`}
              label={label}
              checked={selectedItems.includes(id)}
              onChange={(e) => onFilterChange(id, e.target.checked)}
              className="m-0"
            />
            <Badge bg="light" text="dark" className="border fw-normal">
              {count}
            </Badge>
          </div>
        ))}
      </Form>
    </div>
  );

  console.log("Filtered Products:", filteredProducts);

  useEffect(() => {
    if (headerProducts && headerProducts.length > 0) {
      setProducts(headerProducts);
      setCurrentPage(1);
      setLoading(false);
    } else {
      fetchProducts(); // Nếu không có headerProducts, gọi API
    }
  }, [headerProducts]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:9999/product/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts(res.data.data);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (sortValue) => {
    setSortOption(sortValue);
  };

  return (
    <Row>
      {/* Filter bên trái */}
      <Col lg={3}>
        <FilterSection
          title="Lọc theo giá"
          options={priceOptions}
          namePrefix="price"
          selectedItems={selectedPriceRanges}
          onFilterChange={handlePriceFilterChange}
        />
        <FilterSection
          title="Filter by color"
          options={colorOptions}
          namePrefix="color"
          selectedItems={selectedColors}
          onFilterChange={handleColorFilterChange}
        />
        <FilterSection
          title="Filter by size"
          options={sizeOptions}
          namePrefix="size"
          selectedItems={selectedSizes}
          onFilterChange={handleSizeFilterChange}
        />
      </Col>

      {/* Danh sách sản phẩm bên phải */}
      <Col lg={9}>
        <Row className="pb-3">
          <Col xs={12} className="pb-1">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <Form className="d-flex">
                <InputGroup>
                  <FormControl
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <InputGroup.Text className="bg-transparent ">
                    <FaSearch />
                  </InputGroup.Text>
                </InputGroup>
              </Form>
              <Dropdown className="ms-4">
                <Dropdown.Toggle variant="outline-secondary" id="sortDropdown">
                  Sort by
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={() => handleSortChange("latest")}>
                    Latest
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSortChange("popularity")}>
                    Popularity
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSortChange("rating")}>
                    Best Rating
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSortChange("price-low")}>
                    Price: Low to High
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSortChange("price-high")}>
                    Price: High to Low
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>

          {/* Hiển thị kết quả tìm kiếm */}
          <Col xs={12} className="pb-3">
            <p className="text-muted">
              Showing {currentProducts.length} of {filteredProducts.length}{" "}
              products
            </p>
          </Col>

          {/* Hiển thị sản phẩm đã lọc */}
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <Col
                lg={3}
                md={4}
                sm={6}
                xs={12}
                className="pb-1"
                key={product.id || product._id}
              >
                <Card className="product-item border-0 mb-4">
                  <Card.Header className="product-img position-relative overflow-hidden bg-transparent border p-0">
                    <Card.Img
                      variant="top"
                      src={product.image}
                      className="img-fluid w-100"
                    />
                  </Card.Header>
                  <Card.Body className="border-start border-end text-center p-0 pt-4 pb-3">
                    <h6 className="text-truncate mb-3">{product.name}</h6>
                    <div className="d-flex justify-content-center">
                      <h6>{formatVND(product.price || 0)}</h6>
                      <h6 className="text-muted ms-2">
                        <del>{formatVND(product.price || 0)}</del>
                      </h6>
                    </div>
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-between bg-light border">
                    <Button
                      variant="link"
                      className="text-dark p-0 btn-sm"
                      onClick={() =>
                        navigate(
                          `/product-detail/${product._id}/${product.storeId}`
                        )
                      }
                    >
                      <FaEye style={{ color: "#8A784E" }} />
                      Xem chi tiết
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12} className="text-center py-5">
              <h5>Không tìm thấy sản phẩm nào</h5>
              <p className="text-muted">
                Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </Col>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <Col xs={12} className="pb-1">
              <Pagination className="justify-content-center mb-3">
                <Pagination.Prev
                  onClick={() =>
                    currentPage > 1 && handlePageChange(currentPage - 1)
                  }
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() =>
                    currentPage < totalPages &&
                    handlePageChange(currentPage + 1)
                  }
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </Col>
          )}
        </Row>
      </Col>
    </Row>
  );
}

export default ProductFilter;

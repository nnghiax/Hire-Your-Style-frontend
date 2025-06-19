import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Nav,
  Tab,
} from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import HeaderAdmin from "./HeaderAdmin";

ChartJS.register(BarElement, CategoryScale, LinearScale);

const customStyles = `
  .shadow-sm {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
  }
  .nav-tabs .nav-link {
    color: #000;
  }
  .nav-tabs .nav-link.active {
    color: #fff;
    background-color: #0d6efd;
    border-color: #0d6efd;
  }
`;

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [commissionData, setCommissionData] = useState({});
  const [dailyByStore, setDailyByStore] = useState([]);
  const [monthlyByStore, setMonthlyByStore] = useState([]);
  const [yearlyByStore, setYearlyByStore] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    const parseUser = user ? JSON.parse(user) : null;

    if (!parseUser || parseUser.role !== "admin") {
      navigate("/error");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }

        const [
          commissionRes,
          weeklyCommissionRes,
          dailyByStoreRes,
          monthlyByStoreRes,
          yearlyByStoreRes,
        ] = await Promise.all([
          axios
            .get("http://localhost:9999/revenue/admin/commission", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: { data: {} } })),
          axios
            .get("http://localhost:9999/revenue/admin/weekly-commission", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: { data: {} } })),
          axios.get("http://localhost:9999/revenue/admin/daily-by-store", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:9999/revenue/admin/monthly-by-store", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:9999/revenue/admin/yearly-by-store", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Merge weekly data into commission data
        const mergedCommissionData = { ...commissionRes.data.data };
        Object.keys(weeklyCommissionRes.data.data).forEach((storeId) => {
          if (!mergedCommissionData[storeId]) {
            mergedCommissionData[storeId] = {
              storeName: weeklyCommissionRes.data.data[storeId].storeName,
              monthly: {},
              yearly: {},
              weekly: weeklyCommissionRes.data.data[storeId].weekly,
            };
          } else {
            mergedCommissionData[storeId].weekly =
              weeklyCommissionRes.data.data[storeId].weekly;
          }
        });

        setCommissionData(mergedCommissionData);
        setDailyByStore(dailyByStoreRes.data.data);
        setMonthlyByStore(monthlyByStoreRes.data.data);
        setYearlyByStore(yearlyByStoreRes.data.data);

        // Set default selected store if available
        if (dailyByStoreRes.data.data.length > 0) {
          setSelectedStore(dailyByStoreRes.data.data[0].storeName);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc đăng nhập lại."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Commission chart data
  const weeklyCommissionChartData = {
    labels: Object.values(commissionData).flatMap((store) =>
      Object.keys(store.weekly || {}).map(
        (week) => `${store.storeName} - ${week}`
      )
    ),
    datasets: [
      {
        label: "Hoa hồng hàng tuần",
        data: Object.values(commissionData).flatMap((store) =>
          Object.values(store.weekly || {})
        ),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  const monthlyCommissionChartData = {
    labels: Object.values(commissionData).flatMap((store) =>
      Object.keys(store.monthly).map((month) => `${store.storeName} - ${month}`)
    ),
    datasets: [
      {
        label: "Hoa hồng hàng tháng",
        data: Object.values(commissionData).flatMap((store) =>
          Object.values(store.monthly)
        ),
        backgroundColor: "rgba(54,162,235,0.6)",
      },
    ],
  };

  const yearlyCommissionChartData = {
    labels: Object.values(commissionData).flatMap((store) =>
      Object.keys(store.yearly).map((year) => `${store.storeName} - ${year}`)
    ),
    datasets: [
      {
        label: "Hoa hồng hàng năm",
        data: Object.values(commissionData).flatMap((store) =>
          Object.values(store.yearly)
        ),
        backgroundColor: "rgba(255,99,132,0.6)",
      },
    ],
  };

  const filteredDailyByStore = dailyByStore
    .filter((store) => !selectedStore || store.storeName === selectedStore)
    .map((store) => {
      const dailyData = store.daily.filter((d) => {
        const date = new Date(d.date);
        const start = selectedStartDate ? new Date(selectedStartDate) : null;
        const end = selectedEndDate ? new Date(selectedEndDate) : null;
        return (
          (!start || date >= start) && (!end || date <= end || !selectedEndDate)
        );
      });
      return { ...store, daily: dailyData };
    });

  const dailyRevenueChartData = {
    labels: filteredDailyByStore.flatMap((store) =>
      store.daily.map((d) => `${store.storeName} - ${d.date}`)
    ),
    datasets: [
      {
        label: "Doanh thu hàng ngày",
        data: filteredDailyByStore.flatMap((store) =>
          store.daily.map((d) => d.totalRevenue)
        ),
        backgroundColor: "rgba(153,102,255,0.6)",
      },
    ],
  };

  const monthlyRevenueChartData = {
    labels: monthlyByStore.flatMap((store) =>
      store.monthly.map((m) => `${store.storeName} - ${m.yearMonth}`)
    ),
    datasets: [
      {
        label: "Doanh thu hàng tháng",
        data: monthlyByStore.flatMap((store) =>
          store.monthly.map((m) => m.totalRevenue)
        ),
        backgroundColor: "rgba(54,162,235,0.6)",
      },
    ],
  };

  const yearlyRevenueChartData = {
    labels: yearlyByStore.flatMap((store) =>
      store.yearly.map((y) => `${store.storeName} - ${y.year}`)
    ),
    datasets: [
      {
        label: "Doanh thu hàng năm",
        data: yearlyByStore.flatMap((store) =>
          store.yearly.map((y) => y.totalRevenue)
        ),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div
        style={{
          marginLeft: "250px",
          flexGrow: 1,
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <HeaderAdmin />
        <Container fluid className="px-4 py-4">
          <style>{customStyles}</style>
          <Row className="mb-4">
            <Col>
              <h5 className="fw-bold">📊 Bảng điều khiển quản trị</h5>
            </Col>
          </Row>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <Row>
              <Col className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <div>Đang tải dữ liệu...</div>
              </Col>
            </Row>
          ) : (
            <Tab.Container
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Row>
                <Col>
                  <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                      <Nav.Link eventKey="revenue">
                        Doanh thu của cửa hàng
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="commission">
                        Hoa hồng của admin
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
              </Row>
              <Tab.Content>
                <Tab.Pane eventKey="revenue">
                  <Row className="mb-3">
                    <Col md={4}>
                      <input
                        type="date"
                        className="form-control"
                        value={selectedStartDate}
                        onChange={(e) => setSelectedStartDate(e.target.value)}
                      />
                    </Col>
                    <Col md={4}>
                      <input
                        type="date"
                        className="form-control"
                        value={selectedEndDate}
                        onChange={(e) => setSelectedEndDate(e.target.value)}
                      />
                    </Col>
                    <Col md={4}>
                      <select
                        className="form-select"
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                      >
                        <option value="">Chọn cửa hàng</option>
                        {dailyByStore.map((store) => (
                          <option key={store.storeName} value={store.storeName}>
                            {store.storeName}
                          </option>
                        ))}
                      </select>
                    </Col>
                  </Row>
                  {(selectedStartDate || selectedEndDate || selectedStore) && (
                    <>
                      <Row className="mb-4">
                        <Col>
                          <Card className="shadow-sm border-0">
                            <Card.Body>
                              <Card.Title>
                                💵 Doanh thu hàng ngày theo cửa hàng
                              </Card.Title>
                              <Bar data={dailyRevenueChartData} />
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      <Row className="mb-4">
                        <Col>
                          <Card className="shadow-sm border-0">
                            <Card.Body>
                              <Card.Title>
                                💵 Doanh thu hàng tháng theo cửa hàng
                              </Card.Title>
                              <Bar data={monthlyRevenueChartData} />
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Card className="shadow-sm border-0">
                            <Card.Body>
                              <Card.Title>
                                💵 Doanh thu hàng năm theo cửa hàng
                              </Card.Title>
                              <Bar data={yearlyRevenueChartData} />
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </>
                  )}
                </Tab.Pane>
                <Tab.Pane eventKey="commission">
                  <Row className="mb-4">
                    <Col>
                      <Card className="shadow-sm border-0">
                        <Card.Body>
                          <Card.Title>
                            💰 Hoa hồng hàng tuần theo cửa hàng
                          </Card.Title>
                          <Bar data={weeklyCommissionChartData} />
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  <Row className="mb-4">
                    <Col>
                      <Card className="shadow-sm border-0">
                        <Card.Body>
                          <Card.Title>
                            💰 Hoa hồng hàng tháng theo cửa hàng
                          </Card.Title>
                          <Bar data={monthlyCommissionChartData} />
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Card className="shadow-sm border-0">
                        <Card.Body>
                          <Card.Title>
                            💰 Hoa hồng hàng năm theo cửa hàng
                          </Card.Title>
                          <Bar data={yearlyCommissionChartData} />
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          )}
        </Container>
      </div>
    </div>
  );
}

export default AdminDashboard;

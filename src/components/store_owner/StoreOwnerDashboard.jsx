import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Form, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
import StoreOwnerSidebar from './StoreOwnerSidebar';
import HeaderStoreOwner from './HeaderStoreOwner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(BarElement, CategoryScale, LinearScale);

const StoreOwnerRevenueDashboard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueDetails, setRevenueDetails] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [quarterlyRevenue, setQuarterlyRevenue] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDailyChart, setShowDailyChart] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (startDate) params.startDate = startDate.toISOString().split('T')[0];
      if (endDate) params.endDate = endDate.toISOString().split('T')[0];

      console.log('Fetching data with params:', params);

      const [totalRes, detailsRes, dailyRes, monthlyRes, quarterlyRes] = await Promise.all([
        axios.get('http://localhost:9999/revenue/total', { headers: { Authorization: `Bearer ${token}` }, params }),
        axios.get('http://localhost:9999/revenue/details', { headers: { Authorization: `Bearer ${token}` }, params }),
        axios.get('http://localhost:9999/revenue/daily', { headers: { Authorization: `Bearer ${token}` }, params }),
        axios.get('http://localhost:9999/revenue/monthly', { headers: { Authorization: `Bearer ${token}` }, params }),
        axios.get('http://localhost:9999/revenue/quarterly', { headers: { Authorization: `Bearer ${token}` }, params }),
      ]);

      console.log('Details Response:', detailsRes.data);

      setTotalRevenue(totalRes.data.data.totalRevenue || 0);
      setRevenueDetails(detailsRes.data.data || []);
      setDailyRevenue(dailyRes.data.data || []);
      setMonthlyRevenue(monthlyRes.data.data || []);
      setQuarterlyRevenue(quarterlyRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    const parseUser = JSON.parse(user);
    if (parseUser?.role !== 'store_owner') {
      navigate('/error');
      return;
    }
    fetchData();
  }, [navigate, startDate, endDate]);

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc');
      return;
    }
    if (startDate > endDate) {
      alert('Ngày bắt đầu phải trước ngày kết thúc');
      return;
    }
    setShowDailyChart(true);
    setLoading(true);
    await fetchData(); // Gọi lại fetchData khi nhấn Lọc
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setShowDailyChart(false);
    setLoading(true);
    fetchData(); // Tải lại dữ liệu khi xóa bộ lọc
  };

  const dailyChartData = {
    labels: dailyRevenue.map(item => item.date),
    datasets: [{
      label: 'Doanh thu hàng ngày',
      data: dailyRevenue.map(item => item.totalRevenue),
      backgroundColor: 'rgba(75,192,192,0.6)',
    }],
  };

  const monthlyChartData = {
    labels: monthlyRevenue.map(item => item.yearMonth),
    datasets: [{
      label: 'Doanh thu hàng tháng',
      data: monthlyRevenue.map(item => item.totalRevenue),
      backgroundColor: 'rgba(54,162,235,0.6)',
    }],
  };

  const quarterlyChartData = {
    labels: quarterlyRevenue.map(item => item.quarter),
    datasets: [{
      label: 'Doanh thu theo quý',
      data: quarterlyRevenue.map(item => item.totalRevenue),
      backgroundColor: 'rgba(153,102,255,0.6)',
    }],
  };

  return (
    <div className="d-flex">
      <StoreOwnerSidebar />
      <div style={{ marginLeft: '250px', flexGrow: 1, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <HeaderStoreOwner />
        <Container fluid className="p-4">
          <Row className="mb-3">
            <Col>
              <h5 className="fw-bold">📊 Bảng điều khiển doanh thu</h5>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Title>💰 Tổng doanh thu</Card.Title>
                  <Card.Text className="fs-4 fw-semibold">
                    {totalRevenue.toLocaleString()} VNĐ
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={8}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Title>Lọc theo ngày</Card.Title>
                  <Form className="d-flex gap-3 align-items-end">
                    <Form.Group>
                      <Form.Label>Ngày bắt đầu</Form.Label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="dd/MM/yyyy"
                        className="form-control"
                        placeholderText="Chọn ngày bắt đầu"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Ngày kết thúc</Form.Label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        dateFormat="dd/MM/yyyy"
                        className="form-control"
                        placeholderText="Chọn ngày kết thúc"
                      />
                    </Form.Group>
                    <Button variant="primary" onClick={handleFilter}>
                      Lọc
                    </Button>
                    <Button variant="secondary" onClick={handleClearFilter}>
                      Xóa bộ lọc
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {showDailyChart && (
            <Row className="mb-4">
              <Col>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Card.Title>Biểu đồ doanh thu hàng ngày</Card.Title>
                    <Bar data={dailyChartData} options={{ scales: { y: { beginAtZero: true } } }} />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Title>Biểu đồ doanh thu hàng tháng</Card.Title>
                  <Bar data={monthlyChartData} options={{ scales: { y: { beginAtZero: true } } }} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Title>Biểu đồ doanh thu theo quý</Card.Title>
                  <Bar data={quarterlyChartData} options={{ scales: { y: { beginAtZero: true } } }} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Card.Title>Chi tiết doanh thu</Card.Title>
                  <Table hover responsive className="align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Người thuê</th>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                        <th>Tổng cộng</th>
                        <th>Ngày thuê</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <Spinner animation="border" variant="primary" />
                            <div>Đang tải dữ liệu...</div>
                          </td>
                        </tr>
                      ) : revenueDetails.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-4">
                            Không có dữ liệu doanh thu trong khoảng thời gian này.
                          </td>
                        </tr>
                      ) : (
                        revenueDetails.map((detail, index) => (
                          <tr key={detail.rentalId}>
                            <td>{index + 1}</td>
                            <td>{detail.user?.name || 'N/A'}</td>
                            <td>{detail.items?.map(item => item.productName).join(', ') || 'N/A'}</td>
                            <td>{detail.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</td>
                            <td>{(detail.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0).toLocaleString()} VNĐ</td>
                            <td>{(detail.totalAmount || 0).toLocaleString()} VNĐ</td>
                            <td>{detail.rentalDate ? new Date(detail.rentalDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default StoreOwnerRevenueDashboard;
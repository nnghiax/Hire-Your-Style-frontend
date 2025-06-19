import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaChartBar, FaBoxOpen, FaFileInvoice, FaUser, FaSignOutAlt } from 'react-icons/fa';

const linkStyle = {
  color: '#ccc',
  padding: '10px 15px',
  marginBottom: '5px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
};

const activeLinkStyle = {
  backgroundColor: '#00d4ff',
  color: '#000',
};

const hoverStyle = {
  backgroundColor: '#2c2c3e',
  color: '#fff',
};

const logoutStyle = {
  ...linkStyle,
  backgroundColor: '#ff4d4d', // Màu đỏ
  color: '#fff',
};

const logoutHoverStyle = {
  ...logoutStyle,
  backgroundColor: '#cc0000', // Màu đỏ đậm hơn khi hover
};

const StoreOwnerSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    console.log('Token removed:', localStorage.getItem('token'));
    navigate('/');
    // Fallback để đảm bảo chuyển hướng
    window.location.href = '/';
  };

  const StyledNavLink = ({ to, icon: Icon, children, onClick, isLogout }) => (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...(isLogout ? logoutStyle : linkStyle),
        ...(isActive && !isLogout ? activeLinkStyle : {}),
      })}
      onMouseEnter={(e) => {
        if (!e.target.classList.contains('active')) {
          Object.assign(e.target.style, isLogout ? logoutHoverStyle : hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (!e.target.classList.contains('active')) {
          Object.assign(e.target.style, isLogout ? logoutStyle : linkStyle);
        }
      }}
      onClick={onClick}
    >
      <Icon style={{ marginRight: '10px', fontSize: '18px' }} />
      {children}
    </NavLink>
  );

  return (
    <div
      style={{
        width: '250px',
        minHeight: '100vh',
        backgroundColor: '#1e1e2f',
        color: '#fff',
        padding: '20px 15px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
      }}
    >
      <h4 style={{ textAlign: 'center', color: '#00d4ff', marginBottom: '30px', fontWeight: 'bold' }}>
        🏪 Store Owner Panel
      </h4>
      <div className="nav flex-column" style={{ flex: 1 }}>
        <StyledNavLink to="/store-owner/dashboard" icon={FaChartBar}>Doanh thu</StyledNavLink>
        <StyledNavLink to="/store-owner/products" icon={FaBoxOpen}>Sản phẩm</StyledNavLink>
        <StyledNavLink to="/store-owner/orders" icon={FaFileInvoice}>Đơn hàng</StyledNavLink>
        <StyledNavLink to="/store-owner/profile" icon={FaUser}>Hồ sơ</StyledNavLink>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <StyledNavLink icon={FaSignOutAlt} onClick={handleLogout} isLogout>Đăng xuất</StyledNavLink>
      </div>
    </div>
  );
};

export default StoreOwnerSidebar;
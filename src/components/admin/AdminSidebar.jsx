import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaBoxOpen,
  FaMoneyBill,
  FaStore,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";

const linkStyle = {
  color: "#ccc",
  padding: "10px 15px",
  marginBottom: "5px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  fontWeight: 500,
  transition: "all 0.3s ease",
};

const activeLinkStyle = {
  backgroundColor: "#00d4ff",
  color: "#000",
};

const hoverStyle = {
  backgroundColor: "#2c2c3e",
  color: "#fff",
};

const logoutStyle = {
  ...linkStyle,
  backgroundColor: "#ff4d4d",
  color: "#fff",
};

const logoutHoverStyle = {
  ...logoutStyle,
  backgroundColor: "#cc0000",
};

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    console.log("Token removed:", localStorage.getItem("token"));
    navigate("/");
    window.location.href = "/";
  };

  const StyledNavLink = ({ to, icon: Icon, children, onClick, isLogout }) => (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...(isLogout ? logoutStyle : linkStyle),
        ...(isActive && !isLogout ? activeLinkStyle : {}),
      })}
      onMouseEnter={(e) => {
        if (!e.target.classList.contains("active")) {
          Object.assign(
            e.target.style,
            isLogout ? logoutHoverStyle : hoverStyle
          );
        }
      }}
      onMouseLeave={(e) => {
        if (!e.target.classList.contains("active")) {
          Object.assign(e.target.style, isLogout ? logoutStyle : linkStyle);
        }
      }}
      onClick={onClick}
    >
      <Icon style={{ marginRight: "10px", fontSize: "18px" }} />
      {children}
    </NavLink>
  );

  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        backgroundColor: "#1e1e2f",
        color: "#fff",
        padding: "20px 15px",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
      }}
    >
      <h4
        style={{
          textAlign: "center",
          color: "#00d4ff",
          marginBottom: "30px",
          fontWeight: "bold",
        }}
      >
        🛠 Admin Panel
      </h4>
      <div className="nav flex-column">
        <StyledNavLink to="/admin/dashboard" icon={FaChartBar}>
          Dashboard
        </StyledNavLink>
        <StyledNavLink to="/admin/products" icon={FaBoxOpen}>
          Quản lý sản phẩm
        </StyledNavLink>
        <StyledNavLink to="/admin/request" icon={FaStore}>
          Quản lý đăng kí cửa hàng
        </StyledNavLink>
        <StyledNavLink to="/admin/users" icon={FaUsers}>
          Quản lý người dùng
        </StyledNavLink>

        <StyledNavLink to="/admin/deposit-dashboard" icon={FaMoneyBill}>
          Quản lý tiền đặt cọc
        </StyledNavLink>
      </div>
      <div style={{ marginTop: "auto" }}>
        <StyledNavLink icon={FaSignOutAlt} onClick={handleLogout} isLogout>
          Đăng xuất
        </StyledNavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;

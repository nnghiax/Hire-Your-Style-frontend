import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Image, Alert, Card } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StoreOwnerSidebar from './StoreOwnerSidebar';
import HeaderStoreOwner from './HeaderStoreOwner';
import "../css/ProfilePage.css"; 

export default function StoreOwnerProfile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState({
    street: "",
    ward: "",
    district: "",
    city: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("https://hireyourstyle-backend.onrender.com/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const userData = {
          ...res.data.data,
          avatar: res.data.data.avatar || "https://res.cloudinary.com/dh4vnrtg5/image/upload/v1747473243/avatar_user_orcdde.jpg",
        };
        setUser(userData);
        setName(userData.name);
        setAddress(userData.address || {
          street: "",
          ward: "",
          district: "",
          city: "",
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        setError("Không thể tải hồ sơ người dùng.");
      }
    };

    if (localStorage.getItem("token")) {
      fetchUser();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      if (name) formData.append("name", name);
      formData.append("address", JSON.stringify(address));
      if (avatar) formData.append("avatar", avatar);

      const res = await axios.put("https://hireyourstyle-backend.onrender.com/user/update", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data.data);
      setName(res.data.data.name);
      setAddress(res.data.data.address || {
        street: "",
        ward: "",
        district: "",
        city: "",
      });
      setAvatar(null);
      setSuccess("Cập nhật hồ sơ thành công!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      setError(error.response?.data?.message || "Không thể cập nhật hồ sơ.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  if (!user) {
    return (
      <div className="d-flex">
        <StoreOwnerSidebar />
        <div style={{ marginLeft: '250px', flexGrow: 1, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <HeaderStoreOwner />
          <div className="text-center mt-5">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <StoreOwnerSidebar />
      <div style={{ marginLeft: '250px', flexGrow: 1, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <HeaderStoreOwner />
        <Container className="main-body p-4">
          <Row className="gutters-sm">
            <Col md={4} className="mb-3">
              <Card className="shadow-sm border">
                <Card.Body>
                  <div className="d-flex flex-column align-items-center text-center">
                    <Image
                      src={avatar ? URL.createObjectURL(avatar) : user.avatar}
                      roundedCircle
                      width={150}
                      height={150}
                      alt="Ảnh đại diện người dùng"
                      className="object-cover"
                    />
                    <div className="mt-3">
                      <h4>{user.name}</h4>
                      <p className="text-muted">{`${address.street}, ${address.ward}, ${address.district}, ${address.city}`}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={8}>
              <Card className="mb-3 shadow-sm border">
                <Card.Body>
                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}
                  <Form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-sm-3">
                        <h6 className="mb-0">Tên</h6>
                      </div>
                      <div className="col-sm-9 text-secondary">
                        <Form.Control
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nhập tên của bạn"
                          className="mb-2"
                        />
                      </div>
                    </div>
                    <hr />
                    <div className="row mb-3">
                      <div className="col-sm-3">
                        <h6 className="mb-0">Email</h6>
                      </div>
                      <div className="col-sm-9 text-secondary">
                        <Form.Control
                          type="email"
                          value={user.email}
                          readOnly
                          disabled
                          className="mb-2"
                        />
                      </div>
                    </div>
                    <hr />
                    <div className="row mb-3">
                      <div className="col-sm-3">
                        <h6 className="mb-0">Địa chỉ</h6>
                      </div>
                      <div className="col-sm-9 text-secondary">
                        <Form.Control
                          type="text"
                          value={address.street}
                          onChange={(e) =>
                            setAddress({ ...address, street: e.target.value })
                          }
                          placeholder="Nhập đường"
                          className="mb-2"
                        />
                        <Form.Control
                          type="text"
                          value={address.ward}
                          onChange={(e) =>
                            setAddress({ ...address, ward: e.target.value })
                          }
                          placeholder="Nhập phường"
                          className="mb-2"
                        />
                        <Form.Control
                          type="text"
                          value={address.district}
                          onChange={(e) =>
                            setAddress({ ...address, district: e.target.value })
                          }
                          placeholder="Nhập quận"
                          className="mb-2"
                        />
                        <Form.Control
                          type="text"
                          value={address.city}
                          onChange={(e) =>
                            setAddress({ ...address, city: e.target.value })
                          }
                          placeholder="Nhập thành phố"
                          className="mb-2"
                        />
                      </div>
                    </div>
                    <hr />
                    <div className="row mb-3">
                      <div className="col-sm-3">
                        <h6 className="mb-0">Hình ảnh cá nhân</h6>
                      </div>
                      <div className="col-sm-9 text-secondary">
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="mb-2"
                        />
                      </div>
                    </div>
                    <div className="text-end">
                      <Button variant="info" type="submit">
                        Cập nhật
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
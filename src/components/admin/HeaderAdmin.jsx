import React from 'react';
import { Navbar, Image } from 'react-bootstrap';

function HeaderAdmin() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { name: 'Admin', avatar: null };

  return (
    <Navbar bg="white" className="px-4 shadow-sm" style={{ height: '60px', marginBottom: '30px' }}>
      <Navbar.Brand className="fw-bold">🛠 Bảng điều khiển quản trị</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end d-flex align-items-center" style={{ gap: '10px' }}>
        <Navbar.Text>Chào, {user.name}</Navbar.Text>
        <Image
          src={user.avatar || '/images/default-avatar.png'}
          roundedCircle
          width={36}
          height={36}
          alt="avatar"
          style={{ objectFit: 'cover' }}
        />
      </Navbar.Collapse>
    </Navbar>
  );
}

export default HeaderAdmin;
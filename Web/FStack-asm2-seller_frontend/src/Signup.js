import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Seller.css'

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [business_name, setBusiness_name] = useState('');

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:8000/sellerSignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, phone, address, business_name }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Show success message
        // You can redirect the user to a login page or another appropriate page here
      } else {
        alert(data.message); // Show error message
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container">
      <div className="onSubmit">
        <h2 className="text">Signup</h2>
        <input className="input" type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
        <input className="input" type="text" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="input" type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="input" type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input className="input" type="text" placeholder="Business name" value={business_name} onChange={(e) => setBusiness_name(e.target.value)} />

        <button onClick={handleSignup}>Signup</button>
      </div>

      <div className="text">
        <Link to='/'>Already have an account? Login now.</Link>
      </div>
    </div>
  );
}
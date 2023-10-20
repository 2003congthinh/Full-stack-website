import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Seller.css'

export default function Login() {
    const navigate = useNavigate();
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        try {
          const response = await fetch('http://localhost:8000/sellerLogin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credential, password }),
          });
          const data = await response.json();
          if (response.ok) {
            const { email, message } = data; // Destructure the email and message from the response
            localStorage.setItem('email', email); // Store the email in localStorage
            alert(message); // Show success message
            navigate('/Seller');
            // localStorage.setItem('email', credential); // Store the email in localStorage
            // alert(data.message); // Show success message
            // navigate('/Seller');
          } else {
            alert(data.message); // Show error message
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

    return (
      <div className="container">
        <h2 className="text">Login</h2>
        <form className="onSubmit" onSubmit={handleLogin}>
            <input className="input" type="text" placeholder="Email or Phone" value={credential} onChange={(e) => setCredential(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>

        <div className="text">
          <Link to='/Signup'>Don't have an account? Signup now.</Link>
        </div>
      </div>
    );
}
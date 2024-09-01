import React, { useState, useContext } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../contexts/AuthContext';

function Register() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/messageboard" />;
    }

    const handleChange = (e)  => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post('/api/register', formData);
          console.log('User registered:', response.data);
          navigate('/login'); // Redirect to login page after successful registration
        } catch (error) {
          console.error('Error registering user:', error.response?.data?.message || error.message);
          setError(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="text-center py-10">
            <h1 className="text-3xl font-bold text-white">Create an Account</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form className="flex flex-col items-center" onSubmit={handleSubmit}>
                <input
                    className="w-64 p-2 rounded m-2"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    placeholder="First Name"
                    onChange={handleChange}
                    required
                />
                <input
                    className="w-64 p-2 rounded m-2"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    placeholder="Last Name"
                    onChange={handleChange}
                    required
                />
                <input
                    className="w-64 p-2 rounded m-2"
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />
                <input
                    className="w-64 p-2 rounded m-2"
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />
                <button className="bg-fuchsia-900 text-white py-2 px-4 rounded m-2">
                    REGISTER
                </button>
                <Link to="/login">
                    <button className="bg-fuchsia-900 text-white py-2 px-4 rounded m-2">
                        Back to Login
                    </button>
                </Link>
            </form>
        </div>
    );
}

export default Register;
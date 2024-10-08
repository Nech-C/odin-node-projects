import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';



function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, login } = useAuth();

    if (user) {
        return <Navigate to="/messageboard" />;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const success = await login(formData.email, formData.password);
            if (success) {
                console.log('Login successful');
                navigate('/messageboard'); // Redirect to message board after successful login
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred during login. Please try again.');
        }
    };

    return (
        <div className="text-center py-10">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form className="flex flex-col items-center" onSubmit={handleSubmit}>
                <input
                    className="w-64 p-2 rounded m-2"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                />
                <input
                    className="w-64 p-2 rounded m-2"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                />
                <button 
                    type="submit"
                    className="bg-fuchsia-900 text-white py-2 px-4 rounded m-2 hover:bg-fuchsia-800 transition-colors"
                >
                    LOG IN
                </button>
                <Link to="/">
                    <button className="bg-fuchsia-900 text-white py-2 px-4 rounded m-2 hover:bg-fuchsia-800 transition-colors">
                        Back
                    </button>
                </Link>
            </form>
        </div>
    );
}

export default Login;
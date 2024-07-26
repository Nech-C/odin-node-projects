import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState('');

    const handleChange = (e)  => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        console.log(formData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, password } = formData;
        console.log('Registering user:', { username, email, password });
        try {
          const response = await axios.post('/api/register', { username, email, password});
          console.log('User registered:', response.data);
        } catch (error) {
          console.error('Error registering user:', error);
          setError('Registration failed');
        }
      };

    return (
        <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-white">Create an Account</h1>
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
        <input
            className="w-64 p-2 rounded m-2"
            type="text"
            name="username"
            value={formData.username}
            placeholder="Username"
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
                Back
            </button>
        </Link>
        </form>
        </div>
    );
}

export default Register;

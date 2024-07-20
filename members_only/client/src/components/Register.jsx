import React from "react";
import { Link } from "react-router-dom";

function Register() {
    return (
        <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-white">Create an Account</h1>
        <form className="flex flex-col items-center">
            <input
            className="w-64 p-2 rounded m-2"
            type="text"
            placeholder="Username"
            />
            <input
            className="w-64 p-2 rounded m-2"
            type="password"
            placeholder="Password"
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

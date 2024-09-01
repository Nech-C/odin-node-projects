import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user, logout } = useAuth();

  if (user) {
    return <Navigate to="/messageboard" />;
  }

  return (
    <div className="text-center py-10">
      <h1 className="text-3xl font-bold text-white">Exclusive Club</h1>
      <Link to="/login">
        <button className="bg-fuchsia-900 text-white py-2 px-4 rounded m-2">LOG IN</button>
      </Link>
      <Link to="/register">
        <button className="bg-fuchsia-900 text-white py-2 px-4 rounded m-2">REGISTER</button>
      </Link>
    </div>
  );
}

export default Home;
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';

import App from "./App";
import Login from "./components/Login";
import Register from "./components/Register";
import MessageBoard from "./components/MessageBoard";
import Question from "./components/Question";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/messageboard",
    element: <MessageBoard />
  },
  {
    path:"/question",
    element:<Question/>
  }
]);

const Router = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default Router;
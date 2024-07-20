import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Login from "./components/Login";
import Register from "./components/Register";
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
        }
    ]
);

const Router = () => {
    return (
        <RouterProvider router={router} />
    );
}

export default Router;
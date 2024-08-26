import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Login from "./components/Login";
import Register from "./components/Register";
import MessageBoard from "./components/MessageBoard";
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
        }
    ]
);

const Router = () => {
    return (
        <RouterProvider router={router} />
    );
}

export default Router;
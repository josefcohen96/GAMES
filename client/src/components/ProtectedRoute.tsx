import { Navigate } from "react-router-dom";
import  JSX  from "react";

interface ProtectedRouteProps {
    children: JSX.ReactNode;
}


export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

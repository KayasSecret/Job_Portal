import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole = "recruiter" }) => {
    const { user } = useSelector((store) => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
        } else if (requiredRole && user.role !== requiredRole) {
            navigate("/", { replace: true });
        }
    }, [user, requiredRole, navigate]);

    if (!user) {
        return null;
    }

    if (requiredRole && user.role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

/**
 * allowGuest: when true, unauthenticated visitors may view the route (public preview).
 * Authenticated users whose role does not match requiredRole are still redirected away.
 */
const ProtectedRoute = ({ children, requiredRole = "recruiter", allowGuest = false }) => {
    const { user } = useSelector((store) => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            if (!allowGuest) navigate("/login", { replace: true });
        } else if (requiredRole && user.role !== requiredRole) {
            navigate(user.role === "recruiter" ? "/admin/companies" : "/", { replace: true });
        }
    }, [user, requiredRole, allowGuest, navigate]);

    if (!user) {
        return allowGuest ? <>{children}</> : null;
    }

    if (requiredRole && user.role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

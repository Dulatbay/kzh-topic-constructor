import { Navigate, Outlet } from 'react-router-dom';
import {useSelector} from 'react-redux';
import {RootState} from "./redux/store.ts";

export default function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
    const { token, role } = useSelector((state: RootState) => state.auth);


    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

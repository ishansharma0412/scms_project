import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        const storedName = localStorage.getItem('userName');
        const storedRollNo = localStorage.getItem('userRollNo');
        
        if (storedRole) {
            setUser({
                role: storedRole,
                name: storedName,
                roll_no: storedRollNo
            });
        }
        setLoading(false);
    }, []);

    const login = (role, name, roll_no) => {
        localStorage.setItem('userRole', role);
        if (name) localStorage.setItem('userName', name);
        if (roll_no) localStorage.setItem('userRollNo', roll_no);
        
        setUser({ role, name, roll_no });
        if (role === 'admin') navigate('/admin');
        else navigate('/user');
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user');

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'admin') navigate('/admin');
    else navigate('/user');
  };

  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary mb-6">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="email" placeholder="Email Address" className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="password" placeholder="Password" className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" />
          </div>
          <div className="flex justify-around bg-gray-100 p-1 rounded-lg">
            <button type="button" onClick={() => setRole('user')} className={`flex-1 py-1 rounded-md text-sm ${role === 'user' ? 'bg-white shadow' : ''}`}>User</button>
            <button type="button" onClick={() => setRole('admin')} className={`flex-1 py-1 rounded-md text-sm ${role === 'admin' ? 'bg-white shadow' : ''}`}>Admin</button>
          </div>
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition duration-300">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
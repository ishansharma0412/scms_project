import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Send Credentials to Backend
     // ✅ CORRECT (This points to your running backend)
const res = await axios.post('https://scms-project-sgg8.onrender.com/login', { 
  email: email, 
  password: password 
});

      // 2. Check Role and Save to Local Storage
      if (res.data.success) {
        localStorage.setItem("userRole", res.data.role); // Save the "Key"
        
        if (res.data.role === "admin") {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      }
    } catch (err) {
      // 3. Handle Wrong Password
      setError("Invalid Email or Password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-teal-600">
        <div className="text-center mb-8">
         <h1 className="text-xl font-bold tracking-wide">Fix<span className="text-teal-400">Flow</span></h1>
          <p className="text-gray-500 text-sm mt-2">Please login to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="email" 
                required
                className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="admin@abes.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="password" 
                required
                className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-3 rounded hover:bg-teal-700 transition flex justify-center gap-2"
          >
            {loading ? "Verifying..." : <><ShieldCheck size={20} /> Secure Login</>}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Demo Credentials:</p>
          <p>User: student@abes.edu / student123</p>
          <p>Admin: admin@abes.edu / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
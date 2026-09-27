import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User, ShieldCheck, AlertCircle, UserPlus, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  
  const [mode, setMode] = useState('student_login'); // student_login | student_signup | admin_login
  const [formData, setFormData] = useState({ roll_no: '', name: '', password: '', admin_id: '', admin_password: '' });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    try {
      if (mode === 'student_signup') {
        const res = await axios.post('http://127.0.0.1:8000/signup/student', {
            roll_no: formData.roll_no,
            name: formData.name,
            password: formData.password
        });
        if (res.data.success) {
            setMsg("Registration successful! Please login.");
            setMode('student_login');
            setFormData({...formData, password: ''});
        }
      } 
      else if (mode === 'student_login') {
        const res = await axios.post('http://127.0.0.1:8000/login', { 
          email: formData.roll_no, 
          password: formData.password 
        });
        if (res.data.success) {
          login(res.data.role, res.data.name, res.data.roll_no);
        }
      } 
      else if (mode === 'admin_login') {
        const res = await axios.post('http://127.0.0.1:8000/login', { 
            email: formData.admin_id, 
            password: formData.admin_password 
        });
        if (res.data.success) {
          login(res.data.role, res.data.name, null);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-teal-600">
        <div className="text-center mb-6">
         <h1 className="text-2xl font-bold tracking-wide text-gray-800">Fix<span className="text-teal-500">Flow</span></h1>
          <p className="text-gray-500 text-sm mt-1">Campus Complaint Management</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6 text-sm font-semibold text-gray-500">
            <button className={`flex-1 pb-2 ${mode.startsWith('student') ? 'text-teal-600 border-b-2 border-teal-600' : 'hover:text-gray-700'}`} 
                onClick={() => setMode('student_login')}>Student</button>
            <button className={`flex-1 pb-2 ${mode === 'admin_login' ? 'text-teal-600 border-b-2 border-teal-600' : 'hover:text-gray-700'}`} 
                onClick={() => setMode('admin_login')}>Admin</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
        {msg && <div className="bg-green-50 text-green-600 p-3 rounded text-sm mb-4 flex items-center gap-2"><ShieldCheck size={16} /> {msg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* STUDENT SIGNUP */}
            {mode === 'student_signup' && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="text" required className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="Ishan Sharma" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Roll No (Login ID)</label>
                        <div className="relative">
                            <UserPlus className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="text" required className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="2022CS101" value={formData.roll_no} onChange={(e) => setFormData({...formData, roll_no: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="password" required className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>
                </>
            )}

            {/* STUDENT LOGIN */}
            {mode === 'student_login' && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Roll No</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="text" required className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="2022CS101" value={formData.roll_no} onChange={(e) => setFormData({...formData, roll_no: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="password" required className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>
                </>
            )}

            {/* ADMIN LOGIN */}
            {mode === 'admin_login' && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Admin ID</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="text" required className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="admin" value={formData.admin_id} onChange={(e) => setFormData({...formData, admin_id: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="password" required className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="••••••" value={formData.admin_password} onChange={(e) => setFormData({...formData, admin_password: e.target.value})} />
                        </div>
                    </div>
                </>
            )}

          <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white font-bold py-3 rounded hover:bg-teal-700 transition flex justify-center gap-2 mt-4">
            {loading ? "Processing..." : <><ShieldCheck size={20} /> {mode === 'student_signup' ? 'Create Account' : 'Secure Login'}</>}
          </button>
        </form>

        {mode.startsWith('student') && (
            <div className="mt-4 text-center text-sm">
                {mode === 'student_login' ? (
                    <p className="text-gray-600">Don't have an account? <button onClick={() => setMode('student_signup')} className="text-teal-600 font-bold hover:underline">Register</button></p>
                ) : (
                    <p className="text-gray-600">Already registered? <button onClick={() => setMode('student_login')} className="text-teal-600 font-bold hover:underline">Login here</button></p>
                )}
            </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-400 border-t pt-4">
          <p>Admin Demo: admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
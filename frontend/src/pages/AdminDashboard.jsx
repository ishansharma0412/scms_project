import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Save, AlertTriangle, CheckCircle, Clock, Search, AlertOctagon, Filter, LogOut, User, FileText, Star, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [updates, setUpdates] = useState({});
  const [stats, setStats] = useState({ total: 0, active: 0, critical: 0, history: 0 });
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('Active'); 

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/complaints');
      const data = res.data;
      setComplaints(data);
      calculateStats(data);
    } catch (e) { console.error("Backend offline"); }
  };

  // Helper to determine if a complaint is active or history
  const isActiveComplaint = (c) => ['Pending', 'Reopened', 'ESCALATED'].includes(c.status);
  const isHistoryComplaint = (c) => ['Resolved', 'Closed'].includes(c.status);

  const calculateStats = (data) => {
    setStats({
        total: data.length,
        active: data.filter(isActiveComplaint).length,
        critical: data.filter(c => c.priority === 'High' && isActiveComplaint(c)).length,
        history: data.filter(isHistoryComplaint).length
    });

    const categories = {};
    data.forEach(c => categories[c.category] = (categories[c.category] || 0) + 1);
    setChartData(Object.keys(categories).map(k => ({ name: k, count: categories[k] })));
  };

  const handleUpdateChange = (id, field, value) => {
    setUpdates({ ...updates, [id]: { ...updates[id], [field]: value } });
  };

  const saveUpdate = async (id) => {
    const current = complaints.find(c => c.id === id);
    const updateData = updates[id] || {};
    try {
      await axios.put(`http://127.0.0.1:8000/complaints/${id}`, {
        status: updateData.status || current.status,
        estimated_days: parseInt(updateData.estimated_days || current.estimated_days)
      });
      alert("Status Updated Successfully");
      // Clear updates for this ID so dropdown reflects new server state safely
      setUpdates(prev => { const next = {...prev}; delete next[id]; return next; });
      fetchComplaints();
    } catch (err) { alert("Update failed"); }
  };

  const getFilteredComplaints = () => {
    switch (activeTab) {
        case 'Active': return complaints.filter(isActiveComplaint);
        case 'Critical': return complaints.filter(c => c.priority === 'High' && isActiveComplaint(c));
        case 'History': return complaints.filter(isHistoryComplaint);
        default: return complaints;
    }
  };

  const filteredData = getFilteredComplaints();

  // Badge Color Helpers
  const getPriorityColor = (priority) => {
      if (priority === 'High') return 'bg-red-500';
      if (priority === 'Medium') return 'bg-yellow-500';
      return 'bg-green-500';
  };

  return (
    <div className="space-y-8 mt-6 pb-10">
      <div className="flex justify-between items-end bg-slate-900 p-6 rounded-lg text-white shadow-xl">
        <div>
            <h1 className="text-3xl font-bold text-teal-400 flex items-center gap-2"><CheckCircle /> Admin Operations Center</h1>
            <p className="text-gray-300 mt-1">Manage campus grievances and track resolution metrics.</p>
        </div>
        <div className="flex gap-4">
            <button onClick={() => window.open('http://127.0.0.1:8000/report/download', '_blank')} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded text-sm font-bold transition shadow-lg">
                <FileText size={16} /> Export PDF Report
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active & Pending" value={stats.active} icon={<AlertTriangle size={24} />} color="bg-orange-500" isActive={activeTab === 'Active'} onClick={() => setActiveTab('Active')} />
        <StatCard title="Critical Issues" value={stats.critical} icon={<AlertOctagon size={24} />} color="bg-red-600" isActive={activeTab === 'Critical'} onClick={() => setActiveTab('Critical')} />
        <StatCard title="Resolved & Closed" value={stats.history} icon={<Archive size={24} />} color="bg-gray-600" isActive={activeTab === 'History'} onClick={() => setActiveTab('History')} />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded shadow border border-gray-200 flex flex-col">
            <h3 className="font-bold text-gray-700 mb-6 border-b pb-2">Category Distribution</h3>
            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius:'4px'}} />
                        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#0f172a', '#14b8a6', '#ef4444', '#f59e0b'][index % 4]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="md:col-span-2 bg-white rounded shadow border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Filter size={18} /> {activeTab} Records
                </h3>
                <span className="text-xs bg-slate-200 text-slate-800 px-3 py-1 rounded font-bold shadow-sm">
                    {filteredData.length} items
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px]">
                        <tr>
                            <th className="p-4 w-20">Evidence</th>
                            <th className="p-4">Student & Details</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 w-48">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredData.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-400">No records found for this category.</td></tr>
                        ) : filteredData.map((c) => (
                            <tr key={c.id} className={c.status === 'Closed' ? 'bg-gray-50 opacity-80' : c.status === 'Reopened' ? 'bg-red-50' : 'bg-white hover:bg-slate-50 transition'}>
                                
                                <td className="p-4 align-top">
                                    {c.image ? (
                                        <a href={`http://127.0.0.1:8000${c.image}`} target="_blank" rel="noreferrer" className="block w-14 h-14 rounded overflow-hidden border shadow-sm hover:opacity-80">
                                            <img src={`http://127.0.0.1:8000${c.image}`} className="w-full h-full object-cover" />
                                        </a>
                                    ) : <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-[10px] border">No Img</div>}
                                </td>

                                <td className="p-4 align-top">
                                    {c.roll_no && c.student_name && (
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 inline-block px-2 py-0.5 rounded border border-teal-100 mb-2">
                                            <User size={10} /> {c.student_name} ({c.roll_no})
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-gray-900 line-clamp-1 text-base">{c.title}</p>
                                    </div>
                                    <p className="text-gray-500 text-xs line-clamp-2 mb-2">{c.description}</p>
                                    <div className="flex gap-2 items-center">
                                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded text-white ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                                        <span className="text-[9px] uppercase font-bold bg-slate-100 border px-2 py-0.5 rounded text-slate-600">{c.category}</span>
                                        <span className="text-[9px] text-gray-400 font-medium px-1 py-0.5">{c.date}</span>
                                        {c.status === 'Closed' && c.rating > 0 && (
                                            <span className="text-[10px] flex items-center gap-0.5 text-yellow-600 font-bold ml-2">
                                                <Star size={10} fill="currentColor" /> {c.rating}/5
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="p-4 align-top">
                                    <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold border shadow-sm
                                        ${c.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                                          c.status === 'ESCALATED' ? 'bg-red-600 text-white border-red-800 animate-pulse' :
                                          c.status === 'Reopened' ? 'bg-red-100 text-red-800 border-red-200' :
                                          c.status === 'Closed' ? 'bg-gray-200 text-gray-600 border-gray-300' :
                                          'bg-yellow-50 text-yellow-800 border-yellow-200'}`}>
                                        {c.status}
                                    </span>
                                </td>

                                <td className="p-4 align-top">
                                    {c.status === 'Closed' ? (
                                        <div className="flex flex-col items-center justify-center text-gray-400 bg-gray-100 p-2 rounded border border-gray-200 h-full">
                                            <Lock size={16} className="mb-1" />
                                            <span className="text-[10px] font-bold uppercase">Closed by Student</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded border border-slate-200 shadow-sm">
                                            <select className="border-gray-300 border p-1.5 rounded text-xs bg-white outline-none w-full shadow-sm font-semibold text-slate-700" 
                                                value={updates[c.id]?.status || c.status} 
                                                onChange={(e) => handleUpdateChange(c.id, 'status', e.target.value)}>
                                                <option value="Pending">Pending</option>
                                                <option value="ESCALATED">Escalated</option>
                                                <option value="Resolved">Mark Resolved</option>
                                                <option value="Reopened">Reopened</option>
                                            </select>
                                            <input type="number" placeholder="Days to resolve..." className="border-gray-300 border p-1.5 rounded text-xs w-full shadow-sm outline-none"
                                                value={updates[c.id]?.estimated_days ?? c.estimated_days} 
                                                onChange={(e) => handleUpdateChange(c.id, 'estimated_days', e.target.value)} />
                                            <button onClick={() => saveUpdate(c.id)} className="bg-teal-700 hover:bg-teal-800 text-white p-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 w-full transition shadow-sm">
                                                <Save size={12} /> Update State
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

// Reusable StatCard
function StatCard({ title, value, icon, color, isActive, onClick }) {
    return (
        <div onClick={onClick} className={`p-6 rounded-lg border-2 cursor-pointer transition shadow-sm relative overflow-hidden group
            ${isActive ? `border-slate-800 bg-white ring-4 ring-slate-100` : `border-transparent bg-white hover:border-gray-300 hover:shadow-md`}`}>
            
            <div className={`absolute top-0 left-0 w-1.5 h-full ${color}`}></div>
            <div className="flex justify-between items-start ml-2">
                <div>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
                    <h2 className="text-3xl font-black text-slate-800">{value}</h2>
                </div>
                <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.replace('bg-','')}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// Hack to fix lucide icon color mapping easily
const Archive = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;

export default AdminDashboard;
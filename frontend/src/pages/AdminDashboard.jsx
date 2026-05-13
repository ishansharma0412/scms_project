// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
// import { Save, AlertTriangle, CheckCircle, Clock, Search, AlertOctagon, Filter } from 'lucide-react';

// const AdminDashboard = () => {
//   const [complaints, setComplaints] = useState([]);
//   const [updates, setUpdates] = useState({});
//   const [stats, setStats] = useState({ total: 0, pending: 0, critical: 0, resolved: 0 });
//   const [chartData, setChartData] = useState([]);
//   const [activeTab, setActiveTab] = useState('Total'); 

//   useEffect(() => { fetchComplaints(); }, []);

//   const fetchComplaints = async () => {
//     try {
//       const res = await axios.get('http://127.0.0.1:8000/complaints');
//       const data = res.data;
//       setComplaints(data);
//       calculateStats(data);
//     } catch (e) { console.error("Backend offline"); }
//   };

//   const calculateStats = (data) => {
//     setStats({
//         total: data.length,
//         pending: data.filter(c => c.status === 'Pending' || c.status === 'Reopened').length,
//         critical: data.filter(c => c.priority === 'High').length,
//         resolved: data.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
//     });

//     const categories = {};
//     data.forEach(c => categories[c.category] = (categories[c.category] || 0) + 1);
//     setChartData(Object.keys(categories).map(k => ({ name: k, count: categories[k] })));
//   };

//   const handleUpdateChange = (id, field, value) => {
//     setUpdates({ ...updates, [id]: { ...updates[id], [field]: value } });
//   };

//   const saveUpdate = async (id) => {
//     const current = complaints.find(c => c.id === id);
//     const updateData = updates[id] || {};
//     try {
//       await axios.put(`http://127.0.0.1:8000/complaints/${id}`, {
//         status: updateData.status || current.status,
//         estimated_days: parseInt(updateData.estimated_days || current.estimated_days)
//       });
//       alert("Status Updated Successfully");
//       fetchComplaints();
//     } catch (err) { alert("Update failed"); }
//   };

//   const getFilteredComplaints = () => {
//     switch (activeTab) {
//         case 'Pending': return complaints.filter(c => c.status === 'Pending' || c.status === 'Reopened');
//         case 'Critical': return complaints.filter(c => c.priority === 'High');
//         case 'Resolved': return complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed');
//         default: return complaints;
//     }
//   };

//   const filteredData = getFilteredComplaints();

//   return (
//     <div className="space-y-8 mt-6 pb-10">
//       <div className="flex justify-between items-end">
//         <div>
//             <h1 className="text-3xl font-bold text-primary">Admin Operations Center</h1>
//             <p className="text-gray-500 mt-1">Manage grievances, track performance, and view history.</p>
//         </div>
//         <div className="bg-white border rounded flex items-center px-3 py-2 text-sm text-gray-500">
//             <Search size={16} className="mr-2" /> Search records...
//         </div>
//       </div>

//       {/* 1. STATIC TABS (No Animation) */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <StatCard 
//             title="Total Complaints" 
//             value={stats.total} 
//             icon={<Clock size={24} />} 
//             color="bg-blue-600" 
//             isActive={activeTab === 'Total'} 
//             onClick={() => setActiveTab('Total')} 
//         />
//         <StatCard 
//             title="Pending / Reopened" 
//             value={stats.pending} 
//             icon={<AlertTriangle size={24} />} 
//             color="bg-orange-500" 
//             isActive={activeTab === 'Pending'} 
//             onClick={() => setActiveTab('Pending')} 
//         />
//         <StatCard 
//             title="Critical Issues" 
//             value={stats.critical} 
//             icon={<AlertOctagon size={24} />} 
//             color="bg-red-600" 
//             isActive={activeTab === 'Critical'} 
//             onClick={() => setActiveTab('Critical')} 
//         />
//         <StatCard 
//             title="History & Resolved" 
//             value={stats.resolved} 
//             icon={<CheckCircle size={24} />} 
//             color="bg-green-600" 
//             isActive={activeTab === 'Resolved'} 
//             onClick={() => setActiveTab('Resolved')} 
//         />
//       </div>

//       <div className="grid md:grid-cols-3 gap-8">
//         {/* 2. CHART */}
//         <div className="md:col-span-1 bg-white p-6 rounded shadow border border-gray-200 flex flex-col">
//             <h3 className="font-bold text-gray-700 mb-6">Category Distribution</h3>
//             <div className="flex-1 w-full min-h-[200px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={chartData}>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                         <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
//                         <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius:'4px'}} />
//                         <Bar dataKey="count" radius={[2, 2, 0, 0]}>
//                             {chartData.map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={['#0f172a', '#14b8a6', '#ef4444', '#f59e0b'][index % 4]} />
//                             ))}
//                         </Bar>
//                     </BarChart>
//                 </ResponsiveContainer>
//             </div>
//         </div>

//         {/* 3. TABLE */}
//         <div className="md:col-span-2 bg-white rounded shadow border border-gray-200 overflow-hidden">
//             <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
//                 <h3 className="font-bold text-gray-700 flex items-center gap-2">
//                     <Filter size={18} /> {activeTab} Records
//                 </h3>
//                 <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded font-bold">
//                     {filteredData.length} items
//                 </span>
//             </div>
            
//             <div className="overflow-x-auto">
//                 <table className="w-full text-left text-sm">
//                     <thead className="bg-gray-100 text-gray-600 uppercase font-bold text-xs">
//                         <tr>
//                             <th className="p-4">Evidence</th>
//                             <th className="p-4">Details</th>
//                             <th className="p-4">Status</th>
//                             <th className="p-4 w-48">Action</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                         {filteredData.length === 0 ? (
//                             <tr><td colSpan="4" className="p-8 text-center text-gray-400">No records found.</td></tr>
//                         ) : filteredData.map((c) => (
//                             <tr key={c.id} className={`${c.status === 'Closed' ? 'bg-gray-50 opacity-60' : c.status === 'Reopened' ? 'bg-red-50' : 'bg-white'}`}>
//                                 {/* IMAGE */}
//                                 <td className="p-4 align-top">
//                                     {c.image ? (
//                                         <a href={c.image} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded border border-gray-300 hover:opacity-80">
//                                             <img src={c.image} className="w-full h-full object-cover" />
//                                         </a>
//                                     ) : <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs border">No Img</div>}
//                                 </td>

//                                 {/* DETAILS */}
//                                 <td className="p-4 align-top max-w-[200px]">
//                                     <div className="flex items-center gap-2 mb-1">
//                                         <p className="font-bold text-primary line-clamp-1">{c.title}</p>
//                                         {c.status === 'Closed' && <span className="text-[10px] bg-gray-300 px-2 rounded font-bold text-gray-700">ARCHIVED</span>}
//                                     </div>
//                                     <p className="text-gray-500 text-xs line-clamp-2 mb-2">{c.description}</p>
//                                     <div className="flex gap-1">
//                                         <span className={`text-[10px] px-2 py-0.5 rounded text-white ${c.priority==='High'?'bg-red-600':'bg-green-600'}`}>{c.priority}</span>
//                                         <span className="text-[10px] bg-gray-100 border border-gray-300 px-2 py-0.5 rounded text-gray-600">{c.category}</span>
//                                     </div>
//                                 </td>

//                                 {/* STATUS BADGE */}
//                                 <td className="p-4 align-top">
//                                     <span className={`inline-block px-2 py-1 rounded text-xs font-bold border
//                                         ${c.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-200' :
//                                           c.status === 'Reopened' ? 'bg-red-100 text-red-800 border-red-200' :
//                                           c.status === 'Closed' ? 'bg-gray-200 text-gray-600 border-gray-300' :
//                                           'bg-yellow-50 text-yellow-800 border-yellow-200'}`}>
//                                         {c.status}
//                                     </span>
//                                 </td>

//                                 {/* ACTION BUTTONS */}
//                                 <td className="p-4 align-top">
//                                     {c.status === 'Closed' ? (
//                                         <span className="text-xs text-gray-500 flex items-center gap-1 border p-2 rounded bg-white justify-center">
//                                             <CheckCircle size={12} /> Verified by User
//                                         </span>
//                                     ) : (
//                                         <div className="flex flex-col gap-2">
//                                             <select className="border-gray-300 border p-1.5 rounded text-xs bg-white outline-none w-full" 
//                                                 defaultValue={c.status}
//                                                 onChange={(e) => handleUpdateChange(c.id, 'status', e.target.value)}>
//                                                 <option value="Pending">Pending</option>
//                                                 <option value="In Progress">In Progress</option>
//                                                 <option value="Resolved">Resolved</option>
//                                             </select>
                                            
//                                             <div className="flex items-center gap-2">
//                                                 <span className="text-[10px] text-gray-500 font-bold uppercase w-6">Est.</span>
//                                                 <input type="number" className="border-gray-300 border p-1.5 rounded w-full text-xs"
//                                                     defaultValue={c.estimated_days}
//                                                     placeholder="Days"
//                                                     onChange={(e) => handleUpdateChange(c.id, 'estimated_days', e.target.value)} />
//                                             </div>

//                                             {/* NEW VISIBLE BUTTON */}
//                                             <button 
//                                                 onClick={() => saveUpdate(c.id)} 
//                                                 className="bg-primary hover:bg-slate-700 text-white py-1.5 rounded text-xs font-bold w-full flex items-center justify-center gap-2 transition-colors"
//                                             >
//                                                 <Save size={12} /> Update Status
//                                             </button>
//                                         </div>
//                                     )}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // PROFESSIONAL STATIC COMPONENT
// const StatCard = ({ title, value, icon, color, isActive, onClick }) => (
//     <div 
//         onClick={onClick}
//         className={`p-6 rounded shadow-sm border flex items-center gap-4 cursor-pointer select-none
//         ${isActive ? 'bg-slate-800 border-slate-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
//     >
//         <div className={`${isActive ? 'bg-white/20 text-white' : color + ' text-white'} p-3 rounded`}>
//             {icon}
//         </div>
//         <div>
//             <p className={`text-xs uppercase font-bold tracking-wider ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>{title}</p>
//             <p className={`text-3xl font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>{value}</p>
//         </div>
//     </div>
// );

// export default AdminDashboard;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Save, AlertTriangle, CheckCircle, Clock, Search, AlertOctagon, Filter, MoreHorizontal } from 'lucide-react';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [updates, setUpdates] = useState({});
  const [stats, setStats] = useState({ total: 0, pending: 0, critical: 0, resolved: 0 });
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('Total'); 

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('https://scms-project-sgg8.onrender.com/complaints');
      const data = res.data;
      setComplaints(data);
      calculateStats(data);
    } catch (e) { console.error("Backend offline"); }
  };

  const calculateStats = (data) => {
    setStats({
        total: data.length,
        pending: data.filter(c => c.status === 'Pending' || c.status === 'Reopened').length,
        critical: data.filter(c => c.priority === 'High').length,
        resolved: data.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
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
      await axios.put(`https://scms-project-sgg8.onrender.com/complaints/${id}`, {
        status: updateData.status || current.status,
        estimated_days: parseInt(updateData.estimated_days || current.estimated_days)
      });
      alert("Status Updated");
      fetchComplaints();
    } catch (err) { alert("Update failed"); }
  };

  const filteredData = () => {
    switch (activeTab) {
        case 'Pending': return complaints.filter(c => c.status === 'Pending' || c.status === 'Reopened');
        case 'Critical': return complaints.filter(c => c.priority === 'High');
        case 'Resolved': return complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed');
        default: return complaints;
    }
  };

  return (
    <div className="mt-8 pb-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 pl-1">Admin Control Panel</h1>

      {/* 1. SIMPLE METRIC CARDS (Solid Colors, No gradients) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <DashboardCard title="Total Tickets" value={stats.total} color="bg-slate-700" active={activeTab === 'Total'} onClick={() => setActiveTab('Total')} />
        <DashboardCard title="Pending Work" value={stats.pending} color="bg-orange-500" active={activeTab === 'Pending'} onClick={() => setActiveTab('Pending')} />
        <DashboardCard title="High Priority" value={stats.critical} color="bg-red-600" active={activeTab === 'Critical'} onClick={() => setActiveTab('Critical')} />
        <DashboardCard title="Resolved" value={stats.resolved} color="bg-green-600" active={activeTab === 'Resolved'} onClick={() => setActiveTab('Resolved')} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* CHART */}
        <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">Category Breakdown</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} />
                        <Tooltip cursor={{fill: '#f9fafb'}} />
                        <Bar dataKey="count" fill="#0f172a" /> 
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* TABLE - Looks like a data sheet */}
        <div className="md:col-span-2 bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm uppercase">{activeTab} Issues</h3>
                <span className="bg-white border px-2 py-0.5 rounded text-xs font-mono">{filteredData().length} records</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 border-b">
                        <tr>
                            <th className="p-3 font-bold text-xs uppercase">Img</th>
                            <th className="p-3 font-bold text-xs uppercase">Details</th>
                            <th className="p-3 font-bold text-xs uppercase">Status</th>
                            <th className="p-3 font-bold text-xs uppercase w-40">Controls</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData().map((c) => (
                            <tr key={c.id} className={`hover:bg-gray-50 ${c.status === 'Reopened' ? 'bg-red-50' : ''}`}>
                                <td className="p-3 align-top">
                                    {c.image ? (
                                        <a href={c.image} target="_blank" rel="noreferrer">
                                            <img src={c.image} className="w-12 h-12 object-cover border rounded" />
                                        </a>
                                    ) : <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">N/A</div>}
                                </td>
                                <td className="p-3 align-top">
                                    <div className="font-bold text-gray-800 text-sm">{c.title}</div>
                                    <div className="text-gray-500 text-xs mt-1 line-clamp-1">{c.description}</div>
                                    <div className="flex gap-1 mt-2">
                                        <span className="text-[10px] bg-gray-100 border px-1.5 rounded text-gray-600">{c.category}</span>
                                        <span className={`text-[10px] px-1.5 rounded text-white ${c.priority==='High'?'bg-red-600':'bg-gray-400'}`}>{c.priority}</span>
                                    </div>
                                </td>
                                <td className="p-3 align-top">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border 
                                        ${c.status==='Resolved'?'bg-green-50 border-green-200 text-green-700':
                                          c.status==='Reopened'?'bg-red-50 border-red-200 text-red-700':
                                          c.status==='Closed'?'bg-gray-100 border-gray-200 text-gray-500':
                                          'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="p-3 align-top">
                                    {c.status !== 'Closed' && (
                                        <div className="space-y-2">
                                            <select className="w-full text-xs border border-gray-300 p-1 rounded bg-white" 
                                                defaultValue={c.status} onChange={(e) => handleUpdateChange(c.id, 'status', e.target.value)}>
                                                <option>Pending</option>
                                                <option>In Progress</option>
                                                <option>Resolved</option>
                                            </select>
                                            <div className="flex gap-1">
                                                <input type="number" placeholder="Days" className="w-12 text-xs border p-1 rounded"
                                                    defaultValue={c.estimated_days} onChange={(e) => handleUpdateChange(c.id, 'estimated_days', e.target.value)} />
                                                <button onClick={() => saveUpdate(c.id)} className="flex-1 bg-slate-800 text-white text-xs rounded hover:bg-slate-700">
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {c.status === 'Closed' && <span className="text-xs text-gray-400 italic">Archived</span>}
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

// Simple, blocky card
const DashboardCard = ({ title, value, color, active, onClick }) => (
    <div onClick={onClick} className={`${active ? color + ' text-white ring-2 ring-offset-2 ring-gray-400' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'} p-4 rounded shadow-sm cursor-pointer transition-all`}>
        <p className={`text-xs uppercase font-bold ${active ? 'text-white/80' : 'text-gray-400'}`}>{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
);

export default AdminDashboard;
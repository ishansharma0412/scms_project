// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Send, Image as ImageIcon, Bell, Info, Loader2, CheckCircle, Archive, ThumbsUp, ThumbsDown, AlertOctagon } from 'lucide-react';

// const UserDashboard = () => {
//   const [complaints, setComplaints] = useState([]);
//   const [formData, setFormData] = useState({ title: "", description: "", image: null });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [aiPopup, setAiPopup] = useState(null);

//   useEffect(() => { fetchComplaints(); }, []);

//   const fetchComplaints = async () => {
//     try {
//       const res = await axios.get('http://127.0.0.1:8000/complaints');
//       setComplaints(res.data);
//     } catch (e) { console.error("Backend offline"); }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.title || !formData.description) return;
//     setIsSubmitting(true);

//     const data = new FormData();
//     data.append('title', formData.title);
//     data.append('description', formData.description);
//     if (formData.image) data.append('image', formData.image);

//     try {
//       const res = await axios.post('http://127.0.0.1:8000/complaints', data, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//       setTimeout(() => {
//         setComplaints([res.data, ...complaints]);
//         setFormData({ title: "", description: "", image: null });
//         setAiPopup(res.data);
//         setIsSubmitting(false);
//       }, 800);
//     } catch (error) { alert("Error uploading"); setIsSubmitting(false); }
//   };

//   // 1. Verify (Close Ticket)
//   const handleVerify = async (id) => {
//     try {
//       await axios.put(`http://127.0.0.1:8000/complaints/${id}/verify`);
//       const updatedList = complaints.map(c => c.id === id ? { ...c, status: "Closed" } : c);
//       setComplaints(updatedList);
//     } catch (e) { alert("Connection Error"); }
//   };

//   // 2. Reopen (Reject Resolution) - NEW FUNCTION
//   const handleReopen = async (id) => {
//     try {
//         await axios.put(`http://127.0.0.1:8000/complaints/${id}/reopen`);
//         const updatedList = complaints.map(c => c.id === id ? { ...c, status: "Reopened", priority: "High" } : c);
//         setComplaints(updatedList);
//         alert("Complaint Reopened! Admin has been notified.");
//     } catch (e) { alert("Connection Error"); }
//   };

//   const activeComplaints = complaints.filter(c => c.status !== 'Closed');
//   const closedComplaints = complaints.filter(c => c.status === 'Closed');

//   return (
//     <div className="grid md:grid-cols-2 gap-8 mt-8 relative pb-10">
      
//       {aiPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full animate-bounce-in text-center">
//             <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle className="text-green-600" size={32} /></div>
//             <h3 className="text-2xl font-bold text-gray-800 mb-2">Complaint Logged!</h3>
//             <div className="bg-blue-50 p-4 rounded-lg text-left mb-6 border border-blue-100">
//                 <h4 className="font-bold text-blue-700 flex items-center gap-2 mb-1"><Info size={16} /> AI Suggested Fix:</h4>
//                 <p className="text-gray-700 text-sm">{aiPopup.ai_solution}</p>
//             </div>
//             <button onClick={() => setAiPopup(null)} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-slate-800">Close</button>
//           </div>
//         </div>
//       )}

//       <div className="space-y-8">
//         <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-fit">
//             <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3"><Send className="text-secondary" size={28} /> File New Complaint</h2>
//             <form onSubmit={handleSubmit} className="space-y-5">
//             <input type="text" placeholder="Subject" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-secondary" 
//                 value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
//             <textarea placeholder="Describe the issue..." required className="w-full p-3 border rounded-lg h-32 outline-none focus:ring-2 focus:ring-secondary resize-none" 
//                 value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
//             <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:bg-gray-50 relative">
//                 <input type="file" accept="image/*" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
//                 onChange={(e) => setFormData({...formData, image: e.target.files[0]})} />
//                 <div className="flex flex-col items-center text-gray-400">
//                 <ImageIcon size={40} />
//                 <span className="text-sm mt-2 font-medium">{formData.image ? <span className="text-green-600">{formData.image.name}</span> : "Click to upload photo"}</span>
//                 </div>
//             </div>
//             <button disabled={isSubmitting} className={`w-full py-3 rounded-xl font-bold text-white flex justify-center gap-2 ${isSubmitting ? 'bg-gray-400' : 'bg-secondary hover:bg-teal-600'}`}>
//                 {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Complaint"}
//             </button>
//             </form>
//         </div>

//         {closedComplaints.length > 0 && (
//             <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200 opacity-80 hover:opacity-100 transition">
//                 <h2 className="text-xl font-bold text-gray-500 mb-4 flex items-center gap-2"><Archive size={20} /> Past History</h2>
//                 <div className="space-y-3">
//                     {closedComplaints.map(c => (
//                         <div key={c.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
//                             <span className="text-gray-600 font-medium line-through decoration-gray-400">{c.title}</span>
//                             <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-bold">Closed</span>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         )}
//       </div>

//       <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-fit min-h-[600px]">
//         <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
//             <Bell className="text-orange-500" /> Active Issues <span className="text-sm bg-primary text-white px-2 py-1 rounded-full ml-2">{activeComplaints.length}</span>
//         </h2>
        
//         {activeComplaints.length === 0 ? (
//             <div className="text-center py-20 text-gray-400"><CheckCircle size={48} className="mx-auto mb-4 opacity-20" /><p>No active issues.</p></div>
//         ) : (
//             <div className="space-y-6">
//             {activeComplaints.map((c) => (
//                 <div key={c.id} className={`border-2 p-5 rounded-xl bg-white transition relative group overflow-hidden
//                     ${c.status === 'Resolved' ? 'border-green-400 shadow-green-100 shadow-lg' : 
//                       c.status === 'Reopened' ? 'border-red-400 shadow-red-100 shadow-lg' : 'border-gray-100'}`}>
                
//                 {c.admin_viewed && c.status !== 'Resolved' && c.status !== 'Reopened' && (
//                     <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">ADMIN VIEWED</div>
//                 )}
                
//                 <div className="flex justify-between items-start mb-3">
//                     <div>
//                         <h3 className="font-bold text-lg text-gray-800">{c.title}</h3>
//                         <div className="flex gap-2 mt-1">
//                             <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded text-white ${c.priority === 'High' ? 'bg-red-500' : 'bg-gray-400'}`}>{c.priority}</span>
//                             {/* REOPENED BADGE */}
//                             {c.status === 'Reopened' && (
//                                 <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1"><AlertOctagon size={10} /> Not Fixed</span>
//                             )}
//                         </div>
//                     </div>
//                     <div className="text-right">
//                         <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border
//                             ${c.status==='Resolved'?'bg-green-100 text-green-700 border-green-300 animate-pulse':
//                               c.status==='Reopened'?'bg-red-100 text-red-700 border-red-300':
//                               'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
//                             {c.status}
//                         </span>
//                     </div>
//                 </div>

//                 {c.image && ( <div className="mb-3 h-24 w-full bg-gray-100 rounded-lg overflow-hidden"><img src={c.image} alt="Proof" className="w-full h-full object-cover" /></div> )}

//                 {/* RESOLUTION ACTIONS */}
//                 {c.status === 'Resolved' ? (
//                     <div className="mt-4 bg-green-50 p-4 rounded-xl border border-green-200 text-center">
//                         <p className="text-green-800 font-bold text-sm mb-3">Admin marked this as resolved. Is it fixed?</p>
//                         <div className="flex gap-3">
//                             <button onClick={() => handleVerify(c.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition">
//                                 <ThumbsUp size={16} /> Yes, Verified
//                             </button>
//                             <button onClick={() => handleReopen(c.id)} className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition">
//                                 <ThumbsDown size={16} /> No, Reopen
//                             </button>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-3">
//                         <p className="text-xs text-gray-500 font-semibold uppercase mb-1">AI Suggestion:</p>
//                         <p className="text-sm text-gray-700 italic">"{c.ai_solution}"</p>
//                     </div>
//                 )}
//                 </div>
//             ))}
//             </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserDashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Image as ImageIcon, Bell, Info, Loader2, CheckCircle, Archive, ThumbsUp, ThumbsDown, AlertOctagon } from 'lucide-react';

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "", image: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPopup, setAiPopup] = useState(null);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('https://scms-project-sgg8.onrender.com/complaints');
      setComplaints(res.data);
    } catch (e) { console.error("Backend offline"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    setIsSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.image) data.append('image', formData.image);

    try {
      const res = await axios.post('https://scms-project-sgg8.onrender.com/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTimeout(() => {
        setComplaints([res.data, ...complaints]);
        setFormData({ title: "", description: "", image: null });
        setAiPopup(res.data);
        setIsSubmitting(false);
      }, 800);
    } catch (error) { alert("Error uploading"); setIsSubmitting(false); }
  };

  const handleVerify = async (id) => {
    try {
      await axios.put(`https://scms-project-sgg8.onrender.com/complaints/${id}/verify`);
      const updatedList = complaints.map(c => c.id === id ? { ...c, status: "Closed" } : c);
      setComplaints(updatedList);
    } catch (e) { alert("Connection Error"); }
  };

  const handleReopen = async (id) => {
    try {
        await axios.put(`https://scms-project-sgg8.onrender.com/complaints/${id}/reopen`);
        const updatedList = complaints.map(c => c.id === id ? { ...c, status: "Reopened", priority: "High" } : c);
        setComplaints(updatedList);
        alert("Complaint Reopened!");
    } catch (e) { alert("Connection Error"); }
  };

  const activeComplaints = complaints.filter(c => c.status !== 'Closed');
  const closedComplaints = complaints.filter(c => c.status === 'Closed');

  return (
    <div className="grid md:grid-cols-12 gap-8 mt-8 pb-10">
      
      {/* STANDARD MODAL (No Blur) */}
      {aiPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-300">
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                    <CheckCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Complaint Registered</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-6">
                <h4 className="font-bold text-blue-800 text-sm mb-1 flex items-center gap-2"><Info size={14} /> AI Suggestion:</h4>
                <p className="text-blue-900 text-sm">{aiPopup.ai_solution}</p>
            </div>
            <button onClick={() => setAiPopup(null)} className="w-full bg-slate-900 text-white py-2 rounded font-semibold hover:bg-slate-800">Close Window</button>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: FORM & HISTORY (4 Columns) */}
      <div className="md:col-span-4 space-y-6">
        
        {/* FORM CARD */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <Send size={18} /> Submit Complaint
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Issue Title</label>
                    <input type="text" placeholder="e.g. Projector Issue" required 
                        className="w-full p-2 border border-gray-300 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition" 
                        value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea placeholder="Describe what happened..." required 
                        className="w-full p-2 border border-gray-300 rounded h-24 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition resize-none" 
                        value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                
                {/* Standard File Input */}
                <div className="border border-gray-300 rounded p-2 bg-gray-50">
                    <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, image: e.target.files[0]})} 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                </div>

                <button disabled={isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-bold shadow-sm flex justify-center items-center gap-2 transition">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Register Complaint"}
                </button>
            </form>
        </div>

        {/* CLOSED HISTORY */}
        {closedComplaints.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2 uppercase">
                    <Archive size={16} /> Verified & Closed
                </h2>
                <div className="space-y-2">
                    {closedComplaints.map(c => (
                        <div key={c.id} className="bg-white p-2 px-3 rounded border border-gray-200 flex justify-between items-center text-sm">
                            <span className="text-gray-400 line-through">{c.title}</span>
                            <CheckCircle size={14} className="text-gray-400" />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* RIGHT COLUMN: ACTIVE TICKETS (8 Columns) */}
      <div className="md:col-span-8">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Active Complaints <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full border border-teal-200">{activeComplaints.length}</span>
            </h2>
        </div>
        
        {activeComplaints.length === 0 ? (
            <div className="bg-white p-10 rounded-lg border border-dashed border-gray-300 text-center text-gray-400">
                <CheckCircle size={40} className="mx-auto mb-2 opacity-20" />
                <p>No active complaints found.</p>
            </div>
        ) : (
            <div className="space-y-4">
            {activeComplaints.map((c) => (
                <div key={c.id} className={`bg-white border rounded-lg p-4 shadow-sm relative
                    ${c.status === 'Resolved' ? 'border-green-500 ring-1 ring-green-500' : 
                      c.status === 'Reopened' ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}>
                
                {/* Status Tag */}
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
                        <div className="flex gap-2 mt-1">
                            <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">{c.category}</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white ${c.priority === 'High' ? 'bg-red-600' : 'bg-gray-500'}`}>{c.priority}</span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-bold border 
                        ${c.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' : 
                          c.status === 'Reopened' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {c.status}
                    </span>
                </div>

                <div className="flex gap-4 mt-3">
                    {/* Image Thumbnail */}
                    {c.image && (
                        <div className="w-24 h-24 flex-shrink-0 border rounded bg-gray-100 overflow-hidden">
                            <img src={c.image} alt="Evidence" className="w-full h-full object-cover" />
                        </div>
                    )}
                    
                    <div className="flex-1">
                        <div className="bg-gray-50 p-3 rounded border border-gray-100 text-sm text-gray-600 mb-2">
                            <span className="font-bold text-gray-400 text-xs uppercase block mb-1">AI Diagnosis:</span>
                            {c.ai_solution}
                        </div>

                        {/* ACTIONS AREA */}
                        {c.status === 'Resolved' && (
                            <div className="flex items-center gap-3 mt-2 bg-green-50 p-3 rounded border border-green-100">
                                <p className="text-xs font-bold text-green-800 flex-1">Admin marked resolved. Verify?</p>
                                <button onClick={() => handleVerify(c.id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1">
                                    <ThumbsUp size={12} /> Verify
                                </button>
                                <button onClick={() => handleReopen(c.id)} className="bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-50 flex items-center gap-1">
                                    <ThumbsDown size={12} /> Reopen
                                </button>
                            </div>
                        )}
                        
                        {c.admin_viewed && c.status !== 'Resolved' && c.status !== 'Reopened' && (
                            <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
                                <Bell size={12} /> Admin has viewed this ticket
                            </p>
                        )}
                    </div>
                </div>

                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
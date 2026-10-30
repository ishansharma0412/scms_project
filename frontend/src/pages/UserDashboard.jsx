import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, imageUrl } from '../config';
import { Send, Image as ImageIcon, Bell, Info, Loader2, CheckCircle, Archive, ThumbsUp, ThumbsDown, AlertOctagon, History, List, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatWidget from '../components/ChatWidget';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "", image: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPopup, setAiPopup] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  
  // Toggle between "Active" and "History" views
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'history'

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      // Backend returns only this student's complaints
      const res = await axios.get(`${API_URL}/complaints`, { params: { roll_no: user.roll_no } });
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
    data.append('roll_no', user.roll_no);
    data.append('student_name', user.name);
    if (formData.image) data.append('image', formData.image);

    try {
      const res = await axios.post(`${API_URL}/complaints`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setComplaints([res.data, ...complaints]);
      setFormData({ title: "", description: "", image: null });
      setAiPopup(res.data);
      setIsSubmitting(false);
      setViewMode('active'); // Switch back to active to see the new complaint
    } catch (error) { alert("Error uploading"); setIsSubmitting(false); }
  };

  const handleVerify = async (id, rating, feedback) => {
    try {
      if (rating > 0) {
          await axios.put(`${API_URL}/complaints/${id}/rate`, { rating, feedback });
      }
      await axios.put(`${API_URL}/complaints/${id}/verify`);
      const updatedList = complaints.map(c => c.id === id ? { ...c, status: "Closed", rating: rating } : c);
      setComplaints(updatedList);
      setRatingModal(null);
    } catch (e) { alert("Connection Error"); }
  };

  const handleReopen = async (id) => {
    try {
        await axios.put(`${API_URL}/complaints/${id}/reopen`);
        const updatedList = complaints.map(c => c.id === id ? { ...c, status: "Reopened", priority: "High" } : c);
        setComplaints(updatedList);
        alert("Complaint Reopened!");
    } catch (e) { alert("Connection Error"); }
  };

  const handleWithdraw = async (id) => {
    if(!window.confirm("Are you sure you want to withdraw and delete this complaint?")) return;
    try {
        await axios.delete(`${API_URL}/complaints/${id}`);
        setComplaints(complaints.filter(c => c.id !== id));
        alert("Complaint Withdrawn Successfully");
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

      {/* LEFT COLUMN: FORM */}
      <div className="md:col-span-4 space-y-6">
        
        {/* PROFILE CARD */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 rounded-lg shadow text-white flex justify-between items-center">
            <div>
                <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">Student Profile</p>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-teal-200 text-sm">{user.roll_no}</p>
            </div>
            <div className="bg-teal-900/50 px-3 py-1.5 rounded text-xs font-bold border border-teal-500/30">
              B.TECH STUDENT
            </div>
        </div>

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
                
                <div className="border border-gray-300 rounded p-2 bg-gray-50">
                    <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, image: e.target.files[0]})} 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                </div>

                <button disabled={isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-bold shadow-sm flex justify-center items-center gap-2 transition">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Register Complaint"}
                </button>
            </form>
        </div>
      </div>

      {/* RIGHT COLUMN: TICKETS */}
      <div className="md:col-span-8">
        
        {/* TOGGLE TABS */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button 
                onClick={() => setViewMode('active')}
                className={`pb-3 font-bold text-sm flex items-center gap-2 ${viewMode === 'active' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}>
                <List size={16} /> Active Issues
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{activeComplaints.length}</span>
            </button>
            <button 
                onClick={() => setViewMode('history')}
                className={`pb-3 font-bold text-sm flex items-center gap-2 ${viewMode === 'history' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}>
                <History size={16} /> History (Resolved)
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{closedComplaints.length}</span>
            </button>
        </div>

        {/* ACTIVE VIEW */}
        {viewMode === 'active' && (
            activeComplaints.length === 0 ? (
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
                    
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">{c.category}</span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white ${c.priority === 'High' ? 'bg-red-600' : 'bg-gray-500'}`}>{c.priority}</span>
                                <span className="text-[10px] text-gray-400 font-medium px-1 py-0.5">{c.date}</span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded text-xs font-bold border 
                            ${c.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' : 
                              c.status === 'ESCALATED' ? 'bg-red-600 text-white border-red-800 animate-pulse' :
                              c.status === 'Reopened' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            {c.status}
                        </span>
                    </div>

                    <div className="flex gap-4 mt-3">
                        {c.image && (
                            <div className="w-24 h-24 flex-shrink-0 border rounded bg-gray-100 overflow-hidden">
                                <img src={imageUrl(c.image)} alt="Evidence" className="w-full h-full object-cover" />
                            </div>
                        )}
                        
                        <div className="flex-1">
                            <div className="bg-gray-50 p-3 rounded border border-gray-100 text-sm text-gray-600 mb-2">
                                <span className="font-bold text-gray-400 text-xs uppercase block mb-1">AI Diagnosis:</span>
                                {c.ai_solution}
                            </div>

                            {c.status === 'Resolved' && (
                                <div className="flex items-center gap-3 mt-2 bg-green-50 p-3 rounded border border-green-100">
                                    <p className="text-xs font-bold text-green-800 flex-1">Admin marked resolved. Verify?</p>
                                    <button onClick={() => setRatingModal({id: c.id, rating: 0, feedback: ''})} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1">
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

                            {c.status !== 'Resolved' && (
                                <div className="mt-3 flex justify-end">
                                    <button onClick={() => handleWithdraw(c.id)} className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 hover:bg-red-50 px-3 py-1 rounded transition">
                                        Withdraw Complaint
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )
        )}

        {/* HISTORY VIEW */}
        {viewMode === 'history' && (
            closedComplaints.length === 0 ? (
                <div className="bg-white p-10 rounded-lg border border-dashed border-gray-300 text-center text-gray-400">
                    <Archive size={40} className="mx-auto mb-2 opacity-20" />
                    <p>No past history found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                {closedComplaints.map((c) => (
                    <div key={c.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm opacity-80 hover:opacity-100 transition">
                        <div className="flex justify-between items-start gap-4">
                            {c.image && (
                                <a href={imageUrl(c.image)} target="_blank" rel="noreferrer" className="w-16 h-16 flex-shrink-0 border rounded bg-gray-100 overflow-hidden">
                                    <img src={imageUrl(c.image)} alt="Evidence" className="w-full h-full object-cover" />
                                </a>
                            )}
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-600 text-lg line-through">{c.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded font-bold uppercase">{c.category}</span>
                                    <span className="text-[10px] text-gray-400 font-medium px-1 py-0.5 flex items-center gap-1"><History size={10} /> {c.date}</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded text-xs font-bold bg-gray-200 text-gray-500 flex items-center gap-1">
                                <CheckCircle size={14} /> Closed
                            </span>
                        </div>
                    </div>
                ))}
                </div>
            )
        )}
      </div>

      {ratingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                <h3 className="font-bold text-lg mb-2">Rate Resolution</h3>
                <p className="text-sm text-gray-500 mb-4">How satisfied are you with the work done?</p>
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRatingModal({...ratingModal, rating: star})}
                            className={`p-2 transition ${ratingModal.rating >= star ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}>
                            <Star size={32} fill="currentColor" />
                        </button>
                    ))}
                </div>
                <textarea
                    className="w-full border rounded p-2 text-sm mb-4 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Optional feedback..."
                    value={ratingModal.feedback}
                    onChange={(e) => setRatingModal({...ratingModal, feedback: e.target.value})}
                ></textarea>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => setRatingModal(null)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                    <button onClick={() => handleVerify(ratingModal.id, ratingModal.rating, ratingModal.feedback)} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded">Submit & Verify</button>
                </div>
            </div>
        </div>
      )}

      <ChatWidget />
    </div>
  );
};

export default UserDashboard;
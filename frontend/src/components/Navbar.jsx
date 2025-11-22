// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { LayoutDashboard, LogOut } from 'lucide-react';

// const Navbar = () => {
//   const navigate = useNavigate();

//   return (
//     <nav className="bg-primary text-white shadow-lg">
//       <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
//         <div className="flex items-center space-x-2">
//           <LayoutDashboard className="h-6 w-6 text-secondary" />
//           <span className="text-xl font-bold tracking-wide">SCMS <span className="text-secondary">AI</span></span>
//         </div>
//         <div className="space-x-6">
//           <Link to="/user" className="hover:text-secondary transition">User Panel</Link>
//           <Link to="/admin" className="hover:text-secondary transition">Admin Panel</Link>
//           <button 
//             onClick={() => navigate('/')}
//             className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded flex items-center gap-2 text-sm"
//           >
//             <LogOut size={16} /> Logout
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;





// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { LayoutDashboard, LogOut, UserCircle } from 'lucide-react';

// const Navbar = () => {
//   const navigate = useNavigate();

//   return (
//     <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//         {/* Logo Area */}
//         <div className="flex items-center gap-3">
//           <div className="bg-teal-500 p-2 rounded">
//             <LayoutDashboard className="h-6 w-6 text-white" />
//           </div>
//           <div>
//             <h1 className="text-xl font-bold tracking-wide">SCMS <span className="text-teal-400">Portal</span></h1>
//             <p className="text-[10px] text-gray-400 uppercase tracking-wider">Complaint Management System</p>
//           </div>
//         </div>

//         {/* Navigation Links */}
//         <div className="flex items-center gap-6">
//           <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
//             <Link to="/user" className="hover:text-white transition">Student Panel</Link>
//             <Link to="/admin" className="hover:text-white transition">Admin Panel</Link>
//           </div>
          
//           <div className="h-6 w-px bg-gray-700"></div> {/* Divider */}

//           <button 
//             onClick={() => navigate('/')}
//             className="flex items-center gap-2 text-sm font-bold bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition"
//           >
//             <LogOut size={16} /> Logout
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // <--- Import useLocation
import { LayoutDashboard, LogOut, LogIn } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <--- Get current route
  
  // Check if we are on the Login Page (root path "/")
  const isLoginPage = location.pathname === '/';

  return (
    <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-teal-500 p-2 rounded">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">SCMS <span className="text-teal-400">Portal</span></h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Complaint Management System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          
          {/* Only show Panel links if NOT on Login Page */}
          {!isLoginPage && (
            <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
              <Link to="/user" className="hover:text-white transition">Student Panel</Link>
              <Link to="/admin" className="hover:text-white transition">Admin Panel</Link>
            </div>
          )}
          
          <div className="h-6 w-px bg-gray-700"></div>

          {/* Dynamic Button: Login vs Logout */}
          {isLoginPage ? (
            <button 
              disabled
              className="flex items-center gap-2 text-sm font-bold bg-teal-600 px-4 py-2 rounded text-white opacity-50 cursor-not-allowed"
            >
              <LogIn size={16} /> Please Login
            </button>
          ) : (
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm font-bold bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
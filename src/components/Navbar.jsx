import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = authService.getUser();
    setUser(u);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold text-purple-600">
              Recruitment App
            </Link>
            <nav className="hidden sm:flex items-center gap-3">
              {user?user.role=='employer'?"":<Link
                to="/alljobs"
                className="text-sm text-gray-700 hover:text-purple-600 transition"
              >
                All Jobs
              </Link>:""}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="text-sm text-gray-700 hover:text-purple-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

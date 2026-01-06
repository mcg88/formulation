import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-purple-600 text-white'
        : 'text-gray-700 hover:bg-purple-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-purple-600">
                Cosmetics Formulation Manager
              </h1>
              <div className="hidden md:flex space-x-2">
                <NavLink to="/" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/formulations" className={navLinkClass}>
                  Formulations
                </NavLink>
                <NavLink to="/ingredients" className={navLinkClass}>
                  Ingredients
                </NavLink>
                <NavLink to="/categories" className={navLinkClass}>
                  Categories
                </NavLink>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

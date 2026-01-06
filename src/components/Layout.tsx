import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountingOpen, setAccountingOpen] = useState(false);

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

  const isAccountingActive = location.pathname.startsWith('/expenses') ||
                             location.pathname.startsWith('/income') ||
                             location.pathname.startsWith('/reports');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-purple-600 cursor-pointer" onClick={() => navigate('/')}>
                Noita Dashboard
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

                {/* Accounting Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setAccountingOpen(!accountingOpen)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                      isAccountingActive
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-purple-100'
                    }`}
                  >
                    Accounting
                    <svg
                      className={`w-4 h-4 transition-transform ${accountingOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {accountingOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setAccountingOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <NavLink
                          to="/expenses"
                          onClick={() => setAccountingOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm ${
                              isActive
                                ? 'bg-purple-100 text-purple-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`
                          }
                        >
                          Expenses
                        </NavLink>
                        <NavLink
                          to="/income"
                          onClick={() => setAccountingOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm ${
                              isActive
                                ? 'bg-purple-100 text-purple-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`
                          }
                        >
                          Income
                        </NavLink>
                        <NavLink
                          to="/reports"
                          onClick={() => setAccountingOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm ${
                              isActive
                                ? 'bg-purple-100 text-purple-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`
                          }
                        >
                          Reports
                        </NavLink>
                      </div>
                    </>
                  )}
                </div>
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

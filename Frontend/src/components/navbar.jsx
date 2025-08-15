import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-400 shadow-md dark:border-gray-500 top-0 z-50 sticky">
      <div className="flex items bg-center justify-between p-3">
        <Link
          to="/"
          className="w-auto p-2 rounded text-gray-800 dark:text-gray-200 font-semibold text-2xl "
        >
          HelpDesk
        </Link>
        <div className="mt-3">
          <Link
            to="/signup"
            className="{`text-sm shadow-md font-semibold text-gray-800 dark:text-gray-200 mr-5 border-gray-600 border-1 dark:border-gray-200 rounded-xl px-3 py-2 hover:bg-indigo-600 hover:text-gray-200  ${
              location.pathname === '/signup' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'
            }`}"
          >
            SignUp
          </Link>
          <Link
            to="/login"
            className="{`text-sm font-semibold shadow-md text-gray-800 dark:text-gray-200 mr-10  border-gray-600 border-1 dark:border-gray-200  rounded-xl px-3 py-2 hover:bg-indigo-600 hover:text-gray-200 ${
              location.pathname === '/login' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'
            }`}"
          >
            LogIn
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { login } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import Navbar from "../components/navbar";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      return setError("Invalid Email");
    }
  
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        return setError(data.message || "Login Error");
      }

      dispatch(login(data));

      if (data.user.role === "support") {
        navigate("/dashboard/support");
      } else if (data.user.role === "admin") {
        navigate("/dashboard/admin");
      } else {
        navigate("/dashboard/client");
      }
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };
  return (
    <div>
      <Navbar />
      <div className="flex justify-between bg-white dark:bg-gray-900 h-screen ">
        <div className="w-[600px] text-center">
          <h1 className="text-gry-800 dark:text-gray-200 mt-40 text-2xl font-bold">
            Login to Your Account to Start TroubleShooting
          </h1>
          <p className="text-gry-800 dark:text-gray-200 font-semibold text-md mt-5">
            You Can Upgrade Your Account To Access Premium Features
          </p>
        </div>
        <div className="w-[600px]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center border border-gray-400 dark:border-gray-200 shadow-xl w-[400px] mt-15 rounded-xl"
          >
            <h1 className="text-gry-800 dark:text-gray-200 font-bold text-3xl mt-10">
              Login
            </h1>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              className="p-2 rounded-xl text-md text-gray-800 dark:text-gray-200 w-[250px] shadow-md border border-gray-800 dark:border-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-200 mb-3 mt-3"
            />

            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="p-2 rounded-xl text-md text-gray-800 dark:text-gray-200 w-[250px] shadow-md  border border-gray-800 dark:border-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-200 mb-3 mt-3"
            />
            <button
              className="py-2 px-3 w-fit border mt-3 mb-5 rounded-xl shadow-md p-2 hover:bg-indigo-600 hover:text-gray-200 dark:border-gray-200 dark:text-gray-200"
              type="submit"
            >
              Login
            </button>
            {error && <p className="text-md text-red-500">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;

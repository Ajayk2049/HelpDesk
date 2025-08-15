import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/navbar";

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      return setError("Invalid Email Format");
    }
    if (!passwordRegex.test(password)) {
      return setError("Password Too Weak");
    }
    if (password !== confirmPassword) {
      return setError("Passwords Do Not Match");
    }
   try{
    const res = await fetch("http://localhost:5000/api/signup",{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email,password})
    });
    const data = await res.json();
    if(!res.ok){
      return setError(data.message || "Singup Failed");
    }
    navigate("/login");
   } catch(err){
    console.error(err)
    setError("Signup Error");
   }
  };

  return (
    <div>
      <Navbar />
      <div className="bg-white dark:bg-gray-900 flex justify-between h-screen">
        <div className="w-full flex justify-center">
          <div className="mt-20 h-fit p-5">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">
              SignUp Now To Start TroubleShooting
            </h1>
            <p className="text-gray-800 dark:text-gray-200 text-wrap text-center mt-10 text-md font-semibold">
              You Can Choose a Plan Later <br />
              To Upgrade Your Account And Unlock Premium Features
            </p>

            <div className="text-gray-800  dark:text-gray-200 text-wrap text-center mt-40 text-md font-semibold bg-gray-300 dark:bg-gray-700 border rounded p-3 shadow-xl">
              <ul>Password Hint</ul>
              <li className="list-none"> - One Upparcase Letter </li>
              <li className="list-none">- One Number </li>
              <li className="list-none">- One Symbol</li>
              <li className="list-none">- Min. 8 Characters</li>
            </div>
          </div>
        </div>

        <div>
          <div className="w-[600px] mt-3flex items-center">
            <form
              onSubmit={handleSubmit}
              className="border dark:border-white shadow-xl rounded flex flex-col w-[400px] p-5 mt-20 items-center"
            >
              <h1 className="text-3xl font-bold text-center dark:text-gray-200 mb-3">
                SignUp
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
                onChange={(e) => setpassword(e.target.value)}
                placeholder="Enter Password"
                className="p-2 rounded-xl text-md text-gray-800 dark:text-gray-200 w-[250px] shadow-md  border border-gray-800 dark:border-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-200 mb-3 mt-3"
              />
             
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="p-2 rounded-xl shadow-md text-md text-gray-800 dark:text-gray-200 w-[250px] border border-gray-800 dark:border-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-200 mb-3 mt-3"
              />
              
              <button
                className="py-2 px-3 w-fit border mt-3 mb-3 rounded-xl shadow-md p-2 hover:bg-indigo-600 hover:text-gray-200 dark:border-gray-200 dark:text-gray-200"
                onClick={handleSubmit}
              >
                SignUp
              </button>
              {error && <p className="text-md text-red-500">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Signup;

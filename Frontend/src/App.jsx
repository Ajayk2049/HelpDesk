import { Route, Routes } from "react-router"
import Home from "./pages/Home"
import Pricing from "./components/pricing"
import Signup from "./pages/signup"
import Login from "./pages/login"
import ClientDashboard from "./pages/clientDashboard"
import SupportDashboard from "./pages/supportDashboard"
import AdminDashboard from "./pages/AdminDashboard"

const App = ()=> {
  return(
    <div>
      <Routes>
         <Route path ="/" element={<Home />} />
         <Route path='/pricing' element={<Pricing />} />
         <Route path="/signup" element={<Signup />} />
         <Route path="/login" element={<Login />} />
         <Route path="/dashboard/client" element={<ClientDashboard />} />
         <Route path="/dashboard/support" element={<SupportDashboard />} />
         <Route path="/dashboard/admin" element={<AdminDashboard />} />
       </Routes>
    </div>
  )
}

export default App
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

// Mock data
const mockUsers = [
  { id: 1, email: "client1@test.com", role: "client", plan: "Free" },
  { id: 2, email: "client2@test.com", role: "client", plan: "Premium" },
  { id: 3, email: "agent1@test.com", role: "support", plan: "N/A" },
];

const mockTickets = [
  { id: 1, topic: "Login Issue", client: "client1@test.com", assignedTo: "agent1@test.com", status: "Unresolved" },
  { id: 2, topic: "Payment Failure", client: "client2@test.com", assignedTo: null, status: "Unresolved" },
];

const AdminDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [users, setUsers] = useState(mockUsers);
  const [tickets, setTickets] = useState(mockTickets);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const togglePlan = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, plan: u.plan === "Free" ? "Premium" : "Free" }
          : u
      )
    );
  };

  const assignSupport = (ticketId, agentEmail) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, assignedTo: agentEmail } : t
      )
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-400 shadow-md dark:border-gray-500 top-0 sticky z-50">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="text-2xl font-bold">HelpDesk</Link>
          <div className="flex items-center gap-4">
            <span>🛡️ {user?.email}</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
          </div>
        </div>
      </nav>

      <main className="p-6 space-y-8">
        {/* Users Section */}
        <section>
          <h2 className="text-xl font-semibold mb-2">👥 User Management</h2>
          <table className="w-full table-auto border text-left">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Plan</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b dark:border-gray-700">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 capitalize">{u.role}</td>
                  <td className="p-2">{u.plan}</td>
                  <td className="p-2">
                    {u.role === "client" && (
                      <button
                        onClick={() => togglePlan(u.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                      >
                        {u.plan === "Free" ? "Upgrade" : "Downgrade"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Tickets Section */}
        <section>
          <h2 className="text-xl font-semibold mb-2">🎫 Ticket Overview</h2>
          <table className="w-full table-auto border text-left">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="p-2">Topic</th>
                <th className="p-2">Client</th>
                <th className="p-2">Assigned</th>
                <th className="p-2">Status</th>
                <th className="p-2">Assign Agent</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b dark:border-gray-700">
                  <td className="p-2">{t.topic}</td>
                  <td className="p-2">{t.client}</td>
                  <td className="p-2">{t.assignedTo || "Not Assigned"}</td>
                  <td className="p-2">{t.status}</td>
                  <td className="p-2">
                    <select
                      onChange={(e) => assignSupport(t.id, e.target.value)}
                      defaultValue=""
                      className="bg-gray-300 dark:bg-gray-700 p-1 rounded"
                    >
                      <option value="" disabled>
                        Select Agent
                      </option>
                      {users
                        .filter((u) => u.role === "support")
                        .map((agent) => (
                          <option key={agent.id} value={agent.email}>
                            {agent.email}
                          </option>
                        ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;

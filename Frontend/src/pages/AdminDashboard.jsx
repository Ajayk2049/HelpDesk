import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../redux/authSlice";

const AdminDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const togglePlan = (_id, currentPlan) => {
    const action =
      currentPlan === "free" ? "upgrade to premium" : "downgrade to free";
    const confirm = window.confirm(
      `Are you sure you want to ${action} this user?`
    );

    if (!confirm) return;

    setUsers((prev) =>
      prev.map((u) =>
        u._id === _id
          ? { ...u, plan: u.plan === "free" ? "premium" : "free" }
          : u
      )
    );
  };

  const assignSupport = async (ticketId, agentId) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/tickets/assign-agent",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ticketId, agentId }),
        }
      );

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Assign Failed");

      const updatedTicket = data.ticket || {};

      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, ...updatedTicket } : t))
      );
    } catch (err) {
      console.error("Assign Error", err);
      alert("Error assigning agent");
    }
  };

  const getAssignedId = (t) => {
    if (!t) return "";

    if (t.supportAgent)
      return typeof t.supportAgent === "string"
        ? t.supportAgent
        : t.supportAgent._id;
    if (t.assignedTo)
      return typeof t.assignedTo === "string" ? t.assignedTo : t.assignedTo._id;
    return "";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketRes, userRes] = await Promise.all([
          fetch("http://localhost:5000/api/tickets/all-tickets", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const ticketData = await ticketRes.json();
        const userData = await userRes.json();

        setTickets(ticketData.tickets || []);
        setUsers(userData.users || []);
      } catch (err) {
        console.error("Admin Fetch Error", err);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-400 shadow-md dark:border-gray-500 top-0 sticky z-50">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="text-2xl font-bold">
            HelpDesk
          </Link>
          <div className="flex items-center gap-4">
            <span>👨🏻‍💼{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* USERS */}
        <section className="p-">
          <h2 className="text-2xl font-semibold mb-4 border-gray-600">
            User Management 👤👤
          </h2>
          <table className="w-full text-center mt-2">
            <thead className="border-b border-gray-600 text-gray-800 dark:text-gray-200">
              <tr>
                <th className="border w-[250px] font-semibold text-xl py-2">
                  ID
                </th>
                <th className="border w-[250px] font-semibold text-xl py-2">
                  Email
                </th>
                <th className="border w-[150px] font-semibold text-xl py-2">
                  Role
                </th>
                <th className="border w-[150px] font-semibold text-xl py-2">
                  Plan
                </th>
                <th className="border w-[150px] font-semibold text-xl py-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => u.role !== "admin")
                .map((u) => (
                  <tr key={u._id}>
                    <td className="p-2">{u._id}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.plan}</td>
                    <td>
                      {u.role === "client" && (
                        <button
                          className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 text-white rounded"
                          onClick={() => togglePlan(u._id, u.plan)}
                        >
                          {u.plan === "free" ? "Upgrade" : "Downgrade"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        {/* TICKETS */}
        <section className="p-6">
          <h2 className="text-2xl font-semibold border-gray-600">
            Ticket Overview
          </h2>
          <table className="w-full text-center mt-2">
            <thead className="border-b border-gray-600">
              <tr>
                <th className="border w-[200px] font-semibold text-xl py-2">
                  Topic
                </th>
                <th className="border w-[200px] font-semibold text-xl py-2">
                  Client
                </th>
                <th className="border w-[180px] font-semibold text-xl py-2">
                  Assigned
                </th>

                {/* NEW column */}
                <th className="border w-[160px] font-semibold text-xl py-2">
                  Agent Request
                </th>

                <th className="border w-[120px] font-semibold text-xl py-2">
                  Status
                </th>
                <th className="border w-[250px] font-semibold text-xl py-2">
                  Assign Agent
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const requested =
                  !!t.needsAgent || t.status === "awaiting_agent";
                const clientEmail = t.createdBy?.email || "Unknown";
                const assignedEmail = t.assignedTo?.email || "Not Assigned";

                return (
                  <tr key={t._id}>
                    <td className="p-2">{t.topic || t.title || "Untitled"}</td>
                    <td className="p-2">{t.createdBy?.email || "unknown"}</td>

                    <td className="p-2">
                      {t.assignedTo?.email || "Not Assigned"}
                    </td>

                    {/* Agent Request indicator */}
                    <td className="p-2">
                      {requested ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-red-600 text-white font-semibold">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-gray-300 text-gray-700 font-semibold">
                          No
                        </span>
                      )}
                    </td>

                    <td className="p-2">
                      {t.resolved ? "Resolved" : t.status || "Open"}
                    </td>
                    <td>
                      <select
                        onChange={(e) => assignSupport(t._id, e.target.value)}
                        value={getAssignedId(t)}
                        className="text-gray-800 dark:text-gray-900 border border-gray-500 p-1 bg-gray-300 rounded-md"
                      >
                        <option value="">Select Agent</option>
                        {users
                          .filter((u) => u.role === "support")
                          .map((agent) => (
                            <option key={agent._id} value={agent._id}>
                              {agent.email}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { io } from "socket.io-client";

const SupportDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);

  const socket = useMemo(() => io("http://localhost:5000"), []);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const load = async () => {
      try {
        console.log("🔐 Support load assigned → /api/tickets/assigned");
        const res = await fetch(
          "http://localhost:5000/api/tickets/assigned-tickets",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        console.log("📥 Assigned tickets:", data);
        const arr = data?.tickets || [];
        setTickets(arr);
        if (arr.length > 0) setSelectedTicket(arr[0]);
      } catch (e) {
        console.error("❌ error fetching assigned tickets", e);
      }
    };
    if (token) load();
  }, [token]);

  useEffect(() => {
    if (!selectedTicket) return;
    socket.emit("join-ticket", selectedTicket._id);
    return () => {};
  }, [socket, selectedTicket]);

  useEffect(() => {
    const onReceive = (incoming) => {
      if (!selectedTicket) return;
      const normalized = {
        ...incoming,
        sender:
          typeof incoming.sender === "string" ||
          typeof incoming.sender === "number"
            ? { _id: incoming.sender, role: incoming.role || "support" }
            : incoming.sender,
      };
      setSelectedTicket((prev) =>
        prev
          ? { ...prev, messages: [...(prev.messages || []), incoming] }
          : prev
      );
    };
    socket.on("receive-message", onReceive);
    return () => socket.off("receive-message", onReceive);
  }, [socket, selectedTicket]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    if (!selectedTicket) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/reply/${selectedTicket._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: input, image: null }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("❌ reply failed:", data);
        setLoading(false);
        return;
      }

      const updated = data.ticket;
      const latest = updated.messages[updated.messages.length - 1];
      if (!latest) {
        console.error("❌ message not saved", updated);
        return;
      }

      socket.emit("send-message", {
        ticketId: selectedTicket._id,
        message: {
          ...latest,
          sender: latest.sender || { _id: currentUserId, role: "support" },
        },
      });

      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
      setInput("");
      setSelectedImage(null);
    } catch (err) {
      console.error("❌ send error:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = user?.id || user?._id || null;

  const handleResolve = async () => {
    if (!selectedTicket?._id) return;
    const confirmed = confirm("Mark This Ticket As Resolved");
    if (!confirmed) return;
    try {
      const res = await fetch("http://localhost:5000/api/tickets/resolve", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: selectedTicket._id,
          finalMessage: "Thanks For Confirming Marking This Ticket As Resolved",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Resolve Failed", data);
        return;
      }

      const updated = data.ticket;
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
      alert("✅ Ticket Resolved");
    } catch (err) {
      console.error("❌ Error Resolving Ticket", err);
    }
  };

  const messageEndRef = useRef(null);
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages]);

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-400 shadow-md dark:border-gray-500 top-0 z-50 sticky">
        <div className="flex items-center justify-between p-3">
          <Link to="/" className="p-2 rounded font-semibold text-2xl">
            HelpDesk
          </Link>
          <div className="mt-3 flex gap-5">
            <span>👨🏻‍💼{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold shadow-md mr-10 rounded px-3 py-2 bg-red-500 hover:bg-red-600 text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex flex-col border-r p-2 w-1/4 overflow-y-auto">
          <h3 className="font-semibold text-2xl mb-4">Assigned Tickets</h3>
          <ul>
            {tickets.map((t) => (
              <li
                key={t._id}
                onClick={() => setSelectedTicket(t)}
                className={`p-2 rounded cursor-pointer ${
                  selectedTicket?._id === t._id
                    ? "bg-indigo-700"
                    : "hover:bg-gray-700"
                }`}
              >
                <p className="text-sm text-gray-500 dark:text-gray-300 italic">
                  {t.resolved && (
                    <span className="text-green-400 ml-2">(Resolved)</span>
                  )}
                </p>
                <h4 className="text-xl">{t.title || t.topic}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-300 italic">
                  {t.createdBy?.email || t.createdBy?.topic || "ticket"}
                </p>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat section */}
        <div className="w-3/4 flex flex-col">
          {/* Header */}
          <div className="flex justify-between p-1 border-b">
            <h2 className="text-2xl ml-2 font-semibold">
              {selectedTicket?.topic || "No ticket selected"}
            </h2>
            {selectedTicket && !selectedTicket.resolved && (
              <button
                onClick={handleResolve}
                className="mt-1 w-fit px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
              >
                ✅ Mark Ticket as Resolved
              </button>
            )}
            {selectedTicket?.resolved && (
              <div className="mt-1 text-sm text-green-400 font-semibold">
                ✅ This ticket is resolved.
              </div>
            )}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {(selectedTicket?.messages || []).map((msg, idx) => {
              const senderId =
                typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
              if (!senderId) return null;
              const senderRole =
                typeof msg.sender === "object" ? msg.sender?.role : null;
              const isMine =
                senderId?.toString() === currentUserId?.toString() ||
                senderRole === "ai" ||
                senderRole === "support";

              const bubbleClass = isMine
                ? "ml-auto bg-indigo-600 text-white text-right"
                : "mr-auto bg-gray-700 text-white";

              return (
                <div
                  key={idx}
                  className={`w-fit max-w-xl break-words px-4 py-3 rounded-xl shadow ${bubbleClass}`}
                >
                  {msg.text && <p>{msg.text}</p>}
                  {msg.img && (
                    <img
                      src={msg.img}
                      alt="chat-img"
                      className="rounded mt-2 max-w-[200px] border"
                    />
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleString()}
                  </p>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t">
            {selectedImage && (
              <div className="mb-2">
                <p className="text-sm font-semibold">selected image</p>
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="preview"
                  className="w-[100px] rounded p-2"
                />
              </div>
            )}
            <form
              onSubmit={handleSend}
              className="text-sm gap-2 flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Reply To Client"
                disabled={selectedTicket?.resolved}
                className="outline-none p-2 bg-gray-400 dark:bg-gray-700 rounded-lg text-lg flex-1"
              />
              <label className="rounded-md cursor-pointer bg-gray-600 p-2 text-lg">
                📎
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setSelectedImage(file);
                  }}
                />
              </label>
              <button
                className="rounded py-2 px-3 bg-indigo-600 text-lg"
                type="submit"
                disabled={loading}
              >
                {loading ? "…" : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;

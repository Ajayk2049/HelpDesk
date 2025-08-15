import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { io } from "socket.io-client";

const ClientDashboard = () => {
  const socket = useMemo(() => io("http://localhost:5000"), []);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);
  const token = auth?.user?.token || auth?.user?.accessToken || auth?.token;
  const currentUser = auth?.user?.user || auth?.user || {};
  const currentUserId =
    currentUser?._id || currentUser?.id || currentUser?.userId || null;

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const handleCreateTopic = async () => {
    const topicName = prompt("Enter ticket topic:");
    if (!topicName?.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/tickets/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topicName }),
      });

      const data = await res.json();
      if (res.ok) {
        setTickets((prev) => [...prev, data.ticket]);
      } else {
        console.error("Ticket creation failed:", data?.message);
      }
    } catch (err) {
      console.error("Create ticket error:", err);
    }
  };

  const deleteTicket = async (ticket) => {
    if (!ticket || !ticket._id) return;
    const ok = window.confirm("Delete this ticket? This cannot be undone.");
    if (!ok) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/tickets/delete/${ticket._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Delete failed:", data);
        alert(data.message || "Failed to delete ticket");
        return;
      }

      setTickets((prev) => {
        const next = prev.filter((t) => t._id !== ticket._id);
        if (selectedTicket && selectedTicket._id === ticket._id) {
          const newSelected = next[0] || null;
          setSelectedTicket(newSelected);
          setMessages(newSelected ? newSelected.messages || [] : []);
        }
        return next;
      });
    } catch (err) {
      console.error("Delete ticket error", err);
      alert("Error deleting ticket");
    }
  };

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/tickets/my-tickets", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const ticketsArray = Array.isArray(data) ? data : data?.tickets || [];
          setTickets(ticketsArray);
          if (ticketsArray.length > 0) {
            setSelectedTicket(ticketsArray[0]);
            setMessages(ticketsArray[0].messages || []);
          }
        })
        .catch(() => {
          setTickets([]);
          setMessages([]);
          setSelectedTicket(null);
        });
    }
  }, [token]);

  const onSelectTicket = (ticket) => {
    setMessages(ticket.messages || []);
    setSelectedTicket(ticket);
  };

  useEffect(() => {
    if (!selectedTicket) return;
    socket.emit("join-ticket", selectedTicket._id);
  }, [socket, selectedTicket]);

  useEffect(() => {
    socket.on("receive-message", (incomingMessage) => {
      if (incomingMessage.sender?.role === "ai") {
        setMessages((prev) =>
          prev.map((m) => (m._id === "mock-ai-reply" ? incomingMessage : m))
        );
      } else {
        setMessages((prev) => [...prev, incomingMessage]);
      }
    });
    return () => socket.off("receive-message");
  }, [socket]);

  const onPickImage = (file) => {
    if (!file) {
      setSelectedImageFile(null);
      setSelectedImageUrl(null);
      return;
    }
    setSelectedImageFile(file);
    setSelectedImageUrl(URL.createObjectURL(file));
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedTicket?._id) return;

    setLoading(true);

    const payload = {
      text: selectedImageFile ? `${input} (+ image attached)` : input,
      image: selectedImageUrl || null,
    };

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          _id: "mock-ai-reply",
          sender: { role: "ai" },
          text: "Analyzing your query, please wait...",
        },
      ]);
    }, 500);

    try {
      const replyRes = await fetch(
        `http://localhost:5000/api/messages/reply/${selectedTicket._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await replyRes.json();
      if (replyRes.ok) {
        setMessages(data.ticket.messages || []);
        setSelectedTicket(data.ticket);
      } else {
        console.error("Message save failed:", data?.message);
      }
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setInput("");
      setSelectedImageFile(null);
      setSelectedImageUrl(null);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const messageEndRef = useRef(null);
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const requestHumanSupport = async () => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/tickets/${selectedTicket._id}/needs-agent`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSelectedTicket(data.ticket);
        setMessages(data.ticket.messages || []);
      } else {
        console.error("Failed to request Support", data.messages);
      }
    } catch (err) {
      console.error("Error Getting Support", err);
    }
  };

  // Helper for header text: show topic or fall back to title
  const selectedTitle =
    selectedTicket?.topic || selectedTicket?.title || "No Ticket Selected";

  return (
    // Page takes full viewport height; content below nav never forces page scroll
    <div className="h-screen flex flex-col">
      {/* Fixed-height top nav so the layout can subtract it */}
      <nav className="h-16 bg-white dark:bg-gray-900 border-b border-gray-400 shadow-md dark:border-gray-500">
        <div className="h-full flex items-center justify-between px-3">
          <Link
            to="/"
            className="w-auto p-2 rounded text-gray-800 dark:text-gray-200 font-semibold text-2xl"
          >
            HelpDesk
          </Link>
          <div className="flex gap-5 text-gray-800 dark:text-gray-200">
            <span className="font-sm">
              👨🏻‍💼 {currentUser?.email || auth?.user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold shadow-md text-gray-800 dark:text-gray-200 mr-2 border-gray-600 dark:border-gray-200 rounded px-3 py-2 bg-red-500 hover:bg-red-600 hover:text-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Everything below fills remaining height; no body/page scrolling */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - tickets (own scroll) */}
        <aside className="w-1/4 bg-white dark:bg-gray-800 p-4 border-r border-gray-700 text-gray-800 dark:text-gray-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your tickets</h2>
            <button
              onClick={handleCreateTopic}
              className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded text-sm text-white"
            >
              + Ticket
            </button>
          </div>
          <ul className="space-y-2">
            {tickets.length === 0 && (
              <p className="text-sm italic text-gray-500">No tickets yet.</p>
            )}

            {(tickets || []).map((ticket) => (
              <li
                onClick={() => onSelectTicket(ticket)}
                key={ticket._id}
                className={`cursor-pointer p-2 rounded flex justify-between items-center ${
                  selectedTicket?._id === ticket._id
                    ? "bg-indigo-700 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <span>{ticket.topic || ticket.title || "Undefined"}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTicket(ticket);
                  }}
                  className="text-red-500 hover:text-red-600 text-sm ml-3 cursor-pointer"
                  title="Delete ticket"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right Panel - Chat */}
        {/* h-full + min-h-0 keep this column within viewport; children can scroll */}
        <main className="w-3/4 bg-gray-900 text-gray-200 flex flex-col h-full min-h-0">
          {/* Top bar (non-scrolling header) */}
          <div className="flex justify-between items-center shrink-0 border-b-1 p-2">
            <h2 className="text-xl font-bold">{selectedTitle}</h2>

            {selectedTicket &&
              !selectedTicket?.needsAgent &&
              !selectedTicket?.supportAgent && (
                <div className="">
                  <button
                    onClick={requestHumanSupport}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Request Human Support
                  </button>
                </div>
              )}

            {selectedTicket &&
              selectedTicket?.needsAgent &&
              !selectedTicket?.supportAgent && (
                <p className=" text-yellow-400 font-semibold">
                  Human support requested. Please wait for an agent to respond.
                </p>
              )}

            {selectedTicket && selectedTicket?.supportAgent && (
              <p className=" text-green-400 font-semibold">
                You are now connected with a support agent.
              </p>
            )}
          </div>

          {/* Message Area  */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 p-2">
            {(messages || []).map((msg, idx) => {
              const senderId =
                typeof msg.sender === "object" && msg.sender !== null
                  ? msg.sender._id
                  : msg.sender;

              const isClient =
                senderId?.toString() === currentUserId?.toString();

              const bubbleClass = isClient
                ? "ml-auto bg-indigo-600 text-white text-right"
                : "mr-auto bg-gray-700 text-white ";

              return (
                <div
                  key={idx}
                  className={`w-fit max-w-xl break-words px-4 py-3 rounded-xl shadow ${bubbleClass}`}
                >
                  {msg.text && <p>{msg.text}</p>}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="uploaded"
                      className="mt-2 rounded w-[250px]"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          {/* Input + Preview live at the bottom and are always visible (no scroll) */}
          <form className="mt-4 flex items-center gap-2 shrink-0" onSubmit={onSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your problem..."
              className="flex-1 p-3 rounded-lg bg-gray-800 text-gray-200 outline-none"
            />

            <label className="p-2 bg-gray-600 rounded-lg cursor-pointer">
              📎
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  onPickImage(file || null);
                }}
              />
            </label>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold text-white"
              disabled={!input.trim() || !selectedTicket || loading}
            >
              {loading ? "..." : "Send"}
            </button>
          </form>

          {selectedImageUrl && (
            <div className="mt-3 text-gray-300 shrink-0">
              <p className="text-sm mb-1">Selected image (local preview only):</p>
              <img src={selectedImageUrl} alt="selected" className="w-[160px] rounded" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api";
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  saveAuth
} from "@/lib/storage";
import type { AuthResponse, ChatMessage, User } from "@/lib/types";
import { clearSocket, getSocket } from "@/lib/socket";
import AuthCard from "@/components/AuthCard";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

export default function HomePage() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [typing, setTyping] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const selectedUserIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const selectedUserId = selectedUser?._id ?? null;
  const emphasizeOwnMessages = currentUser?.phone === "8493972906";

  const isLoggedIn = useMemo(() => Boolean(token && currentUser), [token, currentUser]);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(storedUser);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!token || !currentUser) {
      setUsers([]);
      setSelectedUser(null);
      setMessages([]);
      clearSocket();
      socketRef.current = null;
      return;
    }

    const socket = getSocket(token);
    socketRef.current = socket;

    const handleReceiveMessage = (message: ChatMessage) => {
      const activeChatId = selectedUserIdRef.current;
      if (
        activeChatId &&
        ((activeChatId === message.senderId && message.receiverId === currentUser._id) ||
          (activeChatId === message.receiverId && message.senderId === currentUser._id))
      ) {
        setMessages((prev) =>
          prev.some((item) => item._id === message._id) ? prev : [...prev, message]
        );
      }
    };

    const handleTypingEvent = ({ fromUserId }: { fromUserId: string }) => {
      const activeChatId = selectedUserIdRef.current;
      if (fromUserId !== activeChatId) {
        return;
      }

      setTyping(true);
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = window.setTimeout(() => {
        setTyping(false);
      }, 1200);
    };

    socket.connect();
    socket.emit("join", { userId: currentUser._id });
    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTypingEvent);

    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTypingEvent);
    };
  }, [token, currentUser]);

  useEffect(() => {
    if (!token || !currentUser) return;

    let mounted = true;

    async function loadUsers() {
      try {
        const { data } = await api.get<User[]>("/users");
        if (!mounted) return;
        setUsers(data);
      } catch {
        if (mounted) {
          setError("Failed to load users.");
        }
      }
    }

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [token, currentUser]);

  useEffect(() => {
    async function loadMessages() {
      if (!selectedUserId) return;
      setLoadingMessages(true);
      setError("");
      setTyping(false);

      try {
        const { data } = await api.get<ChatMessage[]>(`/messages/${selectedUserId}`);
        setMessages(data);
      } catch {
        setError("Failed to load conversation.");
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [selectedUserId]);

  async function handleAuth(auth: AuthResponse) {
    saveAuth(auth.token, auth.user);
    setToken(auth.token);
    setCurrentUser(auth.user);
    setSelectedUser(null);
    setMessages([]);
    setMessageText("");
    setMobileChatOpen(false);
    setError("");
  }

  function handleLogout() {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    selectedUserIdRef.current = null;
    clearAuth();
    clearSocket();
    setToken(null);
    setCurrentUser(null);
    setUsers([]);
    setSelectedUser(null);
    setMessages([]);
    setMessageText("");
    setTyping(false);
    setError("");
  }

  function handleSelectUser(user: User) {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    selectedUserIdRef.current = user._id;
    setSelectedUser(user);
    setMobileChatOpen(true);
    setMessages([]);
    setError("");
    setTyping(false);
  }

  function handleBack() {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    selectedUserIdRef.current = null;
    setMobileChatOpen(false);
    setTyping(false);
  }

  async function handleSend() {
    if (!socketRef.current || !selectedUser || !messageText.trim()) return;
    const text = messageText.trim();
    setMessageText("");
    setError("");

    try {
      const saved = await new Promise<ChatMessage>((resolve, reject) => {
        socketRef.current?.emit(
          "send_message",
          { receiverId: selectedUser._id, text },
          (response: { ok: boolean; message?: ChatMessage; error?: string }) => {
            if (response.ok && response.message) {
              resolve(response.message);
              return;
            }
            reject(new Error(response.error ?? "Failed to send message"));
          }
        );
      });

      setMessages((prev) =>
        prev.some((item) => item._id === saved._id) ? prev : [...prev, saved]
      );
    } catch {
      setMessageText(text);
      setError("Could not send message.");
    }
  }

  function handleTyping(value: string) {
    setMessageText(value);
    if (!socketRef.current || !selectedUser || !currentUser) return;
    socketRef.current.emit("typing", { receiverId: selectedUser._id });
  }

  if (!ready) {
    return null;
  }

  if (!isLoggedIn || !currentUser || !token) {
    return <AuthCard onAuth={handleAuth} />;
  }

  return (
    <main className="mx-auto h-screen w-full max-w-[1800px] p-0 lg:p-4">
      <div className="grid h-full overflow-hidden bg-surfaceAlt shadow-soft lg:grid-cols-[340px_1fr] lg:rounded-[2rem] lg:border lg:border-border">
        <div className={`${selectedUser && mobileChatOpen ? "hidden lg:block" : "block"}`}>
          <Sidebar
            users={users}
            activeUserId={selectedUserId}
            currentUser={currentUser}
            onSelectUser={handleSelectUser}
            onLogout={handleLogout}
          />
        </div>
        <div className={`${selectedUser && mobileChatOpen ? "block" : "hidden lg:block"} min-h-0`}>
          <ChatWindow
            currentUser={currentUser}
            selectedUser={selectedUser}
            messages={messages}
            messageText={messageText}
            onMessageTextChange={handleTyping}
            onSend={handleSend}
            onBack={handleBack}
            loading={loadingMessages}
            error={error}
            typing={typing}
            mobileOnlyShowBack={Boolean(selectedUser)}
            emphasizeOwnMessages={emphasizeOwnMessages}
          />
        </div>
      </div>
    </main>
  );
}

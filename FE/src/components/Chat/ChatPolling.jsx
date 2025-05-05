// src/components/Chat/ChatPolling.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './Chat.css';

export default function ChatPolling({
  initialRecipient = '',
  fixedRecipient   = false,
  fetchAllUsers    = true,
}) {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [users, setUsers]         = useState([]);
  const [msgs, setMsgs]           = useState([]);
  const [input, setInput]         = useState('');
  const pollRef                   = useRef(null);
  const containerRef              = useRef(null);

  // 1) Nếu admin: load danh sách users
  useEffect(() => {
    if (!fetchAllUsers) return;
    api.get('/users/')
      .then(res => {
        const me = localStorage.getItem('uid');
        setUsers(res.data.filter(u => String(u.id) !== me));
      })
      .catch(console.error);
  }, [fetchAllUsers]);

  // 2) Poll messages
  const fetchMsgs = () => {
    if (!recipient) return;
    api.get('/chat/', { params: { user: recipient } })
      .then(res => setMsgs(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    setMsgs([]);
    clearInterval(pollRef.current);
    if (recipient) {
      fetchMsgs();
      pollRef.current = setInterval(fetchMsgs, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [recipient]);

  // 3) Auto‑scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [msgs]);

  // 4) Gửi message
  const send = () => {
    const text = input.trim();
    if (!text || !recipient) return;
    api.post('/chat/', { recipient, content: text })
      .then(() => {
        setInput('');
        fetchMsgs();
      })
      .catch(console.error);
  };

  return (
    <div className="chat-container">
      <h3 className="chat-title">Chat</h3>

      {!fixedRecipient && fetchAllUsers && (
        <select
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          className="chat-recipient-select"
        >
          <option value="">Select user to chat with…</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>
      )}

      <div className="chat-messages" ref={containerRef}>
        {msgs.map(m => (
          <div key={m.id} className="chat-message">
            <span className="message-sender">
              {m.sender === localStorage.getItem('username') ? 'Me' : m.sender}
            </span>
            <span className="message-text">{m.content}</span>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={recipient ? 'Type a message…' : 'Select a user first'}
          disabled={!recipient}
          className="chat-input"
        />
        <button
          onClick={send}
          disabled={!recipient}
          className="chat-send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
}

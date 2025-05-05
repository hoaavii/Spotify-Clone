import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './Chat.css';

export default function Chat({
  initialRecipient = '',
  fixedRecipient = false,
  fetchAllUsers = true
}) {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [users, setUsers]         = useState([]);
  const [msgs, setMsgs]           = useState([]);
  const [input, setInput]         = useState('');
  const ws                         = useRef(null);
  const containerRef               = useRef(null);

  // 1) Load list of users if admin page
  useEffect(() => {
    if (!fetchAllUsers) return;
    api.get('/users/')
      .then(res => {
        const me = localStorage.getItem('uid');
        setUsers(res.data.filter(u => String(u.id) !== me));
      })
      .catch(console.error);
  }, [fetchAllUsers]);

  // 2) Auto‑scroll new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [msgs]);

  // 3) Open/close WebSocket connection whenever recipient changes
  useEffect(() => {
    setMsgs([]);
    if (!recipient) return;

    const me = localStorage.getItem('uid');
    if (!me) {
      console.error('No current user ID');
      return;
    }

    // Only pass the other user's ID in the URL:
    const otherId = recipient;
    const base    = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
    const wsUrl   = `${base}/ws/chat/${otherId}/`;

    ws.current = new WebSocket(wsUrl);
    ws.current.onopen    = () => console.log('WS open to', otherId);
    ws.current.onmessage = e => {
      const data = JSON.parse(e.data);
      setMsgs(prev => [...prev, data]);
    };
    ws.current.onerror = console.error;
    ws.current.onclose = () => console.log('WS closed for', otherId);

    return () => {
      ws.current?.close();
      ws.current = null;
    };
  }, [recipient]);


  const send = () => {
    if (!input.trim() || ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ message: input }));
    setInput('');
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
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>
      )}

      <div className="chat-messages" ref={containerRef}>
        {msgs.map((m, i) => (
          <div key={i} className="chat-message">
            <span className="message-sender">
              {m.sender_id === Number(localStorage.getItem('uid')) ? 'Me' : m.sender_id}
            </span>
            <span className="message-text">{m.message}</span>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={recipient ? "Type a message…" : "Select a user first"}
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

// src/pages/UserChatPage.jsx
import React, { useEffect, useState } from 'react';
import ChatPolling from '../components/Chat/ChatPolling';
import api from '../services/api';

export default function UserChatPage() {
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    api.get('/users/')
      .then(res => {
        const admins = res.data.filter(u => u.is_staff);
        if (admins.length) setAdminId(admins[0].id);
      })
      .catch(console.error);
  }, []);

  if (adminId === null) return <p>Loading admin info…</p>;

  return (
    <ChatPolling
      initialRecipient={String(adminId)}
      fixedRecipient={true}
      fetchAllUsers={false}
    />
  );
}

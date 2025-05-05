import React from 'react';
import ChatPolling from '../components/Chat/ChatPolling';

export default function AdminChatPage() {
  // Admin can pick any non‑admin user
  return (
    <ChatPolling
      initialRecipient=""
      fixedRecipient={false}
      fetchAllUsers={true}
    />
  );
}

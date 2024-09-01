import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function MessageBoard() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user && user.membership_status) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.membership_status) {
    return <div>You need to be a member to view messages.</div>;
  }

  return (
    <div>
      <h1>Messages</h1>
      {messages.map(message => (
        <div key={message.id}>
          <h2>{message.title}</h2>
          <p>{message.content}</p>
        </div>
      ))}
    </div>
  );
}

export default MessageBoard;
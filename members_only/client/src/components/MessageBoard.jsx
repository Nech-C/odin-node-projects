import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
axios.defaults.withCredentials = true;

function MessageBoard() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user && user.membership_status) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/messages', { withCredentials: true });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  if (!user) {
    return <div>Please log in to view messages.</div>;
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
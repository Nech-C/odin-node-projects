import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function MessageBoard() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [myMessage, setMyMessage] = useState({title: '', content: ''});

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

  const postMessage = async (e) => {
    e.preventDefault();
    const title = e.target[0].value;
    const content = e.target[1].value;

    try {
      await axios.post('/api/messages', { title, content });
      fetchMessages();
      setMyMessage({title: '', content: ''});
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  const handleChange = (e) => {
    setMyMessage({
      ...myMessage,
      [e.target.name]: e.target.value
    });
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
      <h1>Messages:</h1>
      {messages.map(message => (
        <div key={message.id}>
          <h2>{message.title}</h2>
          <p>{message.content}</p>
        </div>
      ))}
      <div>
        <h2>Post a message</h2>
        <form onSubmit={postMessage}>
          <input
              type="text"
              value={myMessage.title}
              onChange={handleChange}
              placeholder="Title"
              name='title'
          />
          <textarea
              name="content"
              value={myMessage.content}
              onChange={handleChange}
              placeholder="Content" 
          />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
}

export default MessageBoard;
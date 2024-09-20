import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function MessageBoard() {
  const { user, loading, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [myMessage, setMyMessage] = useState({title: '', content: ''});
  const navigate = useNavigate();

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
    try {
      await axios.post('/api/messages', myMessage);
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

  const HandleLogout = () => {
    logout();
    navigate('/login');
  }

  const HandleBecomeMember = () => {
    navigate('/question');
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.membership_status) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <p className="text-xl text-red-600">You need to be a member to view messages.</p>
        <button className='bg-emerald-500 py-2 px-4 rounded text-white mt-10' onClick={HandleBecomeMember}>Become a member</button>
        <button className='bg-red-500 py-2 px-4 rounded text-white mt-4' onClick={HandleLogout}>Logout</button>
        <Link to='/invite' className="mt-8 text-blue-500">Have an invite code?</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end gap-5">
          <button className='bg-red-500 py-2 px-4 rounded text-white' onClick={HandleLogout}>Logout</button>
        </div>
      <h1 className="text-3xl font-bold mb-6 text-center">Message Board</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Post a message</h2>
        <form onSubmit={postMessage} className="space-y-4">
          <input
            type="text"
            value={myMessage.title}
            onChange={handleChange}
            placeholder="Title"
            name='title'
            className="w-full p-2 border border-gray-300 rounded"
          />
          <textarea
            name="content"
            value={myMessage.content}
            onChange={handleChange}
            placeholder="Content" 
            className="w-full p-2 border border-gray-300 rounded h-32"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Post Message
          </button>
        </form>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Messages</h2>
        
        {messages.map(message => (
          <div key={message.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
            <h3 className="text-xl font-semibold mb-2">{message.title}</h3>
            <p className="text-gray-700">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessageBoard;
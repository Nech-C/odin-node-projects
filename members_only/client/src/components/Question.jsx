import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Question() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [token, setToken] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const handleClick = async () => {
        const response = await axios.get('/api/question');
        setQuestion(response.data.question);
        setToken(response.data.token);
    }

    const handleChange = (e) => {
        setAnswer(e.target.value);
    }

    const handleSubmit = async () => {
        const response = await axios.post('/api/check-answer', {token, answer});
        console.log(response.data);
        if (response.data.success) {
            setInviteCode(response.data.invite_code);
        }
    }

    if (inviteCode) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-3xl font-bold mb-4">Congratulations!</h1>
                <p className="text-xl mb-4">Here's your invite code:</p>
                <div className="bg-gray-200 p-4 rounded-lg">
                    <code className="text-2xl font-mono">{inviteCode}</code>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className='text-center font-bold text-3xl mb-6 mt-6'>Question</h1>
            <div className='mx-96 rounded h-screen'>
                <div className='flex flex-col mb-8 gap-4 px-10'>
                    <p className='text-lg font-semibold'>{question}</p>
                    {question && (
                        <input
                            type="text"
                            className='border border-gray-400 rounded p-2'
                            value={answer}
                            placeholder='Enter your answer'
                            onChange={handleChange}
                        />
                    )}
                </div>
                <div className='flex flex-row gap-2 justify-end pr-12'>
                    <button onClick={handleClick} className='bg-emerald-500 text-white px-4 py-2 rounded'>
                        Get Question
                    </button>
                    {question && (
                        <button
                            onClick={handleSubmit}
                            className='bg-blue-500 text-white px-4 py-2 rounded'
                        >
                            Submit Answer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Question;
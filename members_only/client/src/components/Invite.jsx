import react, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';


function Invite() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post('/api/validate-invite-code', { invite_code: code });

        if (res.data.valid) {
            alert('You are now a member!');
            navigate('/messageboard');
        } else {
            setError('Invalid invite code');
        }
    }

    return (
        <div>
            <h1 className='text-3xl font-bold mb-6 text-center'>Become Member</h1>
            <div className='flex flex-col items-center gap-5'>
                <p>Enter your invite code below:</p>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className='border border-gray-400 rounded p-2'
                />
                <button onClick={handleSubmit} className='bg-blue-500 text-white px-4 py-2 rounded'>Submit</button>

                {error && <p>{error}</p>}
            </div>
        </div>
    );

}

export default Invite;
import {useState, useEffect} from 'react';
import {useAuth} from '../contexts/AuthContext';
import axios from 'axios';

function Question() {
    const [question, setQuestion] = useState('');

    const handleClick = async () => {
        const response = await axios.get('/api/question');
        setQuestion(response.data.question);
    }

    return (
        <div>
            <h1 className = 'text-center font-bold text-3xl mb-6 mt-6'>Question</h1>
            <div className='mx-96 rounded h-screen'>
                <div className='flex flex-col mb-8 gap-4 px-10'>
                    <p
                    className='text-lg font-semibold'>
                        {question}
                    </p>
                    {
                        question != "" ? <input
                        type="text"
                        defaultValue='Your Answer'  
                        className='border border-gray-400 rounded p-2'
                        /> : null
                    }
                </div>
                <div className='flex flex-row gap-2 justify-end pr-12'>
                    <button onClick={handleClick} className='bg-emerald-500 text-white px-4 py-2 rounded'>Get Question</button>
                    {
                        question != "" ? <button className='bg-blue-500 text-white px-4 py-2 rounded'>Submit Answer</button> : null
                    }
                </div>
            </div>
        </div>

    );
}

export default Question;
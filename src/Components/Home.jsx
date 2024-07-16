import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import "./Style.css"
const API_KEY = process.env.API_KEY;

function Home() {
  const [messages, setMessages] = useState([]);
  const [genAI, setGenAI] = useState(null);
  const [message, setMessage] = useState('');
  const [isUserMessageSent, setIsUserMessageSent] = useState(false);

  useEffect(() => {
    const ai = new GoogleGenerativeAI(API_KEY);
    setGenAI(ai);
  }, []);

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!genAI || !message.trim()) return;

    setMessages((prevMessages) => [...prevMessages, { text: message, isYou: true }]);
    setMessage('');
    setIsUserMessageSent(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();

      const truncatedText = text.split('\n').slice(0,3).join('\n');

      setMessages((prevMessages) => [...prevMessages, { text:truncatedText }]);
      setMessage('');
    } catch (error) {
      if (error.status === 503) {
        console.log('Model is overloaded. Retrying in 5 seconds...');
        setTimeout(() => {
          handleSubmit(event);
        }, 5000);
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="chat-app">
        <h2>ask me anything</h2>
      <div className="chat-window">
        {messages.map((message, index) => (
          <div key={index} className={message.isYou ? 'you' : 'gemini'}>
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="input-box">
        <input type="text" value={message} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Home;

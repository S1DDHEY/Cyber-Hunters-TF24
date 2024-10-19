import React, { useState } from 'react';
import axios from 'axios';



const Home = () => {
  
  const [codeInput, setCodeInput] = useState('');
  const [language, setLanguage] = useState('javascript'); // Mocked language detection
  const [history, setHistory] = useState([
    {
      input: 'console.log("Hello World");',
      output: 'console.log("Hello, World!");'
    },
    {
      input: 'def greet(name): print(name)',
      output: 'def greet(name): return name'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const apiKey = "AIzaSyDxxOvO3DmTqnGIeB8N3IX2vIOTiRZDMVg";
  // process.env.REACT_APP_MY_API_KEY; // Insert your GPT-4 API key here

  
  const handleFixCode = async () => {
    if (!codeInput) return;

    setLoading(true); // Start loading
    try {
      const prompt = `Analyze the following code, detect its language, identify potential vulnerabilities, and suggest fixes;

       ${codeInput}`;

      const data = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };

      const options = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
        headers: { 'Content-Type': 'application/json' },
        data: data
      };

      const response = await axios(options);
      const fixedCode = response.data.candidates[0].content.parts[0].text; // Extract the generated text from Gemini response

      setHistory([
        ...history,
        { input: codeInput, output: fixedCode }
      ]);
      setCodeInput(''); // Clear input after fixing
    } catch (error) {
      console.error('Error processing the code with Gemini:', error);
    } finally {
      setLoading(false); // End loading
    }
  };
  

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r border-gray-300">
        <button className="w-full bg-black text-white py-2 mb-6 rounded-md">
          New Chat
        </button>
        <div className="overflow-y-auto">
          {history.map((chat, index) => (
            <div key={index} className="mb-4 p-3 bg-white rounded-md shadow">
              <strong className="block">Input:</strong> {chat.input}
              <br />
              <strong className="block">Output:</strong> {chat.output}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Code Fixer Chatbot</h1>
        <div className="bg-white p-6 rounded-md shadow-md">
          <h2 className="text-lg font-semibold mb-2">Input Your Code</h2>
          <p className="mb-4 text-gray-600">
            Paste your code below. We'll automatically detect the language and fix any errors or vulnerabilities.
          </p>
          <textarea
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-md mb-4"
          />
          <p className="text-gray-600 mb-4">Detected language: {language}</p>
          <button
            onClick={handleFixCode}
            className="bg-black text-white py-2 px-4 rounded-md"
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Fix Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

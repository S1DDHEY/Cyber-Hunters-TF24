import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Loader2, Copy, CheckCircle, Shield, Code, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tooltip from './Toolkit';
import Button from './Button';

const detectLanguage = (code) => {
  if (code.includes('console.log')) return 'javascript';
  if (code.includes('print(')) return 'python';
  return 'unknown';
};

const CyberCodeAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const language = detectLanguage(input);
    setMessages(prev => [...prev, { type: 'input', content: input, language }]);
    setInput('');
    setLoading(true);

    try {
      const prompt = `Analyze the following code and suggest improvements:
      ${input}`;
      const response = await axios.post(
        `https://api.example.com/analyze`,
        { prompt },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const output = response.data.result;
      setMessages(prev => [...prev, { type: 'output', content: output }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'output', content: 'An error occurred.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (index) => {
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Cybersecurity Code Assistant</h1>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="hover:text-blue-200">Home</a></li>
              <li><a href="#" className="hover:text-blue-200">About</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700">
          <h2 className="text-lg font-semibold mb-4">
            <MessageSquare className="mr-2" />
            Chat History
          </h2>
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div key={index} className="mb-2 bg-gray-700 rounded p-2">
                <strong>{msg.type === 'input' ? 'You:' : 'Bot:'}</strong>
                {msg.content.substring(0, 50)}...
              </motion.div>
            ))}
          </AnimatePresence>
        </aside>

        <main className="flex-1 p-4">
          {messages.map((message, index) => (
            <motion.div key={index} className={`mb-4 p-4 rounded ${message.type === 'input' ? 'bg-blue-900' : 'bg-gray-700'}`}>
              <SyntaxHighlighter language={message.language} style={vscDarkPlus}>
                {message.content}
              </SyntaxHighlighter>
              {message.type === 'output' && (
                <CopyToClipboard text={message.content} onCopy={() => handleCopy(index)}>
                  <button className="absolute top-2 right-2">
                    {copied === index ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </CopyToClipboard>
              )}
            </motion.div>
          ))}

          <form onSubmit={handleSubmit} className="mt-4">
            <Tooltip content="Paste your code here for analysis">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="// Paste your code here..."
                className="w-full bg-gray-700 p-2 text-white rounded-md"
                rows={4}
              />
            </Tooltip>
            <Button className="mt-2" type="submit">
              <Shield className="mr-2" />
              {loading ? 'Processing...' : 'Analyze Code'}
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CyberCodeAssistant;

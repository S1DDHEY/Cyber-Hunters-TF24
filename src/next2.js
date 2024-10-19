import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Loader2, Copy, CheckCircle, Shield, Code, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tooltip from './Toolkit';

const detectLanguage = (code) => {
  if (code.includes('console.log')) return 'javascript';
  if (code.includes('print(')) return 'python';
  return 'unknown';
};

const Next2= () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [repoLink, setRepoLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [fileIndex, setFileIndex] = useState(0); // To track the current file being analyzed
  const [repoFiles, setRepoFiles] = useState([]); // Stores files from the GitHub repo
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const apiKey = "AIzaSyDxxOvO3DmTqnGIeB8N3IX2vIOTiRZDMVg";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!repoLink.trim() && !input.trim()) return;

    setLoading(true);

    if (repoLink) {
      // GitHub Repo Analysis
      await fetchGitHubRepo(repoLink);
    } else {
      // Regular code analysis
      await analyzeCode(input);
    }
  };

  const fetchGitHubRepo = async (repoLink) => {
    try {
      const response = await axios.post('http://localhost:3000/git/analyze', { repoLink });
      const files = response.data.analysis;
      
      setRepoFiles(files);
      if (files.length > 0) {
        setMessages(prev => [...prev, { type: 'output', content: `Analyzing file: ${files[0].fileName}` }]);
        await analyzeGitHubFile(files[0].fileName, files[0].vulnerabilities);
      }
    } catch (error) {
      setMessages(prev => [...prev, { type: 'output', content: 'Error analyzing the GitHub repository.' }]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeGitHubFile = async (fileName, vulnerabilities) => {
    setMessages(prev => [...prev, { type: 'output', content: `File: ${fileName}\nVulnerabilities:\n${vulnerabilities}` }]);
    setFileIndex((prev) => prev + 1); // Move to the next file
  };

  const handleNextFile = async () => {
    if (fileIndex < repoFiles.length) {
      setLoading(true);
      const nextFile = repoFiles[fileIndex];
      await analyzeGitHubFile(nextFile.fileName, nextFile.vulnerabilities);
      setLoading(false);
    }
  };

  const analyzeCode = async (input) => {
    const language = detectLanguage(input);
    setMessages(prev => [...prev, { type: 'input', content: input }]);
    setInput('');

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: input }] }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const output = response.data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { type: 'output', content: output }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'output', content: 'Error analyzing code with Gemini AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (index) => {
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r w-screen from-blue-600 to-blue-800 p-4 shadow-lg">
        <div className="container mx-auto items-center justify-between">
          <div className="flex items-center space-x-2 justify-center">
            <Shield className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-center">Cybersecurity Code Assistant</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <MessageSquare className="mr-2" />
            Chat History
          </h2>
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-400 text-sm">
                Your past interactions will appear here.
              </motion.div>
            ) : (
              messages.map((msg, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-2 p-2 bg-gray-700 rounded text-sm">
                  <strong>{msg.type === 'input' ? 'You:' : 'Bot:'}</strong> {msg.content.substring(0, 50)}...
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-12">
                  <Code className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                  <h2 className="text-2xl font-bold mb-2">Welcome to Cybersecurity Code Assistant</h2>
                  <p className="text-gray-400 mb-4">Start typing your code or paste a GitHub link for analysis!</p>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mb-4 p-4 rounded-lg ${message.type === 'input' ? 'bg-blue-900' : 'bg-gray-700'} ${message.type === "input" ? "" : "ml-[25%]"}`}>
                    {message.type === 'input' && (
                      <div className="mb-2">
                        <strong>Your Input:</strong>
                        <SyntaxHighlighter language={message.language} style={vscDarkPlus}>
                          {message.content}
                        </SyntaxHighlighter>
                        <p className="text-sm text-gray-400 mt-1">Detected language: {message.language}</p>
                      </div>
                    )}
                    {message.type === 'output' && (
                      <div>
                        <strong>Chatbot Response:</strong>
                        <div className="mt-2 relative">
                          <SyntaxHighlighter language="plaintext" style={vscDarkPlus}>
                            {message.content}
                          </SyntaxHighlighter>
                          <CopyToClipboard text={message.content} onCopy={() => handleCopy(index)}>
                            <button className="absolute top-2 right-2 p-1 bg-gray-600 rounded text-white hover:bg-gray-500 transition-colors">
                              {copied === index ? <CheckCircle size={18} /> : <Copy size={18} />}
                            </button>
                          </CopyToClipboard>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center space-x-2 mb-2">
                <label htmlFor="repoLink" className="text-gray-400">GitHub Repo Link (optional):</label>
                <input
                  type="text"
                  id="repoLink"
                  value={repoLink}
                  onChange={(e) => setRepoLink(e.target.value)}
                  placeholder="https://github.com/user/repo"
                  className="flex-1 p-2 bg-gray-800 text-gray-300 rounded-md focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                  placeholder="Paste your code here for analysis..."
                  className="flex-1 p-2 bg-gray-800 text-gray-300 rounded-md focus:outline-none"
                />
                <button
                  type="submit"
                  className={`p-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors ${loading ? 'cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Analyze'}
                </button>
              </div>
            </form>
            {repoFiles.length > 0 && fileIndex < repoFiles.length && (
              <button onClick={handleNextFile} className="mt-4 p-2 bg-green-600 rounded-md hover:bg-green-700 transition-colors">
                Analyze Next File
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Next2;

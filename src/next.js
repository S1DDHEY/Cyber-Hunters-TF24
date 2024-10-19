import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Loader2, Copy, CheckCircle, Shield, Code, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const detectLanguage = (code) => {
  if (code.includes('console.log')) return 'javascript';
  if (code.includes('print(')) return 'python';
  return 'unknown';
};

const Githero= () => {
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

    if (!input.trim()) return;

    setLoading(true);

    function isGitHubRepoLink(input) {
      const githubRepoRegex = /https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+/;
      return githubRepoRegex.test(input);
    }
    
    if (isGitHubRepoLink(input)) {
      // GitHub Repo Analysis
      console.log('GitHub repository link detected. Starting repository analysis...');
      await fetchGitHubRepo(input);
      console.log('GitHub repository analysis completed.');
    } else {
      // Regular code analysis
      console.log('No GitHub link detected. Starting regular code analysis...');
      await analyzeCode(input);
      console.log('Code analysis completed.');
    }
  };

  const fetchGitHubRepo = async (repoLink) => {
    try {
      const response = await axios.post('http://localhost:3000/git/analyze', { repoLink });
      const files = response.data.fileswithContent;
      setRepoFiles(files);
      console.log("files recieved")
      handleNextFile();

    } catch (error) {
      setMessages(prev => [...prev, { type: 'output', content: 'Error analyzing the GitHub repository.' }]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeGitHubFile = async (fileName, fileContent) => {
    const language = detectLanguage(fileContent);
    setMessages(prev => [...prev, { type: 'input', content: fileContent, language }]);

    try {
      const prompt = `Analyze the following code, detect its language, identify potential vulnerabilities, and suggest fixes with a focus on cybersecurity:

      ${fileContent}

      Please provide your response in the following format:
      Language: [detected language]
      Vulnerabilities:
      - [List of identified vulnerabilities]
      
      Suggested fixes:
      [Your suggested code fixes with explanations]

      Security Improvements:
      [Explain how the fixes improve security]`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const output = response.data.candidates[0].content.parts[0].text;
      console.log(output);
      setMessages(prev => [...prev, { type: 'output', content: output }]);
    } catch (error) {
      console.error('Error processing the code with Chatbot:', error);
      setMessages(prev => [...prev, { type: 'output', content: 'An error occurred while processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNextFile = async () => {
    if (fileIndex < repoFiles.length) {
      setLoading(true);
      const nextFile = repoFiles[fileIndex];
      await analyzeGitHubFile(nextFile.fileName, nextFile.fileContent);
      setFileIndex(fileIndex + 1); // Move to the next file
      setLoading(false);
      console.log("file index done");
    }
  };

  const analyzeCode = async (code) => {
    if (!code.trim()) return;

    const language = detectLanguage(code);
    setMessages(prev => [...prev, { type: 'input', content: code, language }]);

    try {
      const prompt = `Analyze the following code, detect its language, identify potential vulnerabilities, and suggest fixes with a focus on cybersecurity:

      ${code}

      Please provide your response in the following format:
      Language: [detected language]
      Vulnerabilities:
      - [List of identified vulnerabilities]
      
      Suggested fixes:
      [Your suggested code fixes with explanations]

      Security Improvements:
      [Explain how the fixes improve security]`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const output = response.data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { type: 'output', content: output }]);
    } catch (error) {
      console.error('Error processing the code with Chatbot:', error);
      setMessages(prev => [...prev, { type: 'output', content: 'An error occurred while processing your request.' }]);
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
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mb-4 p-4 rounded-lg ${message.type === 'input' ? 'bg-blue-900' : 'bg-gray-800'}`}>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{message.type === 'input' ? 'Your Code:' : 'Assistant Response:'}</h3>
                      {message.type === 'output' && (
                        <CopyToClipboard text={message.content} onCopy={() => handleCopy(index)}>
                          <button className="text-gray-500 hover:text-green-500">
                            {copied === index ? <CheckCircle /> : <Copy />}
                          </button>
                        </CopyToClipboard>
                      )}
                    </div>
                    <SyntaxHighlighter language={message.language || 'text'} style={vscDarkPlus}>
                      {message.content}
                    </SyntaxHighlighter>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={chatEndRef}></div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="bg-gray-800 p-4 border-t border-gray-700 flex items-center">
            <input
              type="text"
              className="flex-1 bg-gray-700 rounded-lg p-2 text-white focus:outline-none mr-2"
              placeholder="Enter code or GitHub repository link here..."
              value={repoLink || input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold hover:bg-blue-700 focus:outline-none"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Analyze'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      {/* <footer className="bg-gradient-to-r from-blue-600 to-blue-800 text-center p-4">
        <p className="text-white text-sm">&copy; 2024 Cybersecurity Code Assistant</p>
      </footer> */}
    </div>
  );
};

export default Githero;

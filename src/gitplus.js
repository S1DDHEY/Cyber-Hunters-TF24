import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Loader2, Copy, CheckCircle, Shield, Code, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tooltip from './Toolkit';
import Button from './Button';

const Gitplus= () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [repoLink, setRepoLink] = useState(null);
  const [fileIndex, setFileIndex] = useState(0); // To track the current file being analyzed
  const [repoFiles, setRepoFiles] = useState([]); // Stores files from the GitHub repo
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (!inputRef.current || inputRef.current.value.trim() === "") {
        return;
      }
      handleSubmit(event);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [input]);

  function isGitHubRepoLink(input) {
    const githubRepoRegex = /(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)?/;
    const match = input.match(githubRepoRegex);
    if (match) {
      setRepoLink(match[0]);
    }
    return githubRepoRegex.test(input);
  }

  const analyzeGitHubFile = async (fileName, fileContent) => {
    setLoading(true);
    try {
      // Create the prompt for the Gemini API
      const prompt = `Analyze the following file for security vulnerabilities and provide fixes with a README-style explanation:

      File: ${fileName}
      File Content:
      ${fileContent}`;

      const apiKey = 'YOUR_GOOGLE_API_KEY_HERE'; // Insert your actual API key
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const analysis = response.data.candidates[0].content.parts[0].text;

      // Store the analysis result in the messages
      setMessages((prev) => [
        ...prev,
        { type: 'output', content: `### ${fileName}\n\n${analysis}` }
      ]);

      setFileIndex((prev) => prev + 1); // Move to the next file
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: 'output', content: `Error analyzing the file: ${fileName}` }
      ]);
      console.error('Error analyzing file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextFile = async () => {
    if (fileIndex < repoFiles.length) {
      const nextFile = repoFiles[fileIndex];
      await analyzeGitHubFile(nextFile.fileName, nextFile.fileContent);
    }
  };

  const fetchGitHubRepo = async (repoLink) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/git/analyze', { repoLink });
      const files = response.data.fileswithContent;
      setRepoFiles(files);
      await analyzeGitHubFile(files[0].fileName, files[0].fileContent); // Start with the first file
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: 'output', content: 'Error fetching the GitHub repository.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isGitHubRepoLink(input)) {
      await fetchGitHubRepo(input);
    } else {
      // Handle non-GitHub input
      console.log('No GitHub link detected.');
    }
    setInput('');
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
            <Shield className="h-8 w-8 " />
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-400 text-sm"
              >
                Your past interactions will appear here.
              </motion.div>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-2 py-2 pl-2 pr-4 bg-gray-700 rounded text-sm overflow-x-hidden"
                >
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Code className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                  <h2 className="text-2xl font-bold mb-2">Welcome to Cybersecurity Code Assistant</h2>
                  <p className="text-gray-400 mb-4">Start typing your code to get instant feedback!</p>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 p-4 rounded-lg w-[60vw]  ${
                      message.type === 'input' ? 'bg-blue-900' : 'bg-gray-700'
                    } ${message.type === 'input' ? '' : 'ml-[25%]'} }
                  `}
                  >
                    {message.type === 'input' && (
                      <div className="mb-2 flex justify-end space-x-1 items-center">
                        <Tooltip content="Request Analysis">
                          <Loader2 />
                        </Tooltip>
                      </div>
                    )}
                    <SyntaxHighlighter
                      language="markdown"
                      style={vscDarkPlus}
                      customStyle={{ backgroundColor: 'transparent' }}
                    >
                      {message.content}
                    </SyntaxHighlighter>
                    <div className="flex justify-end mt-2">
                      <CopyToClipboard text={message.content} onCopy={() => handleCopy(index)}>
                        <Button>
                          {copied === index ? (
                            <>
                              <CheckCircle className="w-4 h-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Copy
                            </>
                          )}
                        </Button>
                      </CopyToClipboard>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-gray-700 p-4 flex space-x-4 items-center">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-gray-800 text-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gitplus;

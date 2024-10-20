import React, { useState } from 'react';
import Button from './Button';  // Assuming Button component is imported

const FormWithButton = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Form submit logic here...
  };

  return (
    <form onSubmit={handleSubmit} className="relative p-4 bg-gray-800 border-t border-gray-700">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="// Paste your code here..."
        className="w-full p-2 pr-16 bg-gray-700 text-white border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        style={{
          minHeight: '100px',  // minimum height of textarea
          maxHeight: '300px',  // maximum height of textarea
          overflowY: 'auto'    // enable vertical scrolling when needed
        }}
      />

      <div className="absolute bottom-2 right-2">
        <Button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Code'}
        </Button>
      </div>
    </form>
  );
};

export default FormWithButton;

import React, { useState } from 'react';

const Tooltip = ({ children, message }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute border border-white -top-10 left-0 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap">
          {message}
        </div>
      )}
    </div>
  );
};

export default Tooltip;

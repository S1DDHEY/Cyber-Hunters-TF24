// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Next1 from './next1';

const App = () => {
    return (
        <Router>
            <div className="flex h-screen w-screen">
               

                <div className="flex-1 flex flex-col">
                    <Routes>
                        <Route path='/' element={<Next1 />} />
                        
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;

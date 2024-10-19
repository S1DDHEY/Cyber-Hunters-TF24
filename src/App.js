// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AnalysisPage from './next';
import Next1 from './next1';
import Githero from './next';
import Next2 from './next2';
import Gitplus from './gitplus';

const App = () => {
    return (
        <Router>
            <div className="flex h-screen w-screen">
               

                <div className="flex-1 flex flex-col">
                    <Routes>
                        <Route path="/" element={<Githero/>} />
                        <Route path='/best' element={<Gitplus />}/>
                        <Route path='/next1' element={<Next1 />} />
                        <Route path='/next2' element={<Next2 />} />
                        
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;

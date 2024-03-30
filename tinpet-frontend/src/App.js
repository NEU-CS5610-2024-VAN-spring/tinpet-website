import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import DetailsPage from './components/DetailsPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/details/:identifier" element={<DetailsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

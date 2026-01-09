import React, { useState } from 'react';
import './App.scss';
import { Routes, Route } from 'react-router-dom';
import GamePage from './pages/GamePage';
import MainPage from './pages/MainPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/gamepage" element={<GamePage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </div>
  );
}

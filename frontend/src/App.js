// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MovieDetailPage from './pages/MovieDetailPage';
import SeriesDetailPage from './pages/SeriesDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
//import Header from './components/Header';
import WatchedPage from './pages/WatchedPage';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import SettingsPage from './pages/SettingsPage';
import MoviesPage from './pages/MoviesPage';
import SeriesPage from './pages/SeriesPage';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider> {/* Assurez-vous d'englober toute l'application avec SettingsProvider */}
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />
            <main className="flex-grow bg-gray-100 dark:bg-gray-900"> {/* Ajout de la classe pour le mode sombre */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/movie/:id" element={<MovieDetailPage />} />
                <Route path="/series/:id" element={<SeriesDetailPage />} />
                <Route path="/seriespage" component={<SeriesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/watched" element={<WatchedPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/moviespage" element={<MoviesPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

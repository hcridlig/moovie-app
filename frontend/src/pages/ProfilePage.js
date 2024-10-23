// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, updatePassword } from '../utils/api';

function ProfilePage() {
  const [user, setUser] = useState({
    username: '',
    email: '',
    platforms: [],
  });
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    username: '',
    email: '',
    platforms: '',
  });

  const [passwordEditing, setPasswordEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Récupérer les informations de l'utilisateur connecté via l'API
    async function fetchUserProfile() {
      const profileData = await getUserProfile();
      setUser(profileData);
      setUpdatedUser({
        username: profileData.username,
        email: profileData.email,
        platforms: profileData.platforms.join(', '), // Afficher les plateformes en tant que chaîne
      });
    }
    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Transformer les plateformes en tableau avant de soumettre les données
    const platformsArray = updatedUser.platforms.split(',').map((p) => p.trim());
    const updatedData = {
      ...updatedUser,
      platforms: platformsArray,
    };
    await updateUserProfile(updatedData);
    setUser(updatedData); // Mettre à jour les informations affichées
    setEditing(false); // Désactiver le mode édition
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
      setPasswordEditing(false);
    } catch (error) {
      setPasswordError('Erreur lors de la modification du mot de passe. Vérifiez votre mot de passe actuel.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Mon Profil</h1>

      {!editing ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Nom d'utilisateur:</label>
            <p className="text-gray-600">{user.username}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Email:</label>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Plateformes de streaming:</label>
            <p className="text-gray-600">{user.platforms.join(', ')}</p>
          </div>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={() => setEditing(true)}
          >
            Modifier mes informations
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Nom d'utilisateur:</label>
            <input
              type="text"
              name="username"
              value={updatedUser.username}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Email:</label>
            <input
              type="email"
              name="email"
              value={updatedUser.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Plateformes de streaming (séparées par des virgules):</label>
            <input
              type="text"
              name="platforms"
              value={updatedUser.platforms}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Enregistrer
            </button>
            <button
              type="button"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              onClick={() => setEditing(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <h2 className="text-2xl font-bold mt-8">Modifier mon mot de passe</h2>

      {!passwordEditing ? (
        <button
          className="bg-indigo-600 text-white px-4 py-2 mt-4 rounded hover:bg-indigo-700"
          onClick={() => setPasswordEditing(true)}
        >
          Modifier le mot de passe
        </button>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="bg-white p-6 mt-4 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Mot de passe actuel:</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Nouveau mot de passe:</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Confirmer le nouveau mot de passe:</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          {passwordError && <p className="text-red-500 mb-4">{passwordError}</p>}
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Enregistrer le mot de passe
            </button>
            <button
              type="button"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              onClick={() => setPasswordEditing(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;

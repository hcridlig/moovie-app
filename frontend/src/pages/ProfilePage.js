import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, updatePassword } from '../utils/api';

function ProfilePage() {
  const [user, setUser] = useState({
    username: '',
    email: '',
    created_at: '',
  });
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    username: '',
    email: '',
  });
  const [passwordEditing, setPasswordEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      async function fetchUserProfile() {
        try {
          const profileData = await getUserProfile();
          setUser(profileData);
          setUpdatedUser({
            username: profileData.username,
            email: profileData.email,
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des données de l'utilisateur", error);
        }
      }
      fetchUserProfile();
    }
  }, [navigate]);

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
    try {
      await updateUserProfile(updatedUser); // Mettre à jour le profil via l'API
      setUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil", error);
    }
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
      setPasswordError('Erreur lors de la modification du mot de passe.');
    }
  };

  const handleCancelEdit = () => {
    setUpdatedUser({
      username: user.username,
      email: user.email,
    });
    setEditing(false);
  };

  const handleCancelPasswordEdit = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setPasswordEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Mon Profil</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">Nom d'utilisateur:</label>
          <p className="text-gray-600">{user.username}</p>
          {editing && (
            <input
              type="text"
              name="username"
              value={updatedUser.username}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-2"
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">Email:</label>
          <p className="text-gray-600">{user.email}</p>
          {editing && (
            <input
              type="email"
              name="email"
              value={updatedUser.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-2"
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">Date de création du compte:</label>
          <p className="text-gray-600">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>

        {!editing ? (
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={() => setEditing(true)}
          >
            Modifier mes informations
          </button>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Enregistrer
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Annuler la modification
            </button>
          </div>
        )}
      </div>

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
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Enregistrer le mot de passe
            </button>
            <button
              onClick={handleCancelPasswordEdit}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Annuler la modification
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;

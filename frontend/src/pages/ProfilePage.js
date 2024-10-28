// src/pages/ProfilePage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, updatePassword } from '../utils/api';
import { SettingsContext } from '../contexts/SettingsContext'; // Contexte pour le thème
import { useTranslation } from 'react-i18next';

function ProfilePage() {
  const { t } = useTranslation();
  const { theme } = useContext(SettingsContext); // Accès au thème
  const [user, setUser] = useState({ username: '', email: '', created_at: '' });
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ username: '', email: '' });
  const [passwordEditing, setPasswordEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
          setUpdatedUser({ username: profileData.username, email: profileData.email });
        } catch (error) {
          console.error(t('errorFetchingData'), error);
        }
      }
      fetchUserProfile();
    }
  }, [navigate, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevState) => ({ ...prevState, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(updatedUser);
      setUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error(t('errorUpdatingProfile'), error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('passwordMismatch'));
      return;
    }

    try {
      await updatePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError('');
      setPasswordEditing(false);
    } catch (error) {
      setPasswordError(t('passwordUpdateError'));
    }
  };

  const handleCancelEdit = () => {
    setUpdatedUser({ username: user.username, email: user.email });
    setEditing(false);
  };

  const handleCancelPasswordEdit = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordEditing(false);
  };

  return (
    <div className={`container mx-auto px-4 py-8 mt-12 max-w-lg mx-auto ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4">{t('profile')}</h1>

      <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="mb-4">
          <label className="block font-semibold">{t('username')}</label>
          <p className="mb-2">{user.username}</p>
          {editing && (
            <input
              type="text"
              name="username"
              value={updatedUser.username}
              onChange={handleChange}
              className={`w-full p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block font-semibold">{t('emailAddress')}</label>
          <p className="mb-2">{user.email}</p>
          {editing && (
            <input
              type="email"
              name="email"
              value={updatedUser.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded mt-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block font-semibold">{t('accountCreationDate')}</label>
          <p>{new Date(user.created_at).toLocaleDateString()}</p>
        </div>

        {!editing ? (
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" onClick={() => setEditing(true)}>
            {t('editProfile')}
          </button>
        ) : (
          <div className="flex space-x-4">
            <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {t('saveChanges')}
            </button>
            <button onClick={handleCancelEdit} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              {t('cancelChanges')}
            </button>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mt-8">{t('changePassword')}</h2>

      {!passwordEditing ? (
        <button className="bg-indigo-600 text-white px-4 py-2 mt-4 rounded hover:bg-indigo-700" onClick={() => setPasswordEditing(true)}>
          {t('changePassword')}
        </button>
      ) : (
        <form onSubmit={handlePasswordSubmit} className={`p-6 mt-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="mb-4">
            <label className="block font-semibold">{t('currentPassword')}</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">{t('newPassword')}</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">{t('confirmNewPassword')}</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />
          </div>
          {passwordError && <p className="text-red-500 mb-4">{passwordError}</p>}
          <div className="flex space-x-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {t('savePassword')}
            </button>
            <button onClick={handleCancelPasswordEdit} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              {t('cancelChanges')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;

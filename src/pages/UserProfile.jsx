import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../store/userSlice';
import defaultProfilePic from '../assets/default.png';
import axios from 'axios';

const UserProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysOnPlatform = () => {
    const createdDate = new Date(user.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form when canceling
      setEditForm({
        name: user?.name || '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordFields(false);
    }
    setIsEditing(!isEditing);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const updateData = {};
      
      // Check if name is changed
      if (editForm.name.trim() && editForm.name.trim() !== user.name) {
        updateData.name = editForm.name.trim();
      }

      // Check if password is being updated
      if (showPasswordFields && editForm.newPassword) {
        if (editForm.newPassword !== editForm.confirmPassword) {
          alert('Passwords do not match!');
          setIsUpdating(false);
          return;
        }
        if (editForm.newPassword.length < 6) {
          alert('Password must be at least 6 characters long!');
          setIsUpdating(false);
          return;
        }
        updateData.password = editForm.newPassword;
      }

      // If no changes, just close edit mode
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setIsUpdating(false);
        return;
      }

      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.patch(
        `http://localhost:3000/user/${user.id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      // Update Redux store with updated user data
      dispatch(updateUser(response.data));

      // Show success notification
      const successDiv = document.createElement('div');
      successDiv.innerHTML = `
        <div class="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[60] flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>Profile updated successfully!</span>
        </div>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 3000);

      setIsEditing(false);
      setShowPasswordFields(false);
      setEditForm({
        name: response.data.name || '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div class="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[60] flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span>Failed to update profile. Please try again.</span>
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Profile</h1>
          <p className="text-gray-400">Manage your account settings and change password by clicking on Edit profile</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Cover Section */}
          <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute top-4 right-4">
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditToggle}
                    disabled={isUpdating}
                    className="px-3 py-2 bg-gray-600 bg-opacity-80 backdrop-blur-sm text-white rounded-lg hover:bg-gray-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Profile Info */}
              <div className="lg:w-1/2">
                {/* Profile Picture and Basic Info */}
                <div className="flex items-start space-x-6 mb-8">
                  <div className="relative">
                    <img
                      src={user.profilePic || defaultProfilePic}
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-600 shadow-lg"
                      onError={(e) => {
                        e.target.src = defaultProfilePic;
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    {!isEditing ? (
                      <>
                        <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                        <p className="text-gray-400 mb-2">{user.email}</p>
                        <div className="flex items-center space-x-2">
                          {user.isEmailVerified && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </span>
                          )}
                          {user.isGoogleUser && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              Google
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                            placeholder="Enter your name"
                            required
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">Change Password</label>
                            <button
                              type="button"
                              onClick={() => setShowPasswordFields(!showPasswordFields)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              {showPasswordFields ? 'Cancel' : 'Change Password'}
                            </button>
                          </div>
                          
                          {showPasswordFields && (
                            <>
                              <div>
                                <input
                                  type="password"
                                  value={editForm.newPassword}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                                  placeholder="Enter new password"
                                  minLength={6}
                                />
                              </div>
                              <div>
                                <input
                                  type="password"
                                  value={editForm.confirmPassword}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                                  placeholder="Confirm new password"
                                  minLength={6}
                                />
                              </div>
                              {editForm.newPassword && editForm.confirmPassword && editForm.newPassword !== editForm.confirmPassword && (
                                <p className="text-red-400 text-sm">Passwords do not match</p>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isUpdating ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Save Changes</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-700 p-4 rounded-xl">
                      <p className="text-gray-400 text-sm">User ID</p>
                      <p className="text-white font-medium">#{user.id}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-xl">
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="text-white font-medium">{formatDate(user.createdAt)}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-xl">
                      <p className="text-gray-400 text-sm">Days on Platform</p>
                      <p className="text-white font-medium">{calculateDaysOnPlatform()} days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Stats */}
              <div className="lg:w-1/2">
                <h3 className="text-lg font-semibold text-white mb-6">Your Music Library</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Songs Stats */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{user.songs?.length || 0}</div>
                        <div className="text-blue-100 text-sm">Songs</div>
                      </div>
                    </div>
                    <div className="text-blue-100 text-sm">
                      Total tracks in your collection
                    </div>
                  </div>

                  {/* Playlists Stats */}
                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-2xl text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{user.playlists?.length || 0}</div>
                        <div className="text-purple-100 text-sm">Playlists</div>
                      </div>
                    </div>
                    <div className="text-purple-100 text-sm">
                      Curated collections you've created
                    </div>
                  </div>

                  {/* Total Duration Stats */}
                  <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-2xl text-white sm:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">
                          {user.songs?.reduce((total, song) => {
                            const duration = song.duration || "0:00";
                            const [minutes, seconds] = duration.split(':').map(Number);
                            return total + (minutes || 0) + ((seconds || 0) / 60);
                          }, 0).toFixed(0)} min
                        </div>
                        <div className="text-green-100 text-sm">Total Music</div>
                      </div>
                    </div>
                    <div className="text-green-100 text-sm">
                      Total duration of your music library
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {user.songs?.slice(-3).reverse().map((song) => (
                      <div key={song.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            Added "{song.name.replace(/\.[^/.]+$/, "")}"
                          </p>
                          <p className="text-gray-400 text-xs">
                            {formatDate(song.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {user.playlists?.slice(-2).reverse().map((playlist) => (
                      <div key={`playlist-${playlist.id}`} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            Created playlist "{playlist.name}"
                          </p>
                          <p className="text-gray-400 text-xs">
                            {formatDate(playlist.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {(!user.songs || user.songs.length === 0) && (!user.playlists || user.playlists.length === 0) && (
                      <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <p>No recent activity</p>
                        <p className="text-sm mt-1">Start uploading songs to see your activity here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        </div>
    </div>
  );
};

export default UserProfile;
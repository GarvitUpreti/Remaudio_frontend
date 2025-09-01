import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { addSong } from '../store/songSlice';
import axios from 'axios';

const Upload = () => {
  const dispatch = useDispatch();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedSong, setUploadedSong] = useState([]);
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('audio/')) {
        alert(`${file.name} is not an audio file`);
        continue;
      }

      await uploadFile(file);
    }
  };

  const updateUserInRedux = async (newFiles) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User id not found in localStorage');
        return;
      }

      const response = await axios.patch(
        `${API_URL}/user/${userId}`,
        {
          songToAdd: newFiles
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        dispatch(setUser(response.data));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('audio', file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post(
         `${API_URL}/songs/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000,
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(Math.round(progress));
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const result = response.data;

        dispatch(addSong(result));

        setUploadedFiles(prev => {
          const newFiles = [...prev, result.id];
          updateUserInRedux(newFiles);
          return newFiles;
        });

        setUploadedSong(prev => {
          const newFiles = [...prev, result.name];
          return newFiles;
        });

      } else {
        setUploadedFiles(prev => [...prev, { name: file.name, status: 'error' }]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => [...prev, { name: file.name, status: 'error' }]);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
    setUploadedSong([]);
  };

  return (
    <div className="px-4 py-6 sm:p-6 pb-24 sm:pb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Upload Songs</h1>

      <div className="max-w-4xl mx-auto">
        {/* Upload Area */}
        <div className="mb-6 sm:mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleChange}
              accept="audio/*"
              multiple
              disabled={uploading}
            />

            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="text-4xl sm:text-6xl text-gray-400 mb-3 sm:mb-4">🎵</div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                {uploading ? 'Uploading...' : 'Drop your music here'}
              </h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base px-2">
                {uploading ? `${uploadProgress}% complete` : 'Or tap to browse files'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 px-2">
                Supports MP3, WAV, FLAC, and other audio formats
              </p>
            </label>

            {uploading && (
              <div className="mt-4 sm:mt-6">
                <div className="bg-gray-700 rounded-full h-2 sm:h-3 mx-4 sm:mx-8">
                  <div
                    className="bg-blue-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-300">
                  {uploadProgress}% uploaded
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload History */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-gray-900 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Uploads</h3>
              <button
                onClick={clearUploadedFiles}
                className="text-gray-400 hover:text-white transition-colors text-sm bg-gray-800 px-3 py-1 rounded-md"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {uploadedSong.map((name, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-800 p-3 sm:p-4 rounded-lg gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm sm:text-base block truncate">
                      <span className="text-gray-400">Song:</span> {name}
                    </span>
                  </div>
                  <span className="bg-green-600 text-white text-xs sm:text-sm px-2 py-1 rounded-md inline-flex items-center w-fit">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Uploaded
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom spacer for mobile */}
      <div className="h-8 sm:h-0"></div>
    </div>
  );
};

export default Upload;
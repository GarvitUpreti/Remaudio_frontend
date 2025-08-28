import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { addSong } from '../store/songSlice'; // Import addSong action
import axios from 'axios'; // Import axios

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

      // Upload file directly without conversion
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
          timeout: 300000, // 5 minutes timeout
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            console.log('Upload progress:', progress);
            setUploadProgress(Math.round(progress));
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const result = response.data;

        // ✅ Add song to Redux store
        dispatch(addSong(result));

        // ✅ Update local state with song ID
        setUploadedFiles(prev => {
          const newFiles = [...prev, result.id];
          updateUserInRedux(newFiles);
          return newFiles;
        });

        // ✅ Update uploaded songs display
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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Upload Songs</h1>

      <div className="max-w-4xl mx-auto">
        {/* Upload Area */}
        <div className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
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

            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-6xl text-gray-400 mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {uploading ? 'Uploading...' : 'Drop your music here'}
              </h3>
              <p className="text-gray-400 mb-4">
                {uploading ? `${uploadProgress}% complete` : 'Or click to browse files'}
              </p>
              <p className="text-sm text-gray-500">
                Supports MP3, WAV, FLAC, and other audio formats
              </p>
            </label>

            {uploading && (
              <div className="mt-4">
                <div className="bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload History */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8 bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Recent Uploads</h3>
              <button
                onClick={clearUploadedFiles}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2">
              {uploadedSong.map((name, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                  <span className="text-white">Song Name: {name}</span>
                  <span className="bg-green-600 text-white text-sm px-2 py-1 rounded">✓ Uploaded</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
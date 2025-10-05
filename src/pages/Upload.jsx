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
  const [processingStatus, setProcessingStatus] = useState(''); // ✅ NEW: Track what's happening
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedSong, setUploadedSong] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [currentUploadingFile, setCurrentUploadingFile] = useState('');
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  // ✅ FIXED: Match backend limit (100MB)
  const MAX_FILE_SIZE = 100 * 1024 * 1024;

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
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    setUploadErrors([]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type
      if (!file.type.startsWith('audio/')) {
        const errorMsg = `${file.name} is not an audio file`;
        setUploadErrors(prev => [...prev, errorMsg]);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = `${file.name} is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
        setUploadErrors(prev => [...prev, errorMsg]);
        continue;
      }

      // ✅ Check if file is empty
      if (file.size === 0) {
        const errorMsg = `${file.name} is empty`;
        setUploadErrors(prev => [...prev, errorMsg]);
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
          timeout: 30000,
        }
      );

      if (response.status === 200) {
        dispatch(setUser(response.data));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setUploadErrors(prev => [...prev, 'Failed to update user profile']);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('audio', file);

    setUploading(true);
    setUploadProgress(0);
    setProcessingStatus(''); // ✅ Reset processing status
    setCurrentUploadingFile(file.name);

    const cancelTokenSource = axios.CancelToken.source();

    // ✅ Log upload start
    console.log('='.repeat(60));
    console.log('🎵 Starting upload:', file.name);
    console.log('📊 File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('🎵 File type:', file.type);
    console.log('='.repeat(60));

    try {
      const response = await axios.post(
        `${API_URL}/songs/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 600000, // 10 minutes
          cancelToken: cancelTokenSource.token,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              setUploadProgress(Math.round(progress));

              // ✅ Show processing message when upload reaches 100%
              if (progress === 100) {
                setProcessingStatus('Uploading to cloud storage...  PLease wait... ');
                console.log('✅ Data sent to server, waiting for processing...');
              } else if (progress > 50) {
                setProcessingStatus('Uploading...');
              }
            }
          },
        }
      );

      // ✅ Server responded, update status
      setProcessingStatus('Saving song...');
      console.log('📦 Server response received:', response.status);

      // ✅ CRITICAL: Validate response data
      if (!response.data) {
        console.error('❌ No data in response');
        throw new Error('Server returned empty response');
      }

      console.log('📦 Response data:', response.data);

      // ✅ Validate required fields
      if (!response.data.id) {
        console.error('❌ Missing song ID in response');
        throw new Error('Server response missing song ID');
      }

      if (!response.data.name) {
        console.error('❌ Missing song name in response');
        throw new Error('Server response missing song name');
      }

      if (!response.data.audioURL) {
        console.error('❌ Missing audio URL in response');
        throw new Error('Server response missing audio URL');
      }

      if (response.status === 200 || response.status === 201) {
        const result = response.data;

        console.log('✅ Upload successful!');
        console.log('🆔 Song ID:', result.id);
        console.log('🎵 Song Name:', result.name);
        console.log('🔗 Audio URL:', result.audioURL);

        // ✅ Update Redux store
        dispatch(addSong(result));
        console.log('✅ Song added to Redux store');

        // ✅ Update uploaded files list
        const newFileId = result.id;
        setUploadedFiles(prev => {
          const newFiles = [...prev, newFileId];
          // Call updateUserInRedux after state is updated
          setTimeout(() => updateUserInRedux(newFiles), 0);
          return newFiles;
        });

        setUploadedSong(prev => [...prev, result.name]);

        // ✅ Clear errors for this file
        setUploadErrors(prev => prev.filter(error => !error.includes(file.name)));

        // ✅ Set success status
        setProcessingStatus('Upload complete! ✓');
        console.log('='.repeat(60));
        console.log('🎉 Upload process completed successfully');
        console.log('='.repeat(60));

      } else {
        console.error('❌ Unexpected response status:', response.status);
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('='.repeat(60));
      console.error('❌ Upload failed for:', file.name);
      console.error('Error details:', error);

      let errorMessage = `Failed to upload ${file.name}: `;

      if (axios.isCancel(error)) {
        errorMessage += 'Upload was cancelled';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Upload timed out. Please try again.';
      } else if (error.response?.status === 413) {
        errorMessage += 'File is too large for the server.';
      } else if (error.response?.status === 401) {
        errorMessage += 'Authentication failed. Please login again.';
      } else if (error.response?.status === 400) {
        // ✅ Capture backend error message
        const backendMessage = error.response?.data?.message || error.response?.data?.error;
        errorMessage += backendMessage || 'Invalid request. Please check the file.';
        console.error('Backend error:', backendMessage);
      } else if (error.response?.status === 500) {
        // ✅ Capture backend error message
        const backendMessage = error.response?.data?.message || error.response?.data?.error;
        errorMessage += backendMessage || 'Server error. Please try again later.';
        console.error('Backend error:', backendMessage);
      } else if (error.response?.data?.message) {
        // ✅ Generic backend error message
        errorMessage += error.response.data.message;
        console.error('Backend message:', error.response.data.message);
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred';
      }

      console.error('Final error message:', errorMessage);
      console.error('='.repeat(60));

      setUploadErrors(prev => [...prev, errorMessage]);
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        status: 'error',
        error: errorMessage
      }]);

      setProcessingStatus('Upload failed ✗');
    } finally {
      // ✅ Delay before resetting to show final status
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setCurrentUploadingFile('');
        setProcessingStatus('');
      }, 2000); // Show final status for 2 seconds
    }
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
    setUploadedSong([]);
  };

  const clearErrors = () => {
    setUploadErrors([]);
  };

  return (
    <div
      className="px-4 py-6 sm:p-6 pb-24 sm:pb-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Upload Songs</h1>

      <div className="max-w-4xl mx-auto">
        {/* Upload Area */}
        <div className="mb-6 sm:mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : uploading
                  ? 'border-yellow-500 bg-yellow-500/10'
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

            <label htmlFor="file-upload" className={uploading ? "cursor-not-allowed block" : "cursor-pointer block"}>
              <div className="text-4xl sm:text-6xl text-gray-400 mb-3 sm:mb-4">
                {/* ✅ Change emoji based on status */}
                {uploading && uploadProgress === 100 ? '⏳' : '🎵'}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                {uploading ? `Uploading ${currentUploadingFile}...` : 'Drop your music here'}
              </h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base px-2">
                {/* ✅ Show processing status or progress */}
                {uploading
                  ? (processingStatus || `${uploadProgress}% complete`)
                  : 'Or tap to browse files'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 px-2">
                Supports audio files (Max: {MAX_FILE_SIZE / 1024 / 1024}MB)
              </p>
            </label>

            {uploading && (
              <div className="mt-4 sm:mt-6">
                <div className="bg-gray-700 rounded-full h-2 sm:h-3 mx-4 sm:mx-8 overflow-hidden">
                  <div
                    className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${uploadProgress === 100
                        ? 'bg-yellow-500 animate-pulse' // ✅ Pulsing when processing
                        : 'bg-blue-500'
                      }`}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-300">
                  {processingStatus || `${uploadProgress}% uploaded`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {uploadErrors.length > 0 && (
          <div className="mb-6 sm:mb-8 bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-red-200 font-semibold">Upload Errors:</h4>
              <button
                onClick={clearErrors}
                className="text-red-300 hover:text-red-100 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1">
              {uploadErrors.map((error, index) => (
                <p key={index} className="text-red-300 text-sm">{error}</p>
              ))}
            </div>
          </div>
        )}

        {/* Upload History */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-gray-900 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Uploads</h3>
              <button
                onClick={clearUploadedFiles}
                className="text-gray-400 hover:text-white transition-colors text-sm bg-gray-800 px-3 py-1 rounded-md"
                disabled={uploading}
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

      <div className="h-8 sm:h-0"></div>
    </div>
  );
};

export default Upload;
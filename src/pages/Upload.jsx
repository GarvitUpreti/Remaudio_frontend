import React, { useState } from 'react';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [songMetadata, setSongMetadata] = useState({
    title: '',
    artist: '',
    album: '',
    genre: ''
  });

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

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata if provided
    if (songMetadata.title) formData.append('title', songMetadata.title);
    if (songMetadata.artist) formData.append('artist', songMetadata.artist);
    if (songMetadata.album) formData.append('album', songMetadata.album);
    if (songMetadata.genre) formData.append('genre', songMetadata.genre);
    
    setUploading(true);
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => resolve(xhr);
        xhr.onerror = () => reject(xhr);
        
        xhr.open('POST', 'http://localhost:3000/songs/upload');
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
        xhr.send(formData);
      });

      if (response.status === 200 || response.status === 201) {
        const result = JSON.parse(response.responseText);
        setUploadedFiles(prev => [...prev, { name: file.name, status: 'success', id: result.id }]);
        
        // Clear metadata form
        setSongMetadata({
          title: '',
          artist: '',
          album: '',
          genre: ''
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
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Upload Songs</h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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

          {/* Metadata Form */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Song Information (Optional)</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Song Title"
                value={songMetadata.title}
                onChange={(e) => setSongMetadata({...songMetadata, title: e.target.value})}
                className="w-full bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="text"
                placeholder="Artist"
                value={songMetadata.artist}
                onChange={(e) => setSongMetadata({...songMetadata, artist: e.target.value})}
                className="w-full bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="text"
                placeholder="Album"
                value={songMetadata.album}
                onChange={(e) => setSongMetadata({...songMetadata, album: e.target.value})}
                className="w-full bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="text"
                placeholder="Genre"
                value={songMetadata.genre}
                onChange={(e) => setSongMetadata({...songMetadata, genre: e.target.value})}
                className="w-full bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                  <span className="text-white">{file.name}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    file.status === 'success' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {file.status === 'success' ? '✓ Uploaded' : '✗ Failed'}
                  </span>
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
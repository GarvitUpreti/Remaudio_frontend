import React from 'react';

const Home = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Welcome to Remaudio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Your Music</h3>
          <p className="text-gray-400">Listen to your uploaded songs</p>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Playlists</h3>
          <p className="text-gray-400">Create and manage your playlists</p>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Upload</h3>
          <p className="text-gray-400">Add new songs to your library</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
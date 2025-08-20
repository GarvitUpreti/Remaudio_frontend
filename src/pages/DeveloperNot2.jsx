import React from 'react';

const DeveloperNote = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Developer's Note</h1>
      
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">Welcome to Remaudio! 🎵</h2>
          <p className="text-gray-300 leading-relaxed">
            Thank you for trying out Remaudio - a modern music streaming application built with passion and dedication. 
            This project showcases the integration of modern web technologies to create a seamless music experience.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">Tech Stack 🛠️</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Frontend</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• React 18</li>
                <li>• Tailwind CSS</li>
                <li>• React Router</li>
                <li>• Modern JavaScript (ES6+)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Backend</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Node.js</li>
                <li>• NestJS Framework</li>
                <li>• RESTful API</li>
                <li>• JWT Authentication</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">Features ✨</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Current Features</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  User Authentication & Authorization
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Music Upload & Storage
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Audio Player with Controls
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Playlist Management
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Responsive Design
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Upcoming Features</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center">
                  <span className="text-yellow-400 mr-2">⏳</span>
                  Music Recommendations
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-400 mr-2">⏳</span>
                  Social Features & Sharing
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-400 mr-2">⏳</span>
                  Advanced Search & Filtering
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-400 mr-2">⏳</span>
                  Music Visualization
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-400 mr-2">⏳</span>
                  Mobile App
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">API Endpoints 🔗</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Authentication</h3>
              <div className="bg-gray-800 p-4 rounded text-sm font-mono text-gray-300">
                <div>POST /auth/login - User login</div>
                <div>POST /auth/signup - User registration</div>
                <div>GET /auth/profile - Get user profile</div>
                <div>POST /auth/refresh - Refresh token</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Songs</h3>
              <div className="bg-gray-800 p-4 rounded text-sm font-mono text-gray-300">
                <div>POST /songs/upload - Upload song</div>
                <div>GET /songs - Get all songs</div>
                <div>GET /songs/:id - Get song by ID</div>
                <div>DELETE /songs/:id - Delete song</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Playlists</h3>
              <div className="bg-gray-800 p-4 rounded text-sm font-mono text-gray-300">
                <div>POST /playlists - Create playlist</div>
                <div>GET /playlists - Get all playlists</div>
                <div>GET /playlists/:id - Get playlist by ID</div>
                <div>DELETE /playlists/:id - Delete playlist</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">Get in Touch 📬</h2>
          <p className="text-gray-300 mb-4">
            Have feedback, suggestions, or found a bug? I'd love to hear from you!
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Report Bug
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              Feature Request
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              Send Feedback
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 py-6">
          <p>Made with ❤️ for music lovers everywhere</p>
          <p className="text-sm mt-2">Remaudio v1.0.0 - {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default DeveloperNote;
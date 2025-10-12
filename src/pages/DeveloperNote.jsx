import React from 'react';

const DeveloperNote = () => {
  const supportEmail = import.meta.env.VITE_SUPPORT_GMAIL || 'support@remaudio.com';

  // ✅ Email handling function
  const handleContactSupport = () => {
    const subject = 'Contact from Remaudio User';
    const body = `Hello Remaudio Team,

I would like to get in touch regarding:

Please describe your message here...

Best regards,
[Your Name]`;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // ✅ MOBILE: Try to open Gmail app, fallback to default mail app, then web
      const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      if (/Android/i.test(navigator.userAgent)) {
        // Android: Try Gmail app via intent
        const intentUrl = `intent://send?to=${encodeURIComponent(supportEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}#Intent;scheme=mailto;package=com.google.android.gm;end`;
        
        window.location.href = intentUrl;
        
        // Fallback to mailto (opens default email app)
        setTimeout(() => {
          window.location.href = mailtoUrl;
        }, 1000);
        
        // Final fallback to Gmail web
        setTimeout(() => {
          const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(gmailUrl, '_blank');
        }, 2500);
        
      } else {
        // iOS: Try mailto (opens default email app, usually Mail or Gmail)
        window.location.href = mailtoUrl;
        
        // Fallback to Gmail web if no app responds
        setTimeout(() => {
          const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(gmailUrl, '_blank');
        }, 2000);
      }
      
    } else {
      // ✅ DESKTOP: Open Gmail web compose directly in new tab
      const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(
        supportEmail
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.open(gmailUrl, '_blank');
    }
  };

  return (
    <div className="px-4 py-6 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Developer's Note</h1>

      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-400 mb-3 sm:mb-4">Welcome to Remaudio! 🎵</h2>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
            Thank you for trying out Remaudio - a modern music streaming application built with passion and dedication.
            This project showcases the integration of modern web technologies to create a seamless music experience.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-400 mb-3 sm:mb-4">Tech Stack 🛠️</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Frontend</h3>
              <ul className="text-gray-300 space-y-1 text-sm sm:text-base">
                <li>• React 18</li>
                <li>• Tailwind CSS</li>
                <li>• Redux Toolkit</li>
                <li>• Modern JavaScript (ES6+)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Backend</h3>
              <ul className="text-gray-300 space-y-1 text-sm sm:text-base">
                <li>• Node.js</li>
                <li>• NestJS Framework</li>
                <li>• RESTful API</li>
                <li>• JWT Authentication</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-400 mb-3 sm:mb-4">Features ✨</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-sm sm:text-base">User Authentication & Authorization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-sm sm:text-base">Music Upload & Storage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-sm sm:text-base">Audio Player with Controls</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-sm sm:text-base">Playlist Management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-sm sm:text-base">Responsive Design</span>
                </li>
              </ul>
            </div>
            <div>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-sm sm:text-base">Google Authentication</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-sm sm:text-base">Multiplay Feature : sync playback of many devices together</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-sm sm:text-base">Password and username Editing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-sm sm:text-base">Users can contact developer for feedback and suggestion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Journey */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-400 mb-3 sm:mb-4">Journey 🌌</h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            Building Remaudio has been an exciting journey of continuous learning and growth. What began as a simple learning project gradually evolved into my major project. During the early stages, especially while developing the backend, the entire project broke due to several issues. After weeks of troubleshooting, I decided to restart from scratch — a turning point that taught me resilience, patience, and problem-solving at a deeper level.
          </p>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            Through Remaudio, I learned frontend development with React from the ground up. From building the backend with NestJS to crafting a responsive UI with React and Tailwind CSS, the journey was both challenging and rewarding. The fully deployed project reflects my technical growth and persistence.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-400 mb-3 sm:mb-4">Get in Touch 📬</h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            Have feedback, suggestions, or found a bug? I'd love to hear from you!
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleContactSupport}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Contact Us via Gmail</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 py-6">
          <p className="text-sm sm:text-base">Made with ❤️ for music lovers everywhere</p>
          <p className="text-xs sm:text-sm mt-2">Remaudio v2.0.0 - {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Bottom spacer for mobile navigation */}
      <div className="h-8 sm:h-0"></div>
    </div>
  );
};

export default DeveloperNote;
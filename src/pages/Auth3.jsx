import React, { useState, useEffect } from "react";
import axios from "axios";
import image from '../assets/image.png';
import logo from '../assets/remaudio_logo.png';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { setSongs } from "../store/songSlice";          
import { setPlaylists } from "../store/playlistSlice";   
import { setRefreshToken } from '../store/authSlice'; 
import LoadingScreen from '../components/LoadingScreen'; 

const Auth3 = () => { // ✅ Remove prop parameter
  const dispatch = useDispatch();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [googleLoaded, setGoogleLoaded] = useState(false);
  // const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(true);
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const [isAuthenticating, setIsAuthenticating] = useState(false);


  // Helper function to decode JWT token and extract email
  const decodeGoogleToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Helper function to fetch user info
  const fetchUserInfo = async (userEmail, accessToken) => {
    try {
      const userRes = await axios.get(
        `${API_URL}/user/email/${userEmail}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("userId", userRes.data.id); // Store user ID for future use
      console.log("User id:", userRes.data.id);

      // Load user's songs and playlists
      console.log("🚀 Loading user's songs and playlists...");
      const [songsResponse, playlistsResponse] = await Promise.all([
        axios.get(`${API_URL}/songs/user/${userRes.data.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        axios.get(`${API_URL}/playlists/user/${userRes.data.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
      ]);

      console.log("📦 Data loaded:", {
        songs: songsResponse.data.length,
        playlists: playlistsResponse.data.length,
        user: userRes.data.email
      });

      // ✅ Dispatch all data to Redux
      dispatch(setUser(userRes.data));
      dispatch(setSongs(songsResponse.data));
      dispatch(setPlaylists(playlistsResponse.data));

      console.log("✅ All data dispatched to Redux:", {
        user: userRes.data.email,
        songsCount: songsResponse.data.length,
        playlistsCount: playlistsResponse.data.length
      });

    } catch (error) {
      console.error("Error fetching user info:", error);
      setMessage("⚠️ Login successful but failed to fetch user info");
    }
  };

  // Google auth initialization
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        setGoogleLoaded(true);
      };
    } else {
      setGoogleLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (googleLoaded && window.google && showAuth) {
      renderGoogleButton();
    }
  }, [googleLoaded, isLogin, username, password, showAuth]);

  const renderGoogleButton = () => {
    window.google.accounts.id.initialize({
      client_id: '951644398991-48o8dm4ci53gb34qeqqjcm227pdu004l.apps.googleusercontent.com',
      callback: handleGoogleAuth,
    });

    const googleButton = document.getElementById('google-button');
    if (googleButton) {
      googleButton.innerHTML = '';

      const shouldShowButton = isLogin || (username.trim() && password.trim());

      if (shouldShowButton) {
        window.google.accounts.id.renderButton(
          googleButton,
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            shape: 'pill'
          }
        );
      }
    }
  };

  const handleGoogleAuth = async (response) => {
    try {
      setIsAuthenticating(true); // ✅ ADD THIS LINE
      const idToken = response.credential;
      const decodedToken = decodeGoogleToken(idToken);
      const googleEmail = decodedToken?.email;

      if (!googleEmail) {
        setMessage("❌ Failed to extract email from Google token");
        return;
      }

      let res;
      if (isLogin) {
        res = await axios.post(`${API_URL}/auth/google/login`, {
          token: idToken
        });
      } else {
        if (!username.trim() || !password.trim()) {
          setMessage("❌ Please fill in username and password before using Google signup");
          return;
        }

        res = await axios.post(`${API_URL}/auth/google/signup`, {
          token: idToken,
          name: username,
          password,
        });
      }

      const { access_token, refresh_token } = res.data; // ✅ Fixed field names
      localStorage.setItem("accessToken", access_token);
      dispatch(setRefreshToken(refresh_token)); // ✅ Store in Redux memory only

      // ✅ Only fetch user data - Redux dispatch will trigger App re-render
      await fetchUserInfo(googleEmail, access_token);
      setMessage("✅ Success! You are logged in.");
      // ✅ Removed dispatch(authenticated()) - function doesn't exist

    } catch (err) {
      setIsAuthenticating(false); // ✅ ADD THIS LINE
      setMessage("❌ " + (err.response?.data?.message || "Google auth failed"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsAuthenticating(true);
      if (isLogin) {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });

        const { access_token, refresh_token } = res.data; // ✅ Fixed field names
        localStorage.setItem("accessToken", access_token);
        dispatch(setRefreshToken(refresh_token)); // ✅ Store in Redux memory only

        // ✅ Only fetch user data - Redux dispatch will trigger App re-render
        await fetchUserInfo(email, access_token);
        setMessage("✅ Success! You are logged in.");

      } else {
        const res = await axios.post(`${API_URL}/auth/signup`, {
          email,
          name: username,
          password,
        });

        const { access_token, refresh_token } = res.data; // ✅ Fixed field names
        localStorage.setItem("accessToken", access_token);
        dispatch(setRefreshToken(refresh_token)); // ✅ Store in Redux memory only

        // ✅ Only fetch user data - Redux dispatch will trigger App re-render
        await fetchUserInfo(email, access_token);
        setMessage("✅ Account created successfully!");
      }
    } catch (err) {
      setIsAuthenticating(false);
      setMessage("❌ " + (err.response?.data?.message || "Something went wrong"));
    }
  };

  const shouldShowGoogleButton = isLogin || (username.trim() && password.trim());

  if (isAuthenticating) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen fixed inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-800 flex items-center justify-center p-4 overflow-y-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Main Auth Container */}
      <div className={`relative w-full max-w-md max-h-[90vh] transform transition-all duration-500 ${showAuth
        ? "translate-y-0 opacity-100 scale-100"
        : "translate-y-8 opacity-0 scale-95"
        }`}>

        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl">

          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-2xl mb-4">
              <div className="relative w-32 h-32">
                <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-blue-200 text-sm">
              {isLogin ? "Sign in to your account" : "Start your musical journey"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>

              {!isLogin && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
              )}

              <div className="relative">
                <input
                  type="password"
                  placeholder={isLogin ? "Password" : "Create Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/50 text-blue-200 rounded-full">or continue with</span>
            </div>
          </div>

          {/* Google Auth */}
          <div className="space-y-3">
            <div id="google-button" className="w-full min-h-[48px] [&>div]:!w-full [&>div]:!rounded-2xl"></div>

            {!isLogin && !shouldShowGoogleButton && (
              <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm text-blue-200 rounded-2xl px-4 py-3 border border-white/20">
                <img className="h-5 w-5 mr-3 opacity-70" src={image} alt="icon" />
                <span className="text-sm">Fill in username and password to enable Google signup</span>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-2xl text-center text-sm ${message.includes('✅')
              ? 'bg-green-500/20 text-green-200 border border-green-500/30'
              : message.includes('⚠️')
                ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-200 border border-red-500/30'
              }`}>
              {message}
            </div>
          )}

          {/* Switch Auth Mode */}
          <div className="text-center mt-8">
            <p className="text-blue-200 mb-2">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
                setEmail("");
                setUsername("");
                setPassword("");
              }}
              className="text-blue-300 hover:text-white font-semibold underline hover:no-underline transition-all"
            >
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth3;
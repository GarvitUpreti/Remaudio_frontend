import React, { useState, useEffect } from "react";
import axios from "axios";
import image from '../assets/image.png';
import logo from '../assets/remaudio_logo.png'; // ✅ correct

const Auth2 = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [user, setuser] = useState(null)
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  let userRes;

  // Google auth initialization
  useEffect(() => {
    // Load Google Identity Services script if not already loaded
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

  // Re-render Google button when conditions change
  useEffect(() => {
    if (googleLoaded && window.google) {
      renderGoogleButton();
    }
  }, [googleLoaded, isLogin, username, password]);

  const renderGoogleButton = () => {
    window.google.accounts.id.initialize({
      client_id: '951644398991-48o8dm4ci53gb34qeqqjcm227pdu004l.apps.googleusercontent.com', // Replace with your actual client ID
      callback: handleGoogleAuth,
    });

    // Clear previous button
    const googleButton = document.getElementById('google-button');
    if (googleButton) {
      googleButton.innerHTML = '';
      
      // Show Google button for login, or for signup when fields are filled
      const shouldShowButton = isLogin || (username.trim() && password.trim());
      
      if (shouldShowButton) {
        window.google.accounts.id.renderButton(
          googleButton,
          { 
            theme: 'outline', 
            size: 'large',
            width: '100%'
          }
        );
      }
    }
  };

  const handleGoogleAuth = async (response) => {
    try {
      const idToken = response.credential;
      console.log("ID Token:", idToken);

      let res;
      if (isLogin) {
        console.log(idToken)
        res = await axios.post(`${API_URL}/auth/google/login`, {
           token: idToken
        });
      } else {
        // For signup, we need username and password to be filled
        if (!username.trim() || !password.trim()) {
          setMessage("❌ Please fill in username and password before using Google signup");
          return;
        }
        
        res = await axios.post(`${API_URL}/auth/google/signup`, {
          token: idToken,
          name:username,
          password,
        });
      }
      console.log(res.data)
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      userRes = await axios.get(
          `${API_URL}/user/email/${email}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setuser(userRes.data)
        console.log("User:", user.data);

      setMessage("✅ Success! You are logged in.");
      console.log("User:", res.data);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Google auth failed"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });

        const { accessToken, refreshToken } = res.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        

        userRes = await axios.get(
          `${API_URL}/user/email/${email}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setuser(userRes.data)
        console.log("User:", user.data);
        setMessage("✅ Success! You are logged in.");
        
      } else {
        // Signup logic - only username and password, no email
        const res = await axios.post(`${API_URL}/auth/signup`, {
          email,
          name:username,
          password,
        });

        const { accessToken, refreshToken } = res.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        setMessage("✅ Account created successfully!");
        console.log("User:", res.data);
      }
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Something went wrong"));
    }
  };

  // Check if Google button should be shown
  const shouldShowGoogleButton = isLogin || (username.trim() && password.trim());

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {/* Normal Login/Signup Form */}
        <form onSubmit={handleSubmit}>
          
          
          {/* Show email field only for login */}
          
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          {/* Show username field only for signup */}
          {!isLogin && (
            <input
              type="text"
              placeholder="Set Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mb-4 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          
          <input
            type="password"
            placeholder={isLogin ? "Password" : "Set Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Google Auth Section */}
        <div className="mt-6">
          <div className="text-center text-gray-400 mb-4">or</div>
          
          {/* Google button container - always present but conditionally filled */}
          <div id="google-button" className="w-full min-h-[44px]"></div>
          
          {/* Show message for signup when fields are not filled */}
          {!isLogin && !shouldShowGoogleButton && (
            <p className="flex items-center justify-center bg-[#fbfcfc] text-black rounded-md px-4 py-2 font-medium text-[15px]">
            <img
              className="h-5 w-5 mr-3"
              src={image}
              alt="icon"
            />
            Fill in username and password to enable Google signup
          </p>
          )}
        </div>

        {message && (
          <p className="text-center text-sm text-gray-300 mt-4">{message}</p>
        )}

        <p className="text-gray-400 mt-4 text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
              // Clear form fields when switching
              setEmail("");
              setUsername("");
              setPassword("");
            }}
            className="text-blue-400 hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth2;
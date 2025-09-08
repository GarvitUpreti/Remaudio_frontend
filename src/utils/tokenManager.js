import axios from 'axios';
import { logout } from '../store/userSlice';
import { setRefreshing, clearRefreshToken } from '../store/authSlice';

const API_URL = import.meta.env.VITE_BACKEND_URL;

class TokenManager {
  constructor() {
    this.store = null; // Will be set by App.js
    this.failedQueue = [];
  }

  // Set Redux store reference
  setStore(store) {
    this.store = store;
  }

  // Process queued requests after refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Refresh token function
  async refreshToken() {
    try {
      const state = this.store.getState();
      const refreshToken = state.auth.refreshToken; // ✅ Get from Redux
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      this.store.dispatch(setRefreshing(true));

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;
      
      // ✅ Store access token in localStorage (it's short-lived)
      localStorage.setItem('accessToken', access_token);
      
      // ✅ Store NEW refresh token in Redux (memory only)
      if (newRefreshToken) {
        this.store.dispatch(setRefreshToken(newRefreshToken));
      }

      console.log('✅ Token refreshed successfully (refresh token in memory only)');
      return access_token;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      
      // Refresh failed - clear everything
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      this.store.dispatch(clearRefreshToken());
      throw error;
    } finally {
      this.store.dispatch(setRefreshing(false));
    }
  }

  // Setup axios interceptor
  setupInterceptor(dispatch) {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          const state = this.store.getState();
          
          if (state.auth.isRefreshing) {
            // Token refresh in progress, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return axios(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            this.processQueue(null, newToken);
            
            // Retry original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
            
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            dispatch(logout());
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export default new TokenManager();
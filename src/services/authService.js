import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Cookie utility functions
const getCookie = (name) => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
};

const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const authService = {
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} { token, user }
   */
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      // Store token and user in cookies
      if (response.data.token) {
        setCookie("auth_token", response.data.token, 7);
        setCookie("auth_user", JSON.stringify(response.data.user), 7);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Login failed" };
    }
  },

  /**
   * Register user
   * @param {Object} userData { name, email, password, role, phone }
   * @returns {Promise<Object>} { token, user }
   */
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      // Store token and user in cookies after registration
      if (response.data.token) {
        setCookie("auth_token", response.data.token, 7);
        setCookie("auth_user", JSON.stringify(response.data.user), 7);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Registration failed" };
    }
  },

  /**
   * Logout user (clear cookies)
   */
  logout: () => {
    deleteCookie("auth_token");
    deleteCookie("auth_user");
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} user data
   */
  getProfile: async () => {
    try {
      const token = getCookie("auth_token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch profile" };
    }
  },

  /**
   * Update user profile
   * @param {Object} updates { name, phone, resumeUrl }
   * @returns {Promise<Object>} updated user data
   */
  updateProfile: async (updates) => {
    try {
      const token = getCookie("auth_token");
      if (!token) throw new Error("No token found");

      const response = await axios.put(
        `${API_URL}/auth/profile`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update user cookie with new data
      if (response.data.user) {
        setCookie("auth_user", JSON.stringify(response.data.user), 7);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to update profile" };
    }
  },

  /**
   * Get token from cookies
   * @returns {string|null} JWT token
   */
  getToken: () => {
    return getCookie("auth_token");
  },

  /**
   * Get user from cookies
   * @returns {Object|null} user object
   */
  getUser: () => {
    const user = getCookie("auth_user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!getCookie("auth_token");
  },

  /**
   * Create axios instance with auth header
   * @returns {AxiosInstance}
   */
  getAuthAxios: () => {
    const token = getCookie("auth_token");
    return axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
};

export default authService;

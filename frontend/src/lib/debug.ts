// Debug utilities for authentication troubleshooting
// Use in browser console: window.authDebug.clearAll() or window.authDebug.status()

export const authDebug = {
  // Clear all authentication data
  clearAll() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('lastEmail');
    localStorage.removeItem('pomodoroSettings');
    console.log('✅ All auth data cleared from localStorage');
    console.log('🔄 Reload the page to reset authentication state');
  },

  // Show current authentication status
  status() {
    const token = localStorage.getItem('accessToken');
    const lastEmail = localStorage.getItem('lastEmail');
    
    console.log('📊 Authentication Status:');
    console.log('- Token:', token ? '✅ Present' : '❌ Missing');
    console.log('- Last Email:', lastEmail || '❌ None');
    
    if (token) {
      try {
        // Try to decode JWT payload (basic check, not secure)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = new Date(payload.exp * 1000);
        const now = new Date();
        
        console.log('- Token expires:', exp.toLocaleString());
        console.log('- Token valid:', exp > now ? '✅ Yes' : '❌ Expired');
        console.log('- User ID:', payload.sub || 'Unknown');
        console.log('- Email:', payload.email || 'Unknown');
      } catch (error) {
        console.log('- Token format:', '❌ Invalid JWT');
      }
    }
  },

  // Test API connection
  async testConnection() {
    try {
      const response = await fetch('http://localhost:3000/api');
      console.log('🌐 API Connection:', response.ok ? '✅ OK' : '❌ Failed');
      console.log('- Status:', response.status);
    } catch (error) {
      console.log('🌐 API Connection: ❌ Failed');
      console.log('- Error:', error.message);
    }
  },

  // Force logout and clear everything
  async forceLogout() {
    try {
      // Try to call logout API
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.log('⚠️ Logout API call failed, but clearing local data anyway');
    }
    
    this.clearAll();
    window.location.href = '/login';
  },

  // Show all localStorage data
  showStorage() {
    console.log('💾 LocalStorage Contents:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`- ${key}:`, value);
    }
  }
};

// Make available globally for console access
declare global {
  interface Window {
    authDebug: typeof authDebug;
  }
}

// Auto-attach to window in development
if (typeof window !== 'undefined') {
  window.authDebug = authDebug;
} 
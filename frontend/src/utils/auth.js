// Simple authentication utility using localStorage

const ADMIN_CREDENTIALS = {
    username: 'Gyanin',
    password: 'Gyanin.academy@123'
}

// Check if user is authenticated
export const isAuthenticated = () => {
    const authData = localStorage.getItem('adminAuth')
    return authData !== null
}

// Login function
export const login = (username, password) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const authData = {
            username: username,
            loginTime: Date.now(),
            isAdmin: true
        }
        localStorage.setItem('adminAuth', JSON.stringify(authData))
        return { success: true, message: 'Login successful' }
    }
    return { success: false, message: 'Invalid username or password' }
}

// Logout function
export const logout = () => {
    localStorage.removeItem('adminAuth')
}

// Get current user
export const getCurrentUser = () => {
    const authData = localStorage.getItem('adminAuth')
    return authData ? JSON.parse(authData) : null
}

// Check if session is valid (optional: add session expiry)
export const isSessionValid = () => {
    const authData = localStorage.getItem('adminAuth')
    if (!authData) return false

    const data = JSON.parse(authData)
    const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours
    const now = Date.now()

    if (now - data.loginTime > sessionDuration) {
        logout()
        return false
    }

    return true
}


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'

// Initialize app
const initApp = async () => {
  // Hide splash screen after app loads (Capacitor will auto-handle if plugin is available)
  if (Capacitor.isNativePlatform()) {
    try {
      const { SplashScreen } = await import('@capacitor/splash-screen')
      const { StatusBar, Style } = await import('@capacitor/status-bar')
      
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#0f172a' })
      
      // Hide splash screen after a short delay
      setTimeout(async () => {
        await SplashScreen.hide()
      }, 500)
    } catch (e) {
      console.log('Native plugins not available:', e)
    }
  }
}

// Render the app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize native features
initApp()

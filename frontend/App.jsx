// import { useState } from 'react'
import { Routes, Route } from 'react-router'
import LoginPage from './pages/LoginPage.jsx'
import ForgotPasswordPage from './pages/ForgotPassword.jsx'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route index element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
  )
}

export default App

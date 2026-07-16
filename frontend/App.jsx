// import { useState } from 'react'
import { Routes, Route } from 'react-router'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
    </Routes>
  )
}

export default App

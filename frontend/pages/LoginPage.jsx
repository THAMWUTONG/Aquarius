import { Link } from "react-router"
import logo from "../assets/placeholder.png"
import { FaSignInAlt } from "react-icons/fa"

function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-md flex-1 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <img className="inline w-14 h-14" src={logo} alt="Aquarius Logo"/>
          <h2 className="text-xl font-bold">Welcome to Aquarius</h2>
          <p>Your Personalized Learning Assistant</p>
        </div>
      
        <form className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm" htmlFor="email">Email Address</label>
            <input className="p-2 rounded-lg ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500" id="email" type="text" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm" htmlFor="password">Password</label>
            <input className="p-2 rounded-lg ring ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500" id="password" type="password" />
            <Link className="text-sm underline" to="/forgot-password">Forgot Password?</Link>
          </div>
          <button className="flex justify-center items-center gap-2 w-full rounded-lg py-2 font-semibold text-lg text-white bg-sky-500 hover:bg-sky-600 transition-all"type="submit">Sign In <FaSignInAlt/></button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
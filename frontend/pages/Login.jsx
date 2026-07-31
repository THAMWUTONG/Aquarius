import { useNavigate } from "react-router"
import { FaSignInAlt } from "react-icons/fa"
import logo from "../assets/placeholder.png"
import { useAuth } from "../context/AuthContext.jsx"
import { login } from "../services/authService.jsx"

/**
 * Displays the login page for user authentication,
 * this is the default landing page of the website.
 */
function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  function validateEmail(email) {
    // Regex breakdown:
    // 1. check if email does not start with one or more whitespace or "@".
    // 2. check if there is a literal "@".
    // 3. check if after the literal "@", there is one or more characters that are not whitespace or "@".
    // 4. check if there is a literal ".".
    // 5. check if after the literal ".", there is one or more characters that are not whitespace or "@".
    // 6. check if email ends immediately with no extra characters.
    // If all above conditions are true, then email is valid.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePassword(password) {
    return password.length != 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const loginForm = e.target;
    const formData = new FormData(loginForm);

    if (!validateEmail(formData.get("email"))) {
      alert("Please enter a valid email address.");
      return;
    }
    else if (!validatePassword(formData.get("password"))) {
      alert("Please enter your password.");
      return;
    }
    else {
      try {
        const user = await login(formData.get("email"), formData.get("password"));
        console.log(user);
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user))
        switch (user.role) {
          case "student":
            navigate("/student-dashboard");
            break;
          case "lecturer":
            navigate("/lecturer-dashboard");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
        }
      }
      catch (error) {
        alert(error.message);
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute w-full h-full z-0">

      </div>
      <div className="flex justify-center items-center relative z-10 min-h-screen">
        <div className="max-w-md flex-1 p-8 rounded-xl shadow-lg bg-white">
          <div className="text-center mb-8">
            <img className="inline w-14 h-14" src={logo} alt="Aquarius Logo"/>
            <h2 className="text-xl font-bold">Welcome to Aquarius</h2>
            <p>Your Personalized Learning Assistant</p>
          </div>
        
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm" htmlFor="email">Email Address</label>
              <input className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500" name="email" type="text" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm" htmlFor="password">Password</label>
              <input className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500" name="password" type="password" />
            </div>
            <button className="flex justify-center items-center gap-2 w-full rounded-lg py-2 font-semibold text-lg text-white bg-sky-500 hover:bg-sky-600 transition-all" type="submit">Sign In <FaSignInAlt /></button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
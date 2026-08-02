import { Link } from "react-router"
import { FaBook, FaGraduationCap, FaChartLine, FaUsersCog, FaChalkboardTeacher, FaCalendarAlt, FaRobot } from "react-icons/fa"
import FloatingLines from "../components/lib/FloatingLines.jsx"
import logo from "../assets/placeholder.png"

/**
 * Public marketing landing page. Introduces Aquarius to a signed-out
 * visitor and routes them to /login. No auth required to view this page.
 */
function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero: full-bleed animated water-current background, shared with the Login page for brand consistency */}
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <FloatingLines
            enabledWaves={["bottom", "middle", "top"]}
            lineCount={9}
            lineDistance={8}
            bendRadius={8}
            bendStrength={-2}
            interactive={false}
            parallax={false}
            animationSpeed={0.6}
            linesGradient={["#32B7F3", "#0d629e", "#094461"]}
          />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <nav className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-3">
              <img className="h-10 w-10" src={logo} alt="Aquarius Logo" />
              <span className="text-2xl font-bold text-white">Aquarius</span>
            </div>
            <Link
              to="/login"
              className="rounded-lg px-5 py-2 text-sm font-semibold text-sky-900 bg-white transition-all hover:bg-sky-50"
            >
              Log In
            </Link>
          </nav>

          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <h1 className="max-w-3xl text-5xl font-bold leading-tight text-white sm:text-6xl">
              Learning, in flow.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-sky-50">
              Aquarius brings your courses, quizzes, and progress into one calm, connected place —
              built for students, lecturers, and admins alike.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/login"
                className="rounded-lg px-6 py-3 text-base font-semibold text-sky-900 bg-white transition-all hover:bg-sky-50"
              >
                Get Started
              </Link>
              <a
                href="#roles"
                className="rounded-lg px-6 py-3 text-base font-semibold text-white ring-2 ring-white/60 transition-all hover:bg-white/10"
              >
                See how it works
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Roles section */}
      <section id="roles" className="px-8 py-20 bg-slate-50">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Built for every role</h2>
          <p className="mt-3 text-slate-500">One platform, three ways to use it.</p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <RoleCard
              icon={<FaGraduationCap className="text-sky-500" size={28} />}
              title="Students"
              description="Study materials, quizzes with instant review, and a schedule that adapts to your weak spots."
            />
            <RoleCard
              icon={<FaChalkboardTeacher className="text-sky-500" size={28} />}
              title="Lecturers"
              description="Create and manage quizzes and materials, then monitor how your class is actually performing."
            />
            <RoleCard
              icon={<FaUsersCog className="text-sky-500" size={28} />}
              title="Admins"
              description="Regulate platform content, manage accounts and enrollment, and track usage across every course."
            />
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="px-8 py-20 bg-white">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">What's inside</h2>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FeatureCard
              icon={<FaBook className="text-sky-500" size={24} />}
              title="Study materials, organized"
              description="Every material is tied to a topic and course, with prerequisites so you always know what to review first."
            />
            <FeatureCard
              icon={<FaRobot className="text-sky-500" size={24} />}
              title="AI-assisted recommendations"
              description="A transparent, rule-based engine flags weak topics and suggests what to study next — no black box."
            />
            <FeatureCard
              icon={<FaChartLine className="text-sky-500" size={24} />}
              title="Clear performance tracking"
              description="Score history, course progress, and trend charts so you can see exactly where you stand."
            />
            <FeatureCard
              icon={<FaCalendarAlt className="text-sky-500" size={24} />}
              title="A schedule built around you"
              description="Study sessions are allocated based on your weakest topics and upcoming events, not a generic calendar."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between px-8 py-8 bg-slate-50">
        <div className="flex items-center gap-2">
          <img className="h-6 w-6" src={logo} alt="Aquarius Logo" />
          <span className="text-sm font-semibold text-slate-700">Aquarius</span>
        </div>
        <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} Aquarius. All rights reserved.</p>
      </footer>
    </div>
  )
}

/**
 * A single role card in the "Built for every role" section.
 * @param {Object} props
 * @param {JSX.Element} props.icon
 * @param {string} props.title
 * @param {string} props.description
 */
function RoleCard({ icon, title, description }) {
  return (
    <div className="rounded-xl p-6 bg-white ring ring-gray-200 text-left">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

/**
 * A single feature card in the "What's inside" section.
 * @param {Object} props
 * @param {JSX.Element} props.icon
 * @param {string} props.title
 * @param {string} props.description
 */
function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex gap-4 rounded-xl p-6 bg-slate-50 text-left">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white ring ring-gray-200">{icon}</div>
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export default Landing
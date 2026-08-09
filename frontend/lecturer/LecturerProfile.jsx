import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HeaderBar from '../components/HeaderBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FaUser, FaEnvelope, FaLock, FaSave, FaCheckCircle, FaExclamationCircle, FaBookOpen } from 'react-icons/fa';
import { getLecturerProfileData } from '../services/getLecturerProfileData.jsx';
import { updateLecturerProfile } from '../services/lecturerContentService.jsx';

function LecturerProfile() {
  const { user } = useAuth();

  // Form State initialized with logged-in user or default lecturer data.
  // department now comes from the lecturers table via the login payload.
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Dr. Sarah Lim',
    email: user?.email || 'sarah.lim@aquarius.edu.my',
    department: user?.department || 'School of Computing & IT',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [courses, setCourses] = useState([]);

  // Courses taught are DERIVED data, so they come from the API rather than the
  // login payload - the same split the student profile page uses.
  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getLecturerProfileData();
        setCourses(data.courses);
      } catch (error) {
        console.error('Error loading courses taught:', error);
      }
    }

    fetchCourses();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    // Validate password match if attempting to change password
    if (profileData.newPassword) {
      if (!profileData.currentPassword) {
        setFeedback({
          type: 'error',
          message: 'Please enter your current password to set a new password.',
        });
        return;
      }
      if (profileData.newPassword !== profileData.confirmPassword) {
        setFeedback({
          type: 'error',
          message: 'New password and confirmation password do not match.',
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Only the password fields are sent: name, email and department are
      // rendered read-only, and the endpoint ignores them anyway.
      const result = await updateLecturerProfile({
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword,
        confirmPassword: profileData.confirmPassword,
      });

      setFeedback({ type: 'success', message: result.message });

      // Clear password fields upon successful save
      setProfileData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      // Surface the server's reason ('Your current password is incorrect')
      // rather than a generic message that gives the user nothing to act on.
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f8fafc] text-[#1e293b] antialiased">
      {/* Locked Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar displayedTitle="Lecturer Profile" userName={profileData.name} userRole={user?.role || 'lecturer'} />

        <main className="flex-1 overflow-y-auto p-8 space-y-6 max-w-[1200px] w-full mx-auto">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Account Settings & Profile
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your personal credentials, contact email, and account security.
            </p>
          </div>

          {/* Feedback Banner */}
          {feedback.message && (
            <div
              className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-3 transition-all ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {feedback.type === 'success' ? (
                <FaCheckCircle className="text-base shrink-0" />
              ) : (
                <FaExclamationCircle className="text-base shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Card 1: Personal Information */}
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/40">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                  Personal Information
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name (Read-Only) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        readOnly
                        disabled
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email Address (Read-Only) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        readOnly
                        disabled
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Faculty / Department (Read-Only) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Department / School
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={profileData.department}
                    readOnly
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Password & Security */}
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/40">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                  Security & Change Password
                </h3>
              </div>

              <div className="p-6 space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={profileData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password to verify"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                      <input
                        type="password"
                        name="newPassword"
                        value={profileData.newPassword}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={profileData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-type new password"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <FaSave className="text-xs" />
                <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>

          {/* Courses Taught (read-only, loaded from the database) */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/40">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                Courses You Teach
              </h3>
            </div>

            <div className="p-6">
              {courses.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No courses are assigned to your account yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 border border-slate-100 rounded-lg bg-slate-50/60"
                    >
                      <div className="flex items-start gap-3">
                        <FaBookOpen className="text-sky-500 text-sm mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800">
                            {course.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {course.studentCount} student{course.studentCount === 1 ? '' : 's'}
                            {' · '}
                            {course.topicCount} topic{course.topicCount === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LecturerProfile;
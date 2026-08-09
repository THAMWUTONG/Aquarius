import { FaKey, FaScroll, FaUserAlt } from "react-icons/fa";
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import ProfileInfoField from "../components/ProfileInfoField.jsx";
import { useAuth } from "../context/AuthContext.jsx"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getActiveCourses } from "../services/getStudentProfileDataService.jsx";
import StudentActiveCourses from "../components/StudentActiveCourses.jsx";
import { changePassword } from "../services/passwordService.jsx";

function StudentProfile(){
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)
  const [activeCourses, setActiveCourses] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/")
    }
  }, [user, navigate])
  
  useEffect(() => {
    async function fetchActiveCourses() {
      try {
        const studentProfileData = await getActiveCourses()
        setActiveCourses(studentProfileData.enrolledCourses)
      }
      catch (error) {
        alert(error.message)
      }
      finally {
        setLoading(false)
      }
    }

    fetchActiveCourses()
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.target)
    const currentPassword = formData.get("currentPassword")
    const newPassword = formData.get("newPassword")
    const confirmPassword = formData.get("confirmPassword")

    try {
      await changePassword(currentPassword, newPassword, confirmPassword)
      alert("Password change request completed.")
    }
    catch (error) {
      alert(error.message)
    }
    finally {
      setSubmitting(false)
    }
  }
    
  if (!user || user.role !== "student") {
    return null;
  }
  else {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <HeaderBar displayedTitle="Profile" userName={ user.name } userRole={ user.role }/>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 overflow-y-auto">
            {loading && <p className="rounded-xl bg-white p-6 shadow-sm text-gray-600">Loading Profile Data...</p>}

            {!loading && (
              <>
                <div className="p-6 rounded-xl border border-gray-300 shadow-md bg-white space-y-4">
                  <div className="flex items-center gap-2">
                    <FaUserAlt className="text-sky-500" />
                    <h2 className="text-lg font-bold">Personal Information</h2>
                  </div>
                  <hr className="text-gray-300"></hr>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <ProfileInfoField label="Student ID" displayedInformation={ user.studentId } />
                    <ProfileInfoField label="Name" displayedInformation={ user.name } />
                    <ProfileInfoField label="Email" displayedInformation={ user.email } />
                    <ProfileInfoField label="Account Created At" displayedInformation={ user.createdAt } />
                    <ProfileInfoField label="Role" displayedInformation={ user.role } />
                    <ProfileInfoField label="Programme" displayedInformation={ user.programme } />
                    <ProfileInfoField label="Intake" displayedInformation={ user.intake } />
                  </div>
                </div>
                <div className="p-6 rounded-xl border border-gray-300 shadow-md bg-white space-y-4">
                  <div className="flex items-center gap-2">
                    <FaScroll className="text-sky-500" />
                    <h2 className="text-lg font-bold">Active Enrolled Courses</h2>
                  </div>
                  <hr className="text-gray-300"></hr>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-bold">Course Name</h3>
                      <h3 className="text-sm font-bold">Enrolled At</h3> 
                    </div>
                    <StudentActiveCourses activeCoursesArray={ activeCourses } />
                  </div>
                </div>
                <div className="p-6 rounded-xl border border-gray-300 shadow-md bg-white space-y-4">
                  <div className="flex items-center gap-2">
                    <FaKey className="text-sky-500" />
                    <h2 className="text-lg font-bold">Change Password</h2>
                  </div>
                  <hr className="text-gray-300"></hr>
                  <form onSubmit={handleSubmit} className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-400" htmlFor="currentPassword">Current Password</label>
                      <input className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500" type="password" name="currentPassword" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400" htmlFor="currentPassword">New Password</label>
                      <input className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500" type="password" name="newPassword" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400" htmlFor="currentPassword">Confirm New Password</label>
                      <input className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500" type="password" name="confirmPassword" />
                    </div>
                    <div className="flex items-center justify-end">
                      <button className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-50 transition-all" type="submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    )
  }
}

export default StudentProfile
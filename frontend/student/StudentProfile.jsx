import { FaScroll, FaUserAlt } from "react-icons/fa";
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import ProfileInfoField from "../components/ProfileInfoField.jsx";
import { useAuth } from "../context/AuthContext.jsx"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getActiveCourses } from "../services/getStudentProfileDataService.jsx";
import StudentActiveCourses from "../components/StudentActiveCourses.jsx";

function StudentProfile(){
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)
  const [activeCourses, setActiveCourses] = useState(null)
  
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
    
  if (!user || user.role !== "student") {
    return null;
  }
  else {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <HeaderBar displayedTitle="Profile" userName={ user.name } userRole={ user.role }/>
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            {loading && <p className="rounded-xl bg-white p-6 shadow-sm text-gray-600">Loading Profile Data...</p>}

            {!loading && (
              <>
                <div className="p-6 rounded-xl border border-gray-300 shadow-md mx-64 bg-white space-y-4">
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
                <div className="p-6 rounded-xl border border-gray-300 shadow-md mx-64 bg-white space-y-4">
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
              </>
            )}
          </div>
        </main>
      </div>
    )
  }
}

export default StudentProfile
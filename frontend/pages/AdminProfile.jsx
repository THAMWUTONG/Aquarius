import { FaUserAlt } from "react-icons/fa";
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import ProfileInfoField from "../components/ProfileInfoField.jsx";
import { useAuth } from "../context/AuthContext.jsx"
import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * Admin's personal profile page. Unlike the student profile, admins have
 * no enrolled courses to display — just their account details.
 */
function AdminProfile(){
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/")
    }
  }, [user, navigate])

  if (!user || user.role !== "admin") {
    return null;
  }
  else {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <HeaderBar displayedTitle="Profile" userName={ user.name } userRole={ user.role }/>
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <div className="p-6 rounded-xl border border-gray-300 shadow-md mx-64 bg-white space-y-4">
              <div className="flex items-center gap-2">
                <FaUserAlt className="text-sky-500" />
                <h2 className="text-lg font-bold">Personal Information</h2>
              </div>
              <hr className="text-gray-300"></hr>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <ProfileInfoField label="Admin ID" displayedInformation={ user.adminId } />
                <ProfileInfoField label="Name" displayedInformation={ user.name } />
                <ProfileInfoField label="Email" displayedInformation={ user.email } />
                <ProfileInfoField label="Account Created At" displayedInformation={ user.createdAt } />
                <ProfileInfoField label="Role" displayedInformation={ user.role } />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default AdminProfile
import HeaderBar from "../components/HeaderBar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import StudentStudyCalendar from "../components/StudentStudyCalendar.jsx"
import { FaTimes } from "react-icons/fa"
import { getStudentCalendarData } from "../services/getStudentCalendarDataService.jsx"
import { addStudentEvent } from "../services/addStudentEventService.jsx"
import { generateStudySchedule } from "../services/generateStudyScheduleService.jsx"

function StudyCalendar(){
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isMarkEventOpen, setIsMarkEventOpen] = useState(false)
  const [isGenerateScheduleOpen, setIsGenerateScheduleOpen] = useState(false)
  const [freeDates, setFreeDates] = useState([""])
  const [calendarData, setCalendarData] = useState({ importantEvents: [], studySchedule: [] })
  const [loading, setLoading] = useState(true)
  const [submittingEvent, setSubmittingEvent] = useState(false)
  const [submittingSchedule, setSubmittingSchedule] = useState(false)

  function addFreeDate() {
    setFreeDates(prev => [...prev, ""])
  }
  function updateFreeDate(index, newValue) {
    setFreeDates(prev => prev.map((currentDate, i) => i === index ? newValue : currentDate)) // if index matches, change old date value to new date value
  }
  function deleteFreeDate(index) {
    setFreeDates(prev => prev.filter((_ , i) => i !== index)) // match any date that isnt the removed date
  }

  async function fetchCalendarData() {
      try {
        const data = await getStudentCalendarData()
        setCalendarData({
          importantEvents: data.importantEvents || [],
          studySchedule: data.studySchedule || []
        })
      }
      catch (error) {
        alert(error.message)
      }
      finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/")
      return
    }

    setLoading(true)
    fetchCalendarData()
  }, [user, navigate])

  async function handleAddEventSubmit(event) {
    event.preventDefault()
    setSubmittingEvent(true)
    const eventForm = event.target
    const formData = new FormData(eventForm)

    try {
      await addStudentEvent({title: formData.get("title"), eventDate: formData.get("eventDate"), eventType: formData.get("eventType")})

      setIsMarkEventOpen(false)
      document.getElementById("title").value = ""
      document.getElementById("eventDate").value = ""
      document.getElementById("eventType").value = "exam"
      await fetchCalendarData()
    }
    catch (error) {
      alert(error.message)
    }
    finally {
      setSubmittingEvent(false)
    }
  }

  async function handleGenerateScheduleSubmit(event) {
    event.preventDefault()
    setSubmittingSchedule(true)
    const validDates = freeDates.filter(Boolean)
    if (validDates.length === 0) {
      alert("Please choose at least one free date.")
      setSubmittingSchedule(false)
      return
    }

    try {
      await generateStudySchedule({ freeDates: validDates })
      setIsGenerateScheduleOpen(false)
      setFreeDates([""])
      await fetchCalendarData()
    }
    catch (error) {
      alert(error.message)
    }
    finally {
      setSubmittingSchedule(false)
    }
  }
  
  if (!user || user.role !== "student" || loading) {
    return null;
  }
  else{
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <HeaderBar displayedTitle="Study Calendar" userName={ user.name } userRole={ user.role } />
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <div className="flex justify-end gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600" onClick={() => setIsMarkEventOpen(true)}>&#43; Mark Important Events</button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600" onClick={() => setIsGenerateScheduleOpen(true)}>Generate Study Schedule</button>
            </div>
            <div className="p-6 border border-gray-300 rounded-xl shadow-md bg-white space-y-4">
              <StudentStudyCalendar importantEvents={calendarData.importantEvents} studySchedule={calendarData.studySchedule} />
            </div>
          </div>
        </main>

        {isMarkEventOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/50">
            <div className="w-md p-4 border border-gray-300 rounded-xl shadow-md bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Add New Event</h2>
                <button onClick={() => setIsMarkEventOpen(false)}><FaTimes /></button>
              </div>
              <hr className="text-gray-300"></hr>
              <form className="space-y-2" onSubmit={handleAddEventSubmit}>
                <div className="flex flex-col gap-1">
                  <label className="text-sm" htmlFor="title">Event Title</label>
                  <input className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500" name="title" type="text" id="title" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm" htmlFor="eventDate">Date</label>
                  <input className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500" name="eventDate" type="date" id="eventDate" min={new Date().toISOString().split("T")[0]} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm" htmlFor="eventType">Event Type</label>
                  <select className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500" name="eventType" id="eventType" required>
                    <option value="exam">Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-100" onClick={() => setIsMarkEventOpen(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg font-bold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-60" disabled={submittingEvent}>{submittingEvent ? "Saving..." : "Add Event"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isGenerateScheduleOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/50">
            <div className="w-md p-4 border border-gray-300 rounded-xl shadow-md bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Generate Study Schedule</h2>
                <button onClick={() => setIsGenerateScheduleOpen(false)}><FaTimes /></button>
              </div>
              <hr className="text-gray-300"></hr>
              <form className="space-y-2" onSubmit={handleGenerateScheduleSubmit}>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">On what days will you be free?</label>
                  <div className="space-y-2">
                    {freeDates.map((date, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500" type="date" value={date} min={new Date().toISOString().split("T")[0]} onChange={e => freeDates.includes(e.target.value) ? alert("Date already selected. Select another date.") : updateFreeDate(index, e.target.value)} />
                        {freeDates.length > 1 && (
                          <button type="button" onClick={() => deleteFreeDate(index)}><FaTimes /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="text-sm text-sky-500 hover:text-sky-600 text-left transition-all" type="button" onClick={addFreeDate}>Add Date</button>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-100 transition-all" onClick={() => setIsGenerateScheduleOpen(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg font-bold text-white bg-sky-500 hover:bg-sky-600 transition-all disabled:opacity-60" disabled={submittingSchedule}>{submittingSchedule ? "Generating..." : "Generate"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default StudyCalendar
import { useState } from "react"
import { FaCalendarAlt } from "react-icons/fa"

function StudentStudyCalendar() {
  const year = new Date().getFullYear()
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const month = new Date().getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const numberOfDaysInMonth = new Date(year, month + 1, 0).getDate() // 0 means the last day of the previous month.
  // Stores events for easy render.
  // Day Format:
  // date(1-indexed): [{ title: "Math exam", type: "exam"}]
  const [events, setEvents] = useState({})

  function mapDaysToCalendar() {
    const days = []

    // Insert the first date of the month and setting its grid column placement to match the day of the date.
    // Note: gridColumn with dynamic values does not work using tailwindCSS, so style attribute was used instead.
    if (new Date().getDate() === 1) {
      days.push(
        <div key={0} className="flex flex-col gap-2 min-h-20 p-1.5 border border-sky-500 rounded-lg bg-sky-100" style={{ gridColumn: firstDayOfMonth + 1 }}>
          <div>
            <p className="font-bold text-sky-500">{1}</p>
          </div>
          <div className="space-y-1" id={`day${1}EventHolder`}>
            {(events[0] || []).map(event => (
              <div className="p-1 rounded text-xs bg-sky-200">
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )
    }
    else {
      days.push(
        <div key={0} className="flex flex-col gap-2 min-h-20 p-1.5 border border-gray-300 rounded-lg" style={{ gridColumn: firstDayOfMonth + 1 }}>
          <div>
            <p>{1}</p>
          </div>
          <div className="space-y-1" id={`day${1}EventHolder`}>
            {(events[0] || []).map(event => (
              <div className="p-1 rounded text-xs bg-sky-200">
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )
    }

    for (let day = 1; day < numberOfDaysInMonth ; day++) {
      if (new Date().getDate() === day + 1) {
        days.push(
          <div key={day} className="flex flex-col gap-2 min-h-20 p-1.5 border border-sky-500 rounded-lg bg-sky-100">
            <div>
              <p className="font-bold text-sky-500">{day + 1}</p>
            </div>
            <div className="space-y-1" id={`day${day + 1}EventHolder`}>
              {(events[day + 1] || []).map(event => (
                <div className="p-1 rounded text-xs bg-sky-200">
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        )
      }
      else {
        days.push(
          <div key={day} className="flex flex-col gap-2 min-h-20 p-1.5 border border-gray-300 rounded-lg">
            <div>
              <p>{day + 1}</p>
            </div>
            <div className="space-y-1" id={`day${day + 1}EventHolder`}>
              {(events[day + 1] || []).map(event => (
                <div className="p-1 rounded text-xs bg-sky-200">
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        )
      }
    }

    return days
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <FaCalendarAlt className="text-sky-500"/>
        <h2 className="text-lg font-bold">{monthNames[month]}</h2>
      </div>
      <hr className="text-gray-300"></hr>
      <div className="grid grid-cols-7 gap-2">
        <p className="text-center font-bold">SUN</p>
        <p className="text-center font-bold">MON</p>
        <p className="text-center font-bold">TUE</p>
        <p className="text-center font-bold">WED</p>
        <p className="text-center font-bold">THU</p>
        <p className="text-center font-bold">FRI</p>
        <p className="text-center font-bold">SAT</p>
        {mapDaysToCalendar()}
      </div>
    </>
  )
}

export default StudentStudyCalendar
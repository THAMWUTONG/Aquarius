import { FaCalendarAlt } from "react-icons/fa"

function StudentStudyCalendar({ importantEvents = [], studySchedule = [] }) {
  const year = new Date().getFullYear()
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const month = new Date().getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const numberOfDaysInMonth = new Date(year, month + 1, 0).getDate()

  const eventsByDay = {}
  const combinedItems = importantEvents.concat(studySchedule)

  combinedItems.forEach((item) => {
    const dateKey = item.eventDate || item.scheduledDate
    if (!dateKey) return

    const dayNumber = Number(dateKey.split("-")[2])
    if (!Number.isInteger(dayNumber)) return

    if (!eventsByDay[dayNumber]) {
      eventsByDay[dayNumber] = []
    }

    eventsByDay[dayNumber].push({
      title: item.title || item.topicTitle,
      type: item.eventType ? "event" : "study"
    })
  })

  function mapDaysToCalendar() {
    const days = []
    const today = new Date().getDate()

    const renderDayCell = (dayNumber, isFirstDay = false) => {
      const isToday = today === dayNumber
      const cells = eventsByDay[dayNumber] || []

      return (
        <div
          key={dayNumber}
          className={`flex flex-col gap-2 min-h-20 p-1.5 border rounded-lg ${isToday ? "border-sky-500 bg-sky-100" : "border-gray-300"}`}
          style={isFirstDay ? { gridColumn: firstDayOfMonth + 1 } : undefined}
        >
          <div>
            <p className={isToday ? "font-bold text-sky-500" : ""}>{dayNumber}</p>
          </div>
          <div className="space-y-1" id={`day${dayNumber}EventHolder`}>
            {cells.map((event, index) => (
              <div key={`${dayNumber}-${index}`} className="rounded bg-sky-200 p-1 text-xs">
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )
    }

    days.push(renderDayCell(1, true))

    for (let day = 2; day <= numberOfDaysInMonth; day++) {
      days.push(renderDayCell(day))
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
      <div className="grid grid-cols-[repeat(7,minmax(100px,1fr))] sm:grid-cols-7 w-fit gap-2">
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
import { FaFileSignature, FaGraduationCap, FaUser } from "react-icons/fa"

function StudentDashboardUpcomingEvent({ eventsArray }) {
  const eventIcons = {
    assignment: <FaFileSignature />,
    exam: <FaGraduationCap />,
    personal: <FaUser />
  }

  if (eventsArray.length === 0) {
    return (
      <p className="text-sm text-center">You currently do not have any active courses.</p>
    )
  }
  else {
    return (
      eventsArray.map((event) => (
        <div key={event.id} className="flex items-center gap-2">
          {eventIcons[event.eventType]}
          <div>
            <h3 className="text-sm font-bold">{event.title}</h3>
            <p className="text-xs text-gray-400">{event.eventDate} • {event.eventType}</p>
          </div>
        </div>
      ))
    )
  }
}

export default StudentDashboardUpcomingEvent
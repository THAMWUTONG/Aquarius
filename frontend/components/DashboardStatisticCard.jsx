function DashboardStatisticCard({ icon, displayedTitle, displayedData }) {
  return (
    <div className="flex items-center gap-2 p-4 rounded-xl border border-gray-300 shadow-md bg-white">
      <div className="flex justify-center items-center rounded-lg w-10 h-10 text-sky-500 bg-sky-100">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{displayedTitle}</p>
        <strong className="text-lg font-bold">{displayedData}</strong>
      </div>
    </div>
  )
}

export default DashboardStatisticCard
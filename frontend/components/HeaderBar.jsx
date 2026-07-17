function HeaderBar({ displayedTitle, userName, userRole }) {
  return (
    <header className="flex justify-between items-center shrink-0 border-b border-gray-300 px-8 bg-white h-16">
      <h1 className="text-xl font-bold">{displayedTitle}</h1>
      <div className="text-right">
        <h2 className="text-base font-bold">{userName}</h2>
        <p className="text-sm">{userRole}</p>
      </div>
    </header>
  )
}

export default HeaderBar
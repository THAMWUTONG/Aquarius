function HeaderBar({ displayedTitle, userName, userRole }) {
  return (
    <header className="flex justify-between items-center shrink-0 border-b border-gray-300 px-8 bg-white h-16">
      <h1 className="text-xl font-bold">{displayedTitle}</h1>
      <div>
        <h2 className="text-lg font-bold leading-tight">{userName}</h2>
        <p className="text-sm capitalize leading-tight">{userRole}</p>
      </div>
    </header>
  )
}

export default HeaderBar
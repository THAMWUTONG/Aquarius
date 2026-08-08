function ProfileInfoField({ label, displayedInformation }) {
  return (
    <div>
      <label className="text-sm text-gray-400" htmlFor="label">{ label }</label>
      <input className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-2 focus:border-sky-500 caret-transparent" type="text" name="label" value={ displayedInformation } />
    </div>
  )
}

export default ProfileInfoField
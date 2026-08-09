function ImprovementTrend({ topicName, totalAttempts, firstScore, lastScore }){
  const scoreDifference = lastScore - firstScore

  return (
    <tr className="border-y border-gray-400">
      <td className="py-1.5">{ topicName }</td>
      <td className="py-1.5">{ totalAttempts }</td>
      <td className="py-1.5">{ firstScore }% &#8594; { lastScore }% </td>
      <td className={`py-1.5 ${scoreDifference >= 0 ? "text-green-500" : "text-red-500"}`}>{ scoreDifference > 0 ? "+" + scoreDifference + "%" : scoreDifference === 0 ? "Stable"  : + scoreDifference + "%"}</td>
    </tr>
    
  )
}

export default ImprovementTrend
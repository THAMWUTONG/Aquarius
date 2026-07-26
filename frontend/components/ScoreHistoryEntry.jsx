function ScoreHistoryEntry({ quizName, attemptedAt, score }){
  return (
    <tr className="border-y border-gray-400">
      <td className="py-1.5">{ quizName }</td>
      <td className="py-1.5">{ attemptedAt }</td>
      <td className="py-1.5">{ score }%</td>
    </tr>
    
  )
}

export default ScoreHistoryEntry
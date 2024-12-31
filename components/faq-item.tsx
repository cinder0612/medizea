interface FaqItemProps {
  question: string
  answer: string
}

export default function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <div className="border-b border-amber-500/20 py-6 last:border-0">
      <h3 className="text-lg font-semibold mb-2 text-amber-500">{question}</h3>
      <p className="text-gray-400">{answer}</p>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 bg-black/20 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-colors">
      <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-amber-500">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

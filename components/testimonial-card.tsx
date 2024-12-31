interface TestimonialCardProps {
  content: string
  author: string
  role: string
  image: string
}

export default function TestimonialCard({ content, author, role, image }: TestimonialCardProps) {
  return (
    <div className="p-6 bg-black/20 rounded-xl border border-amber-500/20">
      <div className="mb-4">
        <p className="text-gray-400 italic">&quot;{content}&quot;</p>
      </div>
      <div className="flex items-center">
        <img
          src={image}
          alt={author}
          className="w-12 h-12 rounded-full mr-4 object-cover"
        />
        <div>
          <h4 className="font-semibold text-amber-500">{author}</h4>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  )
}

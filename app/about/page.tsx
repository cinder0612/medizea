import { BaseLayout } from '@/components/layouts/base-layout'

export default function AboutPage() {
  return (
    <BaseLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-amber-200 mb-12">About MindfulAI</h1>
          <div className="space-y-12">
            <div>
              <p className="text-xl text-amber-100/80 leading-relaxed">
                MindfulAI is your personal AI-powered meditation companion, designed to help you find peace and mindfulness in your daily life.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-amber-200 mb-6">Our Mission</h2>
              <p className="text-xl text-amber-100/80 leading-relaxed">
                We believe that everyone deserves access to personalized meditation experiences that adapt to their unique needs and preferences.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-amber-200 mb-6">How It Works</h2>
              <p className="text-xl text-amber-100/80 leading-relaxed">
                Using advanced AI technology, MindfulAI creates customized meditation sessions that evolve with your practice, helping you achieve deeper states of relaxation and mindfulness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

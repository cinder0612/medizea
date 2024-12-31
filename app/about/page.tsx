import { BaseLayout } from '@/components/base-layout'

export default function AboutPage() {
  return (
    <BaseLayout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-thin text-amber-200 mb-8">About Calm</h1>
        <div className="prose prose-invert prose-amber">
          <p>
            Calm is an innovative AI-powered meditation app designed to help you find inner peace and tranquility in your busy life. Our platform uses advanced artificial intelligence to create personalized meditation experiences tailored to your unique needs and preferences.
          </p>
          <h2>Our Mission</h2>
          <p>
            At Calm, our mission is to make meditation accessible and effective for everyone. We believe that by combining the ancient wisdom of meditation with cutting-edge AI technology, we can help people reduce stress, improve focus, and enhance overall well-being.
          </p>
          <h2>How It Works</h2>
          <p>
            Our AI-driven platform analyzes your preferences, stress levels, and meditation goals to generate custom-tailored meditation sessions. Whether you're a beginner or an experienced practitioner, Calm adapts to your needs, providing a truly personalized meditation journey.
          </p>
          <h2>Features</h2>
          <ul>
            <li>AI-generated personalized meditations</li>
            <li>High-quality audio experiences</li>
            <li>Progress tracking and insights</li>
            <li>Flexible session durations</li>
            <li>Guided and unguided meditation options</li>
          </ul>
          <p>
            Start your journey to inner peace today with Calm. Let our AI guide you to a more balanced, focused, and relaxed state of mind.
          </p>
        </div>
      </div>
    </BaseLayout>
  )
}

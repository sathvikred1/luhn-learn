// Hero: two-column layout — text + input on the left, preview on the right.

import TopicInput from './TopicInput';
import SuggestedTopics from './SuggestedTopics';
import AnimatedPreview from './AnimatedPreview';

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
      {/* Left column */}
      <div className="flex flex-col gap-6">
        <h1
          className="font-heading text-4xl font-bold leading-tight text-text-primary opacity-0 animate-fade-up sm:text-5xl"
          style={{ animationDelay: '0ms' }}
        >
          Transform Knowledge into a{' '}
          <span className="gradient-text">Visual Learning System</span>
        </h1>
        <p
          className="text-lg text-text-secondary opacity-0 animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >
          Turn any topic into an interactive concept map, study cards,
          quizzes, flashcards, and a personalized revision path.
        </p>
        <div className="opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <TopicInput />
        </div>
        <div className="opacity-0 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <SuggestedTopics />
        </div>
      </div>

      {/* Right column */}
      <div className="opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <AnimatedPreview />
      </div>
    </section>
  );
}

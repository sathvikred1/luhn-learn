// "Why LuhnLearn?" — 2x2 grid of feature cards.

import { FEATURES } from '../../config/constants';

export default function FeaturesSection() {
  return (
    <section className="bg-bg-secondary py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center font-heading text-3xl font-bold text-text-primary">
          Why LuhnLearn?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-card border border-border-color bg-bg-primary p-6 shadow-card transition-shadow hover:shadow-node-hover"
            >
              <div className="mb-4 text-3xl">{f.emoji}</div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

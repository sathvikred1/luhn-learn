// Optional footer for the landing page.

import { APP_NAME } from '../../config/constants';

export default function Footer() {
  return (
    <footer className="border-t border-border-color bg-bg-primary py-8">
      <div className="mx-auto max-w-7xl px-6 text-center text-sm text-text-tertiary">
        <p>
          {APP_NAME} — AI-powered visual learning with maps, quizzes,
          flashcards, and revision paths.
        </p>
      </div>
    </footer>
  );
}

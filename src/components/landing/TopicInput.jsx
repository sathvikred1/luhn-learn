// Search input + "Create Map 🪄" button. Navigates to /map with the topic.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopicInput({ initialValue = '' }) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const topic = value.trim();
    if (!topic) return;
    navigate('/map', { state: { topic } });
  };

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter a topic to explore..."
        className="flex-1 rounded-input border border-border-color bg-bg-primary px-4 py-3 text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-brand-primary"
      />
      <button
        type="submit"
        className="whitespace-nowrap rounded-input bg-brand-primary px-6 py-3 font-medium text-white transition-colors hover:bg-brand-primary-hover"
      >
        Create Map 🪄
      </button>
    </form>
  );
}

// Chip grid of suggested topics. Clicking a chip launches the map.

import { useNavigate } from 'react-router-dom';
import Chip from '../ui/Chip';
import { SUGGESTED_TOPICS } from '../../config/constants';

export default function SuggestedTopics() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-text-tertiary">
        Try exploring:
      </span>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_TOPICS.map((t) => (
          <Chip
            key={t.label}
            onClick={() => navigate('/map', { state: { topic: t.label } })}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </Chip>
        ))}
      </div>
    </div>
  );
}

// Top navigation bar (landing page). Hidden on the map page.

import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.svg';
import { APP_NAME } from '../../config/constants';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border-color bg-bg-primary">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-7 w-7" />
          <span className="font-brand text-xl font-bold text-text-primary">
            {APP_NAME}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/map"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-brand-primary"
          >
            Create Map
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-tertiary"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
              L
            </div>
            <span className="hidden text-sm font-medium text-text-secondary sm:inline">
              Learner
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

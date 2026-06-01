// Reusable button with variant + size styling.

const VARIANTS = {
  primary:
    'bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent',
  accent:
    'bg-brand-accent hover:bg-brand-accent-hover text-white border-transparent',
  blue: 'bg-[#3B82F6] hover:bg-[#2563EB] text-white border-transparent',
  outline:
    'bg-transparent text-text-secondary border-border-color hover:border-border-hover hover:bg-bg-tertiary',
  ghost:
    'bg-transparent text-text-secondary border-transparent hover:bg-bg-tertiary',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-btn border font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

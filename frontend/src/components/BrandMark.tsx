interface BrandMarkProps {
  size?: number
  className?: string
  wordmark?: boolean
}

export function BrandMark({ size = 32, className, wordmark = true }: BrandMarkProps) {
  return (
    <span className={['inline-flex items-center gap-2 font-semibold tracking-tight', className].filter(Boolean).join(' ')}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#12161f" />
        <path
          d="M7.5 24V15.2C7.5 10.4 11.2 7 16 7s8.5 3.4 8.5 8.2V24"
          fill="none"
          stroke="#4f8ef7"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M16 7v3" stroke="#93b8ff" strokeWidth="2" strokeLinecap="round" />
        <rect x="14.4" y="16.2" width="3.2" height="7.8" rx="0.8" fill="#4f8ef7" />
        <circle cx="16" cy="14.2" r="1.15" fill="#93b8ff" />
      </svg>
      {wordmark ? <span>Átrio</span> : null}
    </span>
  )
}

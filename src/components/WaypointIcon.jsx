function WaypointIcon({ className = "w-6 h-6", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <polygon points="12,3 21,12 12,21 3,12" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  )
}

export default WaypointIcon
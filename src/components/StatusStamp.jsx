function StatusStamp({ status, label, seed }) {
  const styles = {
    applied: "border-moss text-moss dark:border-moss-bright dark:text-moss-bright",
    interview: "border-denim text-denim dark:border-denim-bright dark:text-denim-bright",
    offer: "border-ochre text-ochre",
    rejected: "border-brick text-brick dark:border-brick-bright dark:text-brick-bright",
    no_response: "border-stone text-stone",
  };
  const rotation = ((seed?.charCodeAt(0) || 0) % 5) - 2;
  return (
    <span
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full border-2 font-display text-[10px] uppercase tracking-widest ${styles[status] || styles.applied}`}
    >
      {label}
    </span>
  );
}

export default StatusStamp;

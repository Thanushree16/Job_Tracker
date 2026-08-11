import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useJobs } from "../hooks/useJobs"

const STATUS_STYLE = {
  applied: { border: "border-moss dark:border-moss-bright", text: "text-moss dark:text-moss-bright" },
  interview: { border: "border-denim dark:border-denim-bright", text: "text-denim dark:text-denim-bright" },
  offer: { border: "border-ochre", text: "text-ochre" },
  rejected: { border: "border-brick dark:border-brick-bright", text: "text-brick dark:text-brick-bright" },
}

function Profile() {
  const [user, setUser] = useState(null)
  const [displayName, setDisplayName] = useState("")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const { jobs, loading } = useJobs()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setDisplayName(user?.user_metadata?.display_name || "")
    }
    getUser()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName }
    })
    if (!error) setEditing(false)
    setSaving(false)
  }

  const getInitials = (email) => (email ? email[0].toUpperCase() : "U")

  const fileNumber = user?.id ? user.id.slice(0, 8).toUpperCase() : "———"

  const formatShort = (date) =>
    date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

  const joinedShort = user?.created_at ? formatShort(new Date(user.created_at)) : ""

  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {})

  const total = jobs.length
  const interviewCount = statusCounts.interview || 0
  const offerCount = statusCounts.offer || 0
  const rejectedCount = statusCounts.rejected || 0
  const respondedCount = interviewCount + offerCount + rejectedCount
  const responseRate = total ? Math.round((respondedCount / total) * 100) : 0
  const interviewRate = total ? Math.round((interviewCount / total) * 100) : 0

  const weeksSinceJoined = user?.created_at
    ? Math.max(1, Math.ceil((Date.now() - new Date(user.created_at)) / (7 * 24 * 60 * 60 * 1000)))
    : 1
  const avgPerWeek = total ? (total / weeksSinceJoined).toFixed(1) : "0.0"

  const journeyStops = [
    { label: "Applied", count: total, ...STATUS_STYLE.applied },
    { label: "Interview", count: interviewCount, ...STATUS_STYLE.interview },
    { label: "Offer", count: offerCount, ...STATUS_STYLE.offer },
    { label: "Rejected", count: rejectedCount, ...STATUS_STYLE.rejected },
  ]

  const byDate = {}
  jobs.forEach((job) => {
    const key = new Date(job.applied_at).toDateString()
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(job)
  })

  const logEntries = Object.entries(byDate)
    .map(([key, dayJobs]) => {
      const date = new Date(key)
      if (dayJobs.length === 1) {
        const job = dayJobs[0]
        return {
          date,
          title: `Applied to ${job.company || "Untitled company"}`,
          subtitle: job.role || "",
          style: STATUS_STYLE[job.status] || STATUS_STYLE.applied,
        }
      }
      return {
        date,
        title: `${dayJobs.length} applications logged`,
        subtitle: dayJobs.map((j) => j.company || "Untitled").join(", "),
        style: STATUS_STYLE.applied,
      }
    })
    .sort((a, b) => b.date - a.date)

  const lastActivity = logEntries.length ? formatShort(logEntries[0].date) : "—"

  const busiestDay = Object.entries(byDate).reduce(
    (max, [key, dayJobs]) => (dayJobs.length > max.count ? { count: dayJobs.length, date: new Date(key) } : max),
    { count: 0, date: null }
  )

  const fieldNote =
    busiestDay.count >= 2
      ? `Your busiest day was ${formatShort(busiestDay.date)} — ${busiestDay.count} applications logged at once.`
      : total > 0
      ? "One at a time, steadily logged — no clustering yet."
      : "Nothing logged yet. Your first entry starts the journey."

  if (!user) return <div className="p-6 text-stone">Loading...</div>

  return (
    <div
      className="max-w-3xl mx-auto p-6 space-y-5"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(140,133,117,0.12) 28px)",
      }}
    >
      <div className="border border-border-light dark:border-border-dark bg-parchment dark:bg-border-dark rounded-md p-5 flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-moss dark:border-moss-bright flex items-center justify-center text-moss dark:text-moss-bright text-2xl font-bold font-display flex-shrink-0">
            {getInitials(user.email)}
          </div>
          <div>
           
            {editing ? (
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  className="border border-border-light dark:border-border-dark bg-paper dark:bg-night text-ink dark:text-parchment rounded-md px-2 py-1 text-sm focus:outline-none focus:border-moss dark:focus:border-moss-bright"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm bg-moss text-parchment px-3 py-1 rounded-md hover:bg-moss-bright border border-moss dark:border-moss-bright"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm text-stone hover:text-ink dark:hover:text-parchment"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-ink dark:text-parchment text-2xl font-bold font-display tracking-wide">
                  {displayName || user.email.split("@")[0]}
                </h2>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs px-2 py-0.5 rounded border border-border-light dark:border-border-dark text-stone hover:text-ink dark:hover:text-parchment transition"
                >
                  Edit
                </button>
              </div>
            )}
            <p className="text-stone text-sm mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="text-right border-l border-dashed border-border-light dark:border-border-dark pl-6">
          <p className="text-stone text-[10px] uppercase tracking-widest font-display">Entry Date</p>
          <p className="text-ink dark:text-parchment font-display font-semibold mt-0.5">{joinedShort}</p>
          <p className="text-stone text-[10px] uppercase tracking-widest font-display mt-3">Last Activity</p>
          <p className="text-ink dark:text-parchment font-display font-semibold mt-0.5">{lastActivity}</p>
        </div>
      </div>

      <div className="border border-border-light dark:border-border-dark bg-parchment dark:bg-border-dark rounded-md p-5">
        <h3 className="text-ink dark:text-parchment font-semibold font-display tracking-wide mb-6">Journey</h3>

        {loading ? (
          <p className="text-stone text-sm">Loading journey...</p>
        ) : (
          <>
            <div className="relative flex items-start justify-between px-2">
              <div className="absolute top-5 left-10 right-10 border-t border-dashed border-border-light dark:border-border-dark" />
              {journeyStops.map((stop) => (
                <div key={stop.label} className="flex flex-col items-center gap-2 relative z-10 bg-parchment dark:bg-border-dark px-2">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-display font-bold text-sm ${
                      stop.count > 0
                        ? `${stop.border} ${stop.text}`
                        : "border-border-light dark:border-border-dark text-stone"
                    }`}
                  >
                    {stop.count}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-stone font-display">{stop.label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-5 border-t border-border-light dark:border-border-dark">
              <div>
                <p className="text-stone text-[10px] uppercase tracking-widest font-display">Response Rate</p>
                <p className="text-ink dark:text-parchment text-2xl font-bold font-display mt-1">{responseRate}%</p>
              </div>
              <div>
                <p className="text-stone text-[10px] uppercase tracking-widest font-display">Interview Rate</p>
                <p className="text-ink dark:text-parchment text-2xl font-bold font-display mt-1">{interviewRate}%</p>
              </div>
              <div>
                <p className="text-stone text-[10px] uppercase tracking-widest font-display">Avg. / Week</p>
                <p className="text-ink dark:text-parchment text-2xl font-bold font-display mt-1">{avgPerWeek}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {!loading && (
        <div className="border border-dashed border-border-light dark:border-border-dark rounded-md p-4 flex items-start gap-3">
          <span className="text-stone text-base font-display flex-shrink-0">✎</span>
          <div>
            <p className="text-stone text-[10px] uppercase tracking-widest font-display mb-1">Field Note</p>
            <p className="text-ink dark:text-parchment text-sm">{fieldNote}</p>
          </div>
        </div>
      )}

      

      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full text-sm text-brick dark:text-brick-bright border border-brick dark:border-brick-bright rounded-md py-2 hover:bg-brick hover:text-parchment transition"
      >
        Sign Out
      </button>
    </div>
  )
}

export default Profile
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useJobs } from "../hooks/useJobs"

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
    if (!error) {
      setEditing(false)
    }
    setSaving(false)
  }

  const getInitials = (email) => {
    return email ? email[0].toUpperCase() : "U"
  }

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {})

  if (!user) return <div className="p-6 text-stone">Loading...</div>

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">

      {/* Avatar + Name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-md bg-moss flex items-center justify-center text-parchment text-2xl font-bold font-display tracking-wide">
          {getInitials(user.email)}
        </div>
        <div>
          {editing ? (
            <div className="flex gap-2 items-center">
              <input
                className="border border-border-light dark:border-border-dark bg-paper dark:bg-border-dark text-ink dark:text-parchment rounded-md px-2 py-1 text-sm focus:outline-none focus:border-moss dark:focus:border-moss-bright"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
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
              <h2 className="text-ink dark:text-parchment text-xl font-semibold font-display tracking-wide">
                {displayName || user.email}
              </h2>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-denim dark:text-denim-bright hover:underline"
              >
                Edit
              </button>
            </div>
          )}
          <p className="text-stone text-sm">{user.email}</p>
        </div>
      </div>

      {/* Joined Date */}
      <div className="bg-parchment dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md p-4">
        <p className="text-stone text-sm">Member since</p>
        <p className="text-ink dark:text-parchment font-medium">{joinedDate}</p>
      </div>

      {/* Application Stats */}
      <div className="bg-parchment dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md p-4 space-y-3">
        <h3 className="text-ink dark:text-parchment font-semibold font-display tracking-wide">Application Summary</h3>
        {loading ? (
          <p className="text-stone text-sm">Loading stats...</p>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Total Applications</span>
              <span className="text-ink dark:text-parchment font-bold font-display">{jobs.length}</span>
            </div>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-stone capitalize">{status}</span>
                <span className="text-ink dark:text-parchment">{count}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Sign Out */}
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

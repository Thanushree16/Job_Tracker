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

  if (!user) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      
      {/* Avatar + Name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
          {getInitials(user.email)}
        </div>
        <div>
          {editing ? (
            <div className="flex gap-2 items-center">
              <input
                className="border border-gray-600 bg-gray-800 text-white rounded px-2 py-1 text-sm"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-white text-xl font-semibold">
                {displayName || user.email}
              </h2>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Edit
              </button>
            </div>
          )}
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Joined Date */}
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400 text-sm">Member since</p>
        <p className="text-white font-medium">{joinedDate}</p>
      </div>

      {/* Application Stats */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h3 className="text-white font-semibold">Application Summary</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading stats...</p>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Applications</span>
              <span className="text-white font-bold">{jobs.length}</span>
            </div>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-gray-400 capitalize">{status}</span>
                <span className="text-white">{count}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Sign Out */}
      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full text-sm text-red-400 border border-red-400 rounded-lg py-2 hover:bg-red-400 hover:text-white transition"
      >
        Sign Out
      </button>

    </div>
  )
}

export default Profile
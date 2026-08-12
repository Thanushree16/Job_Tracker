import { useState } from "react"

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "no_response", label: "No Response" },
]

function todayDateString() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function AddJobModal({ onClose, onSave }) {
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("applied")
  const [url, setUrl] = useState("")
  const [appliedDate, setAppliedDate] = useState(todayDateString())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSave = async () => {
    if (!company.trim() && !role.trim()) {
      setError("Add at least a company or role.")
      return
    }

    setSaving(true)
    setError(null)

    const { error: saveError } = await onSave({
      company: company.trim(),
      role: role.trim(),
      status,
      url: url.trim(),
      applied_at: new Date(appliedDate).toISOString(),
    })

    setSaving(false)

    if (saveError) {
      setError("Couldn't save this job. Try again.")
      return
    }

    onClose()
  }

  const inputClasses =
    "w-full bg-paper dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md px-3 py-2 text-ink dark:text-parchment text-sm focus:outline-none focus:border-moss dark:focus:border-moss-bright"

  return (
    <div
      className="fixed inset-0 bg-night/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-parchment dark:bg-night border border-border-light dark:border-border-dark rounded-md p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-ink dark:text-parchment text-lg font-semibold font-display tracking-wide mb-4">Add Job</h2>

        <div className="space-y-4">
          <div>
            <label className="text-stone text-xs uppercase tracking-widest block mb-1">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-stone text-xs uppercase tracking-widest block mb-1">
              Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-stone text-xs uppercase tracking-widest block mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClasses}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-stone text-xs uppercase tracking-widest block mb-1">
              Job Link
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-stone text-xs uppercase tracking-widest block mb-1">
              Applied On
            </label>
            <input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        {error && <p className="text-brick dark:text-brick-bright text-sm mt-3">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-stone hover:text-ink dark:hover:text-parchment transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-moss hover:bg-moss-bright text-parchment rounded-md font-medium transition border border-moss dark:border-moss-bright disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add job"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddJobModal
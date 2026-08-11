import { useState } from "react"

function EditJobModal({ job, onClose, onSave }) {
  const [company, setCompany] = useState(job.company || "")
  const [role, setRole] = useState(job.role || "")
  const [url, setUrl] = useState(job.url || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const { error: updateError } = await onSave(job.id, {
      company: company.trim(),
      role: role.trim(),
      url: url.trim(),
    })

    setSaving(false)

    if (updateError) {
      setError("Couldn't save changes. Try again.")
      return
    }

    onClose()
  }

  const inputClasses =
    "w-full bg-paper dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md px-3 py-2 text-ink dark:text-parchment text-sm focus:outline-none focus:border-moss dark:focus:border-moss-bright"

  return (
    <div
      className="fixed inset-0 bg-night/50 dark:bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-parchment dark:bg-night border border-border-light dark:border-border-dark rounded-md p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-ink dark:text-parchment text-lg font-semibold font-display tracking-wide mb-4">Edit Job</h2>

        <div className="space-y-4">
          <div>
            <label className="text-stone text-xs uppercase tracking-widest block mb-1">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
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
              className={inputClasses}
            />
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
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditJobModal

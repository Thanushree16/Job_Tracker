import { useState } from "react";
import { useJobs } from "../hooks/useJobs.js";
import EditJobModal from "./EditJobModal.jsx";
import AddJobModal from "./AddJobModal.jsx";
import StatusStamp from "../components/StatusStamp.jsx";

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "no_response", label: "No Response" },
];

function CompanyAvatar({ name }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="w-7 h-7 rounded-md bg-moss text-parchment text-xs font-bold font-display flex items-center justify-center flex-shrink-0">
      {initial}
    </div>
  );
}

function Dashboard() {
  const { jobs, loading, updateJob, deleteJob, addJob } = useJobs();
  const [editingJob, setEditingJob] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const handleDelete = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.company || "this entry"}" — ${job.role || "no role"}? This can't be undone.`
    );
    if (!confirmed) return;

    setDeletingId(job.id);
    const { error } = await deleteJob(job.id);
    setDeletingId(null);

    if (error) {
      alert("Couldn't delete this entry. Try again.");
    }
  };

  const handleStatusChange = async (job, newStatus) => {
    setUpdatingStatusId(job.id);
    const { error } = await updateJob(job.id, { status: newStatus });
    setUpdatingStatusId(null);

    if (error) {
      alert("Couldn't update status. Try again.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-ink dark:text-parchment text-2xl font-semibold font-display tracking-wide">
            Waypoint
          </h1>
          <p className="text-stone text-sm mt-0.5">
            Track every application in one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-parchment dark:bg-night border border-border-light dark:border-border-dark rounded-md p-5">
          <p className="text-stone text-xs uppercase tracking-widest mb-1">
            Total Applied
          </p>
          <h3 className="text-ink dark:text-parchment text-3xl font-bold font-display tracking-wide">{jobs.length}</h3>
        </div>
        <div className="bg-parchment dark:bg-night border border-border-light dark:border-border-dark rounded-md p-5">
          <p className="text-stone text-xs uppercase tracking-widest mb-1">
            Interviews
          </p>
          <h3 className="text-ink dark:text-parchment text-3xl font-bold font-display tracking-wide">{jobs.filter(j => j.status === 'interview').length}</h3>
        </div>
        <div className="bg-parchment dark:bg-night border border-border-light dark:border-border-dark rounded-md p-5">
          <p className="text-stone text-xs uppercase tracking-widest mb-1">
            Offers
          </p>
          <h3 className="text-ink dark:text-parchment text-3xl font-bold font-display tracking-wide">{jobs.filter(j => j.status === 'offer').length}</h3>
        </div>
        <div className="bg-parchment dark:bg-night border border-border-light dark:border-border-dark rounded-md p-5">
          <p className="text-stone text-xs uppercase tracking-widest mb-1">
            Rejected
          </p>
          <h3 className="text-ink dark:text-parchment text-3xl font-bold font-display tracking-wide">{jobs.filter(j => j.status === 'rejected').length}</h3>
        </div>
        <div className="bg-parchment dark:bg-night border border-border-light dark:border-border-dark rounded-md p-5">
          <p className="text-stone text-xs uppercase tracking-widest mb-1">
            No Response
          </p>
          <h3 className="text-ink dark:text-parchment text-3xl font-bold font-display tracking-wide">{jobs.filter(j => j.status === 'no_response').length}</h3>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 mb-3">
        <h2 className="text-ink dark:text-parchment text-lg font-semibold font-display tracking-wide">Applications</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm bg-moss hover:bg-moss-bright dark:bg-moss dark:hover:bg-moss-bright text-parchment rounded-md font-medium transition flex items-center gap-2 border border-moss dark:border-moss-bright"
        >
          <span className="text-lg leading-none">+</span> Add Job
        </button>
      </div>

      <div className="bg-parchment dark:bg-night border border-border-light dark:border-border-dark rounded-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-paper dark:bg-border-dark/50 border-b border-border-light dark:border-border-dark">
            <tr>
              <th className="text-stone text-xs uppercase tracking-widest py-3 pl-5 pr-4 font-medium">Sno</th>
              <th className="text-stone text-xs uppercase tracking-widest py-3 pr-4 font-medium">Company</th>
              <th className="text-stone text-xs uppercase tracking-widest py-3 pr-4 font-medium">Role</th>
              <th className="text-stone text-xs uppercase tracking-widest py-3 pr-4 font-medium">Status</th>
              <th className="text-stone text-xs uppercase tracking-widest py-3 pr-4 font-medium">Link</th>
              <th className="text-stone text-xs uppercase tracking-widest py-3 pr-4 font-medium">Date</th>
              <th className="text-stone text-xs uppercase tracking-widest py-3 pr-5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-stone">Loading...</td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-stone">No jobs found.</td>
              </tr>
            ) : (
              jobs.map((job, index) => (
                <tr
                  key={job.id}
                  className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-paper dark:hover:bg-border-dark/40 transition-colors"
                >
                  <td className="py-3 pl-5 pr-4 text-sm text-stone">{index + 1}</td>
                  <td className="py-3 pr-4 text-sm">
                    <div className="flex items-center gap-2.5">
                      <CompanyAvatar name={job.company} />
                      <span className="text-ink dark:text-parchment font-medium">
                        {job.company || <span className="text-stone font-normal">—</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-stone dark:text-stone">{job.role}</td>
                  <td className="py-3 pr-4 text-sm">
                    <div className="relative inline-block group">
                      <StatusStamp
                        status={job.status}
                        label={STATUS_OPTIONS.find(o => o.value === job.status)?.label || job.status}
                        seed={job.id}
                      />
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job, e.target.value)}
                        disabled={updatingStatusId === job.id}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:outline-none disabled:cursor-not-allowed"
                        aria-label="Change status"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm">
                    {job.url ? (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-denim dark:text-denim-bright hover:underline font-medium"
                      >
                        View →
                      </a>
                    ) : (
                      <span className="text-stone">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-sm text-stone">
                    {new Date(job.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 pr-5 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingJob(job)}
                        className="px-3 py-1 text-xs font-medium rounded-md border border-border-light dark:border-border-dark text-stone dark:text-stone hover:bg-paper dark:hover:bg-border-dark hover:text-ink dark:hover:text-parchment transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job)}
                        disabled={deletingId === job.id}
                        className="px-3 py-1 text-xs font-medium rounded-md border border-brick dark:border-brick text-brick dark:text-brick hover:bg-brick hover:text-parchment dark:hover:bg-brick dark:hover:text-parchment transition disabled:opacity-50"
                      >
                        {deletingId === job.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={updateJob}
        />
      )}

      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onSave={addJob}
        />
      )}
    </div>
  );
}

export default Dashboard;

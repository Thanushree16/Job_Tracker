import { useState } from "react";
import { useJobs } from "../hooks/useJobs.js";
import EditJobModal from "./EditJobModal.jsx";
import AddJobModal from "./AddJobModal.jsx";


const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "no_response", label: "No Response" },
];

// Full literal class strings (not built dynamically) so Tailwind's compiler
// can actually detect and include them in the build.
const STATUS_STYLES = {
  applied: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  interview: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  offer: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  no_response: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
};

function CompanyAvatar({ name }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="p-6 max-w-7xl mx-auto">


        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest mb-1">
              Total Applied
            </p>
            <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{jobs.length}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest mb-1">
              Interviews
            </p>
            <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{jobs.filter(j => j.status === 'interview').length}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest mb-1">
              Offers
            </p>
            <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{jobs.filter(j => j.status === 'offer').length}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest mb-1">
              Rejected
            </p>
            <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{jobs.filter(j => j.status === 'rejected').length}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest mb-1">
              No Response
            </p>
            <h3 className="text-slate-900 dark:text-white text-3xl font-bold">{jobs.filter(j => j.status === 'no_response').length}</h3>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 mb-3">
          <h2 className="text-slate-900 dark:text-white text-lg font-semibold">Applications</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm bg-blue-700 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-sm"
          >
            <span className="text-lg leading-none">+</span> Add Job
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest py-3 pl-5 pr-4 font-medium">Sno</th>
                <th className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest py-3 pr-4 font-medium">Company</th>
                <th className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest py-3 pr-4 font-medium">Role</th>
                <th className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest py-3 pr-4 font-medium">Status</th>
                <th className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest py-3 pr-4 font-medium">Link</th>
                <th className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest py-3 pr-4 font-medium">Date</th>
                <th className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest py-3 pr-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 dark:text-slate-500">Loading...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 dark:text-slate-500">No jobs found.</td>
                </tr>
              ) : (
                jobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 pl-5 pr-4 text-sm text-slate-500 dark:text-slate-400">{index + 1}</td>
                    <td className="py-3 pr-4 text-sm">
                      <div className="flex items-center gap-2.5">
                        <CompanyAvatar name={job.company} />
                        <span className="text-slate-900 dark:text-white font-medium">
                          {job.company || <span className="text-slate-400 dark:text-slate-500 font-normal">—</span>}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-slate-700 dark:text-slate-300">{job.role}</td>
                    <td className="py-3 pr-4 text-sm">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job, e.target.value)}
                        disabled={updatingStatusId === job.id}
                        className={`rounded-full px-3 py-1 text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 ${STATUS_STYLES[job.status] || STATUS_STYLES.applied}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-sm">
                      {job.url ? (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 dark:text-blue-400 hover:underline font-medium"
                        >
                          View →
                        </a>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(job.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 pr-5 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingJob(job)}
                          className="px-3 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job)}
                          disabled={deletingId === job.id}
                          className="px-3 py-1 text-xs font-medium rounded-md border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition disabled:opacity-50"
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
    </div>
  );
}

export default Dashboard;
import { useState } from "react";
import { useJobs } from "../hooks/useJobs.js";
import EditJobModal from "./EditJobModal.jsx";

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "no_response", label: "No Response" },
];

function Dashboard() {
  const { jobs, loading, updateJob, deleteJob } = useJobs();
  const [editingJob, setEditingJob] = useState(null);
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
    <div className="p-6">
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">
            Total Applied
          </p>
          <h3 className="text-white text-3xl font-bold">{jobs.length}</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">
            Interviews
          </p>
          <h3 className="text-white text-3xl font-bold">{jobs.filter(j => j.status === 'interview').length}</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">
            Offers
          </p>
          <h3 className="text-white text-3xl font-bold">{jobs.filter(j => j.status === 'offer').length}</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">
            Rejected
          </p>
          <h3 className="text-white text-3xl font-bold">{jobs.filter(j => j.status === 'rejected').length}</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">
            No Response
          </p>
          <h3 className="text-white text-3xl font-bold">{jobs.filter(j => j.status === 'no_response').length}</h3>
        </div>
      </div>

      <table className="w-full text-left text-white mt-6 border-collapse">
        <thead className="border-b border-zinc-800">
          <tr>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">Sno</th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">Company</th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">Role</th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">Status</th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">Link</th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">Date</th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="text-center py-6 text-zinc-500">Loading...</td>
            </tr>
          ) : jobs.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-6 text-zinc-500">No jobs found.</td>
            </tr>
          ) : (
            jobs.map((job, index) => (
              <tr key={job.id} className="border-b border-zinc-800">
                <td className="py-3 pr-6 text-sm text-zinc-300">{index + 1}</td>
                <td className="py-3 pr-6 text-sm text-zinc-300">{job.company}</td>
                <td className="py-3 pr-6 text-sm text-zinc-300">{job.role}</td>
                <td className="py-3 pr-6 text-sm">
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job, e.target.value)}
                    disabled={updatingStatusId === job.id}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 pr-6 text-sm">
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="py-3 pr-6 text-sm text-zinc-300">
                  {new Date(job.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="py-3 pr-6 text-sm">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingJob(job)}
                      className="text-zinc-400 hover:text-white underline transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job)}
                      disabled={deletingId === job.id}
                      className="text-red-500/70 hover:text-red-400 underline transition disabled:opacity-50"
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

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={updateJob}
        />
      )}
    </div>
  );
}

export default Dashboard;
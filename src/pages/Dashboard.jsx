import { useJobs } from "../hooks/useJobs.js";

function Dashboard() {
  const { jobs, loading } = useJobs();

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-4">
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
      </div>

      <table className="w-full text-left text-white mt-6 border-collapse">
        <thead className="border-b border-zinc-800">
          <tr>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">
              Sno
            </th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">
              Company
            </th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">
              Role
            </th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">
              Status
            </th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">
              Applied on
            </th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">
              Date
            </th>
            <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 pr-6">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="text-center py-6 text-zinc-500">
                Loading...
              </td>
            </tr>
          ) : jobs.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-6 text-zinc-500">
                No jobs found.
              </td>
            </tr>
          ) : (
            jobs.map((job, index) => (
              <tr key={job.id} className="border-b border-zinc-800">
                <td className="py-3 pr-6 text-sm text-zinc-300">{index + 1}</td>
                <td className="py-3 pr-6 text-sm text-zinc-300">
                  {job.company}
                </td>
                <td className="py-3 pr-6 text-sm text-zinc-300">{job.role}</td>
                <td className="py-3 pr-6 text-sm text-zinc-300">
                  {job.status}
                </td>
                <td className="py-3 pr-6 text-sm text-zinc-300">{job.url}</td>
                <td className="py-3 pr-6 text-sm text-zinc-300">
                  {new Date(job.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="py-3 pr-6 text-sm text-zinc-300">Edit</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;

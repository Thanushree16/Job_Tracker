import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase.js"


export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("applied_at", { ascending: false })
      if (error) {
        console.error("Error fetching jobs:", error)
      } else {
        setJobs(data)
      }
      setLoading(false)
    }
    fetchJobs()

    // Realtime subscription — pushes any change on the jobs table to every
    // open tab instantly over a websocket, regardless of what made the
    // change (this tab's own Add Job modal, the extension writing from a
    // completely separate process, another browser tab, etc). RLS already
    // restricts which rows a given user's connection can see, so this only
    // ever delivers events for the logged-in user's own jobs.
    const channel = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setJobs((prev) => {
              // Avoid duplicating a row this same tab already added
              // optimistically (see addJob below) before Realtime's event
              // for that same insert arrives a moment later.
              if (prev.some((job) => job.id === payload.new.id)) return prev
              // Re-sort rather than prepend, so the order stays identical
              // to what a fresh page load would show (newest applied_at
              // first) no matter when or how a row arrives.
              return [...prev, payload.new].sort(
                (a, b) => new Date(b.applied_at) - new Date(a.applied_at)
              )
            })
          } else if (payload.eventType === 'UPDATE') {
            setJobs((prev) =>
              prev.map((job) => (job.id === payload.new.id ? payload.new : job))
            )
          } else if (payload.eventType === 'DELETE') {
            setJobs((prev) => prev.filter((job) => job.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [])

  const updateJob = async (id, updates) => {
    const { data, error } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating job:", error)
      return { error }
    }

    setJobs((prev) => prev.map((job) => (job.id === id ? data : job)))
    return { data }
  }

  const deleteJob = async (id) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id)

    if (error) {
      console.error("Error deleting job:", error)
      return { error }
    }

    setJobs((prev) => prev.filter((job) => job.id !== id))
    return { success: true }
  }

  // Manual add — for jobs that never went through the extension (referrals,
  // career-page applications you found yourself, anything applied to before
  // installing the extension, etc). Requires the current user's id since the
  // insert RLS policy checks auth.uid() = user_id on the row being created.
  //
  // Uses getSession() rather than getUser() — getUser() makes a live network
  // round-trip to Supabase's Auth server to re-verify the token every call,
  // which is the right call for security-critical server-side checks but
  // unnecessary overhead here: supabase-js already manages this session
  // securely and refreshes it proactively, and the RLS policy independently
  // re-checks auth.uid() server-side regardless of what this call returns.
  const addJob = async (newJob) => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    const user = session?.user

    if (sessionError || !user) {
      console.error("Error getting current session:", sessionError)
      return { error: sessionError || new Error("Not authenticated") }
    }

    const payload = {
      user_id: user.id,
      company: newJob.company || "",
      role: newJob.role || "",
      status: newJob.status || "applied",
      url: newJob.url || "",
      jd_text: "",
      applied_at: newJob.applied_at || new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("jobs")
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error("Error adding job:", error)
      return { error }
    }

    // Re-sort rather than prepend, so the new job lands in the same spot it
    // would land after a page reload — newest applied_at first, always.
    setJobs((prev) =>
      [...prev, data].sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
    )
    return { data }
  }

  return { jobs, loading, updateJob, deleteJob, addJob }
}
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase.js"


export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  
    const fetchJobs = async () => {
      const { data, error } = await supabase.from("jobs").select("*")
      if (error) {
        console.error("Error fetching jobs:", error)
      } else {
        setJobs(data)
      }
      setLoading(false)
    }
    fetchJobs()

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
  const addJob = async (newJob) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting current user:", userError)
      return { error: userError || new Error("Not authenticated") }
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

    // New entries go to the top so the just-added job is immediately visible.
    setJobs((prev) => [data, ...prev])
    return { data }
  }

  return { jobs, loading, updateJob, deleteJob, addJob }
}
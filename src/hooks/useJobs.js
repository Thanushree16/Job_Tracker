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

  return { jobs, loading, updateJob, deleteJob }
}
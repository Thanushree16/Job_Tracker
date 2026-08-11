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

  return { jobs, loading, updateJob }
}
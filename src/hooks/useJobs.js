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

  return { jobs, loading }
}

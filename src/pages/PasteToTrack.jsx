import { useState } from "react";
import { supabase } from "../lib/supabase.js";

function PasteToTrack() {
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    setLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Extract the company name, job role/title, and application URL from this job description. Return ONLY a JSON object with keys: company, role, url. No explanation, no markdown, just raw JSON.\n\n${jdText}`,
            },
          ],
        }),
      });

      const data = await response.json();
      console.log(data);
      const parsed = JSON.parse(data.choices[0].message.content);

      const { error } = await supabase.from("jobs").insert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        company: parsed.company,
        role: parsed.role,
        url: parsed.url,
        status: "applied",
      });

      if (error) throw error;

      alert("Job tracked!");
      setJdText("");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-white text-xl font-semibold mb-1">Paste to Track</h1>
        <p className="text-zinc-500 text-sm">Paste a job description and we'll extract the details automatically.</p>
      </div>
      <div className="flex flex-col gap-3">
        <label htmlFor="jdText" className="text-zinc-400 text-sm font-medium">
          Job Description
        </label>
        <textarea
          id="jdText"
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows="12"
          placeholder="Paste the full job description here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        ></textarea>
        <button
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          onClick={handleTrack}
          disabled={loading || jdText.trim() === ""}
        >
          {loading ? "Tracking..." : "Track Job"}
        </button>
      </div>
    </div>
  );
}

export default PasteToTrack;
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="jdText" className="text-zinc-500 text-sm">
          Paste Job Description
        </label>
        <textarea
          id="jdText"
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="10"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        ></textarea>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleTrack}
          disabled={loading || jdText.trim() === ""}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default PasteToTrack;
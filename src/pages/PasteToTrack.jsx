import { useState } from "react";
import { supabase } from "../lib/supabase.js";

function PasteToTrack() {
  const [jdText, setJdText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracted, setExtracted] = useState(null); // { company, role, url } | null

  const handleExtract = async () => {
    setExtracting(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
      const parsed = JSON.parse(data.choices[0].message.content);

      setExtracted({
        company: parsed.company || "",
        role: parsed.role || "",
        url: parsed.url || "",
      });
    } catch (err) {
      console.error(err);
      alert("Couldn't extract details from that text. Try again.");
    }

    setExtracting(false);
  };

  const handleConfirm = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("jobs").insert({
        user_id: user.id,
        company: extracted.company,
        role: extracted.role,
        url: extracted.url,
        status: "applied",
        applied_at: new Date().toISOString(),
      });

      if (error) throw error;

      setJdText("");
      setExtracted(null);
    } catch (err) {
      console.error(err);
      alert("Couldn't save this job. Try again.");
    }

    setSaving(false);
  };

  const handleClear = () => {
    setJdText("");
    setExtracted(null);
  };

  const inputClasses =
    "w-full bg-paper dark:bg-night border border-border-light dark:border-border-dark rounded-md px-3 py-2 text-sm text-ink dark:text-parchment focus:outline-none focus:border-moss dark:focus:border-moss-bright";

  return (
    <div className="max-w-2xl mx-auto w-full p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-ink dark:text-parchment text-xl font-semibold font-display tracking-wide mb-1">
          Paste to Track
        </h1>
        <p className="text-stone text-sm">
          Paste a job description and we'll extract the company, role and link automatically.
        </p>
      </div>

      {!extracted ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="jdText" className="text-stone text-xs uppercase tracking-widest font-display">
              Job Description
            </label>
            <span className="text-stone text-xs">{jdText.length} characters</span>
          </div>

          <textarea
            id="jdText"
            className="bg-paper dark:bg-border-dark border border-border-light dark:border-border-dark rounded-md p-4 text-sm text-ink dark:text-parchment focus:outline-none focus:border-moss dark:focus:border-moss-bright resize-none"
            rows="12"
            placeholder="Paste the full job description here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              className="flex-1 bg-moss text-parchment px-4 py-3 rounded-md hover:bg-moss-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-moss dark:border-moss-bright"
              onClick={handleExtract}
              disabled={extracting || jdText.trim() === ""}
            >
              {extracting ? "Extracting..." : "Extract details"}
            </button>
            <button
              className="px-4 py-3 rounded-md border border-border-light dark:border-border-dark text-stone hover:text-ink dark:hover:text-parchment transition"
              onClick={handleClear}
              disabled={extracting || jdText.trim() === ""}
            >
              Clear
            </button>
          </div>

          <div className="flex items-start gap-2 border border-dashed border-border-light dark:border-border-dark rounded-md p-4">
            <span className="text-stone text-sm flex-shrink-0">ⓘ</span>
            <p className="text-stone text-sm">
              Works with listings from LinkedIn, Naukri, Wellfound and company career pages.
              Nothing is saved until you confirm.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-stone text-sm">
            Here's what we found — fix anything that's off before saving.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-stone text-xs uppercase tracking-widest font-display">Company</label>
            <input
              type="text"
              value={extracted.company}
              onChange={(e) => setExtracted({ ...extracted, company: e.target.value })}
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-stone text-xs uppercase tracking-widest font-display">Role</label>
            <input
              type="text"
              value={extracted.role}
              onChange={(e) => setExtracted({ ...extracted, role: e.target.value })}
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-stone text-xs uppercase tracking-widest font-display">Link</label>
            <input
              type="url"
              value={extracted.url}
              onChange={(e) => setExtracted({ ...extracted, url: e.target.value })}
              placeholder="https://..."
              className={inputClasses}
            />
          </div>

          <div className="flex gap-3 mt-1">
            <button
              className="flex-1 bg-moss text-parchment px-4 py-3 rounded-md hover:bg-moss-bright transition-colors disabled:opacity-50 font-medium border border-moss dark:border-moss-bright"
              onClick={handleConfirm}
              disabled={saving}
            >
              {saving ? "Saving..." : "Confirm & track"}
            </button>
            <button
              className="px-4 py-3 rounded-md border border-border-light dark:border-border-dark text-stone hover:text-ink dark:hover:text-parchment transition"
              onClick={() => setExtracted(null)}
              disabled={saving}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PasteToTrack;
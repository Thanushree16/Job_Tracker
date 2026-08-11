function GetExtension() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-ink dark:text-parchment text-xl font-semibold font-display tracking-wide mb-1">
          Get the Chrome Extension
        </h1>
        <p className="text-stone text-sm">
          Capture jobs directly from Indeed, LinkedIn, Naukri and company career pages —
          no copy-pasting the description in yourself.
        </p>
      </div>

      <div className="flex items-start gap-2 border border-dashed border-border-light dark:border-border-dark rounded-md p-4">
        <span className="text-stone text-sm flex-shrink-0">ⓘ</span>
        <p className="text-stone text-sm">
          This isn't on the Chrome Web Store yet, so Chrome requires one manual step to
          load it. Takes about a minute, and you only need to do it once.
        </p>
      </div>

      <a
        href="/waypoint-extension.zip"
        download
        className="block w-full text-center bg-moss hover:bg-moss-bright text-parchment font-semibold rounded-md py-3 transition border border-moss dark:border-moss-bright"
      >
        Download extension (.zip)
      </a>

      <div className="border border-border-light dark:border-border-dark bg-parchment dark:bg-border-dark rounded-md p-5">
        <h3 className="text-ink dark:text-parchment font-semibold font-display tracking-wide mb-4">
          Install steps
        </h3>
        <ol className="space-y-4">
          {[
            "Download the .zip above, then unzip it somewhere you'll remember, like your Desktop.",
            "Open Chrome and go to chrome://extensions",
            "Turn on Developer mode — the toggle is in the top-right corner.",
            'Click "Load unpacked".',
            "Select the unzipped folder.",
            "The Waypoint icon appears in your toolbar. You're ready to go.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full border border-moss dark:border-moss-bright text-moss dark:text-moss-bright text-xs font-display font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-ink dark:text-parchment text-sm pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-stone text-xs text-center">
        Chrome may show a "Developer mode extensions" warning banner — that's expected for
        any extension loaded this way, not a sign something's wrong.
      </p>
    </div>
  );
}

export default GetExtension;
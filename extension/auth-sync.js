// auth-sync.js
// Runs only on job-tracker-sigma-indol.vercel.app
// Finds the Supabase session in this page's localStorage and
// sends it to background.js so the extension can use it on other sites

function syncSession() {
  const keys = Object.keys(localStorage);
  const sessionKey = keys.find(
    key => key.startsWith('sb-') && key.endsWith('-auth-token')
  );

  const sessionData = sessionKey ? localStorage.getItem(sessionKey) : null;

  chrome.runtime.sendMessage({
    type: 'SYNC_SESSION',
    session: sessionData
  });
}

// Run once when the page loads
syncSession();

// Re-run whenever localStorage changes — covers login and logout
window.addEventListener('storage', syncSession);
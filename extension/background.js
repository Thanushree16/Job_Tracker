// background.js
// 1. Listens for the session from auth-sync.js and stores it
// 2. Listens for detected "Apply" clicks from content.js and saves the job to Supabase
// 3. Self-heals an expired access token using the stored refresh_token
// 4. Reports back a real {success, error} result to content.js instead of
//    silently succeeding-or-failing with no feedback to the user.

const SUPABASE_URL = 'https://rhggassmooplumabxpbn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZ2dhc3Ntb29wbHVtYWJ4cGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjc4MjQsImV4cCI6MjA5NTY0MzgyNH0.7yKm8a8bOVAa1tZlr8tPLtBqpZpbekZui3E0A3mEjUk';

async function getStoredSession() {
  const stored = await chrome.storage.local.get('supabaseSession');
  const sessionRaw = stored.supabaseSession;
  if (!sessionRaw) return null;
  try {
    return JSON.parse(sessionRaw);
  } catch (e) {
    console.error('Job Tracker: failed to parse stored session', e);
    return null;
  }
}

async function storeSession(session) {
  await chrome.storage.local.set({ supabaseSession: JSON.stringify(session) });
}

function setBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 4000);
}

async function refreshSession(refreshToken) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`refresh failed: ${response.status} ${errText}`);
  }

  return response.json();
}

// Returns a real result object every time — { success: true } or
// { success: false, error: '<code>' } — so the toast can actually tell you
// what happened instead of closing silently either way.
async function saveJobToSupabase(job) {
  const session = await getStoredSession();

  if (!session) {
    console.log('Job Tracker: no session found — are you logged in on the site?');
    return { success: false, error: 'not_logged_in' };
  }

  const accessToken = session.access_token;
  const userId = session.user?.id;

  if (!accessToken || !userId) {
    console.log('Job Tracker: session missing access token or user id');
    return { success: false, error: 'not_logged_in' };
  }

  const payload = {
    user_id: userId,
    company: job.company || '',
    role: job.role || '',
    jd_text: job.jd_text || '',
    url: job.url || '',
    status: 'applied',
    applied_at: new Date().toISOString()
  };

  const doInsert = (token) => fetch(`${SUPABASE_URL}/rest/v1/jobs`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  try {
    let response = await doInsert(accessToken);

    if (response.status === 401) {
      const errorText = await response.text();
      console.warn('Job Tracker: access token rejected (likely expired), attempting refresh —', errorText);

      if (!session.refresh_token) {
        console.error('Job Tracker: no refresh_token available — open the Job Tracker site and make sure you are logged in, then try again.');
        setBadge('!', '#ef4444');
        return { success: false, error: 'not_logged_in' };
      }

      try {
        const refreshed = await refreshSession(session.refresh_token);
        await storeSession(refreshed);
        console.log('Job Tracker: session refreshed successfully');
        response = await doInsert(refreshed.access_token);
      } catch (refreshErr) {
        console.error('Job Tracker: session refresh failed — please log in again on the Job Tracker site.', refreshErr);
        setBadge('!', '#ef4444');
        return { success: false, error: 'session_expired' };
      }
    }

    if (response.ok) {
      console.log('Job Tracker: job saved successfully');
      setBadge('✓', '#22c55e');
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('Job Tracker: failed to save job', response.status, errorText);
      setBadge('!', '#ef4444');
      return { success: false, error: 'save_failed' };
    }
  } catch (e) {
    console.error('Job Tracker: network error saving job', e);
    return { success: false, error: 'network_error' };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_SESSION') {
    if (message.session) {
      chrome.storage.local.set({ supabaseSession: message.session });
      console.log('Job Tracker: session synced');
    } else {
      chrome.storage.local.remove('supabaseSession');
      console.log('Job Tracker: session cleared');
    }
    return; // no response needed for this message type
  }

  if (message.type === 'JOB_APPLY_DETECTED') {
    saveJobToSupabase(message.job).then((result) => {
      sendResponse(result);
    });
    return true; // keep the message channel open for the async sendResponse above
  }
});
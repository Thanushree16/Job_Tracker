// background.js
// 1. Listens for the session from auth-sync.js and stores it
// 2. Listens for detected "Apply" clicks from content.js and saves the job to Supabase
// 3. Self-heals an expired access token using the stored refresh_token — this
//    works even if the Job Tracker site tab isn't open or hasn't refreshed
//    recently, since it only needs what's already sitting in chrome.storage.local.

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
  // Stored in the same string-encoded shape getStoredSession expects
  await chrome.storage.local.set({ supabaseSession: JSON.stringify(session) });
}

function setBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 4000);
}

// Exchanges the long-lived refresh_token for a brand new access_token.
// Works independently of any open tab — this call goes straight to Supabase.
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

  return response.json(); // { access_token, refresh_token, user, expires_at, ... }
}

async function saveJobToSupabase(job) {
  const session = await getStoredSession();

  if (!session) {
    console.log('Job Tracker: no session found — are you logged in on the site?');
    return;
  }

  const accessToken = session.access_token;
  const userId = session.user?.id;

  if (!accessToken || !userId) {
    console.log('Job Tracker: session missing access token or user id');
    return;
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
        return;
      }

      try {
        const refreshed = await refreshSession(session.refresh_token);
        await storeSession(refreshed);
        console.log('Job Tracker: session refreshed successfully');
        response = await doInsert(refreshed.access_token);
      } catch (refreshErr) {
        console.error('Job Tracker: session refresh failed — please log in again on the Job Tracker site.', refreshErr);
        setBadge('!', '#ef4444');
        return;
      }
    }

    if (response.ok) {
      console.log('Job Tracker: job saved successfully');
      setBadge('✓', '#22c55e');
    } else {
      const errorText = await response.text();
      console.error('Job Tracker: failed to save job', response.status, errorText);
      setBadge('!', '#ef4444');
    }
  } catch (e) {
    console.error('Job Tracker: network error saving job', e);
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
  }

  if (message.type === 'JOB_APPLY_DETECTED') {
    saveJobToSupabase(message.job);
  }
});
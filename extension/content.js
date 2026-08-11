// content.js
// Runs on every site EXCEPT the Job Tracker app itself (excluded in manifest.json).
// Detects "Apply" clicks, extracts job data from the current page,
// shows a confirm/cancel prompt, and only saves if you hit Save.
//
// KEY INSIGHT (from testing Indeed's multi-step "smart apply" flow):
// Real job data (company, role) only exists on the ORIGINAL job listing page
// (JSON-LD JobPosting schema). Once you click Apply and land in the
// multi-step apply flow (resume upload -> review -> submit), those later
// steps have NO job metadata at all -- it's a generic form host. So instead
// of re-extracting on every apply-like click (which fails on later steps
// and can overwrite a GOOD earlier capture with a BAD one), we now capture
// ONCE per apply flow and carry that single capture through:
//
// - `currentSession` (in-memory): this flow's state for as long as THIS
//   script instance stays loaded. Resets naturally on any real new page
//   load -- which is exactly when a genuinely different apply flow starts.
// - `handoffJob` (chrome.storage.local): a single-use relay that survives
//   the ONE real cross-origin navigation this flow makes (e.g.
//   indeed.com -> smartapply.indeed.com), since that jump wipes
//   `currentSession` along with the whole script instance.

// Two tiers, deliberately separated:
// - START keywords are strong, unambiguous "this is a job apply action" signals.
//   Only these are allowed to BEGIN a brand-new detection flow from a cold state.
// - CONTINUE keywords (bare "submit" especially) are too generic to trust on
//   their own — quizzes, assessments, contact forms, surveys all have a
//   "Submit" button. These only matter once we're ALREADY mid-application
//   (currentSession.status === 'pending'), where a Submit click is very
//   likely the final step of the flow we already started.
const APPLY_START_KEYWORDS = [
  'apply',
  'apply now',
  'easy apply',
  'apply for this job',
  'quick apply',
  '1-click apply',
  'apply with indeed'
];

const APPLY_CONTINUE_KEYWORDS = [
  'submit application',
  'submit'
];

const HANDOFF_TTL_MS = 10 * 60 * 1000; // 10 minutes — multi-step apply flows (resume, review, submit) can take a while

// This flow's state for as long as this script instance is loaded.
// { job, status: 'pending' | 'saved' | 'dismissed' | 'invalid' } or null if nothing detected yet.
let currentSession = null;

function matchesKeywords(control, keywords) {
  const text = (control.innerText || control.textContent || control.value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  if (!text || text.length > 40) return false;

  for (const keyword of keywords) {
    const pattern = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

// Finds the nearest actual interactive control being clicked (a real button,
// link, or role="button") — NOT a generic wrapping div/card. Walking up
// arbitrary parent levels and reading their full innerText risks bleeding in
// unrelated sibling content (e.g. a job card's "Easily apply" badge sitting
// near the job title — both end up inside the same wrapping container's
// text, falsely matching even though the title link itself has nothing to
// do with applying).
function getClickedControl(element) {
  return element.closest('button, a, [role="button"], input[type="submit"]');
}

function looksLikeApplyStart(element) {
  const control = getClickedControl(element);
  if (!control) return false;
  return matchesKeywords(control, APPLY_START_KEYWORDS);
}

function looksLikeApplyContinue(element) {
  const control = getClickedControl(element);
  if (!control) return false;
  return matchesKeywords(control, APPLY_CONTINUE_KEYWORDS);
}

function cleanUrl(url) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch (e) {
    return url;
  }
}

function extractFromJsonLd() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'JobPosting') {
          return {
            company: item.hiringOrganization?.name || '',
            role: item.title || '',
            jd_text: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 5000),
            url: cleanUrl(window.location.href)
          };
        }
      }
    } catch (e) {
      // not valid JSON, skip this script tag
    }
  }
  return null;
}

// Indeed-specific: their split-pane job listing view (in.indeed.com/?vjk=...)
// has no JSON-LD JobPosting data, but the visible page DOES render the real
// company + role — just inside elements tagged with stable data-testid
// attributes (Indeed's own internal test hooks), rather than the CSS classes
// nearby, which are auto-generated and likely to change on any deploy.
function extractFromDom() {
  const companyEl = document.querySelector('[data-testid="inlineHeader-companyName"]');
  const titleEl = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]');

  const company = (companyEl?.innerText || '').replace(/\s+/g, ' ').trim();

  // Strip Indeed's own "- job post" suffix that lives in a nested span
  // inside the same heading — not part of the actual role name.
  const role = (titleEl?.innerText || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/-\s*job post\s*$/i, '')
    .trim();

  if (!company && !role) return null;

  return {
    company,
    role,
    jd_text: (document.querySelector('#jobDescriptionText')?.innerText || '').slice(0, 5000),
    url: cleanUrl(window.location.href)
  };
}

// LinkedIn-specific extraction. LinkedIn job pages don't reliably separate
// company/role in the DOM the same way across all listings (some fold
// "Role – Company" into a single title element), but LinkedIn's own SEO
// <title> tag follows a consistent public pattern:
//   "{Company} hiring {Role} in {Location} | LinkedIn"
// That's more stable to parse than internal CSS classes, since it's a
// public-facing SEO convention, not an implementation detail likely to
// shift on redesign. Falls back to the confirmed job-title/company-name
// classes if the title doesn't match that pattern.
function extractFromLinkedIn() {
  const jdText = (document.querySelector('.jobs-description__content, #job-details')?.innerText || '').slice(0, 5000);
  const url = cleanUrl(window.location.href);

  // LinkedIn uses different <title> formats on different page types (standalone
  // /jobs/view/ page vs the embedded pane on /jobs/search-results/), and we've
  // now confirmed at least two. Try each pattern rather than betting on one.
  const titlePatterns = [
    // "(20) Company hiring Role in Location | LinkedIn" — notification count prefix optional
    /^\(?\d*\)?\s*(.+?)\s+hiring\s+(.+?)\s+in\s+.+\|\s*LinkedIn$/i,
  ];
  for (const pattern of titlePatterns) {
    const m = document.title.match(pattern);
    if (m) {
      return { company: m[1].trim(), role: m[2].trim(), jd_text: jdText, url };
    }
  }
  // "Role | Company | LinkedIn" — confirmed format on the search-results embedded pane
  const roleCompanyMatch = document.title.match(/^(.+?)\s*\|\s*(.+?)\s*\|\s*LinkedIn$/i);
  if (roleCompanyMatch) {
    return { role: roleCompanyMatch[1].trim(), company: roleCompanyMatch[2].trim(), jd_text: jdText, url };
  }

  // DOM fallback — try known class name variants across LinkedIn's different
  // job-page layouts (standalone view vs embedded search-results pane vs older UI),
  // since the same data may live under different component names per layout.
  const titleSelectors = [
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    '.topcard__title',
    '.jobs-details-top-card__job-title'
  ];
  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name',
    '.topcard__org-name-link',
    '.jobs-details-top-card__company-url'
  ];

  let role = '';
  for (const sel of titleSelectors) {
    const el = document.querySelector(sel);
    if (el?.innerText?.trim()) { role = el.innerText.replace(/\s+/g, ' ').trim(); break; }
  }
  let company = '';
  for (const sel of companySelectors) {
    const el = document.querySelector(sel);
    if (el?.innerText?.trim()) { company = el.innerText.replace(/\s+/g, ' ').trim(); break; }
  }

  if (!company && !role) {
    // Nothing matched any known pattern — log the real title so the next
    // report tells us the actual format instead of another guess.
    console.log('Job Tracker: LinkedIn extraction found no match. document.title was:', JSON.stringify(document.title));
    return null;
  }

  return { company, role, jd_text: jdText, url };
}

function extractFallback() {
  const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
  const metaDesc = document.querySelector('meta[name="description"]')?.content;
  const h1 = document.querySelector('h1')?.innerText;

  return {
    company: '',
    role: ogTitle || h1 || document.title || '',
    jd_text: metaDesc || '',
    url: cleanUrl(window.location.href)
  };
}

// Tries JSON-LD first (most reliable, works on standalone job pages),
// then LinkedIn-specific parsing (SEO title pattern, then confirmed DOM classes),
// then generic DOM scraping (Indeed's split-pane view specifically),
// then falls back to page-shell metadata as a last resort.
function extractJobData() {
  const jsonLdData = extractFromJsonLd();
  if (jsonLdData && jsonLdData.role) {
    return { ...jsonLdData, source: 'jsonld' };
  }

  if (window.location.hostname.includes('linkedin.com')) {
    const linkedinData = extractFromLinkedIn();
    if (linkedinData && linkedinData.company) {
      return { ...linkedinData, source: 'linkedin-dom' };
    }
  }

  const domData = extractFromDom();
  if (domData && domData.company) {
    return { ...domData, source: 'dom' };
  }

  return { ...extractFallback(), source: 'fallback' };
}

// Decides whether extraction is trustworthy enough to offer saving.
// JSON-LD (structured job posting data) is reliable on its own.
// Fallback (guessed from page title/meta/h1) is only trusted if a
// company name also came through — otherwise it's just a page title,
// not job data (e.g. "Job Search India | Indeed", a bare form page).
function isValidExtraction(jobData) {
  const hasCompany = Boolean(jobData.company && jobData.company.trim());
  const hasStructuredRole = jobData.source === 'jsonld' && Boolean(jobData.role && jobData.role.trim());
  return hasCompany || hasStructuredRole;
}

async function getHandoff() {
  try {
    const stored = await chrome.storage.local.get('handoffJob');
    const handoff = stored.handoffJob;
    if (!handoff) return null;
    if (Date.now() - handoff.timestamp > HANDOFF_TTL_MS) return null;
    return handoff;
  } catch (e) {
    return null;
  }
}

function setHandoff(session) {
  try {
    chrome.storage.local.set({ handoffJob: { ...session, timestamp: Date.now() } });
  } catch (e) {
    // extension context gone (reloaded) — nothing we can do about the relay, same-page toast still works
  }
}

function clearHandoff() {
  try {
    chrome.storage.local.remove('handoffJob');
  } catch (e) {
    // ignore
  }
}

function showConfirmToast(jobData) {
  const existing = document.getElementById('job-tracker-toast');
  if (existing) existing.remove();

  // Guards this specific toast instance against a double-click firing two saves.
  let isSaving = false;

  const toast = document.createElement('div');
  toast.id = 'job-tracker-toast';
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      background: #211F1C;
      color: #EDE8DB;
      border: 1px solid #5C6B47;
      border-radius: 6px;
      padding: 16px 18px;
      width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    ">
      <div style="font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-weight: 600; letter-spacing: 0.02em; margin-bottom: 8px;">Save this job to your tracker?</div>
      <div style="opacity: 0.9; margin-bottom: 4px;">${(jobData.role || 'Untitled role').slice(0, 80)}</div>
      <div style="color: #8C8575; margin-bottom: 12px;">${(jobData.company || 'Unknown company').slice(0, 60)}</div>
      <div style="display: flex; gap: 8px;">
        <button id="job-tracker-save-btn" style="
          flex: 1; background: #5C6B47; color: #EDE8DB; border: 1px solid #5C6B47;
          padding: 8px 0; border-radius: 6px; cursor: pointer; font-weight: 600;
        ">Save</button>
        <button id="job-tracker-cancel-btn" style="
          flex: 1; background: transparent; color: #8C8575; border: 1px solid #3A362E;
          padding: 8px 0; border-radius: 6px; cursor: pointer;
        ">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(toast);

  const saveBtn = document.getElementById('job-tracker-save-btn');
  const cancelBtn = document.getElementById('job-tracker-cancel-btn');

  saveBtn.addEventListener('click', () => {
    if (isSaving) return; // second click while the first is already processing — ignore
    isSaving = true;
    saveBtn.disabled = true;
    saveBtn.style.opacity = '0.5';
    saveBtn.style.cursor = 'default';
    cancelBtn.disabled = true;

    try {
      chrome.runtime.sendMessage({ type: 'JOB_APPLY_DETECTED', job: jobData });
    } catch (e) {
      console.warn('Job Tracker: extension was reloaded — refresh this page and try again.');
    }

    currentSession = { job: jobData, status: 'saved' };
    clearHandoff();
    toast.remove();
  });

  cancelBtn.addEventListener('click', () => {
    if (isSaving) return;
    currentSession = { job: jobData, status: 'dismissed' };
    clearHandoff();
    toast.remove();
  });

  // No auto-dismiss timer anymore — a multi-step apply flow easily runs
  // past 15-20 seconds, and the prompt shouldn't vanish before you've had
  // a chance to act on it. It only closes on Save/Cancel, or gets
  // re-created (same data) if a later click in this flow triggers again.
}

// Shown instead of the save toast when extraction couldn't find
// trustworthy job data anywhere in this apply flow. No Save option — nothing gets created.
function showNotRecognizedToast() {
  const existing = document.getElementById('job-tracker-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'job-tracker-toast';
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      background: #211F1C;
      color: #EDE8DB;
      border: 1px solid #C1922E;
      border-radius: 6px;
      padding: 16px 18px;
      width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    ">
      <div style="font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-weight: 600; letter-spacing: 0.02em; margin-bottom: 8px;">Couldn't recognize the job details on this page</div>
      <div style="color: #8C8575; margin-bottom: 12px;">Nothing was saved. You can add this one manually from the Dashboard if needed.</div>
      <button id="job-tracker-dismiss-btn" style="
        width: 100%; background: transparent; color: #8C8575; border: 1px solid #3A362E;
        padding: 8px 0; border-radius: 6px; cursor: pointer;
      ">OK</button>
    </div>
  `;
  document.body.appendChild(toast);

  document.getElementById('job-tracker-dismiss-btn').addEventListener('click', () => {
    toast.remove();
  });

  setTimeout(() => {
    const stillThere = document.getElementById('job-tracker-toast');
    if (stillThere) stillThere.remove();
  }, 8000);
}


async function checkHandoff() {
  const handoff = await getHandoff();
  clearHandoff(); // single-use — consumed here either way

  if (!handoff) {
    console.log('Job Tracker: no handoff found on this page load');
    return;
  }

  console.log('Job Tracker: handoff received from previous tab/page', handoff);
  currentSession = { job: handoff.job, status: handoff.status };

  if (handoff.status === 'pending' && handoff.job) {
    showConfirmToast(handoff.job);
  }
}
checkHandoff();

document.addEventListener('click', (event) => {
  // DEBUG: log every click with visible text, so we can see real button labels
  // on sites where detection isn't firing, instead of guessing keywords blindly.
  const debugText = (event.target.innerText || event.target.textContent || '').replace(/\s+/g, ' ').trim();
  if (debugText) {
    console.log('Job Tracker [debug]: clicked', event.target.tagName, JSON.stringify(debugText.slice(0, 60)), 'in frame', window.location.hostname);
  }

  const isStart = looksLikeApplyStart(event.target);
  const isContinue = looksLikeApplyContinue(event.target);

  if (!isStart && !isContinue) return;

  // Already have a result for this apply flow (captured earlier in this
  // same script instance, or handed off from the previous page)?
  // Don't re-extract from THIS page — later steps of a multi-step apply
  // flow (review pages, submit buttons) have no real job data, and
  // re-extracting there would silently overwrite a good earlier capture
  // with a bad one, or spam a second "not recognized" toast.
  if (currentSession) {
    if (currentSession.status === 'pending') {
      // Re-show the existing good data instead of extracting again —
      // covers both "toast isn't visible right now" and "this click
      // is a later step of the same flow" cases.
      if (!document.getElementById('job-tracker-toast')) {
        showConfirmToast(currentSession.job);
      }
      return;
    }
    // 'saved', 'dismissed', or 'invalid' — this flow is already handled, ignore.
    console.log('Job Tracker: click ignored, this apply flow is already', currentSession.status);
    return;
  }

  // No session yet, and this click is only a generic CONTINUE keyword
  // (e.g. a bare "Submit" on a quiz, assessment, or unrelated form) —
  // too ambiguous to trust as the start of a fresh apply flow. Only a
  // genuine START keyword (Apply, Easy Apply, etc.) may begin cold.
  if (!isStart) return;

  // No session yet — this is the first apply-like click in a new flow.
  const jobData = extractJobData();
  console.log('Job Tracker: Apply click detected', jobData);

  if (!isValidExtraction(jobData)) {
    console.log('Job Tracker: extraction not trustworthy enough, showing not-recognized toast');
    currentSession = { job: null, status: 'invalid' };
    setHandoff(currentSession); // in case this click also navigates cross-origin
    showNotRecognizedToast();
    return;
  }

  currentSession = { job: jobData, status: 'pending' };
  showConfirmToast(jobData);

  // Stash it too, ONLY in case this click causes a real cross-origin
  // navigation (e.g. indeed.com -> smartapply.indeed.com) that would wipe
  // `currentSession` along with this whole script instance. If we stay on
  // the same page/SPA instead, this just expires unused via HANDOFF_TTL_MS.
  setHandoff(currentSession);
}, true); // capture phase — runs before the click's default action (e.g. navigation)

// DEBUG HOOK — lets you manually test the toast + save pipeline from any page's console,
// without needing to find a real Apply button. Run in DevTools console:
//   window.__jobTrackerTest.showConfirmToast({ company: 'Test Co', role: 'Test Role', jd_text: 'sample', url: location.href })
window.__jobTrackerTest = {
  showConfirmToast,
  showNotRecognizedToast,
  extractJobData,
  getSession: () => currentSession
};
console.log('Job Tracker: content script loaded on', window.location.hostname);
/* Unstuck Coach analytics: low-volume, anonymous, free-tier-safe PostHog instrumentation. */
(function () {
  "use strict";

  var PH_PROXY = "https://puenteworks.com/ph";
  var PH_KEY = "phc_xCWVuCx8TVyi3YUzfVNX8BwznXbSvN9jesgEMkNs7Bde";
  var MAX_EVENTS_PER_SESSION = 24;
  var MAX_REPEATS_PER_EVENT = 5;
  var EVENT_VERSION = "2026-05-27";
  var sessionCounts = Object.create(null);
  var totalEvents = 0;
  var isBot = /bot|crawl|spider|headless|playwright|puppeteer|selenium|phantom/i.test(navigator.userAgent || "");

  function getSessionId() {
    try {
      var key = "unstuck_analytics_session_id";
      var existing = sessionStorage.getItem(key);
      if (existing) return existing;
      var created = "uas_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(key, created);
      return created;
    } catch (_) {
      return "uas_ephemeral";
    }
  }

  function getVisitorId() {
    try {
      var key = "unstuck_analytics_visitor_id";
      var existing = localStorage.getItem(key);
      if (existing) return existing;
      var created = "uav_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, created);
      return created;
    } catch (_) {
      return getSessionId();
    }
  }

  function bucketLength(value) {
    var length = String(value || "").trim().length;
    if (!length) return "empty";
    if (length < 40) return "short";
    if (length < 140) return "medium";
    return "long";
  }

  function getSearchParams() {
    var params = new URLSearchParams(window.location.search || "");
    var out = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (key) {
      var value = params.get(key);
      if (value) out[key] = value.slice(0, 120);
    });
    return out;
  }

  function baseProperties(extra) {
    return Object.assign({
      site: "unstuck-coach",
      event_version: EVENT_VERSION,
      distinct_id: getVisitorId(),
      unstuck_session_id: getSessionId(),
      $session_id: getSessionId(),
      $current_url: window.location.href,
      $pathname: window.location.pathname,
      $host: window.location.host,
      $referrer: document.referrer || "$direct",
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    }, getSearchParams(), extra || {});
  }

  function shouldSend(eventName) {
    if (isBot) return false;
    if (!eventName) return false;
    totalEvents += 1;
    sessionCounts[eventName] = (sessionCounts[eventName] || 0) + 1;
    return totalEvents <= MAX_EVENTS_PER_SESSION && sessionCounts[eventName] <= MAX_REPEATS_PER_EVENT;
  }

  function sendViaBeacon(eventName, properties) {
    var payload = JSON.stringify({ api_key: PH_KEY, event: eventName, properties: properties });
    if (navigator.sendBeacon) {
      var blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(PH_PROXY + "/e/", blob)) return;
    }
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", PH_PROXY + "/e/", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(payload);
    } catch (_) {
      // Analytics must never break the product surface.
    }
  }

  function track(eventName, properties) {
    if (!shouldSend(eventName)) return false;
    var safeProperties = baseProperties(properties);
    if (window.posthog && typeof window.posthog.capture === "function") {
      try {
        window.posthog.capture(eventName, safeProperties);
        return true;
      } catch (_) {
        // Fall back to direct ingestion.
      }
    }
    sendViaBeacon(eventName, safeProperties);
    return true;
  }

  window.UnstuckAnalytics = {
    track: track,
    bucketLength: bucketLength,
    budget: {
      max_events_per_session: MAX_EVENTS_PER_SESSION,
      max_repeats_per_event: MAX_REPEATS_PER_EVENT,
      session_replay_enabled: false,
      autocapture_enabled: false,
    },
  };

  track("page viewed", { surface: window.location.pathname === "/" ? "landing" : "chat-or-other" });

  document.addEventListener("click", function (event) {
    var el = event.target.closest("[data-analytics-event]");
    if (!el) return;
    track(el.getAttribute("data-analytics-event"), {
      label: el.getAttribute("data-analytics-label") || (el.textContent || "").trim().slice(0, 80),
      destination: el.getAttribute("data-analytics-destination") || el.getAttribute("href") || null,
      surface: el.getAttribute("data-analytics-surface") || "landing",
      panel: el.getAttribute("data-analytics-panel") || null,
      example: el.getAttribute("data-analytics-example") || null,
    });
  }, { passive: true });
}());

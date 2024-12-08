let lastTrackedUrl = null;

function trackPageView(
  url,
  referrer = document.referrer,
  interactionType = "navigation"
) {
  if (url !== lastTrackedUrl) {
    lastTrackedUrl = url;

    const pageViewData = {
      page: url,
      referrer: referrer,
      timestamp: new Date().toISOString(),
      interactionType: interactionType,
    };

    if (window.mixpanel) {
      mixpanel.track("Page View", pageViewData);
    }

    if (typeof gtag === "function") {
      gtag("event", "page_view", {
        page_path: url,
        referrer: referrer,
        interaction_type: interactionType,
      });
    }
  }
}

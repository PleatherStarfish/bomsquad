// Function to load Mixpanel dynamically
function loadMixpanel() {
  mixpanel.init("099a5cb7f4c47e043ee4e55213130e3f", {
    opt_out_tracking_by_default: true,
    ip: false, // Disable geolocation
    property_blacklist: ["$referrer", "$current_url"],
  });
  console.log("Mixpanel initialized with privacy settings.");
}

document.addEventListener("DOMContentLoaded", () => {
  const COOKIE_CONSENT_KEY = "cookie_consent";
  const banner = document.getElementById("cookie-consent-banner");
  const acceptButton = document.getElementById("allow-cookies");
  const denyButton = document.getElementById("deny-cookies");

  if (!localStorage.getItem(COOKIE_CONSENT_KEY)) {
    document.getElementById("cookie-consent-banner").style = `
            display: block;
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background-color: #212529;
            color: white;
            z-index: 50;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        `;
  }

  function applyCookieSettings(consentStatus) {
    if (consentStatus === "allow") {
      loadGoogleAnalytics();
      loadMixpanel();
      mixpanel.opt_in_tracking();

      // Update Google Consent Mode to 'granted'
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    } else {
      // Deny tracking for both Mixpanel and Google Analytics
      mixpanel.opt_out_tracking();

      // Update Google Consent Mode to 'denied'
      gtag('consent', 'update', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied'
      });
    }
  }

  function closeBanner() {
    banner.style.display = "none";
  }

  acceptButton.addEventListener("click", () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "allow");
    applyCookieSettings("allow");
    closeBanner();
  });

  denyButton.addEventListener("click", () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "deny");
    applyCookieSettings("deny");
    closeBanner();
  });

  const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (storedConsent) {
    applyCookieSettings(storedConsent);
  }
});

function loadGoogleAnalytics(analyticsId = "G-KXVV479GJX") {
  // Check if the script is already loaded
  if (
    document.querySelector(
      `script[src="https://www.googletagmanager.com/gtag/js?id=${analyticsId}"]`
    )
  ) {
    console.warn("Google Analytics script is already loaded.");
    return;
  }

  // Create the script element for Google Analytics
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
  script.async = true;

  // Append the script to the document head
  script.onload = () => {
    console.log("Google Analytics script loaded successfully.");

    // Initialize the dataLayer if not already defined
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }

    // Configure Google Analytics
    gtag("js", new Date());
    gtag("config", analyticsId);
  };

  script.onerror = () => {
    console.error("Failed to load Google Analytics script.");
  };

  document.head.appendChild(script);
}

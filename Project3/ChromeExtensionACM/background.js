chrome.runtime.onInstalled.addListener(() => {
    console.log("Cookie Manager installed.");
  });

  chrome.cookies.onChanged.addListener((changeInfo) => {
    if (!changeInfo.removed) {
      console.log("Cookie added or updated:", changeInfo.cookie);

      // Read whitelist from storage
      chrome.storage.sync.get(['whitelist'], function(result) {
        const whitelist = result.whitelist || [];

        // Normalize both cookie domain and whitelist entries to lowercase
        const cookie = changeInfo.cookie;
        const cookieDomain = cookie.domain.startsWith('.')
          ? cookie.domain.slice(1).toLowerCase()
          : cookie.domain.toLowerCase();

        const normalizedWhitelist = whitelist.map(function(d) {
          return d.toLowerCase();
        });

        // Check if cookie domain matches any whitelist entry
        const isWhitelisted = normalizedWhitelist.some(function(whitelistedDomain) {
          // Exact match (example.com == example.com)
          if (cookieDomain === whitelistedDomain) {
            return true;
          }
          // Subdomain match (a.b.example.com endsWith .example.com)
          if (cookieDomain.endsWith('.' + whitelistedDomain)) {
            return true;
          }
          return false;
        });

        if (isWhitelisted) {
          console.log("Domain is whitelisted, allowing cookie:", cookieDomain);
          return;
        }

        // Not whitelisted - delete the cookie immediately
        console.log("Domain not whitelisted, deleting cookie:", cookieDomain);

        // Construct the URL correctly for removal
        const protocol = cookie.secure ? "https://" : "http://";
        const host = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
        const url = protocol + host + cookie.path;

        chrome.cookies.remove({ url: url, name: cookie.name }, function() {
          if (chrome.runtime.lastError) {
            console.log("Failed to delete cookie:", chrome.runtime.lastError.message);
          } else {
            console.log("Successfully deleted cookie:", cookie.name, "from", cookieDomain);
          }
        });
      });
    } else {
      console.log("Cookie removed:", changeInfo.cookie);
    }
  });

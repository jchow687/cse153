chrome.runtime.onInstalled.addListener(() => {
    console.log("Cookie Manager installed.");
  });
  
  chrome.cookies.onChanged.addListener((changeInfo) => {
    if (!changeInfo.removed) {
      console.log("Cookie added or updated:", changeInfo.cookie);
    } else {
      console.log("Cookie removed:", changeInfo.cookie);
    }
  });
  
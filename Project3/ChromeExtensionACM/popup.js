

/**
 * Event listener for DOMContentLoaded event.
 * 
 * This function initializes the popup by loading cookies and setting up event listeners for various elements:
 * - Loads cookies when the DOM content is fully loaded. // Task 1
 * - Adds a click event listener to the 'deleteSelected' button to delete selected cookies. // Task 2
 * - Adds an input event listener to the 'filterInput' element to filter cookies based on user input. // Task 3
 * - Adds a change event listener to the 'thisDomainOnly' checkbox to reload cookies based on the current domain filter. //Task 3
 */
document.addEventListener('DOMContentLoaded', function() {
  const thisDomainOnly = document.getElementById('thisDomainOnly');
  if (thisDomainOnly) {
    thisDomainOnly.addEventListener('change', function() {
      filterCookies();
    });
  }

  const deleteBtn = document.getElementById('deleteSelected');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function () {
    const protocol = cookie.secure ? 'https://' : 'http://';
    let host = cookie.domain;
    if (host.startsWith('.')) host = host.slice(1);

    const url = protocol + host + cookie.path;

    chrome.cookies.remove({ url, name: cookie.name }, () => loadCookies());
    });
  }

  const filterInput = document.getElementById('filterInput');
  if (filterInput) {
    filterInput.addEventListener('input', function() {
      filterCookies();
    });
  }

  const refreshButton = document.getElementById('refreshButton');
  if (refreshButton) {
    refreshButton.addEventListener('click', function() {
      loadCookies();
    });
  }
});
  /**
 * Loads cookies and displays them in the popup.
 * 
 * This function performs the following tasks:
 * - Checks if the 'thisDomainOnly' checkbox is checked to filter cookies by the current domain. (If you have this filter)
 * - Queries the active tab to get the current domain. (If you have this filter)
 * - Retrieves all cookies and filters them based on the current domain if necessary. (Or all the cookies)
 * - Populates the cookie list table with the retrieved cookies.
 * - Calls the filterCookies function to apply any existing filter to the displayed cookies.
 */
  function loadCookies() {
    //create a checkbox variable to filter cookies by the current domain
    const domCheckbox = document.getElementById('thisDomainOnly');
    if (domCheckbox && domCheckbox.checked){
      alert("cookies have been filtered on current domain");
    }
    //query the active tab to get the current domain
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      const url = new URL(activeTab.url);
      const domain = url.hostname;
      console.log("current domain: " + domain);
    });
  }
  // Delete if you don't need it
  function filterCookies() {
    const filterValue = document.getElementById('filterInput').value.toLowerCase();
    const rows = document.querySelectorAll('#cookieListBody tr');
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      const cookieName = cells[1].textContent.toLowerCase();
      const cookieValue = cells[2].textContent.toLowerCase();
      const cookieDomain = cells[3].textContent.toLowerCase();
      if (cookieName.includes(filterValue) || cookieValue.includes(filterValue) || cookieDomain.includes(filterValue)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
  
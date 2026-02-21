
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
  loadCookies();

  const thisDomainOnly = document.getElementById('thisDomainOnly');
  if (thisDomainOnly) {
    thisDomainOnly.addEventListener('change', function() {
      loadCookies();
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
  const domCheckbox = document.getElementById('thisDomainOnly');
  const thisDomainOnly = domCheckbox ? domCheckbox.checked : false;
  const cookieListBody = document.getElementById('cookieListBody');
  cookieListBody.innerHTML = '';

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    if (!activeTab || !activeTab.url || activeTab.url.startsWith('http://')) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="4">Cannot access cookies on this page</td>';
      cookieListBody.appendChild(row);
      return;
    }

    const url = new URL(activeTab.url);
    const domain = url.hostname;

    chrome.cookies.getAll({}, function(cookies) {
      let filteredCookies = cookies;

      if (thisDomainOnly) {
        filteredCookies = cookies.filter(function(cookie) {
          const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
          return domain.endsWith(cookieDomain) || cookieDomain.endsWith(domain);
        });
      }

      for (let i = 0; i < filteredCookies.length; i++) {
        const cookie = filteredCookies[i];
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = cookie.name;

        const valueCell = document.createElement('td');
        valueCell.textContent = cookie.value;

        const domainCell = document.createElement('td');
        domainCell.textContent = cookie.domain;

        const actionsCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';

        deleteBtn.addEventListener('click', function() {
          const protocol = cookie.secure ? 'https://' : 'http://';
          let host = cookie.domain;
          if (host.startsWith('.')) {
            host = host.slice(1);
          }
          const cookieUrl = protocol + host + cookie.path;

          chrome.cookies.remove({ url: cookieUrl, name: cookie.name }, function() {
            loadCookies();
          });
        });

        actionsCell.appendChild(deleteBtn);

        row.appendChild(nameCell);
        row.appendChild(valueCell);
        row.appendChild(domainCell);
        row.appendChild(actionsCell);

        cookieListBody.appendChild(row);
      }

      filterCookies();
    });
  });
}

// Delete if you don't need it
function filterCookies() {
  const filterValue = document.getElementById('filterInput').value.toLowerCase();
  const rows = document.querySelectorAll('#cookieListBody tr');
  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    const cookieName = cells[0].textContent.toLowerCase();
    const cookieValue = cells[1].textContent.toLowerCase();
    const cookieDomain = cells[2].textContent.toLowerCase();
    if (cookieName.includes(filterValue) || cookieValue.includes(filterValue) || cookieDomain.includes(filterValue)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

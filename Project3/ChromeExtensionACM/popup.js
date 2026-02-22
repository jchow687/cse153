
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
  // Task 1
  loadCookies();

  // Task 2
  const deleteSelectedButton = document.getElementById('deleteSelected');
  if (deleteSelectedButton) {
    deleteSelectedButton.addEventListener('click', function() {
      deleteSelected();
    });
  }

  // Task 3
  const filterInput = document.getElementById('filterInput');
  if (filterInput) {
    filterInput.addEventListener('input', function() {
      filterCookies();
    });
  }

  // Task 3
  const thisDomainOnly = document.getElementById('thisDomainOnly');
  if (thisDomainOnly) {
    thisDomainOnly.addEventListener('change', function() {
      loadCookies();
    });
  }

  const selectAllButton = document.getElementById('selectAll');
  if (selectAllButton) {
    selectAllButton.addEventListener('click', function() {
      const checkboxes = document.querySelectorAll('#cookieListBody input[type="checkbox"]');
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = true;
      }
    });
  }

  const unselectAllButton = document.getElementById('unselectAll');
  if (unselectAllButton) {
    unselectAllButton.addEventListener('click', function() {
      const checkboxes = document.querySelectorAll('#cookieListBody input[type="checkbox"]');
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }
    });
  }

  const optionsButton = document.getElementById('optionsButton');
  if (optionsButton) {
    optionsButton.addEventListener('click', function() {
      chrome.runtime.openOptionsPage();
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

/**
 * Sources:
 * https://stackoverflow.com/questions/54821584/chrome-extension-code-to-get-current-active-tab-url-and-detect-any-url-update-in#:~:text=ios%20azure%20docker-,chrome%20extension%20code%20to%20get%20current%20active%20tab%20url%20and,update%20in%20it%20as%20well&text=chrome.,should%20I%20change%20my%20code?
 * https://developer.chrome.com/docs/extensions/reference/cookies/#method-getAll
 */
function loadCookies() {
  const domCheckbox = document.getElementById('thisDomainOnly');
  const thisDomainOnly = domCheckbox ? domCheckbox.checked : false;
  const cookieListBody = document.getElementById('cookieListBody');
  cookieListBody.innerHTML = '';

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    if (!activeTab || !activeTab.url) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="5">Cannot access cookies on this page</td>';
      cookieListBody.appendChild(row);
      return;
    }

    const url = new URL(activeTab.url);
    const domain = url.hostname;

    console.log('Current domain:', domain);

    chrome.storage.sync.get(['whitelist'], function(result) {
      const whitelist = result.whitelist || [];

      console.log('User whitelist:', whitelist);

      const lowerDomain = domain.toLowerCase();
      const normalizedWhitelist = whitelist.map(function(d) {
        return d.toLowerCase();
      });

      const isWhitelisted = normalizedWhitelist.some(function(whitelistedDomain) {
        return lowerDomain === whitelistedDomain ||
               lowerDomain.endsWith('.' + whitelistedDomain);
      });

      if (isWhitelisted) {
        console.log('Domain is in whitelist, blocking access:', domain);
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5">Cannot access cookies on this page.</td>';
        cookieListBody.appendChild(row);
        return;
      }

      console.log('Domain not in whitelist, loading cookies...');



    chrome.cookies.getAll({}, function(cookies) {
      let filteredCookies = cookies;

      if (thisDomainOnly) {
        filteredCookies = cookies.filter(function(cookie) {
          const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
          const lowerCookieDomain = cookieDomain.toLowerCase();
          const lowerDomain = domain.toLowerCase();
          return lowerDomain === lowerCookieDomain || lowerDomain.endsWith('.' + lowerCookieDomain);
        });
      }

      for (let i = 0; i < filteredCookies.length; i++) {
        const cookie = filteredCookies[i];
        const row = document.createElement('tr');

        // Checkbox cell for deleteSelected
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.name = cookie.name;
        checkbox.dataset.domain = cookie.domain;
        checkbox.dataset.path = cookie.path;
        checkbox.dataset.secure = cookie.secure;
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

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
          deleteCookie(cookie);
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
  });
}

function deleteCookie(cookie) {
  const protocol = cookie.secure ? 'https://' : 'http://';
  let host = cookie.domain;
  if (host.startsWith('.')) {
    host = host.slice(1);
  }
  const cookieUrl = protocol + host + cookie.path;

  chrome.cookies.remove({ url: cookieUrl, name: cookie.name }, function() {
    loadCookies();
  });
}

function deleteSelected() {
  const checkedBoxes = document.querySelectorAll('#cookieListBody input[type="checkbox"]:checked');
  for (let i = 0; i < checkedBoxes.length; i++) {
    const checkbox = checkedBoxes[i];
    const cookieObj = {
      name: checkbox.dataset.name,
      domain: checkbox.dataset.domain,
      path: checkbox.dataset.path,
      secure: checkbox.dataset.secure === 'true'
    };
    deleteCookie(cookieObj);
  }
  loadCookies();
}

// Delete if you don't need it
function filterCookies() {
  const filterValue = document.getElementById('filterInput').value.toLowerCase();
  const rows = document.querySelectorAll('#cookieListBody tr');
  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 5) return;
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

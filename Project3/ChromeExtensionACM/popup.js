

/**
 * Event listener for DOMContentLoaded event.
 * 
 * This function initializes the popup by loading cookies and setting up event listeners for various elements:
 * - Loads cookies when the DOM content is fully loaded.
 * - Adds a click event listener to the 'deleteSelected' button to delete selected cookies.
 * - Adds an input event listener to the 'filterInput' element to filter cookies based on user input.
 * - Adds a change event listener to the 'thisDomainOnly' checkbox to reload cookies based on the current domain filter.
 */
document.addEventListener('DOMContentLoaded', function() {
    loadCookies();
    // Your code here
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
    
  }
  // Delete if you don't need it
  function filterCookies() {
    const filterValue = document.getElementById('filterInput').value.toLowerCase();
    const rows = document.querySelectorAll('#cookieList tr');
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
  
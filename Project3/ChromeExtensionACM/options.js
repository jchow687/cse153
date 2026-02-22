
/**
 * Adds an event listener to the form with id 'whitelistForm' to handle form submission.
 * On form submission, prevents the default form submission behavior, retrieves the value
 * from the input with id 'whitelist', splits it by commas, and saves it to the browser's
 * sync storage under the key 'whitelist'. Displays an alert when the whitelist is saved.
 *
 * Retrieves the 'whitelist' from the browser's sync storage on page load and, if it exists,
 * sets the value of the input with id 'whitelist' to the comma-separated list of whitelist items.
 */
/**
 * Sources:
 * https://developer.chrome.com/docs/extensions/reference/api/storage
 */
document.addEventListener('DOMContentLoaded', function() {
  const whitelistForm = document.getElementById('whitelistForm');
  const whitelistInput = document.getElementById('whitelist');

  chrome.storage.sync.get(['whitelist'], function(result) {
    if (result.whitelist && Array.isArray(result.whitelist)) {
      whitelistInput.value = result.whitelist.join(', ');
    }
  });

  if (whitelistForm) {
    whitelistForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const inputValue = whitelistInput.value;
      const domains = inputValue.split(',')
        .map(function(domain) {
          return domain.trim();
        })
        .filter(function(domain) {
          return domain.length > 0;
        });

      chrome.storage.sync.set({ whitelist: domains }, function() {
        alert('Whitelist saved!');
      });
    });
  }
});

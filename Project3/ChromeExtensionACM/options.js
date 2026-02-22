
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
  const whitelistInput = document.getElementById('whitelistInput');
  const saveMessage = document.getElementById('saveMessage');
  const whitelistList = document.getElementById('whitelistList');

  function displayWhitelist() {
    chrome.storage.sync.get(['whitelist'], function(result) {
      whitelistList.innerHTML = '';
      if (result.whitelist && Array.isArray(result.whitelist)) {
        result.whitelist.forEach(function(domain) {
          const li = document.createElement('li');
          li.textContent = domain;

          const removeButton = document.createElement('button');
          removeButton.textContent = 'Remove';
          removeButton.className = 'remove-button';
          removeButton.addEventListener('click', function() {
            removeDomain(domain);
          });

          li.appendChild(removeButton);
          whitelistList.appendChild(li);
        });
      }
    });
  }

  function removeDomain(domainToRemove) {
    chrome.storage.sync.get(['whitelist'], function(result) {
      let whitelist = result.whitelist || [];
      whitelist = whitelist.filter(function(domain) {
        return domain !== domainToRemove;
      });
      chrome.storage.sync.set({ whitelist: whitelist }, function() {
        whitelistInput.value = whitelist.join(', ');
        displayWhitelist();
      });
    });
  }

  chrome.storage.sync.get(['whitelist'], function(result) {
    if (result.whitelist && Array.isArray(result.whitelist)) {
      whitelistInput.value = result.whitelist.join(', ');
    }
    displayWhitelist();
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
        saveMessage.style.display = 'block';
        displayWhitelist();
        setTimeout(function() {
          saveMessage.style.display = 'none';
        }, 2000);
      });
    });
  }
});

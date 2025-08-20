// WhatsApp Web Shortcuts Extension
// This script adds keyboard shortcuts to WhatsApp Web message actions

// Shortcut keys mapping
const SHORTCUTS = {
    c: "copy",
    r: "reply",
    e: "edit",
    f: "forward",
    d: "delete",
    s: ["star", "unstar"], // Updated to handle both "star" and "unstar"
    p: "pin",
    t: "report",
    a: "react",
    i: "message info",
    l: "download",
  };
  
  // The message element with the currently open menu
  // Note, this is used for logging purposes only and does not affect the functionality
  let menuOpenMessageElement = null;
  
  // Timer for the menu open check
  let menuOpenCheckTimeout = null;
  
  // Start the extension when the page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  
  // Initialize the extension
  function init() {
    console.log("Initializing extension");
    // Add keyboard event listener
    document.addEventListener("keydown", handleKeyboardShortcut);
  
    // Watch for clicks on message dropdown menu buttons
    document.addEventListener("click", (event) => {
      const menuButton = event.target.closest(
        '[data-icon="ic-chevron-down-menu"], div[role="button"]'
      );
      if (menuButton) {
        console.log("Menu button clicked. menuButton:", menuButton);
        // Find the parent message element
        const messageElement = menuButton.closest(".message-in, .message-out");
        if (messageElement) {
          menuOpenMessageElement = messageElement;
          console.log("Menu opened for message:", menuOpenMessageElement);
          // Clear any existing timeout to prevent multiple calls
          if (menuOpenCheckTimeout) {
            clearTimeout(menuOpenCheckTimeout);
          }
          // Wait a short moment for the menu to open
          menuOpenCheckTimeout = setTimeout(addShortcutLabels, 50);
        } else {
          console.log("No message element found for menu button.");
        }
      } else {
        // If a click occurs and it's not on a menu button, it might be a click outside the menu to close it
        // We only clear menuOpenMessageElement if there was an active menu and the click was not inside it
        const openMenuElement = document.querySelector('div[role="application"] > ul');
        if (menuOpenMessageElement && openMenuElement && !openMenuElement.contains(event.target)) {
          console.log("Click outside menu detected. Clearing menuOpenMessageElement.");
          menuOpenMessageElement = null;
          if (menuOpenCheckTimeout) {
            clearTimeout(menuOpenCheckTimeout);
            menuOpenCheckTimeout = null;
          }
        }
        console.log("No menu button found for click event.");
      }
    });
  }
  
  // Function to handle keyboard shortcuts
  function handleKeyboardShortcut(event) {
    // Ignore if Ctrl or Alt is pressed (to allow system shortcuts)
    if (event.ctrlKey || event.altKey) {
      console.log("Ctrl or Alt pressed, ignoring shortcut.");
      return;
    }
  
    const key = event.key.toLowerCase();
    console.log("Key pressed:", key);
  
    if (SHORTCUTS[key]) {
      console.log("Shortcut found for key:", key, "action:", SHORTCUTS[key]);
      console.log("Using message with open menu:", menuOpenMessageElement);
  
      // Get the current menu items
      const menuItems = findMessageMenuItems();
      console.log("Found menu items for keyboard shortcut:", menuItems.length, menuItems);
  
      let found = false;
      menuItems.forEach((item) => {
        const text = getMenuItemText(item); // text will be in original case
        console.log("Checking menu item:", text);
  
        // Check if the text matches any of the actions for the key
        const actionsForShortcut = SHORTCUTS[key];
        if (actionsForShortcut) {
          const lowerCaseText = text.toLowerCase();
          const matchedAction = Array.isArray(actionsForShortcut) ? actionsForShortcut.find(action => lowerCaseText === action) : (lowerCaseText === actionsForShortcut ? actionsForShortcut : null);
          
          if (matchedAction) {
            console.log("Found matching menu item:", text);
            triggerMenuItemAction(item, matchedAction); // Pass the matched action
            found = true;
          }
        }
      });
  
      if (!found) {
        console.log("No matching menu item found for shortcut:", SHORTCUTS[key]);
      }
    } else {
      console.log("No open menu or shortcut not found for key:", key);
    }
  }
  
  // Function to add shortcut labels to menu items
  function addShortcutLabels() {
    console.log("Attempting to add shortcut labels.");
    // Only proceed if a message menu is expected to be open
    if (!menuOpenMessageElement) {
      console.log("addShortcutLabels: No message menu element, aborting.");
      // Clear the timeout if it was set, as we're not expecting a menu anymore
      if (menuOpenCheckTimeout) {
        clearTimeout(menuOpenCheckTimeout);
        menuOpenCheckTimeout = null;
      }
      return;
    }
  
    const menuItems = findMessageMenuItems();
    console.log("addShortcutLabels: Found menu items:", menuItems.length, menuItems);
    if (menuItems.length === 0) {
      console.log("addShortcutLabels: No menu items found, retrying in 200ms...");
      // Set a new timeout only if one isn't already active for this retry
      if (!menuOpenCheckTimeout) {
        menuOpenCheckTimeout = setTimeout(addShortcutLabels, 200); // Retry if no items are found yet
      }
      return;
    }
    
    // Clear the retry timeout once items are found
    if (menuOpenCheckTimeout) {
      clearTimeout(menuOpenCheckTimeout);
      menuOpenCheckTimeout = null;
    }
  
    menuItems.forEach((item) => {
      // Remove any existing shortcut labels
      const existingLabel = item.querySelector(".shortcut-label");
      if (existingLabel) {
        existingLabel.remove();
      }
  
      const text = getMenuItemText(item);
      console.log("addShortcutLabels: Processing menu item with text:", text);
  
      for (const [key, action] of Object.entries(SHORTCUTS)) {
        // Check if the text is the same as the action (case-insensitive)
        const actionsToCheck = Array.isArray(action) ? action : [action];
        if (actionsToCheck.includes(text.toLowerCase())) {
          console.log("addShortcutLabels: Matched action '" + text + "' with key '" + key + "'. Adding label.");
          
          // Find the span that contains the actual text
          const textSpan = Array.from(item.querySelectorAll("span")).find(span => {
            return span.textContent.trim() === text && !span.hasAttribute('data-icon') && !span.classList.contains('shortcut-label');
          });
  
          if (textSpan) {
            // Create and style the shortcut label first
            const shortcutSpan = document.createElement("span");
            shortcutSpan.className = "shortcut-label";
            shortcutSpan.textContent = key.toUpperCase(); // Make key uppercase like Slack
            shortcutSpan.style.color = "#c8c8c8"; // Darker gray text
            shortcutSpan.style.fontSize = "11px";
            shortcutSpan.style.fontWeight = "500";
            shortcutSpan.style.minWidth = "16px";
            shortcutSpan.style.height = "16px";
            shortcutSpan.style.lineHeight = "16px";
            shortcutSpan.style.textAlign = "center";
            shortcutSpan.style.backgroundColor = "#005C4B"; // More grayish background
            shortcutSpan.style.border = "1px solid #c8c8c8"; // Darker border
            shortcutSpan.style.borderRadius = "3px";
            shortcutSpan.style.padding = "0 4px";
            shortcutSpan.style.userSelect = "none";
            shortcutSpan.style.fontFamily =
              'Monaco, Menlo, Consolas, "Courier New", monospace';
            shortcutSpan.style.boxShadow = "0 1px 0 0 #aaa"; // Darker shadow
  
            // Insert the shortcutSpan right before the textSpan
            textSpan.parentNode.insertBefore(shortcutSpan, textSpan);
            // Add a small margin to the shortcut span to create space between it and the text
            shortcutSpan.style.marginRight = "8px";
          } else {
            console.log("addShortcutLabels: Text span not found for item:", item);
          }
          break;
        }
      }
    });
  }
  
  // Function to trigger menu item action
  function triggerMenuItemAction(item, action) {
    console.log(
      "Triggering action:",
      action,
      "for message element:",
      menuOpenMessageElement
    );
    // Small delay to ensure selection
    setTimeout(() => {
      // Try to find the clickable element in different ways
      const clickableDiv =
        item.querySelector('div[role="button"]') ||
        item.querySelector('div[role="menuitem"]') ||
        item.querySelector("div");
      if (clickableDiv) {
        console.log("Clicking div element:", clickableDiv);
        clickableDiv.click();
      } else {
        console.log("Clickable div element not found, clicking li element:", item);
        item.click();
      }
      // Clear the menuOpenMessageElement after an action is triggered
      menuOpenMessageElement = null;
      if (menuOpenCheckTimeout) {
        clearTimeout(menuOpenCheckTimeout);
        menuOpenCheckTimeout = null;
      }
    }, 50);
  }
  
  // Function to get menu item text
  function getMenuItemText(item) {
    const contentDiv = item.querySelector("div");
    if (contentDiv) {
      const spans = contentDiv.querySelectorAll("span");
      // Find the span that has text content and is not an icon or shortcut label
      const textSpan = Array.from(spans).find(span => {
        return span.textContent.trim().length > 0 && !span.hasAttribute('data-icon') && !span.classList.contains('shortcut-label');
      });
      
      if (textSpan) {
        console.log("getMenuItemText: Found textSpan:", textSpan.textContent.trim());
        return textSpan.textContent.trim(); // Return original case
      }
    }
  
    // Fallback to getting text from the div or li, in original case
    const textContent = item.textContent.trim();
    console.log("getMenuItemText: Falling back to item.textContent:", textContent);
    return textContent; // Return original case
  }
  
  // Function to find the message menu items
  function findMessageMenuItems() {
    // Try different selectors for menu items
    const items = document.querySelectorAll(
      'li[role="button"][data-animate-dropdown-item], div[role="menuitem"]',
    );
    console.log("findMessageMenuItems: Found menu items:", items.length, items);
    return items;
  }
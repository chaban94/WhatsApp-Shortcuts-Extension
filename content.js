// WhatsApp Web Shortcuts Extension
// This script adds keyboard shortcuts to WhatsApp Web message actions

// Shortcut keys mapping
const SHORTCUTS = {
    c: "copy",
    r: "reply",
    e: "edit",
    f: "forward",
    d: "delete",
    s: "star",
    p: "pin",
    t: "report",
    a: "react",
    i: "message info",
    l: "download",
  };
  
  // The message element with the currently open menu
  // Note, this is used for logging purposes only and does not affect the functionality
  let menuOpenMessageElement = null;
  
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
        '[data-testid="menu"], [data-icon="menu"], div[role="button"]'
      );
      if (menuButton) {
        console.log("Menu button clicked");
        // Find the parent message element
        const messageElement = menuButton.closest(".message-in, .message-out");
        if (messageElement) {
          menuOpenMessageElement = messageElement;
          console.log("Menu opened for message:", menuOpenMessageElement);
        }
        // Wait a short moment for the menu to open
        setTimeout(addShortcutLabels, 50);
      }
    });
  }
  
  // Function to handle keyboard shortcuts
  function handleKeyboardShortcut(event) {
    // Ignore if Ctrl or Alt is pressed (to allow system shortcuts)
    if (event.ctrlKey || event.altKey) {
      return;
    }
  
    const key = event.key.toLowerCase();
    console.log("Key pressed:", key);
  
    if (SHORTCUTS[key]) {
      console.log("Shortcut found:", SHORTCUTS[key]);
      console.log("Using message with open menu:", menuOpenMessageElement);
  
      // Get the current menu items
      const menuItems = findMessageMenuItems();
      console.log("Menu items:", menuItems.length);
  
      let found = false;
      menuItems.forEach((item) => {
        const text = getMenuItemText(item);
        console.log("Checking menu item:", text);
  
        // Check if the text is the same as the action
        console.log(
          "Checking if:",
          text.toLowerCase(),
          "matches:",
          SHORTCUTS[key]
        );
        if (text.toLowerCase() === SHORTCUTS[key]) {
          console.log("Found matching menu item:", text);
          triggerMenuItemAction(item, SHORTCUTS[key]);
          found = true;
        }
      });
  
      if (!found) {
        console.log("No matching menu item found");
      }
    } else {
      console.log("No open menu or shortcut not found");
    }
  }
  
  // Function to add shortcut labels to menu items
  function addShortcutLabels() {
    const menuItems = findMessageMenuItems();
    menuItems.forEach((item) => {
      // Remove any existing shortcut labels
      const existingLabel = item.querySelector(".shortcut-label");
      if (existingLabel) {
        existingLabel.remove();
      }
  
      const text = getMenuItemText(item);
  
      for (const [key, action] of Object.entries(SHORTCUTS)) {
        // Check if the text is the same as the action
        if (text.toLowerCase() === action) {
          // Create a container for the menu item content
          const contentDiv = item.querySelector("div");
          if (contentDiv) {
            // Set the container to flex to position items
            contentDiv.style.display = "flex";
            contentDiv.style.justifyContent = "flex-start";
            contentDiv.style.alignItems = "center";
            contentDiv.style.width = "100%";
            contentDiv.style.gap = "8px"; // Add space between shortcut and text
  
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
  
            // Add click handler
            // shortcutSpan.addEventListener('click', (e) => {
            //     e.stopPropagation(); // Prevent event from bubbling up
            //     if (menuOpenMessageElement) {
            //         console.log('Using message with open menu');
            //         triggerMenuItemAction(item, action, menuOpenMessageElement);
            //     } else {
            //         console.log('No open menu found');
            //     }
            // });
  
            // Create a wrapper for the text
            const textWrapper = document.createElement("span");
            textWrapper.textContent = contentDiv.textContent;
            contentDiv.textContent = ""; // Clear the original text
  
            // Add elements in the correct order (shortcut first, then text)
            contentDiv.appendChild(shortcutSpan);
            contentDiv.appendChild(textWrapper);
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
        console.log("Clicking div element");
        clickableDiv.click();
      } else {
        console.log("Clicking li element");
        item.click();
      }
    }, 50);
  }
  
  // Function to get menu item text
  function getMenuItemText(item) {
    // First try to find the text span
    const textSpan = item.querySelector("span:not(.shortcut-label)");
    if (textSpan) {
      return textSpan.textContent.toLowerCase().trim();
    }
  
    // Fallback to getting text from the div
    return item.textContent.toLowerCase().trim();
  }
  
  // Function to find the message menu items
  function findMessageMenuItems() {
    // Try different selectors for menu items
    const items = document.querySelectorAll(
      'li[role="button"][data-animate-dropdown-item], div[role="menuitem"]'
    );
    console.log("Found menu items:", items.length);
    return items;
  }
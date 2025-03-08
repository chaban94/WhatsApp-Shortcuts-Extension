// WhatsApp Web Shortcuts Extension
// This script adds keyboard shortcuts to WhatsApp Web message actions

// Shortcut keys mapping
const SHORTCUTS = {
    'c': 'copy',
    'r': 'reply',
    'e': 'edit',
    'f': 'forward',
    'd': 'delete',
    's': 'star',
    'p': 'pin',
    't': 'report',
    'a': 'react',
    'i': 'message info',
    'l': 'download'
};

// Variable to track state
let menuOpenMessage = null;

// Function to close all open menus
function closeAllMenus() {
    const openMenus = document.querySelectorAll('div[role="menu"]');
    openMenus.forEach(menu => {
        if (menu.style.display !== 'none') {
            menu.style.display = 'none';
        }
    });
    menuOpenMessage = null;
}

// Function to find the message menu button
function findMessageMenu(messageElement) {
    if (!messageElement) return null;

    // Try to find the menu button that's closest to the message
    const messageRect = messageElement.getBoundingClientRect();
    const menuButtons = document.querySelectorAll('[data-testid="menu"], [data-icon="menu"], div[role="button"]');
    
    let closestMenu = null;
    let minDistance = Infinity;

    menuButtons.forEach(button => {
        const buttonRect = button.getBoundingClientRect();
        const distance = Math.sqrt(
            Math.pow(buttonRect.left - messageRect.right, 2) +
            Math.pow(buttonRect.top - messageRect.top, 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestMenu = button;
        }
    });

    if (closestMenu) {
        console.log('Found closest menu button:', closestMenu);
        return closestMenu;
    }

    // Fallback to searching within the message element
    const selectors = [
        '[data-testid="menu"]',
        '[data-icon="menu"]',
        'span[data-icon="menu"]',
        'div[data-testid="menu"]',
        'div[data-icon="menu"]',
        'div[role="button"]'
    ];

    for (const selector of selectors) {
        const menu = messageElement.querySelector(selector);
        if (menu) {
            console.log('Found menu button in message:', menu);
            return menu;
        }
    }

    console.log('Menu button not found');
    return null;
}

// Function to find the message menu items
function findMessageMenuItems() {
    // Try different selectors for menu items
    const items = document.querySelectorAll('li[role="button"][data-animate-dropdown-item], div[role="menuitem"]');
    console.log('Found menu items:', items.length);
    return items;
}

// Function to trigger menu item action
function triggerMenuItemAction(item, action, messageElement) {
    console.log('Triggering action:', action, 'for message:', messageElement);
    
    if (messageElement) {
        // Close any open menus first
        closeAllMenus();

        // Click the message to ensure it's selected
        messageElement.click();
        
        // Small delay to ensure selection
        setTimeout(() => {
            // Try to find the clickable element in different ways
            const clickableDiv = item.querySelector('div[role="button"]') || 
                               item.querySelector('div[role="menuitem"]') ||
                               item.querySelector('div');
            if (clickableDiv) {
                console.log('Clicking div element');
                clickableDiv.click();
            } else {
                console.log('Clicking li element');
                item.click();
            }
        }, 50);
    }
}

// Function to get menu item text
function getMenuItemText(item) {
    // First try to find the text span
    const textSpan = item.querySelector('span:not(.shortcut-label)');
    if (textSpan) {
        return textSpan.textContent.toLowerCase().trim();
    }
    
    // Fallback to getting text from the div
    return item.textContent.toLowerCase().trim();
}

// Function to handle keyboard shortcuts
function handleKeyboardShortcut(event) {
    // Ignore if Ctrl or Alt is pressed (to allow system shortcuts)
    if (event.ctrlKey || event.altKey) {
        return;
    }

    const key = event.key.toLowerCase();
    console.log('Key pressed:', key);
    
    if (SHORTCUTS[key] && menuOpenMessage) {
        console.log('Shortcut found:', SHORTCUTS[key]);
        console.log('Using message with open menu:', menuOpenMessage);
        
        // Get the current menu items
        const menuItems = findMessageMenuItems();
        console.log('Menu items:', menuItems.length);
        
        let found = false;
        menuItems.forEach(item => {
            const text = getMenuItemText(item);
            console.log('Checking menu item:', text);
            
            // Skip Message info unless it's specifically requested
            if (text === 'message info' && SHORTCUTS[key] !== 'message info') {
                return;
            }
            
            // For Message info, require exact match
            if (SHORTCUTS[key] === 'message info' && text !== 'message info') {
                return;
            }
            
            // For other actions, check if the text contains the action
            if (text.includes(SHORTCUTS[key])) {
                console.log('Found matching menu item:', text);
                triggerMenuItemAction(item, SHORTCUTS[key], menuOpenMessage);
                found = true;
            }
        });
        
        if (!found) {
            console.log('No matching menu item found');
        }
    } else {
        console.log('No open menu or shortcut not found');
    }
}

// Function to add shortcut labels to menu items
function addShortcutLabels() {
    const menuItems = findMessageMenuItems();
    menuItems.forEach(item => {
        // Remove any existing shortcut labels
        const existingLabel = item.querySelector('.shortcut-label');
        if (existingLabel) {
            existingLabel.remove();
        }

        const text = getMenuItemText(item);
        
        for (const [key, action] of Object.entries(SHORTCUTS)) {
            // Skip Message info unless it's specifically requested
            if (text === 'message info' && action !== 'message info') {
                continue;
            }
            
            // For Message info, require exact match
            if (action === 'message info' && text !== 'message info') {
                continue;
            }
            
            // For other actions, check if the text contains the action
            if (text.includes(action)) {
                // Create a container for the menu item content
                const contentDiv = item.querySelector('div');
                if (contentDiv) {
                    // Set the container to flex to position items
                    contentDiv.style.display = 'flex';
                    contentDiv.style.justifyContent = 'flex-start';
                    contentDiv.style.alignItems = 'center';
                    contentDiv.style.width = '100%';
                    contentDiv.style.gap = '8px'; // Add space between shortcut and text

                    // Create and style the shortcut label first
                    const shortcutSpan = document.createElement('span');
                    shortcutSpan.className = 'shortcut-label';
                    shortcutSpan.textContent = key.toUpperCase(); // Make key uppercase like Slack
                    shortcutSpan.style.color = '#c8c8c8'; // Darker gray text
                    shortcutSpan.style.fontSize = '11px';
                    shortcutSpan.style.fontWeight = '500';
                    shortcutSpan.style.minWidth = '16px';
                    shortcutSpan.style.height = '16px';
                    shortcutSpan.style.lineHeight = '16px';
                    shortcutSpan.style.textAlign = 'center';
                    shortcutSpan.style.backgroundColor = '#005C4B'; // More grayish background
                    shortcutSpan.style.border = '1px solid #c8c8c8'; // Darker border
                    shortcutSpan.style.borderRadius = '3px';
                    shortcutSpan.style.padding = '0 4px';
                    shortcutSpan.style.userSelect = 'none';
                    shortcutSpan.style.fontFamily = 'Monaco, Menlo, Consolas, "Courier New", monospace';
                    shortcutSpan.style.boxShadow = '0 1px 0 0 #aaa'; // Darker shadow
                    
            

                    // Add click handler
                    // shortcutSpan.addEventListener('click', (e) => {
                    //     e.stopPropagation(); // Prevent event from bubbling up
                    //     if (menuOpenMessage) {
                    //         console.log('Using message with open menu');
                    //         triggerMenuItemAction(item, action, menuOpenMessage);
                    //     } else {
                    //         console.log('No open menu found');
                    //     }
                    // });

                    // Create a wrapper for the text
                    const textWrapper = document.createElement('span');
                    textWrapper.textContent = contentDiv.textContent;
                    contentDiv.textContent = ''; // Clear the original text

                    // Add elements in the correct order (shortcut first, then text)
                    contentDiv.appendChild(shortcutSpan);
                    contentDiv.appendChild(textWrapper);
                }
                break;
            }
        }
    });
}

// Function to watch for menu opening
function watchForMenu() {
    // Watch for clicks on menu buttons
    document.addEventListener('click', (event) => {
        const menuButton = event.target.closest('[data-testid="menu"], [data-icon="menu"], div[role="button"]');
        if (menuButton) {
            console.log('Menu button clicked');
            // Find the parent message element
            const messageElement = menuButton.closest('.message-in, .message-out');
            if (messageElement) {
                menuOpenMessage = messageElement;
                console.log('Menu opened for message:', menuOpenMessage);
            }
            // Wait a short moment for the menu to open
            setTimeout(addShortcutLabels, 50);
        }
    });

    // Watch for clicks outside menus to close them
    document.addEventListener('click', (event) => {
        if (!event.target.closest('div[role="menu"]') && 
            !event.target.closest('[data-testid="menu"]') && 
            !event.target.closest('[data-icon="menu"]') && 
            !event.target.closest('div[role="button"]')) {
            closeAllMenus();
        }
    });

    // Also watch for menu items being added to the DOM
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                const hasMenuItems = Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && (
                        node.querySelector('li[role="button"][data-animate-dropdown-item]') ||
                        node.querySelector('div[role="menuitem"]')
                    )
                );
                if (hasMenuItems) {
                    console.log('Menu items added to DOM');
                    addShortcutLabels();
                    break;
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initialize the extension
function init() {
    console.log('Initializing extension');
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    // Start watching for menu opening
    watchForMenu();
}

// Start the extension when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


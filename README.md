# ContactHub — Contact Management System

A responsive contact manager built with plain **HTML, CSS and JavaScript**. It is ready for static hosting such as GitHub Pages.

## Features
- Add, edit, view and delete contacts
- Search contacts by name, phone, email, company, category, address or notes
- Favourite contacts
- Categories: Work, Family, Friends and Other
- Dashboard statistics
- Sort by name, newest or oldest
- Grid and list layouts
- Light and dark appearance
- Quick search / command palette (`Ctrl + K` or `⌘ + K`)
- Keyboard shortcut `/` to focus contact search
- Export contacts to CSV
- Import contacts from CSV or JSON
- Download a full JSON backup
- Duplicate phone/email warning
- Responsive desktop, tablet and mobile layouts
- Existing `contacthub_contacts_v1` browser data is preserved and extended

## Run locally
Keep `index.html`, `style.css` and `script.js` in the same folder. Open `index.html` in a browser.

## Publish using GitHub Pages
1. Create a new repository on GitHub.
2. Upload `index.html`, `style.css`, `script.js` and this `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then Save.
6. Wait for GitHub Pages to publish your website.

## Data and privacy
Contacts are stored in the browser's `localStorage` on the device where the site is used. This static demo does not sync contacts between devices or users. Use **Backup** regularly if you want a copy of your data. Imported and exported files remain under your control.

## Notes
The interface uses Google Fonts and Lucide icons from CDN links, so those decorative assets need an internet connection. The core contact manager runs as a static website without a backend.

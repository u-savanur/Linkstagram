# Linkstagram

Linkstagram is a full-stack system designed to capture, transport, and analyze social media profiles from LinkedIn and Instagram. It employs a "Dumb Client, Smart Server" architecture where a lightweight Chrome Extension captures raw DOM data and a robust Node.js backend performs the parsing and storage.

## Architecture

### Chrome Extension (Client)
- **Manifest V3**: Uses modern Chrome extension standards.
- **Responsibility**: Strictly limited to URL detection and HTML capture. It contains no scraping logic.
- **Security**: Does not execute remote code. It sanitizes input by delegating processing to the backend.

### Node.js Backend (Server)
- **Express & Sequelize**: Handles API requests and database ORM.
- **Scraping Engine**: Uses Cheerio for static HTML analysis.
- **Dispatcher Pattern**: Routes requests to specific strategies (`linkedin.js` or `instagram.js`) based on URL patterns.
- **Storage**: SQLite database for persistent profile storage.

## Prerequisites
- Node.js (v18+)
- Google Chrome

## Setup Instructions

### 1. Backend Setup
The backend is responsible for receiving HTML, parsing it, and storing the results.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`.

### 2. Chrome Extension Setup
The extension provides the UI to capture the current page.

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension` folder within this project.

## Usage Guide

### Testing LinkedIn
1. Ensure the backend is running.
2. Log in to LinkedIn in your browser.
3. Navigate to a profile page (e.g., `https://www.linkedin.com/in/username`).
4. Click the Linkstagram extension icon.
5. Verify the badge says "LinkedIn".
6. Click **Send Page to Backend**.
7. View the extracted data in the popup result window.

### Testing Instagram
1. Log in to Instagram.
2. Navigate to a user profile (e.g., `https://www.instagram.com/username`).
3. Open the extension.
4. Verify the badge says "Instagram".
5. Click **Send Page to Backend**.

## Permissions Explanation

- **activeTab**: Required to access the URL and content of the currently focused tab when the user clicks the extension.
- **scripting**: Required to programmatically inject the capture script to retrieve `document.documentElement.outerHTML`.
- **host_permissions (localhost)**: Allows the extension to send POST requests to the local development server.

## Troubleshooting

- **Backend Offline**: Ensure `npm start` is running and port 3000 is free.
- **Unsupported Page**: The extension only activates on URLs matching `linkedin.com/in/` or `instagram.com/`.
- **Empty Data**: Social media layouts change frequently. If parsing fails, check the backend logs for details on the received HTML structure.

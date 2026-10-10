# Warrantiq — AI-Powered Digital Warranty & Service Platform

A React + Vite prototype for tracking electrical appliance warranties, reading bill images with OCR, and creating demo service requests.

## Requirements
- Node.js 18 or newer
- Internet connection for first-time package installation and OCR language data

## Run in Visual Studio Code
1. Extract the ZIP file.
2. Open the extracted `warranty-service-platform` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the local URL Vite prints, usually `http://localhost:5173`.

## Features
- Responsive dashboard and sidebar navigation
- Sample appliance inventory and warranty status calculation
- Add an appliance using a form
- OCR text extraction from JPG, PNG, and WEBP bill images using Tesseract.js
- Demo service-request form
- Warranty insights calculated from current session data

## Important limitations
This is a frontend prototype. Appliance and service data is kept in React state and is not permanently saved. MongoDB, a Node/Express API, user authentication, PDF OCR, and manufacturer warranty verification are not connected yet. OCR output must be checked against the original bill; it is not proof of warranty authenticity.

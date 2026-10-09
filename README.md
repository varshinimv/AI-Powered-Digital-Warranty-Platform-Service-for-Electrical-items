# Warrantiq – AI-Powered Digital Warranty and Service Management Platform

Warrantiq is a web-based application designed to help users manage electrical appliance warranties, organize appliance details, scan purchase invoices using OCR, and submit service requests through a single dashboard.

## 🚀 Features

* **Dashboard:** View appliance information and warranty-related insights.
* **AI Bill Scanner:** Extract text from uploaded invoice images using Optical Character Recognition (OCR).
* **Appliance Management:** Add and manage appliance details, purchase dates, and warranty expiry dates.
* **Service Requests:** Submit service requests for appliance-related issues.
* **Insights Dashboard:** View warranty and appliance-related information through charts.
* **Responsive Design:** Use the interface on desktop and mobile screens.
* **Interactive Interface:** Navigate between dashboard sections and receive notifications.

## 🛠️ Technologies Used

* React.js
* Vite
* JavaScript
* HTML5
* CSS3
* Tesseract.js (OCR)
* Lucide React (icons)

## 💻 Installation and Setup

### Prerequisites

Install the following software before running the project:

* Node.js
* npm
* Visual Studio Code

### Steps to Run Locally

1. Clone the repository:

   ```bash
    https://github.com/varshinimv/warrantiq.git
   ```

2. Open the project folder:

   ```bash
   cd warrantiq
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal, usually `http://localhost:5173/`.

## 🌐 Deployment

Warrantiq can be deployed using Vercel.

1. Push the project to GitHub.
2. Sign in to Vercel using GitHub.
3. Import the Warrantiq repository.
4. Select **Vite** as the framework.
5. Click **Deploy**.
6. Copy the generated live website URL.

## 📂 Project Structure

```text
warrantiq/
├── index.html
├── package.json
├── package-lock.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    └── index.css
```

## 🔍 Project Objective

The main objective of Warrantiq is to simplify appliance warranty management by providing a centralized digital platform for storing appliance information, extracting invoice text, viewing warranty details, and organizing service requests.

## ⚠️ Current Limitations

* Invoice scanning depends on the quality and clarity of the uploaded image.
* OCR-extracted information may require manual correction.
* The current demonstration version does not include a connected backend or permanent database storage.
* Service requests and appliance details are not yet stored in a permanent database.
* Warranty authenticity is not independently verified with manufacturers.

## 🔮 Future Enhancements

* Integrate a backend API and MongoDB database.
* Save appliance details and service requests permanently.
* Improve invoice information extraction and document processing.
* Add user authentication and individual user accounts.
* Integrate manufacturer or authorized service-centre verification where available.
* Add email or SMS notifications for warranty expiry and service updates.

## 👩‍💻 Author

**Varshini M V**

BCA Final-Year Student

## 📄 License

This project is developed for educational and academic purposes.

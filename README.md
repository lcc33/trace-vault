# 🔐 TraceVault — Lost & Found System

TraceVault is a campus-focused Lost & Found platform built to help students easily report lost items, view found items, and connect both ends securely. It aims to reduce the stress and time associated with finding lost belongings within university environments.

## 🚀 Overview

TraceVault provides a simple, user-friendly interface for students to:
- Report a lost item
- View items that have been found
- Trace and claim items using a unique Trace ID

## ✨ Features

- 📌 **Lost Item Reporting**: Users can submit item details and contact info.
- 🔍 **Found Item Explorer**: A searchable, filterable list of found items.
- 🧩 **Trace ID Feature**: Users receive a unique ID to trace and verify claims.
- 🧠 **Responsive Design**: Optimized for mobile and desktop.
- 🔐 **Secure Cloud Storage**: Items and user data are managed using Firebase.

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend/Database**: Firebase (Authentication, Firestore, Storage)
- **Design**: Clean, minimal, mobile-first approach

## 📦 Folder StructureTraceVault 🔍

TraceVault is an open-source lost & found platform that makes it easy to report lost items, discover found items, and connect owners with finders.

Whether you lost your phone, wallet, or bag — TraceVault helps you report, track, and reclaim your belongings seamlessly.

🚀 Features (MVP)

Google Authentication – quick and secure sign-in.

Report Items – submit details of lost or found items.

View Reports – browse reports from other users.

Claims – request to claim an item (coming soon).

User Profile – view your reports and claims (in progress).

Notifications – get alerts when your item is matched (planned).

📦 Tech Stack

Frontend: HTML, CSS, JavaScript (Vanilla for MVP)

Backend: Node.js, Express

Database: Firebase (for reports & user data)

Authentication: Google OAuth 2.0

🛠️ Installation & Setup

Clone the repo:

git clone https://github.com/<your-username>/tracevault.git
cd tracevault


Install dependencies:

npm install


Create a .env file in the root directory and add your config:

GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=your-random-secret
FIREBASE_CONFIG=your-firebase-config


Run locally:

npm start


Visit http://localhost:5000

🌍 Deployment

Currently deployed on Render:
TraceVault App

Make sure to add both your local and production callback URLs to Google Cloud Console → OAuth 2.0 Redirect URIs.

🤝 Contributing

We’re open to contributions!

Fork the repo

Create your feature branch:

git checkout -b feature/awesome-feature


Commit your changes:

git commit -m "Add awesome feature"


Push to the branch:

git push origin feature/awesome-feature


Open a Pull Request

📌 Roadmap

 Google OAuth setup

 Report & view items

 Claim logic

 Profile with reports & claims

 Notifications system

 Improved UI/UX

📄 License

This project is licensed under the MIT License – feel free to use, modify, and share.

🔥 Built with ❤️ by Muhammad Is’haq
 & the community.
TraceVault/
│
├── index.html # Landing page
├── explore.html # Found items page with search & filters
├── trace.html # Trace ID functionality
├── assets/ # Images, icons, etc.
├── styles/ # Custom CSS
└── scripts/ # JavaScript for UI and Firebase interaction


## 📈 Status

**Development Stage**: 🔧 *Early Development*

> Working MVP landing, explore, and trace pages are live. Authentication and database integration in progress.

## 🎯 Target Audience

- Students
- University staff
- Lost & Found administrators

## 🌍 Industry

**Education** / **Digital Services**


© 2025 TraceVault Team — Built with purpose.



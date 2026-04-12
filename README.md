# SmartWrite-An AI writing assistant

A full-stack AI-powered writing assistant built with the MERN stack. This application acts as a co-pilot for content writers offering tools to generate new content, fix grammar, summarize text, and adjust tone using Google's Gemini AI.

##  Features

* **AI Text Generation & Editing:** Powered by Google Gemini (SDK with REST fallback). Features include content generation, grammar correction, tone adjustment, and summarization.
* **Payment and Subscription:** Feature to subscribe and pay for subscription tiers.
* **Rich User Dashboard:** A clean, responsive React interface for seamless interaction with AI tools and document management.
* **Admin Dashboard:** Comprehensive analytics, user management, and feature usage tracking for platform administrators.

## Screenshots


| Landing Page | AI Editor |
| :---: | :---: |
| ![Landing Page](./screenshots/screenshot1.png) | ![AI Editor](./screenshots/screenshot2.png) |

| Pricing & Stripe Checkout | Admin Dashboard |
| :---: | :---: |
| ![Pricing](./screenshots/screenshot3.png) | ![Admin Dashboard](./screenshots/screenshot4.png) |

##  Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS, Recharts, Stripe Elements
* **Backend:** Node.js, Express.js, express-session
* **Database:** MongoDB, Mongoose
* **External APIs:** Google Gemini API, Stripe API

## Getting Started

### Prerequisites
* Node.js installed on your machine
* MongoDB database (local or MongoDB Atlas)
* Stripe Account (for test API keys)
* Google Gemini API Key
* After getting required keys ,enter them in the .env file appropriately.


## 📄 License
This project is licensed under the ISC License.

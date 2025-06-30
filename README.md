# Labrish - Caribbean Voice AI Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Styled with Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![AI by ElevenLabs](https://img.shields.io/badge/AI%20by-ElevenLabs-42295A?logo=elevenlabs&logoColor=white)](https://elevenlabs.io/)
[![Payments by Stripe](https://img.shields.io/badge/Payments%20by-Stripe-626CD9?logo=stripe&logoColor=white)](https://stripe.com/)

## 🌟 Project Overview

Labrish is a cutting-edge Caribbean Voice AI Platform designed to celebrate and preserve the rich oral traditions of the Caribbean through modern technology. It empowers users to create, share, and listen to stories using lifelike AI-generated voices, including authentic Caribbean accents. The platform offers real-time voice chat, a storytelling studio, and advanced features like voice cloning, analytics, and enhanced security.

The project aims to blend cultural heritage with innovative AI, making storytelling interactive and accessible for a global audience while honoring the unique linguistic and narrative styles of the islands.

## ✨ Key Features

*   **Authentic Caribbean Voices:** Generate speech with a diverse range of Caribbean accents (e.g., Jamaican Patois, Trinidadian Creole) and other global languages.
*   **AI-Powered Storytelling Studio:** Convert text into high-quality audio stories. Users can write their own narratives and have them narrated by AI voices.
*   **Personalized Voice Cloning:** Train and create your own unique AI voice model from audio samples, allowing for truly personalized narration.
*   **Interactive Voice Chat:** Engage in real-time conversations with AI voices, offering a dynamic and immersive experience.
*   **Comprehensive Dashboard:** A personalized hub for users to manage their stories, access quick links, and view usage statistics.
*   **Advanced Analytics:** Gain insights into content performance, user engagement, and audience demographics through a detailed analytics dashboard.
*   **Enhanced Security:** Features like Multi-Factor Authentication (MFA), session management, password strength checking, and security activity logging to protect user accounts.
*   **Subscription Management:** Integrated Stripe for seamless handling of subscription plans (Starter, Labrish Pro, Enterprise) and billing.
*   **Offline Support:** Utilizes Service Workers to queue requests and provide a smoother experience even when offline.
*   **File Upload Integration:** Easily upload text content from `.txt`, `.pdf`, `.doc`, and `.docx` files for speech generation.
*   **Story Library:** Manage and explore both personal and public AI-generated stories.
*   **Interactive FAQ Section:** A searchable and filterable FAQ to help users find answers quickly.

## 🚀 Technologies Used

Labrish is built with a modern, mobile-first, and responsive design philosophy, leveraging a robust stack:

*   **Frontend:**
    *   [React](https://react.dev/) (v18.x): A JavaScript library for building user interfaces.
    *   [TypeScript](https://www.typescriptlang.org/): A superset of JavaScript that adds static typing.
    *   [Vite](https://vitejs.dev/): A fast build tool and development server.
    *   [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapid UI development.
    *   [Framer Motion](https://www.framer.com/motion/): A production-ready motion library for React.
    *   [React Router DOM](https://reactrouter.com/en/main): For declarative routing in React applications.
    *   [Lucide React](https://lucide.dev/): A collection of beautiful open-source icons.
*   **Backend & Database:**
    *   [Supabase](https://supabase.com/): An open-source Firebase alternative providing PostgreSQL database, authentication, and Edge Functions.
    *   [Supabase Edge Functions](https://supabase.com/docs/guides/functions): Serverless functions for handling API calls to third-party services (ElevenLabs, Stripe).
*   **AI & Payments:**
    *   [ElevenLabs API](https://elevenlabs.io/): For advanced Text-to-Speech (TTS) and Voice Cloning capabilities.
    *   [Stripe](https://stripe.com/): For secure payment processing and subscription management.
*   **Utilities & Enhancements:**
    *   Custom utilities for analytics, error handling, file uploads, offline support, performance optimization, and security.

## ⚙️ Installation & Setup

To get a local copy up and running, follow these steps.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or Yarn (npm is used in this guide)
*   A Supabase project
*   An ElevenLabs API Key
*   A Stripe account with API keys

### Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
Replace the placeholder values with your actual keys.

Database Setup (Supabase)
Create Supabase Project: If you don't have one, create a new project on the Supabase website.
Run Migrations: The project uses SQL migrations to set up the database schema. You can find the migration files in the supabase/migrations directory. Apply these migrations to your Supabase project.
20250623020609_fierce_paper.sql: Sets up stripe_customers, stripe_subscriptions, and stripe_orders tables, along with related enums, policies, and views.
20250623032538_broad_credit.sql: Sets up the stories table, increment_play_count function, and storage buckets for user files.
Additional tables for authentication enhancements (user_mfa_settings, security_sessions, security_events) and voice cloning (voice_clone_projects, voice_audio_samples) are also defined in the IMPLEMENTATION_PLAN.md and should be created in your Supabase database.
Configure RLS: Row Level Security (RLS) is enabled by default on critical tables. Ensure the policies defined in the migration files are correctly applied.
Stripe Integration
Stripe API Keys: Ensure your STRIPE_SECRET_KEY is correctly set in your .env file.
Deploy Edge Functions: The project relies on Supabase Edge Functions for Stripe integration. Deploy the following functions from the supabase/functions directory to your Supabase project:
stripe-checkout: Handles the creation of Stripe checkout sessions.
stripe-webhook: Processes Stripe webhook events (e.g., checkout.session.completed, payment_intent.succeeded, subscription updates) to sync data with your Supabase database.
Configure Webhooks: In your Stripe Dashboard, set up a webhook endpoint pointing to your deployed stripe-webhook Edge Function URL. Configure it to listen for events like checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, and payment_intent.succeeded.
ElevenLabs Integration
ElevenLabs API Key: Set your ELEVENLABS_API_KEY in your .env file.
Deploy Edge Functions: Deploy the following ElevenLabs-related Edge Functions from the supabase/functions directory:
elevenlabs-tts: Handles Text-to-Speech requests.
elevenlabs-voices: Fetches available voices from ElevenLabs.
batch-tts: (Optional) For processing multiple text chunks for TTS.
Frontend Setup
Install Dependencies:

npm install
# or
yarn install
Run Development Server:

npm run dev
# or
yarn dev
This will start the development server, usually at http://localhost:5173.
🏃‍♂️ Usage
Once the development server is running and all backend services are configured:

Access the Application: Open your web browser and navigate to http://localhost:5173.
Sign Up/Log In: Create a new account or log in with existing credentials.
Explore Features:
Text-to-Speech Studio: Navigate to /text-to-speech to convert your text into Caribbean-accented audio.
Voice Cloning Studio: Visit /voice-studio to train your own AI voice model.
Dashboard: Your personal hub at /dashboard to manage stories, view analytics, and access quick links.
Security Settings: Manage your account security at /security.
Analytics Dashboard: View detailed insights into your content performance at /analytics.
Interact: Use the various forms and buttons to generate speech, manage stories, and explore the platform's capabilities.
📚 API Endpoints
The project utilizes Supabase Edge Functions as its backend API. These functions are designed to be consumed by the frontend application and handle secure interactions with third-party services and the database.

POST /functions/v1/elevenlabs-tts: Generates speech from text using ElevenLabs.
Request Body: { text: string, voice_id: string, voice_settings: object }
Authentication: Bearer Token (Supabase access_token)
GET /functions/v1/elevenlabs-voices: Fetches a list of available voices from ElevenLabs.
Authentication: Bearer Token (Supabase access_token)
POST /functions/v1/batch-tts: (Optional) Generates speech for multiple text chunks.
Request Body: { texts: string[], voice_id: string, voice_settings: object, merge_audio?: boolean }
Authentication: Bearer Token (Supabase access_token)
POST /functions/v1/stripe-checkout: Creates a Stripe checkout session for payments/subscriptions.
Request Body: { price_id: string, success_url: string, cancel_url: string, mode: 'payment' | 'subscription' }
Authentication: Bearer Token (Supabase access_token)
POST /functions/v1/stripe-webhook: Receives and processes Stripe webhook events.
Authentication: Stripe-Signature header for verification.
⚙️ Configuration Details
Frontend Configuration:
src/lib/supabase.ts: Configures the Supabase client.
src/stripe-config.ts: Defines Stripe product price IDs.
tailwind.config.js: Customizes Tailwind CSS, including color palettes (caribbean shades, brandy, apple, cerise), fonts (Fraunces, Cairo), and animations.
Backend Configuration (Supabase Edge Functions):
Environment variables (ELEVENLABS_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) are crucial for the functions to operate correctly. These are set directly in your Supabase project's function settings.
🤝 Contributing
Contributions are welcome! If you'd like to contribute to Labrish, please follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature/YourFeature).
Make your changes and commit them (git commit -m 'Add new feature').
Push to the branch (git push origin feature/YourFeature).
Open a Pull Request.
Please ensure your code adheres to the existing style and passes linting checks.

📄 License
This project is licensed under the MIT License. See the LICENSE file (if available in the root directory) for more details. If no LICENSE file is present, it is intended to be open-source under the MIT license.

📧 Contact
For any inquiries or support, please contact the Innov8tion Hub team.

Innov8tion Hub Website: https://innov8tionhub.com
Bolt.new: https://www.bolt.new (The platform used to build this project)

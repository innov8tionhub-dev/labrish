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

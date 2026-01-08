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
*   **Persistent Audio Storage:** Generated audio files are automatically stored in S3-compatible storage with permanent URLs for sharing and playback.
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
```

The following secrets should be configured in your Supabase Edge Function settings:

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
LABRISH_S3=your_s3_access_key
LABRISH_S3_SECRET=your_s3_secret_key
```

Replace the placeholder values with your actual keys.

### S3 Audio Storage (Optional)

To enable persistent audio storage, configure the S3 credentials in your Supabase Edge Function secrets:

1. Go to your Supabase Dashboard > Settings > Edge Functions
2. Add the `LABRISH_S3` and `LABRISH_S3_SECRET` secrets
3. The storage bucket `user-files` is automatically created by the database migrations

When configured, all generated audio files are stored at `user-files/audio/{user_id}/{timestamp}.mp3` and can be accessed via permanent public URLs.

### Database Setup (Supabase)

1. **Create Supabase Project:** If you don't have one, create a new project on the Supabase website.
2. **Run Migrations:** The project uses SQL migrations to set up the database schema. You can find the migration files in the `supabase/migrations` directory. Apply these migrations to your Supabase project.
   - `20250623020609_fierce_paper.sql`: Sets up stripe_customers, stripe_subscriptions, and stripe_orders tables.
   - `20250623032538_broad_credit.sql`: Sets up the stories table, increment_play_count function, and storage buckets.
   - `20260108221822_create_audio_files_table_and_storage.sql`: Sets up the audio_files table and user-files storage bucket for persistent audio storage.
3. **Configure RLS:** Row Level Security (RLS) is enabled by default on critical tables. Ensure the policies defined in the migration files are correctly applied.

### Stripe Integration

1. **Stripe API Keys:** Ensure your `STRIPE_SECRET_KEY` is correctly set in your Supabase Edge Function secrets.
2. **Deploy Edge Functions:** The project relies on Supabase Edge Functions for Stripe integration:
   - `stripe-checkout`: Handles the creation of Stripe checkout sessions.
   - `stripe-webhook`: Processes Stripe webhook events to sync data with your Supabase database.
3. **Configure Webhooks:** In your Stripe Dashboard, set up a webhook endpoint pointing to your deployed `stripe-webhook` Edge Function URL.

### ElevenLabs Integration

1. **ElevenLabs API Key:** Set your `ELEVENLABS_API_KEY` in your Supabase Edge Function secrets.
2. **Deploy Edge Functions:** Deploy the following ElevenLabs-related Edge Functions:
   - `elevenlabs-tts`: Handles Text-to-Speech requests with optional S3 storage.
   - `elevenlabs-voices`: Fetches available voices from ElevenLabs.
   - `batch-tts`: For processing multiple text chunks for TTS.

### Frontend Setup

Install Dependencies:

```bash
npm install
```

Run Development Server:

```bash
npm run dev
```

This will start the development server at http://localhost:5173.

## Usage

Once the development server is running and all backend services are configured:

1. **Access the Application:** Open your web browser and navigate to http://localhost:5173.
2. **Sign Up/Log In:** Create a new account or log in with existing credentials.
3. **Explore Features:**
   - **Text-to-Speech Studio:** Navigate to `/text-to-speech` to convert your text into Caribbean-accented audio.
   - **Voice Cloning Studio:** Visit `/voice-studio` to train your own AI voice model.
   - **Dashboard:** Your personal hub at `/dashboard` to manage stories, view analytics, and access quick links.
   - **Security Settings:** Manage your account security at `/security`.
   - **Analytics Dashboard:** View detailed insights into your content performance at `/analytics`.
4. **Interact:** Use the various forms and buttons to generate speech, manage stories, and explore the platform's capabilities.

## API Endpoints

The project utilizes Supabase Edge Functions as its backend API. These functions handle secure interactions with third-party services and the database.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/functions/v1/elevenlabs-tts` | POST | Generates speech from text. Returns audio with `X-Audio-Url` header containing the S3 storage URL. |
| `/functions/v1/elevenlabs-voices` | GET | Fetches available voices from ElevenLabs. |
| `/functions/v1/batch-tts` | POST | Generates speech for multiple text chunks with optional merging. |
| `/functions/v1/stripe-checkout` | POST | Creates a Stripe checkout session. |
| `/functions/v1/stripe-webhook` | POST | Receives Stripe webhook events (uses Stripe-Signature header). |

All endpoints except `stripe-webhook` require Bearer Token authentication using Supabase access_token.

## Configuration Details

**Frontend Configuration:**
- `src/lib/supabase.ts`: Configures the Supabase client.
- `src/lib/audioStorage.ts`: Utilities for managing stored audio files.
- `src/stripe-config.ts`: Defines Stripe product price IDs.
- `tailwind.config.js`: Customizes Tailwind CSS with Caribbean-inspired color palettes.

**Backend Configuration (Supabase Edge Functions):**
Environment variables are configured in your Supabase project's Edge Function settings:
- `ELEVENLABS_API_KEY`: ElevenLabs API key for TTS
- `STRIPE_SECRET_KEY`: Stripe secret key for payments
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook verification secret
- `LABRISH_S3`: S3 access key for audio storage (optional)
- `LABRISH_S3_SECRET`: S3 secret key for audio storage (optional)

## Contributing

Contributions are welcome! If you'd like to contribute to Labrish, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

Please ensure your code adheres to the existing style and passes linting checks.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contact

For any inquiries or support, please contact the Innov8tion Hub team.

- **Innov8tion Hub Website:** https://innov8tionhub.com
- **Bolt.new:** https://www.bolt.new (The platform used to build this project)

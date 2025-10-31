# Deployment Setup Guide for Labrish - Caribbean Voice AI Platform

## Overview
This document outlines all the required configuration steps and environment variables needed to deploy the Labrish platform successfully.

## Database Status ✅
All required database tables and migrations have been applied:
- ✅ Core tables (stories, user_activities, user_generation_counts, etc.)
- ✅ AI features tables (ai_assist_usage, community_prompts, story_interactions, story_analytics)
- ✅ Learning system tables (learning_vocabulary, learning_progress, cultural_quizzes, quiz_results)
- ✅ Achievement system (user_achievements, daily_challenges)
- ✅ Cultural knowledge base for caching
- ✅ RLS policies applied to all tables
- ✅ Database functions (increment_story_counter, calculate_next_review)
- ✅ Sample quizzes and daily challenges created

## Required Environment Variables

### Frontend (.env file)
```env
VITE_SUPABASE_URL=https://uaqfaflmsleipapbxhqs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcWZhZmxtc2xlaXBhcGJ4aHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDYwMTksImV4cCI6MjA2NjIyMjAxOX0.D1G57ZtPTjOixpgggddqvu6wchw81NUDK4RMVQdbu94

# Required but may not be set yet:
# VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

### Supabase Edge Functions Secrets
The following secrets must be configured in Supabase for Edge Functions:

```bash
# ElevenLabs API for text-to-speech
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# OpenAI API for GPT-5 story assistance
OPENAI_API_KEY=your_openai_api_key

# Stripe for payments
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
STRIPE_PRICE_ID_PRO=your_stripe_pro_plan_price_id
```

## Supabase Edge Functions ✅

All Edge Functions are implemented and ready to deploy:

1. **gpt5-story-assistant** - AI-powered story generation, expansion, polishing, and prompts
2. **gpt5-cultural-context** - Provides cultural context for Caribbean terms
3. **gpt5-dialect-enhance** - Suggests dialect improvements for stories
4. **elevenlabs-tts** - Text-to-speech generation with usage tracking
5. **elevenlabs-voices** - Fetches available voices from ElevenLabs
6. **elevenlabs-voice-design** - Custom voice creation
7. **batch-tts** - Batch audio generation
8. **stripe-checkout** - Create Stripe checkout sessions
9. **stripe-portal** - Create Stripe billing portal sessions
10. **stripe-webhook** - Handle Stripe webhook events

### Deploying Edge Functions
Edge Functions are already written in `/supabase/functions/`. To deploy them to Supabase:

```bash
# Note: Deployment should be done via Supabase Dashboard or CI/CD
# as the Supabase CLI is not available in this environment
```

## Third-Party Service Setup

### 1. ElevenLabs Account Setup
1. Create account at https://elevenlabs.io/
2. Navigate to Profile → API Keys
3. Generate a new API key
4. Add to Supabase secrets as `ELEVENLABS_API_KEY`
5. Add to frontend .env as `VITE_ELEVENLABS_API_KEY` (if needed for direct calls)

**Recommended Plan:** At least the Creator plan for production use

### 2. OpenAI API Setup
1. Create account at https://platform.openai.com/
2. Navigate to API Keys section
3. Create a new secret key
4. Add to Supabase secrets as `OPENAI_API_KEY`
5. Enable GPT-5 API access (may require waitlist approval)

**Note:** The application uses the GPT-5 Responses API at `https://api.openai.com/v1/responses`

### 3. Stripe Payment Setup
1. Create account at https://stripe.com/
2. Get API keys from Developers → API Keys
3. Create a product with monthly pricing
4. Set up webhook endpoint: `https://[your-supabase-url]/functions/v1/stripe-webhook`
5. Configure webhook to listen for these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

6. Add the following to Supabase secrets:
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
   - `STRIPE_PRICE_ID_PRO` - Price ID for Pro plan

## Feature Tiers

### Free Tier
- 5 AI-assisted generations per month
- 5 text-to-speech generations per month
- Basic voice selection
- Public story viewing
- Quiz access

### Pro Tier ($9.99/month)
- 50 AI-assisted generations per month
- 40 text-to-speech generations per month
- Voice cloning (up to 3 custom voices)
- Voice design studio access
- Batch generation
- Advanced analytics
- Priority support

## Post-Deployment Checklist

### Immediate Tasks
- [ ] Set all environment variables in Supabase
- [ ] Deploy all Edge Functions
- [ ] Configure Stripe webhook
- [ ] Test authentication flow
- [ ] Test text-to-speech generation
- [ ] Test AI story assistance
- [ ] Verify payment flow
- [ ] Test discovery feed
- [ ] Test quiz system

### Monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor API usage for rate limits
- [ ] Track conversion rates
- [ ] Monitor Edge Function logs
- [ ] Set up alerts for failed payments

### Optional Enhancements
- [ ] Add more sample quizzes
- [ ] Create onboarding tutorial
- [ ] Add more cultural terms to knowledge base
- [ ] Create story templates
- [ ] Set up email notifications
- [ ] Add social sharing features
- [ ] Implement story comments/reviews

## Known Limitations

1. **GPT-5 API:** Currently in limited access. The application will fallback gracefully if API is not available.
2. **Voice Cloning:** Requires ElevenLabs Creator plan or higher
3. **Offline Support:** Uses IndexedDB and may have browser compatibility issues
4. **Mobile Experience:** Optimized for modern browsers; may need additional testing on older devices

## Architecture Notes

### Database Design
- All tables use RLS (Row Level Security) for data protection
- User data is automatically scoped to authenticated users
- Public stories use visibility field (private/unlisted/public)
- Analytics are tracked separately for performance

### API Design
- All API calls go through Supabase Edge Functions
- Edge Functions handle authentication and rate limiting
- Responses include usage metrics for UI display

### Caching Strategy
- Cultural context is cached in database
- Offline actions are queued in IndexedDB
- Stories can be saved for offline access

## Support & Troubleshooting

### Common Issues

**Issue:** Text-to-speech fails with "API key not configured"
**Solution:** Ensure `ELEVENLABS_API_KEY` is set in Supabase secrets and Edge Function is redeployed

**Issue:** AI assistance returns "limit reached"
**Solution:** User has reached their monthly tier limit. Upgrade to Pro or wait for monthly reset

**Issue:** Discovery feed shows no stories
**Solution:** Create some public stories with `visibility = 'public'` to populate the feed

**Issue:** Quiz page is empty
**Solution:** Sample quizzes should be created. Run the SQL insert statements in the migration file

## Contact & Resources

- GitHub Repository: [Your repo URL]
- Documentation: [Your docs URL]
- Support Email: support@labrish.ai
- Supabase Dashboard: https://supabase.com/dashboard/project/uaqfaflmsleipapbxhqs

## Version History
- v1.0.0 - Initial release with core features
- v1.1.0 - Added AI assistance and discovery features
- v1.2.0 - Added learning system and quizzes (current)

---

Last Updated: 2025-10-31

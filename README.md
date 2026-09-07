# StudyMate — Deployment Guide

This folder is a ready-to-deploy version of StudyMate:
- `index.html` — the whole app (chat, notes, summaries, idea feedback, voice, dark mode)
- `api/ask.js` — a tiny serverless function that talks to the Claude API on the server side, so your API key is never exposed in the browser
- `package.json`, `.gitignore`, `.env.example` — supporting config

## Step 1 — Get an Anthropic API key
1. Go to https://console.anthropic.com and sign up / log in.
2. Go to **Settings → API Keys** and create a new key.
3. Add a small amount of credit to the account (Anthropic API usage is pay-as-you-go, billed by usage — this is separate from a claude.ai subscription).
4. Copy the key somewhere safe — you'll paste it into your hosting provider in Step 3.

## Step 2 — Put this project on GitHub
1. Create a new (private is fine) GitHub repository.
2. Upload everything in this folder to that repository (drag-and-drop on github.com works, or use `git push` if you're comfortable with git).

## Step 3 — Deploy on Vercel (free tier is enough to start)
1. Go to https://vercel.com and sign up (you can sign up with your GitHub account).
2. Click **Add New → Project** and import the GitHub repo you just created.
3. Before clicking deploy, open **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: the key you copied in Step 1
4. Click **Deploy**. In about a minute you'll get a live URL like `https://studymate-yourname.vercel.app` — that's your real, online, shareable app.

No other configuration is needed — Vercel automatically detects `index.html` as your site and any file inside `/api` as a serverless endpoint.

## Alternative hosts
If you'd rather not use Vercel:
- **Netlify** — same idea, but serverless functions go in a `netlify/functions` folder instead of `api`. Netlify's docs have a quick guide for converting a Vercel-style function.
- **Render** — better if you'd rather run a small always-on Node/Express server instead of serverless functions (useful once you add a database, per the backend architecture doc from earlier).

## Testing locally before you deploy (optional)
If you have Node.js installed on your computer:
```bash
npm install -g vercel
cp .env.example .env   # then paste your real API key into .env
vercel dev
```
This runs the site at `http://localhost:3000` with the API route working exactly like it will in production.

## Cost & usage notes
- Every message, note, summary, or idea-feedback request costs a small amount based on Claude API pricing (see https://www.anthropic.com/pricing for current rates).
- Because there's no rate limiting yet, anyone who finds your URL can use it and consume your API credits. For a real public launch, add the usage limits and auth described in `studymate-backend-architecture.md` from earlier before sharing the link widely.

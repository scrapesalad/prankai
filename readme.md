# Prank Dial AI

A Streamlit application for prank-style AI voice calls with custom prompts and templates.

## Web app (Next.js for Vercel)

The Next.js app lives in `web/` and is designed for Vercel deployment.

### Environment variables

Set these in Vercel or in `web/.env.local`:

- `NEXT_PUBLIC_APP_URL` (example: https://your-domain.vercel.app)
- `VAPI_PRIVATE_KEY`
- `VAPI_PHONE_ID`

### Local dev

```bash
cd web
npm install
npm run dev
```

### Vercel deployment

1. Import the GitHub repo into Vercel.
2. Set the Root Directory to `web`.
3. Add environment variables:
   - `NEXT_PUBLIC_APP_URL`
   - `VAPI_PRIVATE_KEY`
   - `VAPI_PHONE_ID`
4. Deploy.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the app:

**Option 1** (Recommended - works on Windows):
```powershell
python -m streamlit run app.py
```

**Option 2** (PowerShell script):
```powershell
.\run.ps1
```

**Option 3** (If streamlit is on PATH):
```bash
streamlit run app.py
```

## Configuration

⚠️ **Security Warning**: API keys are currently hardcoded in `app.py`. For production, use environment variables instead.

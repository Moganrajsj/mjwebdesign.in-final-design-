# MJ web designs — website

Static one-page site plus a serverless endpoint that emails the project
enquiry form through Gmail SMTP.

## Layout

```
public/          Static site (served at /)
  index.html
  service-page.css
  services/       Six dedicated service pages
  projects/       Four portfolio case studies
  service-page.css
  portfolio-page.css
  ayli.jpg
  sriram-broadband.jpg
api/enquiry.js   Serverless function for the contact form (POST /api/enquiry)
lib/enquiry.js   Shared validation + email builder (nodemailer)
scripts/         Local dev server + static build check
```

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Create `.env` first (copy `.env.example`):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=your gmail app password
MAIL_TO=you@gmail.com
MAIL_FROM=MJ web designs <you@gmail.com>
```

Gmail requires 2-Step Verification and an App Password
(Google Account → Security → App passwords).

## Deploy on Vercel

The project is set up for Vercel's static + functions model:

- `vercel.json` pins `"framework": null` (Vercel's "Other" preset). This is
  required: the project was first imported while it still had a custom
  `server.js`, so Vercel saved the `node` framework preset. Left as `node`,
  Vercel ignores `outputDirectory` and fails with
  `No entrypoint found in "/vercel/path0"`.
- `vercel.json` also sets the build command to `npm run build` and the output
  directory to `public`.
- `api/enquiry.js` is picked up automatically as a serverless function.

Project settings in the Vercel dashboard should be:

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Root Directory | repository root |
| Build Command | `npm run build` |
| Output Directory | `public` |
| Install Command | `npm install` |

Then add these Environment Variables (Production + Preview):

`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`,
`MAIL_TO`, `MAIL_FROM`

`.env` is never committed. Do not put the app password in code or in the repo.

## Form behaviour

The form posts JSON to `/api/enquiry`. If the endpoint is unavailable
(for example, hosting only the static files), it falls back to WhatsApp and
email links so no enquiry is lost.

# Halfway to God — The 100 Days

A shared 100-day discipline challenge. Each person builds their own list of
daily non-negotiables. Miss one habit on any day and the count returns to
zero. Everyone's current count shows up on a shared Muster Roll.

This is a real, working app — not a demo. Three things to set up, all free
at this scale, and you end up owning all of it.

---

## What you're connecting

- **Supabase** — the database and the login system (magic-link email, no passwords).
- **Vercel** — hosts the actual website and connects your domain.
- **GitHub** — holds the code so Vercel can deploy it.

None of this needs you to write code. You're filling in forms and copying
values between three free accounts.

---

## 1. Create the database (Supabase)

1. Go to supabase.com and create a free account, then "New project."
2. Once it's created, open **SQL Editor** in the left sidebar → **New query**.
3. Open `supabase/schema.sql` from this project, copy the whole file, paste
   it into the editor, and click **Run**. This creates the two tables and
   the streak/leaderboard logic.
4. Go to **Project Settings → API**. You'll need two values from this page
   in a minute: the **Project URL** and the **anon public** key.
5. Go to **Authentication → URL Configuration**. Leave this open — you'll
   come back after step 3 to add your real domain here (as both the
   **Site URL** and in **Redirect URLs** — they're two separate fields).
6. Go to **Authentication → Email Templates → Magic Link**. By default
   this template only shows a clickable link, but logging in is now
   code-based (see "Why a code instead of a link" below), so the actual
   code needs to be visible in the email. Add `{{ .Token }}` somewhere in
   the template body, e.g.:
   ```
   Your code is {{ .Token }}
   ```
   Save it.

## 2. Put the code on GitHub

1. Create a free GitHub account if you don't have one.
2. Create a new, empty repository (e.g. `halfway-100`).
3. Upload every file in this project into that repository (GitHub's
   "Add file → Upload files" works fine — drag the whole folder in).

## 3. Deploy it (Vercel)

1. Go to vercel.com, sign up, and choose **Add New → Project**.
2. Import the GitHub repo you just created.
3. Before clicking deploy, open **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → the Project URL from step 1.4
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → the anon public key from step 1.4
4. Click **Deploy**. In about a minute you'll get a working link like
   `halfway-100.vercel.app` — open it and confirm the login screen appears.
5. Go back to Supabase → **Authentication → URL Configuration** and add
   that `vercel.app` URL (and your custom domain, once step 4 is done) to
   **Redirect URLs**. Magic-link sign-in will fail silently until this is
   set.

## 4. Connect your own domain

1. In Vercel, open your project → **Settings → Domains** → add your domain
   (e.g. `100.halfwaytogod.com` or whatever you've already got).
2. Vercel shows you one or two DNS records to add. Add those in whichever
   place you bought the domain (Namecheap, Google Domains, etc.) — Vercel's
   instructions are specific to your exact domain once you enter it.
3. Add this final domain to Supabase's Redirect URLs list as well (step 3.5).

## 5. Invite people

Send them the link. Each person:
1. Enters their email, gets a magic link, clicks it.
2. Builds their own list of non-negotiables (1–15 habits — yours can be the
   full 13-task version, a friend's can be 3, however it was before).
3. Sees their count, the Muster Roll, and starts day one.

---

## Why a code instead of a link

The first version of this used a clickable magic link. It works fine on a
computer, but breaks in one specific, common situation: a phone, with the
site added to the Home Screen. iOS gives a Home Screen web app its own,
separate storage — it doesn't share logins with regular Safari. The email
link always opens in Safari (or Mail's in-app browser), so even a
successful login there never reaches the Home Screen icon. From the
outside it just looks like login "doesn't work."

A typed 6-digit code sidesteps this entirely — the whole login happens in
the same screen the person is already using, with no jump to another app
and back. Slightly more typing, but it works the same everywhere: laptop,
phone in Safari, or phone as a Home Screen icon.

## How the rules work

- A day only counts if **every** task on that person's list was checked
  before the day ends.
- "Ends" means their own device's local midnight, not a fixed server time.
- Once a day has passed, it's locked — no editing yesterday's boxes.
- The streak shown is always "consecutive complete days up to and including
  yesterday." Today's progress is shown separately and never inflates the
  count until the day is actually over.
- The Muster Roll shows everyone's name and count. It does **not** show
  anyone's specific habit list or daily checkbox history — just the number.

## Local development (optional)

If you ever want to run this on your own computer before it's live:

```
npm install
cp .env.local.example .env.local   # then fill in your two Supabase values
npm run dev
```

Then open http://localhost:3000.

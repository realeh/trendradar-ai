# How To Put TrendRadar AI On GitHub

This guide uploads the TrendRadar AI project to GitHub so you can share it with Claude, connect it to Vercel, and keep building it safely.

## Before You Start

Make sure you have:

- A GitHub account
- Git installed on your computer
- The TrendRadar AI project folder:

```text
C:\Users\ethan\OneDrive\Documents\New project
```

Do not upload secret keys. Files like `.env` and `.env.local` should stay private.

## Step 1: Create A GitHub Repository

1. Go to GitHub.
2. Click the `+` button in the top-right.
3. Click `New repository`.
4. Repository name:

```text
trendradar-ai
```

5. Choose `Private`.
6. Do not tick `Add a README file`.
7. Do not add a `.gitignore`.
8. Do not add a license.
9. Click `Create repository`.

GitHub will then show a repository URL that looks like this:

```text
https://github.com/YOUR_USERNAME/trendradar-ai.git
```

Keep that page open.

## Step 2: Open PowerShell In The Project Folder

Open PowerShell and run:

```powershell
cd "C:\Users\ethan\OneDrive\Documents\New project"
```

## Step 3: Check That Secrets Are Ignored

Run:

```powershell
Get-Content .gitignore
```

You should see entries like:

```text
node_modules
.next
.npm-cache
.env
*.log
```

This helps stop private files and large generated folders from being uploaded.

## Step 4: Create The First Git Commit

Run these commands:

```powershell
git init
git add .
git commit -m "Initial TrendRadar AI app"
```

If Git asks for your name and email, run:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Then run the commit again:

```powershell
git commit -m "Initial TrendRadar AI app"
```

## Step 5: Connect The Local Project To GitHub

Replace `YOUR_USERNAME` with your real GitHub username:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trendradar-ai.git
git push -u origin main
```

If GitHub asks you to sign in, follow the browser login prompt.

## Step 6: Confirm It Worked

Refresh your GitHub repository page.

You should see files like:

```text
src
supabase
package.json
README.md
DEPLOYMENT.md
next.config.mjs
```

You should not see:

```text
node_modules
.next
.env
.env.local
```

## Step 7: Share With Claude

Give Claude the GitHub repository link:

```text
https://github.com/YOUR_USERNAME/trendradar-ai
```

If the repository is private, Claude may not be able to open it unless your Claude plan supports GitHub access. If that happens, upload the `TrendRadar-AI-source.zip` file instead.

## Common Problems

If `git` is not recognized:

Install Git from:

```text
https://git-scm.com/downloads
```

If GitHub rejects your password:

GitHub no longer accepts normal passwords for command-line pushes. Use the browser login prompt, GitHub Desktop, or a personal access token.

If you accidentally upload secrets:

Immediately delete the secret key from the provider dashboard and create a new one. Do not just delete the file from GitHub, because old commits may still contain it.

## Easiest Alternative

If command-line Git feels annoying, install GitHub Desktop:

```text
https://desktop.github.com
```

Then:

1. Click `Add local repository`.
2. Select:

```text
C:\Users\ethan\OneDrive\Documents\New project
```

3. Click `Publish repository`.
4. Choose `Private`.
5. Publish.

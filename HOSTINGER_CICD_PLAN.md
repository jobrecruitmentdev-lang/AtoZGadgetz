# Hostinger CI/CD Deployment Architecture

This document outlines the strategy for deploying the restructured `frontend` (Next.js) and `backend` (Node.js/Prisma) stack to Hostinger using GitHub Actions for continuous integration and delivery.

---

## 1. Hostinger Environment Setup (VPS)

Since you are running Next.js and a Node.js Express server, a **Hostinger VPS (Virtual Private Server)** is highly recommended over shared hosting. It gives you the necessary control to run background processes.

### Required Software on the VPS:
- **Node.js & npm:** To run your apps.
- **PM2:** A production process manager for Node.js to keep your apps alive and restart them automatically on crashes or server reboots.
- **Nginx:** To act as a reverse proxy, routing traffic on port 80/443 (HTTP/HTTPS) to your Next.js (port 3000) and Express (port 8080) servers.
- **PostgreSQL:** You can host your database directly on the VPS or use an external managed database.

---

## 2. CI/CD Architecture (GitHub Actions)

When you push code to the `main` branch, the pipeline will execute your custom agent skills for code quality (like **Ponytail**) and then automatically deploy the code to Hostinger.

### Pipeline Flow:
1. **Developer:** Pushes code to GitHub `main` branch.
2. **GitHub Actions (CI):** 
   - Checks out the code.
   - Runs `npm install` in both `frontend` and `backend`.
   - Runs your Ponytail linter/quality checks.
3. **GitHub Actions (CD):**
   - If tests pass, it uses SSH to securely connect to your Hostinger VPS.
   - Triggers a deployment script on the server.
4. **Hostinger Server (Deployment Script):**
   - Runs `git pull origin main`.
   - Rebuilds the frontend (`npm run build`).
   - Runs database migrations (`npx prisma migrate deploy`).
   - Gracefully restarts the applications using `pm2 reload`.

---

## 3. The GitHub Actions Workflow File

Create a file in your repository at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      # Install and run Ponytail / Linters on Backend
      - name: Check Backend
        run: |
          cd backend
          npm install
          # npm run lint (or your specific Ponytail script here)
          
      # Install and run Ponytail / Linters on Frontend
      - name: Check Frontend
        run: |
          cd frontend
          npm install
          # npm run lint

  deploy:
    needs: quality-check
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Hostinger VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HOSTINGER_IP }}
          username: ${{ secrets.HOSTINGER_USER }}
          key: ${{ secrets.HOSTINGER_SSH_KEY }}
          script: |
            cd /var/www/atozgadgets
            
            # Pull latest code
            git pull origin main
            
            # Update Backend
            cd backend
            npm install
            npx prisma generate
            npx prisma migrate deploy
            
            # Update Frontend
            cd ../frontend
            npm install
            npm run build
            
            # Restart services with PM2 without downtime
            pm2 reload ecosystem.config.js
```

---

## 4. PM2 Configuration (`ecosystem.config.js`)

To keep both apps running smoothly, create an `ecosystem.config.js` file in the root of your project on the server:

```javascript
module.exports = {
  apps: [
    {
      name: "atoz-backend",
      cwd: "./backend",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      }
    },
    {
      name: "atoz-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      }
    }
  ]
}
```

---

## 5. Next Steps to Execute This Plan
1. **Purchase/Setup VPS:** If you haven't already, provision an Ubuntu VPS on Hostinger.
2. **Generate SSH Keys:** Create an SSH key pair on your VPS and add the private key to GitHub Secrets (`HOSTINGER_SSH_KEY`).
3. **Initial Clone:** SSH into your VPS, install Node/PM2, and `git clone` your repository into `/var/www/atozgadgets`.
4. **Nginx Setup:** Route your domain (e.g., `atozgadgets.com`) to port `3000` and `/api` to port `8080`.

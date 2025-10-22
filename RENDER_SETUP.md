# Deploying FastNet to Render

This guide shows you how to deploy FastNet to Render for **free hosting** with automatic deployments from GitHub.

## 🎯 What You'll Get

- ✅ Free hosting (750 hours/month on free tier)
- ✅ Automatic SSL certificate (HTTPS)
- ✅ Auto-deploy on every GitHub push
- ✅ PostgreSQL database included
- ✅ Custom domain support

---

## 📋 Prerequisites

- GitHub repository: `https://github.com/Wirelextechs/fastnet-mtn-data`
- Render account (sign up at https://render.com)
- Your API keys ready:
  - Paystack Secret Key
  - Paystack Public Key
  - DataXpress API Key
  - Session Secret (any random string)

---

## 🚀 Step-by-Step Deployment

### 1. Create Render Account

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with your GitHub account (recommended for easier integration)

### 2. Create PostgreSQL Database

1. From Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Fill in the details:
   - **Name**: `fastnet-db`
   - **Database**: `fastnet`
   - **User**: `fastnet_user` (auto-generated)
   - **Region**: Choose closest to Ghana (e.g., Frankfurt or Oregon)
   - **Instance Type**: **Free**
3. Click **"Create Database"**
4. ⚠️ **IMPORTANT**: Copy the **Internal Database URL** (starts with `postgres://`)
   - You'll need this for the web service environment variables

### 3. Deploy Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** if not connected
   - Select **"Wirelextechs/fastnet-mtn-data"**
3. Configure the service:

   **Basic Settings:**
   - **Name**: `fastnet-mtn-data`
   - **Region**: Same as your database (e.g., Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

4. **Instance Type**: Select **Free**

### 4. Configure Environment Variables

Scroll to **Environment Variables** section and add these:

| Key | Value | Where to Get It |
|-----|-------|----------------|
| `DATABASE_URL` | `postgres://...` | Copy from your Render PostgreSQL database (Internal URL) |
| `SESSION_SECRET` | `your-random-secret-here-12345` | Generate any random string (min 32 chars) |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` or `sk_test_...` | From your Paystack Dashboard |
| `PAYSTACK_PUBLIC_KEY` | `pk_live_...` or `pk_test_...` | From your Paystack Dashboard |
| `DATAXPRESS_API_KEY` | `dx_...` | Your DataXpress API key |
| `VITE_PAYSTACK_PUBLIC_KEY` | `pk_live_...` or `pk_test_...` | Same as PAYSTACK_PUBLIC_KEY |
| `NODE_ENV` | `production` | Set to production |
| `PORT` | `5000` | Render will override this automatically |

**To generate a secure SESSION_SECRET:**
```bash
# In Replit Shell, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Deploy!

1. Click **"Create Web Service"**
2. Render will start building and deploying automatically
3. Wait 3-5 minutes for first deployment
4. You'll see build logs in real-time

### 6. Initialize Database

After first deployment succeeds:

1. Go to your Render PostgreSQL database
2. Click **"Connect"** → **"External Connection"**
3. Copy the **PSQL Command**
4. In your local terminal or Replit Shell, run the command
5. Once connected, the database will auto-initialize on first app visit

---

## 🔄 Auto-Deployment Workflow

Once set up, your workflow is simple:

1. **Make changes in Replit**
2. **Push to GitHub:**
   ```bash
   ./push.sh "Your commit message here"
   ```
3. **Render automatically deploys** (takes 2-3 minutes)
4. **Your site updates** at `https://fastnet-mtn-data.onrender.com`

---

## 🌐 Your Live URLs

After deployment:
- **Web App**: `https://fastnet-mtn-data.onrender.com`
- **Admin Dashboard**: `https://fastnet-mtn-data.onrender.com/admin`

### Adding Custom Domain (Optional)

1. Go to your web service settings
2. Click **"Custom Domains"**
3. Add your domain (e.g., `fastnet.gh`)
4. Follow DNS configuration instructions
5. SSL certificate auto-generated

---

## 💡 Important Notes

### Free Tier Limitations
- App goes to sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month free (enough for 24/7 if only one app)
- Database limited to 1GB storage

### Keeping App Awake (Optional)
Use a free service like UptimeRobot to ping your site every 5 minutes:
1. Sign up at https://uptimerobot.com
2. Add monitor: `https://fastnet-mtn-data.onrender.com`
3. Set interval to 5 minutes

### Monitoring
- **Logs**: Available in Render Dashboard under your service
- **Metrics**: CPU, Memory usage visible in dashboard
- **Events**: Get email notifications for deploy failures

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are in package.json

### Database Connection Error
- Verify `DATABASE_URL` is the **Internal URL** from Render PostgreSQL
- Check database is in same region as web service
- Ensure database is not paused (free tier auto-pauses after 90 days inactivity)

### Environment Variables Not Working
- After adding/changing env vars, click **"Manual Deploy"** → **"Deploy latest commit"**
- Verify no typos in variable names (case-sensitive!)

### App Not Loading
- Check if free hours exceeded (750/month limit)
- View logs: Render Dashboard → Your Service → Logs
- Verify all environment variables are set

---

## 📊 Monitoring Your Deployment

### Check Deployment Status
1. Go to Render Dashboard
2. Click your **fastnet-mtn-data** service
3. View **Events** tab for deployment history

### View Application Logs
1. In your service dashboard
2. Click **"Logs"** tab
3. Filter by time or search for errors

### Database Metrics
1. Go to your PostgreSQL database
2. View **"Metrics"** tab
3. Monitor storage usage, connections

---

## 🎉 Success Checklist

- [ ] PostgreSQL database created and running
- [ ] Web service deployed successfully
- [ ] All 7 environment variables configured
- [ ] Database initialized (packages seeded)
- [ ] Can access homepage at your Render URL
- [ ] Admin login works via Replit Auth
- [ ] Orders can be created and fulfilled
- [ ] Auto-deploy working (push to GitHub triggers redeploy)

---

## 💰 Cost Estimate

**100% FREE** on Render's free tier:
- Web Service: $0 (750 hours/month)
- PostgreSQL: $0 (1GB storage)
- SSL Certificate: $0
- Bandwidth: $0 (100GB/month included)

**Upgrade to Paid ($7/month)** if you need:
- App stays awake 24/7 (no cold starts)
- More resources (512MB RAM → 512MB+)
- Better performance

---

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Render Docs**: https://render.com/docs
- **GitHub Repo**: https://github.com/Wirelextechs/fastnet-mtn-data
- **Support**: https://render.com/docs/support

---

Need help? Check the troubleshooting section above or contact Render support!

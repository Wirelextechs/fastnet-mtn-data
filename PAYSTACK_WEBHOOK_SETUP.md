# Setting Up Paystack Webhook for Automatic Order Processing

This guide shows you how to configure Paystack webhooks so that **orders automatically complete and fulfill** when customers pay.

## 🎯 What This Fixes

**Before webhook setup:**
- ❌ Payment status stays "pending" even after successful payment
- ❌ You must manually change status to "completed"
- ❌ You must manually click "fulfill" button

**After webhook setup:**
- ✅ Payment confirmed → Order automatically marked "completed"
- ✅ Data automatically sent to DataXpress for fulfillment
- ✅ Customer receives data instantly, no manual work needed

---

## 📋 Prerequisites

- Paystack account (with live API keys already configured)
- Your FastNet application deployed and accessible via URL
- Either:
  - **Replit Published URL**: `https://your-app.replit.app`
  - **Render URL**: `https://fastnet-mtn-data.onrender.com`
  - **Custom Domain**: `https://fastnet.gh`

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Webhook URL

Your webhook URL is: `YOUR_SITE_URL/api/webhooks/paystack`

**Examples:**
- Replit: `https://your-replit-app.replit.app/api/webhooks/paystack`
- Render: `https://fastnet-mtn-data.onrender.com/api/webhooks/paystack`
- Custom: `https://fastnet.gh/api/webhooks/paystack`

⚠️ **Important**: 
- Use your **LIVE** site URL (not `localhost`)
- Must be `https://` (not `http://`)
- Must end with `/api/webhooks/paystack`

### Step 2: Configure Paystack Dashboard

1. **Log in to Paystack Dashboard**
   - Go to https://dashboard.paystack.com
   - Use your Paystack account credentials

2. **Navigate to Webhooks Settings**
   - Click **Settings** in the left sidebar
   - Click **Webhooks** under "API Keys & Webhooks"

3. **Add New Webhook**
   - Click **"Add Webhook"** button
   - Enter your webhook URL (from Step 1)
   - Example: `https://your-app.replit.app/api/webhooks/paystack`

4. **Select Events to Listen For**
   - Check **"charge.success"** ✅
   - This is the event that fires when payment succeeds
   - You can uncheck all other events (not needed)

5. **Set Environment**
   - If using **LIVE keys** (production): Select **"Live"**
   - If using **TEST keys** (testing): Select **"Test"**
   - ⚠️ Make sure this matches your API keys!

6. **Save Webhook**
   - Click **"Save"** or **"Create Webhook"**
   - Webhook is now active!

### Step 3: Test the Webhook (Optional but Recommended)

1. **Make a Test Payment**
   - Go to your FastNet homepage
   - Select any data package
   - Enter phone number and email
   - Complete payment using test card:
     - Card: `4084 0840 8408 4081`
     - Expiry: Any future date (e.g., `12/25`)
     - CVV: Any 3 digits (e.g., `123`)

2. **Check Server Logs**
   - In Replit: Open Shell and check console
   - In Render: Go to Dashboard → Your Service → Logs
   - Look for: `🔔 Paystack webhook received`
   - Should see: `✅ Payment successful for reference: ...`
   - Should see: `✅ Order marked completed and sent for fulfillment`

3. **Verify in Admin Dashboard**
   - Go to `/admin/orders`
   - Find your test order
   - Payment Status: Should be **"completed"** ✅
   - Fulfillment Status: Should be **"fulfilled"** or **"processing"** ✅

---

## 🔍 Verifying Webhook is Working

### Check 1: Paystack Dashboard
1. Go to **Settings** → **Webhooks**
2. Click on your webhook URL
3. Scroll to **"Recent Deliveries"**
4. You should see successful webhook calls (200 status)

### Check 2: Server Logs
Look for these messages after a payment:
```
🔔 Paystack webhook received: { event: 'charge.success', reference: 'FS-...' }
✅ Payment successful for reference: FS-1234567890
📦 Order found: abc-123-def, updating to completed and fulfilling...
✅ Order abc-123-def marked completed and sent for fulfillment
```

### Check 3: Admin Dashboard
- Order Payment Status: **completed** (not pending)
- Order Fulfillment Status: **fulfilled** or **processing**
- No manual intervention needed!

---

## 🐛 Troubleshooting

### Webhook Not Firing (Status Still Pending)

**Symptom**: Order stays "pending" after payment

**Possible Causes:**

1. **Webhook URL is Wrong**
   - ✅ Check URL in Paystack dashboard
   - Must be: `https://your-site.com/api/webhooks/paystack`
   - Must be `https://` (not `http://`)
   - Must be your LIVE URL (not `localhost`)

2. **Wrong Environment Selected**
   - If using LIVE keys → Webhook must be in "Live" mode
   - If using TEST keys → Webhook must be in "Test" mode
   - Check: Settings → Webhooks → Edit your webhook

3. **Site Not Accessible**
   - Test your site: Open `https://your-site.com` in browser
   - If it doesn't load, Paystack can't reach your webhook
   - Ensure Replit app is published or Render is deployed

4. **Event Not Selected**
   - Edit webhook in Paystack dashboard
   - Ensure **"charge.success"** is checked ✅

### Webhook Firing But Order Not Updating

**Symptom**: Logs show webhook received, but order stays pending

**Solutions:**

1. **Check Reference Match**
   - Look in logs for: `⚠️ No order found for reference: FS-...`
   - This means order reference doesn't match Paystack reference
   - This is rare but can happen if database is reset

2. **Database Connection Issue**
   - Check server logs for database errors
   - Verify `DATABASE_URL` is set correctly
   - Restart your application

3. **Code Error**
   - Look for: `❌ Failed to fulfill order`
   - Check full error message in logs
   - May be DataXpress API issue (check wallet balance)

### DataXpress Fulfillment Failing

**Symptom**: Order completes but fulfillment shows "failed"

**Solutions:**

1. **Insufficient Wallet Balance**
   - Check admin dashboard → DataXpress Balance card
   - Top up your DataXpress wallet if balance is low
   - Go to https://dataxpress.shop to add funds

2. **Invalid Phone Number**
   - DataXpress requires valid MTN Ghana numbers
   - Must start with `024`, `054`, `055`, or `059`
   - Test with a real MTN number

3. **API Key Issue**
   - Verify `DATAXPRESS_API_KEY` in environment variables
   - Check key is still valid (not expired)

---

## 📊 Monitoring Webhooks

### Paystack Dashboard
1. Go to **Settings** → **Webhooks**
2. Click your webhook URL
3. View **"Recent Deliveries"** tab
4. See all webhook attempts with status codes

### Your Server Logs
Look for these emoji indicators:
- 🔔 = Webhook received
- ✅ = Success (payment/fulfillment)
- ⚠️ = Warning (order not found)
- ❌ = Error (something failed)

---

## 🔒 Security Note

**Webhook Signature Verification:**

Currently, the webhook accepts all requests from Paystack. For production, you should verify the webhook signature to ensure it's really from Paystack.

**To implement (optional but recommended):**

1. Get your webhook secret from Paystack dashboard
2. Add to environment variables: `PAYSTACK_WEBHOOK_SECRET`
3. Update webhook handler to verify signature

This prevents malicious actors from faking payment confirmations.

---

## ✅ Success Checklist

Once set up correctly, you should have:

- [ ] Webhook URL added in Paystack Dashboard
- [ ] "charge.success" event selected
- [ ] Correct environment selected (Live/Test matches API keys)
- [ ] Test payment completed successfully
- [ ] Order automatically changed to "completed"
- [ ] Order automatically sent to DataXpress
- [ ] Server logs show webhook messages
- [ ] No manual intervention needed!

---

## 🎉 Final Result

**Customer Experience:**
1. Customer selects package and pays
2. Payment processes through Paystack
3. **Boom!** Data instantly delivered to their phone
4. Customer receives confirmation
5. Zero manual work for you!

**Admin Experience:**
1. View real-time order updates in dashboard
2. All orders automatically complete and fulfill
3. Only intervene if there's an issue (rare)
4. Monitor DataXpress balance to ensure fulfillment continues

---

## 🆘 Still Having Issues?

1. **Check server logs** for detailed error messages
2. **Check Paystack webhook deliveries** for failed attempts
3. **Verify all environment variables** are set correctly
4. **Test with small amount** first before going live
5. **Contact support** if webhook consistently fails

---

## 🔗 Useful Links

- **Paystack Dashboard**: https://dashboard.paystack.com
- **Paystack Webhook Docs**: https://paystack.com/docs/payments/webhooks
- **DataXpress**: https://dataxpress.shop
- **Test Cards**: https://paystack.com/docs/payments/test-payments

---

**Remember**: Once webhook is set up, FastNet runs 100% automatically! 🚀

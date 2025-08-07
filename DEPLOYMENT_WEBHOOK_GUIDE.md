# Webhook Test Guide

## Current Issue
The webhook reception is not automatically displaying results. Let's test with a simplified approach.

## Testing Steps

### 1. Update Dify Webhook URL
**Change your Dify webhook URL to:**
```
https://ai-business-diagnosis.vercel.app/api/webhook-simple
```

### 2. Test the Webhook Flow
1. Submit a diagnosis form
2. Check the browser console for logs
3. See if the redirect happens automatically

### 3. Manual Test URLs
If the automatic redirect doesn't work, try these test URLs manually:

**Test URL 1 (with sample result):**
```
https://ai-business-diagnosis.vercel.app/?step=5&webhook_data=%7B%22result%22%3A%22Sample%20AI%20analysis%20result%22%2C%22workflow_run_id%22%3A%22test123%22%7D
```

**Test URL 2 (direct to step 5):**
```
https://ai-business-diagnosis.vercel.app/?step=5
```

### 4. Debug Information
- Check browser console for any errors
- Verify the webhook URL is accessible: https://ai-business-diagnosis.vercel.app/api/webhook-simple
- Check Dify logs to see if webhook is being sent

## Webhook Endpoints Available

1. **Simple Webhook** (recommended for testing): `/api/webhook-simple`
2. **Standard Webhook**: `/api/webhook`
3. **Debug Webhook**: `/api/webhook-debug`

## Expected Dify Configuration
- **URL**: `https://ai-business-diagnosis.vercel.app/api/webhook-simple`
- **Method**: POST
- **Content-Type**: application/x-www-form-urlencoded
- **Body**: Include `result` field with the AI analysis

## Troubleshooting

If the webhook still doesn't work:
1. Use the "結果を手動で確認" button on the waiting screen
2. Check if webhooks are reaching Vercel (check Vercel logs)
3. Verify Dify is configured to send webhooks
4. Test the manual URL above to see if the results display works

## Next Steps
After testing, we can:
1. Debug exactly what Dify is sending
2. Simplify the webhook further if needed
3. Add more robust error handling
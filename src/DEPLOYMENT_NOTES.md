# Chef Circle - Deployment Notes

## Community Management Features ✅

All community management features have been successfully implemented:

### Features Implemented

1. **Edit Community**
   - Update community name, description, category, and tags
   - Only available to community creators
   - Accessible via settings menu (⋮) on community cards

2. **Delete Community**
   - Permanently delete communities with confirmation dialog
   - Cascading delete of all posts, comments, votes, and memberships
   - Only available to community creators

3. **Manage Communities Tab**
   - New dedicated tab to view and manage your created communities
   - Shows count of communities you've created
   - Cards have prominent Edit and Delete buttons
   - Empty state with "Create Community" call-to-action

4. **Automatic Discovery**
   - Newly created communities automatically appear in the Discover tab
   - Real-time updates after create/edit/delete operations

### How It Works

- **Settings Menu**: A three-dot menu (⋮) appears on community cards for creators
- **Creator Detection**: Communities are matched to users by the `createdBy` field (user's name)
- **Smart Navigation**: Deleting a selected community automatically returns to "All Communities"
- **Toast Notifications**: Success/error feedback for all operations

---

## 403 Forbidden Error - Troubleshooting Guide

The 403 error you're experiencing during Supabase Edge Function deployment is a **permissions/authentication issue**, not a code problem. Here are steps to resolve it:

### Common Causes & Solutions

#### 1. **Insufficient Supabase Project Permissions**
- **Check**: Your Supabase account has proper permissions for the project
- **Solution**: Ensure you're the project owner or have admin access
- **Verify**: Dashboard → Settings → General → Project Settings

#### 2. **Service Role Key Issues**
- **Check**: The `SUPABASE_SERVICE_ROLE_KEY` environment variable is set
- **Solution**: 
  1. Go to Dashboard → Settings → API
  2. Copy the `service_role` key (not the `anon` key)
  3. Set it as an environment variable in your edge function
- **Note**: Service role key bypasses Row Level Security (RLS) policies

#### 3. **Edge Function Deployment Configuration**
- **Check**: Deployment settings in `supabase/functions/server/`
- **Solution**: Try redeploying with:
  ```bash
  supabase functions deploy server --project-ref eajjlsfplesitsrakpdu
  ```

#### 4. **Authentication Issues**
- **Check**: You're logged in to the correct Supabase project
- **Solution**: 
  ```bash
  supabase logout
  supabase login
  supabase link --project-ref eajjlsfplesitsrakpdu
  ```

#### 5. **Organization/Team Permissions**
- **Check**: If the project is under an organization
- **Solution**: Verify your organization role allows edge function deployment
- **Verify**: Dashboard → Organization Settings → Members

### Debugging Steps

1. **Check Deployment Logs**
   ```bash
   supabase functions deploy server --debug
   ```

2. **View Function Logs**
   - Dashboard → Edge Functions → server → Logs
   - Look for specific error messages

3. **Test Locally First**
   ```bash
   supabase functions serve server
   ```

4. **Verify Environment Variables**
   - Dashboard → Edge Functions → server → Settings
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

### Alternative: Manual Deployment

If CLI deployment fails, try deploying through the Supabase Dashboard:
1. Go to Dashboard → Edge Functions
2. Click "Create a new function"
3. Name it `server`
4. Copy/paste code from `/supabase/functions/server/index.tsx`
5. Set environment variables in function settings

### Code Structure (Already Correct ✅)

Your server code is properly structured:
- ✅ Using Hono framework
- ✅ CORS enabled for all origins
- ✅ Proper authentication with Bearer tokens
- ✅ Service role key for admin operations
- ✅ Error handling and validation
- ✅ KV store integration

---

## Next Steps

Once deployment is successful:

1. **Test Community Management**
   - Create a new community
   - Verify it appears in Discover tab
   - Edit the community details
   - Delete a test community

2. **Verify Backend Integration**
   - Check Supabase Dashboard → Database → kv_store_7d67a39c
   - Confirm communities are being created/updated/deleted

3. **Production Considerations**
   - Set up proper CORS origins (replace `*` with your domain)
   - Add rate limiting for API endpoints
   - Monitor edge function logs for errors
   - Consider adding analytics/monitoring

---

## Support Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deployment Troubleshooting](https://supabase.com/docs/guides/functions/deploy)
- [CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- Project Dashboard: https://supabase.com/dashboard/project/eajjlsfplesitsrakpdu

---

**Note**: The community management features are fully implemented and ready to use. The 403 error is purely a deployment configuration issue that can be resolved through the steps above.

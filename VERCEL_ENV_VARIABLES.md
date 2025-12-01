# 🔑 Vercel Environment Variables - Complete List

## Required Environment Variables

Copy these **EXACT** values to your Vercel Dashboard:

### 1. Database
```
MONGODB_URI
```
**Value:**
```
mongodb+srv://Test:CUHSb1Q37L0Na1JP@cluster0.ip1tc2f.mongodb.net/Taskflow?retryWrites=true&w=majority&appName=Cluster0
```

### 2. JWT Configuration
```
JWT_SECRET
```
**Value:**
```
29183520e450f269
```

```
ACCESS_TOKEN_EXPIRES
```
**Value:**
```
1d
```

```
REFRESH_TOKEN_EXPIRES
```
**Value:**
```
7d
```

### 3. Cloudinary (File Uploads)
```
CLOUDINARY_CLOUD_NAME
```
**Value:**
```
dqlyz8ylc
```

```
CLOUDINARY_API_KEY
```
**Value:**
```
876812657257862
```

```
CLOUDINARY_API_SECRET
```
**Value:**
```
NM6P7DfOZCB96-3roEIhbzhYmj8
```

### 4. Node Environment
```
NODE_ENV
```
**Value:**
```
production
```
**Note:** This is already set in vercel.json, but you can add it here too for clarity.

### 5. Frontend URL (Optional but Recommended)
```
FRONTEND_URL
```
**Value:**
```
https://task-flow-frontend-seven.vercel.app
```
**Note:** Update this with your actual frontend URL after deployment.

---

## 📋 How to Add Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. For each variable:
   - Enter the **Key** (e.g., `MONGODB_URI`)
   - Enter the **Value** (copy from above)
   - Select **Production**, **Preview**, and **Development** (all three)
   - Click **Save**

### Method 2: Vercel CLI

```bash
# Set environment variables via CLI
vercel env add MONGODB_URI production
# Paste the value when prompted

vercel env add JWT_SECRET production
# Paste the value when prompted

# Repeat for all variables...
```

---

## ✅ Complete Checklist

Copy this checklist and check off as you add each variable:

- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `ACCESS_TOKEN_EXPIRES`
- [ ] `REFRESH_TOKEN_EXPIRES`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `NODE_ENV` (set to `production`)
- [ ] `FRONTEND_URL` (optional)

---

## ⚠️ Important Notes

1. **PORT is NOT needed** - Vercel automatically assigns ports for serverless functions
2. **NODE_ENV** - Already set in `vercel.json`, but you can add it for consistency
3. **FRONTEND_URL** - Update this after deploying your frontend
4. **Security** - Never commit `.env` file to Git (already in `.gitignore`)

---

## 🔄 After Adding Variables

1. **Redeploy** - Vercel will automatically redeploy when you add/change env variables
2. **Or manually trigger** - Go to Deployments → Click "..." → "Redeploy"

---

## 🧪 Testing After Deployment

Test that environment variables are working:

```bash
# Test database connection (should work if MONGODB_URI is correct)
curl https://your-backend.vercel.app/api/v1/users/test-endpoint

# Test JWT (should work if JWT_SECRET is correct)
# Try login/register endpoints

# Test Cloudinary (should work if Cloudinary vars are correct)
# Try uploading a file
```

---

## 🎯 You're All Set!

Once you've added all these environment variables to Vercel, your backend will have everything it needs to run in production!

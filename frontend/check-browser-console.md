# How to Check Browser Console Logs

## Steps:
1. Open your website: https://gyanin.academy
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Refresh the page (F5)
5. Look for messages starting with `[EdgeStore]`

## What to Look For:

### ✅ CORRECT (Production Mode):
```
[EdgeStore] ===== INITIALIZATION =====
[EdgeStore] API_CONFIG: {baseURL: "https://api.gyanin.academy", ...}
[EdgeStore] baseURL from config: https://api.gyanin.academy
[EdgeStore] ✅ PRODUCTION MODE
[EdgeStore] Final absolute path: https://api.gyanin.academy/api/edgestore
[EdgeStore] ✅ Validation passed
[EdgeStore] FINAL basePath value: https://api.gyanin.academy/api/edgestore
[EdgeStore] Starts with https?: true
```

### ❌ WRONG (Development Mode or Empty):
```
[EdgeStore] baseURL from config: (empty or wrong)
[EdgeStore] ⚠️  DEVELOPMENT MODE (relative path)
[EdgeStore] FINAL basePath value: /api/edgestore
[EdgeStore] Starts with https?: false
```

### ❌ FATAL ERROR:
```
[EdgeStore] ❌ FATAL: URL points to wrong domain!
```

## If you see DEVELOPMENT MODE:
- The config.js is not set correctly
- Run: `./fix-config-production.sh` on the server
- Rebuild and redeploy

## If you see wrong domain error:
- The config.js has wrong URL
- Should be: `https://api.gyanin.academy`
- NOT: `https://gyanin.academy`


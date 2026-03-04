# Phase 2: Admin Dashboard Complete

Phase 2 is now **fully implemented**. Your app now has a complete admin dashboard for managing reference images and session presets!

## What's New in Phase 2

### Authentication
- **Admin Login**: Password-protected admin panel at `/admin/login`
- **Default Password**: `admin123` (change in `.env.local` → `ADMIN_PASSWORD`)
- **Secure Cookies**: Uses httpOnly cookies for session management

### Admin Dashboard
- Navigate to `http://localhost:3000/admin`
- Login with password: **`admin123`**

### Features

#### 📸 Image Management (/admin/images)
- **View All Images**: Browse all reference images in a grid
- **Add Images**: Create new images with:
  - URL (link to image)
  - Category (figure/hands/faces/animals)
  - Tags (comma-separated, auto-normalized)
  - NSFW flag (for content filtering)
- **Edit Images**: Update any image metadata inline
- **Delete Images**: Remove images with confirmation
- **Real-time Updates**: See changes immediately

#### ⚙️ Preset Management (/admin/presets)
- **View All Presets**: Browse existing session presets
- **Create Presets**: Build custom training sessions with:
  - Preset Name (e.g., "Quick Warmup")
  - Intervals in Seconds (e.g., 30,30,30,30,30)
  - Auto-calculated total duration
  - Optional default category
- **Edit Presets**: Modify timing and settings
- **Delete Presets**: Remove presets with confirmation
- **Intuitive Interval Builder**: Simple comma-separated input

## How to Use

### Adding Reference Images

1. Go to `/admin/images`
2. Click **+ Add Image**
3. Fill in the form:
   ```
   URL: https://example.com/image.jpg
   Category: figure
   Tags: gesture, standing
   NSFW: unchecked
   ```
4. Click **Create**
5. New image immediately appears in the grid

### Creating Session Presets

1. Go to `/admin/presets`
2. Click **+ Add Preset**
3. Fill in the form:
   ```
   Preset Name: 5 Minute Quick Sketch
   Intervals: 60,60,60,60,60
   Default Category: figure
   ```
4. Click **Create**
5. New preset is available on the landing page

### Editing/Deleting

For both images and presets:
- Click **Edit** button to modify
- Click **Delete** button to remove (with confirmation)

## Testing the Admin Features

### Quick Test Workflow

1. **Add a Test Image**:
   - URL: `https://via.placeholder.com/512x768?text=Test+Figure`
   - Category: figure
   - Tags: gesture
   - NSFW: No

2. **Add a Test Preset**:
   - Name: "Test Session"
   - Intervals: 30,30,30
   - Category: figure

3. **Go to Landing Page** (/)
   - You should see your new preset in the dropdown
   - Select it and start a session
   - Your new image should appear in the queue

## API Endpoints (For Reference)

### Image CRUD
```
GET    /api/admin/images                    List images
POST   /api/admin/images                    Create image
PATCH  /api/admin/images/:id                Update image
DELETE /api/admin/images/:id                Delete image
```

### Preset CRUD
```
GET    /api/admin/presets                   List presets
POST   /api/admin/presets                   Create preset
PATCH  /api/admin/presets/:id               Update preset
DELETE /api/admin/presets/:id               Delete preset
```

### Authentication
```
POST   /api/admin/login                     Login (get token)
POST   /api/admin/logout                    Logout (clear token)
```

## Environment Variables

Update `.env.local`:
```bash
ADMIN_PASSWORD=admin123              # Change to your password
ADMIN_TOKEN=admin_secret_token_change_me  # Random secret key
```

## Security Notes

- ⚠️ Change `ADMIN_PASSWORD` from default `admin123` in production
- ⚠️ Use strong, random `ADMIN_TOKEN` value
- ✅ Tokens are httpOnly (JavaScript can't access)
- ✅ Admin routes are protected with middleware
- ✅ Routes redirect unauthenticated users to login

## What's Still Missing (Phase 3+)

❌ **Image Upload**: Currently you must provide image URLs
❌ **Image Storage**: No S3/R2 integration yet (use external URLs)
❌ **Session Persistence**: Sessions not saved to database
❌ **User Stats**: Session history not tracked per user

## Next Steps

### For Testing Now
1. Use placeholder URLs: `https://via.placeholder.com/512x768?text=...`
2. Or use real image URLs from:
   - Unsplash: `https://unsplash.com/random`
   - Pexels: `https://www.pexels.com/`
   - Your own cdn/server

### For Production
1. Implement image upload with S3/R2 (Phase 3)
2. Set strong admin password
3. Use real reference image library

## Troubleshooting

**"Invalid password" at login**
- Check `.env.local` for `ADMIN_PASSWORD` value
- Default is `admin123`

**Images show as broken**
- The URL might not be accessible
- Try using a `https://` URL
- Test with: `https://via.placeholder.com/512x768?text=Test`

**Presets not appearing on landing page**
- Presets require at least one valid image
- Make sure images are in the same category as preset default

**Admin routes redirect to login**
- Browser might not have valid session cookie
- Clear cookies and login again
- Check ADMIN_TOKEN value in .env.local

## File Structure

```
app/admin/
├── layout.tsx              Admin dashboard layout
├── page.tsx                Redirect to /admin/images
├── images/
│   └── page.tsx            Image manager UI
└── presets/
    └── page.tsx            Preset manager UI

app/api/admin/
├── login/route.ts          Login endpoint
├── logout/route.ts         Logout endpoint
├── images/
│   ├── route.ts            GET/POST images
│   └── [id]/route.ts       PATCH/DELETE images
└── presets/
    ├── route.ts            GET/POST presets
    └── [id]/route.ts       PATCH/DELETE presets

middleware.ts              Admin route protection
```

## Summary

✅ **Phase 2 Complete**

You now have:
- Password-protected admin panel
- Full CRUD for reference images
- Full CRUD for session presets
- Responsive admin UI
- Type-safe API endpoints
- Real-time updates

The app is ready for users to create and manage their own training libraries!

---

**For Help or Issues**: Check the API endpoint docs or review the endpoint code in `app/api/admin/`.

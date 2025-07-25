# DegenTalk Forum Demo Instructions

## Prerequisites
- Server running on port 5001
- Client running on port 5173
- Admin user created (username: admin, password: admin123)
- Demo data seeded (15 threads across 3 forums)

## Authentication Setup

1. Open http://localhost:5173/ in your browser
2. Open DevTools Console (F12)
3. Run this command to set the auth token:
```javascript
localStorage.setItem("auth_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZTBkZTAxZS02MTRiLTRkYjEtOWJmMy1mMGFlZTZkZGIwNjkiLCJpYXQiOjE3NTI3MDU2ODgsImV4cCI6MTc1MzMxMDQ4OH0.kdfo82W0Oixf3txFUMt5_jIyO3vI6vyar9SR0W5ofyw")
```
4. Refresh the page

## Demo Flow

### 1. Home Page
- You should see the DegenTalk homepage
- Latest discussions should show the seeded threads
- You should be logged in as "admin" (shown in header)

### 2. View Forums
- Click on "Forums" in the navigation
- You should see two zones:
  - **Market Analysis** (1 forum)
  - **The Pit** (2 forums: Live-Trade Reacts, Shill Zone)

### 3. Browse Threads
- Click on "Market Analysis" forum
- You should see 5 threads including:
  - "💰 Turned $100 into $10k - My journey" (sticky)
  - "📊 Daily market analysis thread"
  - "🔥 ETH vs SOL - Which is the better investment?"

### 4. View Thread Details
- Click on any thread title
- You should see:
  - Thread content
  - Reply count and view count
  - User who created it
  - Replies from other users

### 5. Create a Reply
- Scroll to the bottom of the thread
- Type a reply in the text area
- Click "Post Reply"
- Your reply should appear immediately

### 6. Create New Thread
- Go back to a forum page
- Click "Create Thread" button
- Fill in:
  - Title: "🚀 My first thread on DegenTalk!"
  - Content: "Testing the forum functionality. This platform is awesome!"
- Click "Create Thread"
- You should be redirected to your new thread

### 7. Profile Page
- Click on your username in the header
- You should see your profile with:
  - Stats (Level 100, 999999 XP)
  - Recent activity
  - Badges and achievements

## API Endpoints (for reference)
- Forums content: GET http://localhost:5001/api/forums/content
- Forum structure: GET http://localhost:5001/api/forums/structure
- User auth: GET http://localhost:5001/api/auth/user
- Threads: GET http://localhost:5001/api/forums/threads
- Thread by slug: GET http://localhost:5001/api/forums/threads/slug/:slug

## Troubleshooting

### "Unauthorized" errors
- Make sure you set the auth token in localStorage
- Check that the token hasn't expired
- Try logging in again with: `curl -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'`

### Threads not showing
- Verify the API is returning data: `curl http://localhost:5001/api/forums/content`
- Check browser console for errors
- Make sure you're on the correct port (5173 for client)

### Can't create posts
- Ensure you're logged in (auth token set)
- Check that you're not on a locked thread
- Verify the API endpoints are working
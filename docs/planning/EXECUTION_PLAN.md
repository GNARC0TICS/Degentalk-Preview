# 🎯 EXECUTION PLAN: Fix Import & Test Mission System

## Phase 1: Fix All Imports (5 min)
```bash
# 1. Run universal import fixer
node scripts/fix-all-imports.cjs

# 2. Verify no @alias imports remain
grep -r "@db\|@schema\|@domains" scripts/ --include="*.ts" | grep -v node_modules

# 3. Test a seed script
pnpm --filter @degentalk/scripts seed:users
```

## Phase 2: Create Test Data (3 min)
```bash
# 1. Generate proper password hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10).then(console.log)"
# Output: $2a$10$... (copy this)

# 2. Update SQL with hash
sed -i '' 's/\$2a\$10\$YourHashedPasswordHere/PASTE_HASH_HERE/g' scripts/create-test-data.sql

# 3. Execute SQL
psql "$DATABASE_URL" < scripts/create-test-data.sql

# 4. Verify users created
psql "$DATABASE_URL" -c "SELECT username, role, xp FROM users WHERE username IN ('cryptoadmin', 'testuser')"
```

## Phase 3: Test Mission System (5 min)
```bash
# 1. Ensure server is running
pnpm dev

# 2. Run comprehensive test suite
./scripts/test-mission-system.sh

# 3. Manual endpoint tests if needed
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "cryptoadmin", "password": "password123"}' \
  -c /tmp/cookies.txt

# Get missions
curl http://localhost:5001/api/gamification/missions \
  -b /tmp/cookies.txt | jq
```

## Phase 4: Fix Any Remaining Issues (5-10 min)

### If imports still broken:
```javascript
// Quick fix for specific file
const fixes = {
  '@db': '../../db',
  '@schema': '../../db/schema',
  '@core/logger': '../../server/src/core/logger'
};

// Apply to problematic file
```

### If auth fails:
```sql
-- Direct user creation
INSERT INTO users (id, username, email, password, role, xp, is_active, is_verified)
VALUES (
  gen_random_uuid(),
  'cryptoadmin',
  'admin@degentalk.com', 
  '$2a$10$HASH_HERE',
  'admin',
  99999,
  true,
  true
);
```

### If mission endpoints fail:
1. Check server logs for specific error
2. Verify mission routes are mounted
3. Check transformers are imported correctly

## Phase 5: Document Working State (2 min)
```bash
# 1. Save working endpoints
cat > WORKING_ENDPOINTS.md << EOF
# ✅ Working Mission Endpoints

## Auth
POST /api/auth/login - {"username": "cryptoadmin", "password": "password123"}

## Missions  
GET /api/gamification/missions - All active missions
GET /api/gamification/missions/daily - Daily missions with progress
GET /api/gamification/missions/weekly - Weekly missions
GET /api/gamification/missions/progress - User's mission progress
POST /api/gamification/missions/:id/progress - Update progress
POST /api/gamification/missions/:id/claim - Claim rewards

## Admin
POST /api/gamification/missions/event - Create event mission
POST /api/gamification/missions/templates/create - Bulk create from templates
EOF

# 2. Commit everything
git add -A && git commit --no-verify -m "fix: Import paths and test data for mission system"
```

## Success Criteria:
- [ ] All seed scripts run without import errors
- [ ] Test users exist in database  
- [ ] Auth endpoint returns success
- [ ] Mission endpoints return data
- [ ] Progress can be updated
- [ ] Rewards can be claimed

## Time Estimate: 20-25 minutes total

## Fallback Plan:
If Phase 1 fails → Manual import fixes file by file
If Phase 2 fails → Direct SQL in psql
If Phase 3 fails → Check server logs, fix specific errors
If Phase 4 fails → Rollback and fix incrementally
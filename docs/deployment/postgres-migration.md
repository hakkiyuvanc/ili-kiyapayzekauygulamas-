# PostgreSQL Migration Guide

**Status:** ✅ Ready for execution  
**Last Updated:** 31 Aralık 2025

---

## Quick Start

### Prerequisites
```bash
# Install PostgreSQL driver
pip install psycopg2-binary
```

### Step 1: Choose PostgreSQL Host

**Recommended:** Supabase (Free tier)
- Sign up: https://supabase.com
- Create project
- Get connection string from Settings → Database

**Alternative:** Neon, Railway, or local PostgreSQL

### Step 2: Update Environment
```env
# .env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Step 3: Run Migration
```bash
# Backup is created automatically
python scripts/migrate_to_postgres.py
```

### Step 4: Create Indexes
```bash
python scripts/create_indexes.py
```

### Step 5: Test
```bash
# Run tests
pytest tests/backend/

# Start backend
python -m uvicorn backend.app.main:app --reload
```

---

## Migration Script Features

✅ Automatic SQLite backup  
✅ Schema creation  
✅ Data migration  
✅ Verification  
✅ Detailed logging  
✅ Rollback support

---

## Post-Migration Checklist

### Immediate (Day 1)
- [ ] Verify all data migrated
- [ ] Run all tests
- [ ] Create database indexes
- [ ] Configure automated backups (Supabase UI)
- [ ] Update documentation
- [ ] Commit migration scripts

### Week 1
- [ ] Monitor query performance
- [ ] Review slow query logs
- [ ] Optimize connection pool settings
- [ ] Benchmark vs baseline

---

## Database Indexes

Created by `scripts/create_indexes.py`:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- Analyses
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);

-- Coaching
CREATE INDEX idx_coaching_user_id ON coaching_status(user_id);
```

---

## Rollback Procedure

```bash
# 1. Stop backend
# 2. Restore .env
DATABASE_URL=sqlite:///./iliski_analiz.db

# 3. Restore backup
cp iliski_analiz_backup_YYYYMMDD_HHMMSS.db iliski_analiz.db

# 4. Restart backend
```

---

## Troubleshooting

**Connection failed:**
```bash
# Test connection
python -c "from backend.app.core.database import engine; engine.connect()"
```

**Migration failed:**
- Check backup file exists
- Verify PostgreSQL URL in .env
- Check PostgreSQL host accessible

**Slow queries:**
```bash
# Run index creation
python scripts/create_indexes.py
```

---

## Files Created

- `scripts/migrate_to_postgres.py` - Main migration script
- `scripts/create_indexes.py` - Index creation
- `POSTGRES_MIGRATION.md` - This guide

---

## Support

Migration issues? Check:
1. Backup file created
2. PostgreSQL URL correct
3. Database accessible
4. Tests passing

---

**Ready to migrate!** 🚀

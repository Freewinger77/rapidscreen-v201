# 🔧 Kanban Persistence Solution

## 📋 Issues to Fix:

### 1. Column Names Not Saving
**Problem:** Renamed columns disappear on refresh
**Cause:** Using local state only, not saving to `kanban_columns` table
**Solution:** Load from & save to database

### 2. Loading Screen on Drag
**Problem:** Drag-drop shows loading spinner
**Cause:** Waiting for database save before updating UI
**Solution:** Optimistic updates (update UI first, save in background)

### 3. New Columns Not Persisting
**Problem:** Created columns disappear on refresh
**Cause:** Not saving to `kanban_columns` table
**Solution:** Insert into database when created

### 4. Need "Hired" Column
**Problem:** No way to mark candidates as hired
**Cause:** No hired column or tracking
**Solution:** Add "Hired" column, update `job.hired` counter

### 5. Post-Hire Columns
**Problem:** Onboarding columns don't count as hired
**Cause:** No post-hire flag
**Solution:** Add `is_post_hire` flag to columns

---

## 🎯 Database Schema Already Exists!

The `kanban_columns` table is already in your database:
```sql
CREATE TABLE kanban_columns (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  title TEXT NOT NULL,
  status_key TEXT NOT NULL,    -- 'not-contacted', 'custom-123'
  color TEXT,
  position INTEGER,
  is_default BOOLEAN,
  is_post_hire BOOLEAN,         -- NEW: Add this!
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## ✅ Implementation Plan:

### Phase 1: Load Columns from Database
```typescript
// Load kanban_columns for this job
useEffect(() => {
  async function loadKanbanColumns() {
    const cols = await loadKanbanColumnsForJob(job.id);
    setSwimlanes(cols);
  }
  loadKanbanColumns();
}, [job.id]);
```

### Phase 2: Optimistic Drag-Drop
```typescript
const handleDrop = async (candidateId, newStatus) => {
  // 1. Update UI immediately (no loading!)
  setCandidates(updated);
  
  // 2. Save in background
  updateCandidates(job.id, updated)
    .catch(err => {
      // Revert on error
      setCandidates(previousCandidates);
      toast.error('Failed to move candidate');
    });
};
```

### Phase 3: Persist Column Changes
```typescript
const handleAddColumn = async () => {
  // 1. Add to UI immediately
  setSwimlanes([...swimlanes, newColumn]);
  
  // 2. Save to database
  await saveKanbanColumn(job.id, newColumn);
};

const handleEditColumn = async (id, newTitle, newColor) => {
  // 1. Update UI immediately
  setSwimlanes(updated);
  
  // 2. Save to database
  await updateKanbanColumn(id, { title, color });
};
```

### Phase 4: Hired Column Logic
```typescript
const handleDrop = async (candidateId, newStatus) => {
  const targetColumn = swimlanes.find(s => s.status === newStatus);
  
  // Check if moving to hired or post-hire column
  if (targetColumn.status === 'hired' || targetColumn.is_post_hire) {
    // Increment job.hired counter
    await updateJob(job.id, { 
      hired: job.hired + 1 
    });
  }
  
  // If moving FROM hired/post-hire to other
  if (wasInHiredColumn && !isHiredColumn) {
    // Decrement counter
    await updateJob(job.id, { 
      hired: job.hired - 1 
    });
  }
};
```

---

## 🚀 Would You Like Me To:

**Option A: Implement All Fixes Now** (30-45 min)
- Full database persistence
- Smooth drag-drop
- Hired tracking
- Post-hire columns
- Complete refactor

**Option B: Quick Fixes First** (10 min)
- Just make drag-drop smooth
- Basic column persistence
- Then add hired logic later

**Which do you prefer?** I can implement the full solution properly or do quick fixes first!

---

The kanban board needs significant updates to work properly with the database. I want to make sure I implement it the way you want!

Let me know and I'll get started! 🚀


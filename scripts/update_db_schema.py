import sys
import os
from sqlalchemy import create_engine, text, inspect
from backend.app.core.config import settings

# Add parent dir to path to import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def update_schema():
    print("Updating database schema...")
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    with engine.connect() as conn:
        inspector = inspect(engine)
        
        # 1. Update Users Table
        columns = [col['name'] for col in inspector.get_columns('users')]
        
        if 'love_language' not in columns:
            print("Adding love_language to users...")
            conn.execute(text("ALTER TABLE users ADD COLUMN love_language VARCHAR(50)"))
            
        if 'conflict_resolution_style' not in columns:
            print("Adding conflict_resolution_style to users...")
            conn.execute(text("ALTER TABLE users ADD COLUMN conflict_resolution_style VARCHAR(50)"))

        # 2. Create CoachingStatus Table
        if not inspector.has_table('coaching_status'):
            print("Creating coaching_status table...")
            conn.execute(text("""
                CREATE TABLE coaching_status (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL UNIQUE,
                    current_focus_area VARCHAR(100),
                    week_start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    completed_tasks JSON DEFAULT '[]',
                    updated_at DATETIME,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """))
            conn.execute(text("CREATE INDEX ix_coaching_status_id ON coaching_status (id)"))
            
        conn.commit()
        print("Schema update complete.")

if __name__ == "__main__":
    update_schema()

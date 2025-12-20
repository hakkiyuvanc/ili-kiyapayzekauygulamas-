
import sqlite3
import os

DB_PATH = "iliski_analiz.db"

def update_schema():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Add onboarding_completed column
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0")
            print("Added column: onboarding_completed")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column 'onboarding_completed' already exists.")
            else:
                raise e

        # Add goals column
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN goals JSON")
            print("Added column: goals")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column 'goals' already exists.")
            else:
                raise e
        
        conn.commit()
        print("Schema update completed successfully.")

    except Exception as e:
        print(f"Error updating schema: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    update_schema()

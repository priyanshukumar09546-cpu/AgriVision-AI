import sqlite3
import os
import json
import hashlib
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "agrivision.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Farmer',
            avatar_url TEXT DEFAULT '',
            location TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            email_verified INTEGER DEFAULT 0
        )
    """)

    # Check for missing email_verified column in existing database
    cursor.execute("PRAGMA table_info(users)")
    existing_user_cols = [row[1] for row in cursor.fetchall()]
    if "email_verified" not in existing_user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0")
        cursor.execute("UPDATE users SET email_verified = 1")

    # 2. Crops Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS crops (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            scientific_name TEXT NOT NULL,
            category TEXT NOT NULL,
            growing_season TEXT NOT NULL,
            description TEXT NOT NULL,
            common_diseases TEXT NOT NULL,
            image_url TEXT NOT NULL,
            card_image_url TEXT NOT NULL,
            disease_count INTEGER DEFAULT 0,
            is_popular TEXT DEFAULT 'Most Common',
            created_at TEXT NOT NULL
        )
    """)

    # 3. Diseases Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS diseases (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            affected_crop TEXT NOT NULL,
            scientific_name TEXT NOT NULL,
            type TEXT NOT NULL,
            severity TEXT NOT NULL,
            short_description TEXT NOT NULL,
            image_url TEXT NOT NULL,
            symptoms TEXT NOT NULL,
            causes TEXT NOT NULL,
            prevention TEXT NOT NULL,
            treatments TEXT NOT NULL,
            source TEXT DEFAULT 'ICAR / Agricultural Pathology Database',
            created_at TEXT NOT NULL
        )
    """)

    # 4. Scans History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            crop TEXT NOT NULL,
            disease TEXT NOT NULL,
            scientific_name TEXT NOT NULL,
            confidence REAL NOT NULL,
            severity TEXT NOT NULL,
            image_url TEXT,
            symptoms TEXT,
            treatments TEXT,
            preventive TEXT,
            metrics TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # 5. Community Posts Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            author_name TEXT NOT NULL,
            author_role TEXT NOT NULL,
            author_avatar TEXT DEFAULT '',
            author_location TEXT DEFAULT '',
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT DEFAULT '',
            crop_tag TEXT DEFAULT '',
            category TEXT DEFAULT 'discussion',
            created_at TEXT NOT NULL,
            updated_at TEXT DEFAULT '',
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # 6. Comments Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            author_name TEXT NOT NULL,
            author_role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # 7. Likes Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS likes (
            user_id TEXT NOT NULL,
            post_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (user_id, post_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
        )
    """)

    # 8. Bookmarks Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookmarks (
            user_id TEXT NOT NULL,
            post_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (user_id, post_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
        )
    """)

    # 9. Follows Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS follows (
            follower_id TEXT NOT NULL,
            following_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (follower_id, following_id)
        )
    """)

    # 10. Notifications Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # 11. User Crops Table (My Crops)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_crops (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            crop_name TEXT NOT NULL,
            crop_image TEXT NOT NULL,
            planted_date TEXT DEFAULT '',
            area_acres REAL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # 12. Password Resets Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_resets (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token_hash TEXT UNIQUE NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    # 13. Email Verifications Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS email_verifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token_hash TEXT UNIQUE NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_crops_category ON crops (category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_crops_name ON crops (name)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_diseases_crop ON diseases (affected_crop)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_diseases_type ON diseases (type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scans_user ON scans (user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_user ON posts (user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_comments_post ON comments (post_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pw_reset_hash ON password_resets (token_hash)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_email_verif_hash ON email_verifications (token_hash)")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)

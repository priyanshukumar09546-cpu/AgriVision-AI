import sys
import os
import uuid
import json
import secrets
import hashlib
from datetime import datetime, timedelta
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))

# Load environment configuration from .env if present
env_file = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k:
                    os.environ[k] = v

from flask import Flask, request, jsonify, send_from_directory
from database import get_db, init_db, hash_password
from ai_engine import analyze_leaf_image
from weather_service import get_real_weather
from gemini_service import (
    explain_disease_with_gemini,
    answer_farmer_query,
    get_gemini_api_key,
    get_gemini_model,
    generate_gemini_response
)
from admin_routes import admin_bp

init_db()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.register_blueprint(admin_bp)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB limit

def allowed_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS

# CORS & Production Security Headers Middleware
@app.after_request
def add_security_and_cors_headers(response):
    cors_origin = os.getenv("CORS_ORIGINS", "http://localhost:5173").strip()
    response.headers["Access-Control-Allow-Origin"] = cors_origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    # Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# ==============================================================================
# Helpers & Resend Email Service
# ==============================================================================
RATE_LIMIT_STORE = {}

def check_rate_limit(key: str, window_seconds: int = 60) -> bool:
    now = datetime.utcnow().timestamp()
    last_time = RATE_LIMIT_STORE.get(key, 0)
    if now - last_time < window_seconds:
        return False
    RATE_LIMIT_STORE[key] = now
    return True

def send_email_via_resend(to_email: str, subject: str, html_content: str) -> bool:
    resend_key = os.getenv("RESEND_API_KEY")
    if not resend_key:
        print("[Resend] ERROR: RESEND_API_KEY is not set in environment.")
        return False

    from_email = os.getenv("RESEND_FROM_EMAIL", "AgriVision AI <onboarding@resend.dev>")

    payload = json.dumps({
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {resend_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                return True
            print(f"[Resend] Response status: {resp.status}")
            return False
    except Exception as e:
        print(f"[Resend] Failed to send email: {e}")
        return False

def get_frontend_base_url():
    origin = request.headers.get("Origin") or request.headers.get("Referer")
    if origin:
        origin = origin.rstrip("/")
        if "://" in origin:
            parts = origin.split("/")
            return f"{parts[0]}//{parts[2]}"
    return "http://localhost:5173"

# ==============================================================================
# Health Check
# ==============================================================================
@app.route("/api/health", methods=["GET", "OPTIONS"])
def health_check():
    if request.method == "OPTIONS":
        return "", 200
    return jsonify({
        "status": "online",
        "service": "AgriVision AI Production Engine",
        "timestamp": datetime.utcnow().isoformat()
    })

# ==============================================================================
# Authentication Endpoints
# ==============================================================================
@app.route("/api/auth/signup", methods=["POST", "OPTIONS"])
def sign_up():
    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json(force=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "Farmer")

    if not name or not email or not password:
        return jsonify({"success": False, "error": "Name, email, and password are required."}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "error": "An account with this email address already exists."}), 400

    user_id = str(uuid.uuid4())
    pw_hash = hash_password(password)
    created_at = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO users (id, name, email, password_hash, role, created_at, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, 0)
    """, (user_id, name, email, pw_hash, role, created_at))

    # Generate single-use Email Verification token
    verif_raw = secrets.token_urlsafe(32)
    verif_hash = hashlib.sha256(verif_raw.encode("utf-8")).hexdigest()
    expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat()
    verif_id = str(uuid.uuid4())

    cursor.execute("""
        INSERT INTO email_verifications (id, user_id, token_hash, expires_at, used, created_at)
        VALUES (?, ?, ?, ?, 0, ?)
    """, (verif_id, user_id, verif_hash, expires_at, created_at))

    conn.commit()

    cursor.execute("SELECT id, name, email, role, avatar_url, location, bio, email_verified FROM users WHERE id = ?", (user_id,))
    user_row = dict(cursor.fetchone())
    user_row["email_verified"] = bool(user_row.get("email_verified", 0))
    conn.close()

    # Send verification email asynchronously / in background or inline
    verif_url = f"{get_frontend_base_url()}/verify-email?token={verif_raw}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #15803D; margin: 0; font-size: 24px;">AgriVision AI</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Healthy Crops. Brighter Tomorrow.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Welcome to AgriVision AI, {name}!</h3>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Thank you for registering. Please verify your email address to complete your account setup and activate all features:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{verif_url}" style="background-color: #15803D; color: #ffffff; text-decoration: none; padding: 13px 28px; font-weight: bold; border-radius: 12px; display: inline-block; font-size: 14px;">Verify Email Address</a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.6;">
            This verification link will expire in 24 hours. If you did not register for an AgriVision AI account, please ignore this email.
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; word-break: break-all;">
            Or copy and paste this link: <a href="{verif_url}" style="color: #15803D;">{verif_url}</a>
        </p>
    </div>
    """
    send_email_via_resend(email, "Verify Your AgriVision AI Account Email", html_body)

    return jsonify({
        "success": True,
        "token": f"agri_token_{user_id}",
        "user": user_row,
        "message": "Account created! A verification email has been sent to your inbox."
    })

@app.route("/api/auth/signin", methods=["POST", "OPTIONS"])
@app.route("/api/auth/login", methods=["POST", "OPTIONS"])
def sign_in():
    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json(force=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "error": "Please enter both email and password."}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password_hash, role, avatar_url, location, bio, email_verified FROM users WHERE LOWER(email) = LOWER(?)", (email,))
    user = cursor.fetchone()

    if not user or user["password_hash"] != hash_password(password):
        conn.close()
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    user_data = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "avatar_url": user["avatar_url"],
        "location": user["location"],
        "bio": user["bio"],
        "email_verified": bool(user["email_verified"])
    }
    conn.close()

    return jsonify({
        "success": True,
        "token": f"agri_token_{user['id']}",
        "user": user_data
    })

@app.route("/api/auth/google", methods=["POST", "OPTIONS"])
def google_auth():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(force=True) or {}
    credential = data.get("credential") or data.get("id_token")
    access_token = data.get("access_token")

    if not credential and not access_token:
        return jsonify({"success": False, "error": "Missing Google authentication token."}), 400

    google_email = None
    google_name = None
    google_picture = ""
    google_sub = None

    client_id = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("VITE_GOOGLE_CLIENT_ID")

    # 1. Verify via ID Token (Credential)
    if credential:
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests
            idinfo = id_token.verify_oauth2_token(credential, google_requests.Request(), client_id)
            google_email = idinfo.get("email")
            google_name = idinfo.get("name") or (google_email.split("@")[0] if google_email else "Google User")
            google_picture = idinfo.get("picture", "")
            google_sub = idinfo.get("sub")
        except Exception as e:
            # Fallback verification via Google's tokeninfo endpoint
            try:
                verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
                req = urllib.request.Request(verify_url, headers={"User-Agent": "AgriVisionAI-Backend"})
                with urllib.request.urlopen(req, timeout=7) as resp:
                    info = json.loads(resp.read().decode())
                    if client_id and info.get("aud") != client_id:
                        return jsonify({"success": False, "error": "Invalid Google OAuth client verification."}), 401
                    google_email = info.get("email")
                    google_name = info.get("name") or (google_email.split("@")[0] if google_email else "Google User")
                    google_picture = info.get("picture", "")
                    google_sub = info.get("sub")
            except Exception as inner_e:
                print(f"Google ID token verification failed: {e} / {inner_e}")
                return jsonify({"success": False, "error": "Invalid or expired Google ID token."}), 401

    # 2. Verify via Access Token
    elif access_token:
        try:
            userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            req = urllib.request.Request(userinfo_url, headers={"Authorization": f"Bearer {access_token}"})
            with urllib.request.urlopen(req, timeout=7) as resp:
                uinfo = json.loads(resp.read().decode())
                google_email = uinfo.get("email")
                google_name = uinfo.get("name") or (google_email.split("@")[0] if google_email else "Google User")
                google_picture = uinfo.get("picture", "")
                google_sub = uinfo.get("sub")
        except Exception as e:
            print(f"Google access token verification failed: {e}")
            return jsonify({"success": False, "error": "Invalid or expired Google access token."}), 401

    if not google_email:
        return jsonify({"success": False, "error": "No verified email found in Google profile."}), 400

    clean_email = google_email.strip().lower()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, email, role, avatar_url, location, bio 
        FROM users WHERE LOWER(email) = LOWER(?)
    """, (clean_email,))
    existing_user = cursor.fetchone()

    now_iso = datetime.utcnow().isoformat()

    if existing_user:
        user_id = existing_user["id"]
        avatar_to_save = existing_user["avatar_url"] or google_picture
        cursor.execute("UPDATE users SET last_login = ?, avatar_url = ?, email_verified = 1 WHERE id = ?", (now_iso, avatar_to_save, user_id))
        conn.commit()

        user_data = {
            "id": existing_user["id"],
            "name": existing_user["name"],
            "email": existing_user["email"],
            "role": existing_user["role"],
            "avatar_url": avatar_to_save,
            "location": existing_user["location"],
            "bio": existing_user["bio"],
            "email_verified": True
        }
    else:
        user_id = str(uuid.uuid4())
        pw_hash = hash_password(str(uuid.uuid4()))
        role = "Farmer"
        cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, role, avatar_url, created_at, last_login, email_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (user_id, google_name, clean_email, pw_hash, role, google_picture, now_iso, now_iso))
        conn.commit()

        user_data = {
            "id": user_id,
            "name": google_name,
            "email": clean_email,
            "role": role,
            "avatar_url": google_picture,
            "location": "",
            "bio": "",
            "email_verified": True
        }

    conn.close()

    token = f"agri_token_{user_id}"

    return jsonify({
        "success": True,
        "token": token,
        "user": user_data
    })

@app.route("/api/auth/me", methods=["GET", "OPTIONS"])
def get_current_user():
    if request.method == "OPTIONS":
        return "", 200
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"success": False, "error": "Not authenticated"}), 401

    user_id = auth_header.replace("Bearer ", "").replace("agri_token_", "").strip()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, avatar_url, location, bio, email_verified FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"success": False, "error": "Session expired or user not found."}), 401

    u_dict = dict(user)
    u_dict["email_verified"] = bool(u_dict.get("email_verified", 0))
    return jsonify({"success": True, "user": u_dict})

# ==============================================================================
# Password Reset & Email Verification Endpoints
# ==============================================================================
@app.route("/api/auth/forgot-password", methods=["POST", "OPTIONS"])
def forgot_password():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(force=True) or {}
    email = data.get("email", "").strip().lower()

    if not email or "@" not in email:
        return jsonify({"success": False, "error": "Please provide a valid email address."}), 400

    # Rate limiting: max 1 request per email every 60 seconds
    if not check_rate_limit(f"forgot_{email}", window_seconds=60):
        # To prevent timing/enumeration side channels, return generic success message even on rate limit
        return jsonify({
            "success": True,
            "message": "If an account with that email exists, we sent a password reset link."
        })

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email FROM users WHERE LOWER(email) = LOWER(?)", (email,))
    user = cursor.fetchone()

    generic_success_msg = "If an account with that email exists, we sent a password reset link."

    if not user:
        conn.close()
        return jsonify({"success": True, "message": generic_success_msg})

    user_id = user["id"]
    user_name = user["name"]

    # Invalidate previous unused reset tokens for this user
    cursor.execute("UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0", (user_id,))

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    now_iso = datetime.utcnow().isoformat()
    reset_id = str(uuid.uuid4())

    cursor.execute("""
        INSERT INTO password_resets (id, user_id, token_hash, expires_at, used, created_at)
        VALUES (?, ?, ?, ?, 0, ?)
    """, (reset_id, user_id, token_hash, expires_at, now_iso))
    conn.commit()
    conn.close()

    reset_url = f"{get_frontend_base_url()}/reset-password?token={raw_token}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #15803D; margin: 0; font-size: 24px;">AgriVision AI</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Healthy Crops. Brighter Tomorrow.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Password Reset Request</h3>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Hello {user_name},<br/><br/>
            We received a request to reset your AgriVision AI account password. Click the button below to choose a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}" style="background-color: #15803D; color: #ffffff; text-decoration: none; padding: 13px 28px; font-weight: bold; border-radius: 12px; display: inline-block; font-size: 14px;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.6;">
            This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; word-break: break-all;">
            Or copy and paste this link: <a href="{reset_url}" style="color: #15803D;">{reset_url}</a>
        </p>
    </div>
    """

    send_email_via_resend(email, "Reset Your AgriVision AI Password", html_body)

    return jsonify({"success": True, "message": generic_success_msg})

@app.route("/api/auth/reset-password", methods=["POST", "OPTIONS"])
def reset_password():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(force=True) or {}
    token = data.get("token", "").strip()
    new_password = data.get("newPassword") or data.get("new_password") or ""

    if not token:
        return jsonify({"success": False, "error": "Reset token is required."}), 400

    if not new_password or len(new_password) < 6:
        return jsonify({"success": False, "error": "New password must be at least 6 characters long."}), 400

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, user_id, expires_at, used
        FROM password_resets
        WHERE token_hash = ? AND used = 0
    """, (token_hash,))
    reset_record = cursor.fetchone()

    if not reset_record:
        conn.close()
        return jsonify({"success": False, "error": "Invalid or already used password reset token."}), 400

    if reset_record["expires_at"] < datetime.utcnow().isoformat():
        conn.close()
        return jsonify({"success": False, "error": "Password reset token has expired. Please request a new one."}), 400

    user_id = reset_record["user_id"]
    new_hash = hash_password(new_password)

    # Update password and mark token used
    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    cursor.execute("UPDATE password_resets SET used = 1 WHERE id = ?", (reset_record["id"],))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Your password has been successfully reset. You can now sign in with your new password."
    })

@app.route("/api/auth/verify-email", methods=["POST", "GET", "OPTIONS"])
def verify_email():
    if request.method == "OPTIONS":
        return "", 200

    token = None
    if request.method == "GET":
        token = request.args.get("token", "").strip()
    else:
        data = request.get_json(force=True) or {}
        token = data.get("token", "").strip()

    if not token:
        return jsonify({"success": False, "error": "Verification token is required."}), 400

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, user_id, expires_at, used
        FROM email_verifications
        WHERE token_hash = ? AND used = 0
    """, (token_hash,))
    verif_record = cursor.fetchone()

    if not verif_record:
        conn.close()
        return jsonify({"success": False, "error": "Invalid or already used verification token."}), 400

    if verif_record["expires_at"] < datetime.utcnow().isoformat():
        conn.close()
        return jsonify({"success": False, "error": "Verification token has expired. Please request a new verification link."}), 400

    user_id = verif_record["user_id"]

    cursor.execute("UPDATE users SET email_verified = 1 WHERE id = ?", (user_id,))
    cursor.execute("UPDATE email_verifications SET used = 1 WHERE id = ?", (verif_record["id"],))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Email address verified successfully!"
    })

@app.route("/api/auth/resend-verification", methods=["POST", "OPTIONS"])
def resend_verification():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(force=True) or {}
    email = data.get("email", "").strip().lower()

    if not email or "@" not in email:
        return jsonify({"success": False, "error": "Please provide a valid email address."}), 400

    if not check_rate_limit(f"resend_verif_{email}", window_seconds=60):
        return jsonify({
            "success": True,
            "message": "If an unverified account with that email exists, a new verification link was sent."
        })

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, email_verified FROM users WHERE LOWER(email) = LOWER(?)", (email,))
    user = cursor.fetchone()

    generic_msg = "If an unverified account with that email exists, a new verification link was sent."

    if not user or user["email_verified"] == 1:
        conn.close()
        return jsonify({"success": True, "message": generic_msg})

    user_id = user["id"]
    user_name = user["name"]

    cursor.execute("UPDATE email_verifications SET used = 1 WHERE user_id = ? AND used = 0", (user_id,))

    verif_raw = secrets.token_urlsafe(32)
    verif_hash = hashlib.sha256(verif_raw.encode("utf-8")).hexdigest()
    expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat()
    now_iso = datetime.utcnow().isoformat()
    verif_id = str(uuid.uuid4())

    cursor.execute("""
        INSERT INTO email_verifications (id, user_id, token_hash, expires_at, used, created_at)
        VALUES (?, ?, ?, ?, 0, ?)
    """, (verif_id, user_id, verif_hash, expires_at, now_iso))
    conn.commit()
    conn.close()

    verif_url = f"{get_frontend_base_url()}/verify-email?token={verif_raw}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #15803D; margin: 0; font-size: 24px;">AgriVision AI</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Healthy Crops. Brighter Tomorrow.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Verify Your Email Address</h3>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Hello {user_name},<br/><br/>
            Here is your new link to verify your email address for AgriVision AI:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{verif_url}" style="background-color: #15803D; color: #ffffff; text-decoration: none; padding: 13px 28px; font-weight: bold; border-radius: 12px; display: inline-block; font-size: 14px;">Verify Email Address</a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.6;">
            This verification link will expire in 24 hours.
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; word-break: break-all;">
            Or copy and paste this link: <a href="{verif_url}" style="color: #15803D;">{verif_url}</a>
        </p>
    </div>
    """
    send_email_via_resend(email, "Verify Your AgriVision AI Account Email", html_body)

    return jsonify({"success": True, "message": generic_msg})

@app.route("/api/auth/profile", methods=["PUT", "OPTIONS"])
def update_profile():
    if request.method == "OPTIONS":
        return "", 200
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"success": False, "error": "Not authenticated"}), 401

    user_id = auth_header.replace("Bearer ", "").replace("agri_token_", "").strip()
    data = request.get_json(force=True) or {}

    conn = get_db()
    cursor = conn.cursor()
    updates = []
    values = []
    if "name" in data and data["name"]:
        updates.append("name = ?")
        values.append(data["name"].strip())
    if "role" in data and data["role"]:
        updates.append("role = ?")
        values.append(data["role"].strip())
    if "location" in data:
        updates.append("location = ?")
        values.append(data["location"].strip())
    if "bio" in data:
        updates.append("bio = ?")
        values.append(data["bio"].strip())

    if updates:
        values.append(user_id)
        cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", tuple(values))
        conn.commit()

    cursor.execute("SELECT id, name, email, role, avatar_url, location, bio FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    return jsonify({"success": True, "user": dict(user)})



# ==============================================================================
# Gemini AI Assistant & Agronomic Advisory Endpoints
# ==============================================================================
@app.route("/api/ai/status", methods=["GET", "OPTIONS"])
def gemini_status():
    if request.method == "OPTIONS":
        return "", 200
    api_key = get_gemini_api_key()
    return jsonify({
        "success": True,
        "configured": bool(api_key),
        "model": get_gemini_model(),
        "provider": "Google Gemini AI Engine"
    })

@app.route("/api/ai/explain-disease", methods=["POST", "OPTIONS"])
def explain_disease_endpoint():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(force=True) or {}
    crop = data.get("crop", "Crop")
    disease = data.get("disease", "Disease")
    severity = data.get("severity", "Moderate")
    symptoms = data.get("symptoms", [])
    causes = data.get("causes", [])

    res = explain_disease_with_gemini(crop, disease, severity, symptoms, causes)
    if res.get("success"):
        return jsonify({
            "success": True,
            "explanation": res["text"],
            "model": res.get("model_used")
        })
    else:
        status_code = 429 if res.get("error_type") == "QUOTA_EXCEEDED" else 400
        return jsonify({
            "success": False,
            "error": res.get("error", "Unable to generate Gemini AI explanation."),
            "error_type": res.get("error_type", "UNKNOWN_ERROR")
        }), status_code

@app.route("/api/ai/chat", methods=["POST", "OPTIONS"])
@app.route("/api/ai/ask-assistant", methods=["POST", "OPTIONS"])
def ask_assistant_endpoint():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(force=True) or {}
    query = data.get("query", "").strip()
    crop_context = data.get("cropContext", "").strip()

    if not query or len(query) < 3:
        return jsonify({"success": False, "error": "Please provide a valid question for the AgriVision AI assistant."}), 400

    # Rate limiting: 1 request every 3 seconds per IP
    client_ip = request.remote_addr or "client"
    if not check_rate_limit(f"gemini_chat_{client_ip}", window_seconds=3):
        return jsonify({
            "success": False,
            "error": "Rate limit exceeded. Please wait a moment before sending another question.",
            "error_type": "RATE_LIMITED"
        }), 429

    res = answer_farmer_query(query, crop_context)
    if res.get("success"):
        return jsonify({
            "success": True,
            "answer": res["text"],
            "model": res.get("model_used")
        })
    else:
        status_code = 429 if res.get("error_type") == "QUOTA_EXCEEDED" else 400
        return jsonify({
            "success": False,
            "error": res.get("error", "Unable to process AI assistant request."),
            "error_type": res.get("error_type", "UNKNOWN_ERROR")
        }), status_code

# ==============================================================================
# AI Disease Detection Endpoint
# ==============================================================================
@app.route("/api/detect", methods=["POST", "OPTIONS"])
def detect_crop_disease():
    if request.method == "OPTIONS":
        return "", 200
    
    if "file" not in request.files:
        return jsonify({"success": False, "error": "Please provide an image file."}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"success": False, "error": "Selected image file is empty."}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "error": "Invalid file type. Only JPG, JPEG, PNG, and WEBP image files are allowed."}), 400

    # Check content length
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        return jsonify({"success": False, "error": "Image file size exceeds the 10MB limit."}), 400

    crop_id = request.form.get("cropId", "tomato").lower()
    user_id = request.form.get("userId")

    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    file.save(file_path)

    # Execute Real AI Vision and Pathology Inference Engine
    res = analyze_leaf_image(file_path, crop_id)

    if not res.get("success"):
        return jsonify({
            "success": False,
            "error": res.get("error", "Unable to confidently identify this image. Please upload a clearer crop/leaf image.")
        })

    # Handle Low Confidence Diagnostic State (< 65%)
    if res.get("status") == "low_confidence":
        return jsonify({
            "success": True,
            "status": "low_confidence",
            "crop": res.get("crop", "Crop"),
            "disease": res.get("disease", "Unable to determine reliably from this image"),
            "confidence": res.get("confidence", 0.0),
            "message": res.get("message", "Unable to determine disease reliably from this image. Model confidence is below the diagnostic threshold (65%)."),
            "metrics": res.get("metrics", {})
        })

    image_url = f"/uploads/{filename}"
    scan_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat()
    now_time = datetime.now().strftime("%I:%M %p")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO scans (id, user_id, crop, disease, scientific_name, confidence, severity, image_url, symptoms, treatments, preventive, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        scan_id,
        user_id,
        res["crop"],
        res["disease"],
        res["scientificName"],
        res["confidence"],
        res.get("severity", "Moderate"),
        image_url,
        json.dumps(res["symptoms"]),
        json.dumps(res["treatments"]),
        json.dumps(res["treatments"]["preventive"]),
        now_iso
    ))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "status": "success",
        "scanId": scan_id,
        "isMock": False,
        "crop": res["crop"],
        "disease": res["disease"],
        "scientificName": res["scientificName"],
        "confidence": res["confidence"],
        "severity": res.get("severity", "Moderate"),
        "metrics": res.get("metrics", {}),
        "symptoms": res["symptoms"],
        "causes": res["causes"],
        "treatments": res["treatments"],
        "provenance": res.get("provenance", "ICAR / Agricultural Extension Knowledge Base"),
        "imageUrl": image_url,
        "analyzedAt": now_time
    })

# ==============================================================================
# Scan History Endpoints
# ==============================================================================
@app.route("/api/scans", methods=["GET", "OPTIONS"])
def get_user_scans():
    if request.method == "OPTIONS":
        return "", 200
    user_id = request.args.get("userId")
    conn = get_db()
    cursor = conn.cursor()
    if user_id:
        cursor.execute("SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    else:
        cursor.execute("SELECT * FROM scans ORDER BY created_at DESC LIMIT 30")

    rows = cursor.fetchall()
    scans = []
    for r in rows:
        scans.append({
            "id": r["id"],
            "crop": r["crop"],
            "disease": r["disease"],
            "scientificName": r["scientific_name"],
            "confidence": r["confidence"],
            "severity": r["severity"],
            "imageUrl": r["image_url"],
            "symptoms": json.loads(r["symptoms"]) if r["symptoms"] else [],
            "treatments": json.loads(r["treatments"]) if r["treatments"] else {},
            "createdAt": r["created_at"]
        })
    conn.close()
    return jsonify({"success": True, "scans": scans})

@app.route("/api/scans/<scan_id>", methods=["DELETE", "OPTIONS"])
def delete_scan(scan_id):
    if request.method == "OPTIONS":
        return "", 200

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM scans WHERE id = ?", (scan_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": "Scan record not found"}), 404

    user_id = request.args.get("userId")
    if user_id and row["user_id"] and user_id != row["user_id"]:
        conn.close()
        return jsonify({"success": False, "error": "Unauthorized to delete this scan record."}), 403

    cursor.execute("DELETE FROM scans WHERE id = ?", (scan_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Scan record deleted."})


# ==============================================================================
# Community Endpoints
# ==============================================================================
@app.route("/api/community/posts", methods=["GET", "POST", "OPTIONS"])
def community_posts():
    if request.method == "OPTIONS":
        return "", 200

    if request.method == "POST":
        title = request.form.get("title", "").strip()
        content = request.form.get("content", "").strip()
        crop_tag = request.form.get("cropTag", "").strip()
        category = request.form.get("category", "discussion").strip().lower()
        user_id = request.form.get("userId", "")
        author_name = request.form.get("authorName", "Farmer")
        author_role = request.form.get("authorRole", "Farmer")

        if not title or not content:
            return jsonify({"success": False, "error": "Title and content are required."}), 400

        image_url = ""
        if "file" in request.files:
            f = request.files["file"]
            if f and f.filename:
                if not allowed_file(f.filename):
                    return jsonify({"success": False, "error": "Invalid image file type. Only JPG, JPEG, PNG, and WEBP allowed."}), 400
                f.seek(0, os.SEEK_END)
                if f.tell() > MAX_FILE_SIZE:
                    return jsonify({"success": False, "error": "Image file size exceeds 10MB limit."}), 400
                f.seek(0)
                ext = os.path.splitext(f.filename)[1].lower() or ".jpg"
                fn = f"post_{uuid.uuid4()}{ext}"
                fp = os.path.join(UPLOAD_DIR, fn)
                f.save(fp)
                image_url = f"/uploads/{fn}"

        post_id = str(uuid.uuid4())
        now_iso = datetime.utcnow().isoformat()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO posts (id, user_id, author_name, author_role, title, content, image_url, crop_tag, category, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (post_id, user_id, author_name, author_role, title, content, image_url, crop_tag, category, now_iso))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "postId": post_id})

    # GET Posts
    current_user_id = request.args.get("currentUserId")
    tab = request.args.get("tab", "all")
    crop = request.args.get("crop")
    category = request.args.get("category")
    search = request.args.get("search")

    conn = get_db()
    cursor = conn.cursor()

    query = """
        SELECT p.*,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
        FROM posts p
    """
    conditions = []
    params = []

    if tab == "my_posts" and current_user_id:
        conditions.append("p.user_id = ?")
        params.append(current_user_id)
    elif tab == "bookmarked" and current_user_id:
        conditions.append("p.id IN (SELECT post_id FROM bookmarks WHERE user_id = ?)")
        params.append(current_user_id)

    if crop and crop != "all":
        conditions.append("LOWER(p.crop_tag) = LOWER(?)")
        params.append(crop)

    if category and category != "all":
        conditions.append("LOWER(p.category) = LOWER(?)")
        params.append(category)

    if search:
        s = f"%{search.strip()}%"
        conditions.append("(p.title LIKE ? OR p.content LIKE ? OR p.crop_tag LIKE ?)")
        params.extend([s, s, s])

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY p.created_at DESC"

    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()

    user_liked_ids = set()
    user_bookmarked_ids = set()
    if current_user_id:
        cursor.execute("SELECT post_id FROM likes WHERE user_id = ?", (current_user_id,))
        user_liked_ids = {r["post_id"] for r in cursor.fetchall()}
        cursor.execute("SELECT post_id FROM bookmarks WHERE user_id = ?", (current_user_id,))
        user_bookmarked_ids = {r["post_id"] for r in cursor.fetchall()}

    posts = []
    for r in rows:
        p_id = r["id"]
        posts.append({
            "id": p_id,
            "author": {
                "id": r["user_id"],
                "name": r["author_name"],
                "role": r["author_role"],
                "avatar": r["author_avatar"] or "/community_assets/avatar_aarav.jpg",
                "location": "Verified Farmer",
                "timeAgo": "Recently"
            },
            "title": r["title"],
            "content": r["content"],
            "images": [r["image_url"]] if r["image_url"] else [],
            "cropTag": r["crop_tag"],
            "categoryBadge": {
                "text": r["category"].capitalize() if r["category"] else "Discussion",
                "variant": "help" if r["category"] == "help" else "discussion"
            },
            "likesCount": r["likes_count"],
            "commentsCount": r["comments_count"],
            "isLiked": p_id in user_liked_ids,
            "isBookmarked": p_id in user_bookmarked_ids,
            "createdAt": r["created_at"]
        })

    conn.close()
    return jsonify({"success": True, "posts": posts})

@app.route("/api/community/posts/<post_id>/like", methods=["POST", "OPTIONS"])
def toggle_like(post_id):
    if request.method == "OPTIONS":
        return "", 200
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"success": False, "error": "User ID is required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?", (user_id, post_id))
    existing = cursor.fetchone()

    if existing:
        cursor.execute("DELETE FROM likes WHERE user_id = ? AND post_id = ?", (user_id, post_id))
        is_liked = False
    else:
        cursor.execute("INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, ?)", (user_id, post_id, datetime.utcnow().isoformat()))
        is_liked = True

    conn.commit()
    cursor.execute("SELECT COUNT(*) as count FROM likes WHERE post_id = ?", (post_id,))
    count = cursor.fetchone()["count"]
    conn.close()

    return jsonify({"success": True, "isLiked": is_liked, "likesCount": count})

@app.route("/api/community/posts/<post_id>/bookmark", methods=["POST", "OPTIONS"])
def toggle_bookmark(post_id):
    if request.method == "OPTIONS":
        return "", 200
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"success": False, "error": "User ID is required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM bookmarks WHERE user_id = ? AND post_id = ?", (user_id, post_id))
    existing = cursor.fetchone()

    if existing:
        cursor.execute("DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?", (user_id, post_id))
        is_bookmarked = False
    else:
        cursor.execute("INSERT INTO bookmarks (user_id, post_id, created_at) VALUES (?, ?, ?)", (user_id, post_id, datetime.utcnow().isoformat()))
        is_bookmarked = True

    conn.commit()
    conn.close()
    return jsonify({"success": True, "isBookmarked": is_bookmarked})

@app.route("/api/community/posts/<post_id>/comment", methods=["POST", "OPTIONS"])
def add_comment(post_id):
    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json(force=True) or {}
    content = data.get("content", "").strip()
    user_id = data.get("user_id")
    author_name = data.get("author_name", "Farmer")
    author_role = data.get("author_role", "Farmer")

    if not content or not user_id:
        return jsonify({"success": False, "error": "Comment content and user ID are required."}), 400

    comment_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO comments (id, post_id, user_id, author_name, author_role, content, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (comment_id, post_id, user_id, author_name, author_role, content, now_iso))
    conn.commit()

    cursor.execute("SELECT COUNT(*) as count FROM comments WHERE post_id = ?", (post_id,))
    comments_count = cursor.fetchone()["count"]
    conn.close()

    return jsonify({
        "success": True,
        "comment": {
            "id": comment_id,
            "authorName": author_name,
            "authorRole": author_role,
            "content": content,
            "createdAt": now_iso
        },
        "commentsCount": comments_count
    })

@app.route("/api/community/posts/<post_id>/comments", methods=["GET", "OPTIONS"])
def get_comments(post_id):
    if request.method == "OPTIONS":
        return "", 200
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC", (post_id,))
    rows = cursor.fetchall()
    comments = []
    for r in rows:
        comments.append({
            "id": r["id"],
            "authorName": r["author_name"],
            "authorRole": r["author_role"],
            "content": r["content"],
            "createdAt": r["created_at"]
        })
    conn.close()
    return jsonify({"success": True, "comments": comments})

@app.route("/api/community/posts/<post_id>", methods=["PUT", "DELETE", "OPTIONS"])
def manage_post(post_id):
    if request.method == "OPTIONS":
        return "", 200

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM posts WHERE id = ?", (post_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": "Post not found"}), 404

    owner_id = row["user_id"]

    if request.method == "DELETE":
        user_id = request.args.get("userId") or (request.get_json(silent=True) or {}).get("userId")
        if not user_id or user_id != owner_id:
            conn.close()
            return jsonify({"success": False, "error": "Unauthorized to delete this post."}), 403

        cursor.execute("DELETE FROM likes WHERE post_id = ?", (post_id,))
        cursor.execute("DELETE FROM comments WHERE post_id = ?", (post_id,))
        cursor.execute("DELETE FROM bookmarks WHERE post_id = ?", (post_id,))
        cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Post deleted successfully."})

    if request.method == "PUT":
        data = request.get_json(force=True) or {}
        user_id = data.get("userId")
        if not user_id or user_id != owner_id:
            conn.close()
            return jsonify({"success": False, "error": "Unauthorized to edit this post."}), 403

        title = data.get("title", "").strip()
        content = data.get("content", "").strip()
        crop_tag = data.get("cropTag", "").strip()
        category = data.get("category", "discussion").strip().lower()

        if not title or not content:
            conn.close()
            return jsonify({"success": False, "error": "Title and content are required."}), 400

        now_iso = datetime.utcnow().isoformat()
        cursor.execute("""
            UPDATE posts
            SET title = ?, content = ?, crop_tag = ?, category = ?, updated_at = ?
            WHERE id = ?
        """, (title, content, crop_tag, category, now_iso, post_id))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Post updated successfully."})

@app.route("/api/community/comments/<comment_id>", methods=["DELETE", "OPTIONS"])
def delete_comment(comment_id):
    if request.method == "OPTIONS":
        return "", 200

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT post_id, user_id FROM comments WHERE id = ?", (comment_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": "Comment not found"}), 404

    user_id = request.args.get("userId") or (request.get_json(silent=True) or {}).get("userId")
    if not user_id or user_id != row["user_id"]:
        conn.close()
        return jsonify({"success": False, "error": "Unauthorized to delete this comment."}), 403

    post_id = row["post_id"]
    cursor.execute("DELETE FROM comments WHERE id = ?", (comment_id,))
    conn.commit()

    cursor.execute("SELECT COUNT(*) as count FROM comments WHERE post_id = ?", (post_id,))
    comments_count = cursor.fetchone()["count"]
    conn.close()

    return jsonify({"success": True, "message": "Comment deleted successfully.", "commentsCount": comments_count})



# ==============================================================================
# Crops Endpoints (Real SQLite Catalog)
# ==============================================================================
@app.route("/api/crops", methods=["GET", "OPTIONS"])
def get_crops():
    if request.method == "OPTIONS":
        return "", 200
    search = request.args.get("search", "").strip().lower()
    category = request.args.get("category", "").strip()
    season = request.args.get("season", "").strip()
    sort = request.args.get("sort", "").strip()

    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM crops"
    conditions = []
    params = []

    if search:
        s = f"%{search}%"
        conditions.append("(LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(common_diseases) LIKE ? OR LOWER(scientific_name) LIKE ?)")
        params.extend([s, s, s, s])

    if category and category != "All":
        conditions.append("LOWER(category) = LOWER(?)")
        params.append(category)

    if season and season != "All":
        conditions.append("(growing_season = 'All Season' OR LOWER(growing_season) = LOWER(?))")
        params.append(season)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    if sort == "Name A–Z":
        query += " ORDER BY name ASC"
    elif sort == "Name Z–A":
        query += " ORDER BY name DESC"
    elif sort == "Most Diseases":
        query += " ORDER BY disease_count DESC"
    elif sort == "Least Diseases":
        query += " ORDER BY disease_count ASC"
    else:
        query += " ORDER BY id ASC"

    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    crops = []
    for r in rows:
        common_diseases = []
        try:
            common_diseases = json.loads(r["common_diseases"]) if r["common_diseases"] else []
        except Exception:
            common_diseases = []

        crops.append({
            "id": r["id"],
            "name": r["name"],
            "image": r["image_url"],
            "cardImage": r["card_image_url"],
            "category": r["category"],
            "categoryDisplay": r["category"].upper(),
            "diseaseCount": r["disease_count"],
            "season": r["growing_season"],
            "isPopular": r["is_popular"],
            "scientificName": r["scientific_name"],
            "commonDiseases": common_diseases,
            "description": r["description"]
        })
    conn.close()
    return jsonify({"success": True, "crops": crops})

@app.route("/api/crops/<crop_id>", methods=["GET", "OPTIONS"])
def get_crop_by_id(crop_id):
    if request.method == "OPTIONS":
        return "", 200
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM crops WHERE LOWER(id) = LOWER(?) OR LOWER(name) = LOWER(?)", (crop_id, crop_id))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return jsonify({"success": False, "error": "Crop not found"}), 404
    
    return jsonify({
        "success": True,
        "crop": {
            "id": r["id"],
            "name": r["name"],
            "image": r["image_url"],
            "cardImage": r["card_image_url"],
            "category": r["category"],
            "categoryDisplay": r["category"].upper(),
            "diseaseCount": r["disease_count"],
            "season": r["growing_season"],
            "isPopular": r["is_popular"],
            "scientificName": r["scientific_name"],
            "commonDiseases": json.loads(r["common_diseases"]) if r["common_diseases"] else [],
            "description": r["description"]
        }
    })

# ==============================================================================
# Diseases Endpoints (Real SQLite Pathology Catalog)
# ==============================================================================
@app.route("/api/diseases", methods=["GET", "OPTIONS"])
def get_diseases():
    if request.method == "OPTIONS":
        return "", 200
    search = request.args.get("search", "").strip().lower()
    crop = request.args.get("crop", "").strip()
    disease_type = request.args.get("type", "").strip()
    severity = request.args.get("severity", "").strip()
    sort = request.args.get("sort", "").strip()

    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM diseases"
    conditions = []
    params = []

    if search:
        s = f"%{search}%"
        conditions.append("(LOWER(name) LIKE ? OR LOWER(affected_crop) LIKE ? OR LOWER(type) LIKE ? OR LOWER(scientific_name) LIKE ? OR LOWER(short_description) LIKE ?)")
        params.extend([s, s, s, s, s])

    if crop and crop != "All Crops":
        conditions.append("LOWER(affected_crop) = LOWER(?)")
        params.append(crop)

    if disease_type and disease_type != "All":
        conditions.append("LOWER(type) = LOWER(?)")
        params.append(disease_type)

    if severity and severity != "All":
        conditions.append("LOWER(severity) = LOWER(?)")
        params.append(severity)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    if sort == "name-asc":
        query += " ORDER BY name ASC"
    elif sort == "name-desc":
        query += " ORDER BY name DESC"
    elif sort == "severity-desc":
        query += " ORDER BY CASE severity WHEN 'High' THEN 1 WHEN 'Moderate' THEN 2 WHEN 'Mild' THEN 3 ELSE 4 END ASC"

    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    diseases = []
    for r in rows:
        try:
            symptoms = json.loads(r["symptoms"]) if r["symptoms"] else []
        except Exception:
            symptoms = []
        try:
            causes = json.loads(r["causes"]) if r["causes"] else []
        except Exception:
            causes = []
        try:
            prevention = json.loads(r["prevention"]) if r["prevention"] else []
        except Exception:
            prevention = []
        try:
            treatments = json.loads(r["treatments"]) if r["treatments"] else {"organic": [], "chemical": []}
        except Exception:
            treatments = {"organic": [], "chemical": []}

        diseases.append({
            "id": r["id"],
            "name": r["name"],
            "crop": r["affected_crop"],
            "type": r["type"],
            "severity": r["severity"],
            "shortDescription": r["short_description"],
            "imageUrl": r["image_url"],
            "scientificName": r["scientific_name"],
            "symptoms": symptoms,
            "causes": causes,
            "prevention": prevention,
            "treatments": treatments
        })
    conn.close()
    return jsonify({"success": True, "diseases": diseases})

@app.route("/api/diseases/<disease_id>", methods=["GET", "OPTIONS"])
def get_disease_by_id(disease_id):
    if request.method == "OPTIONS":
        return "", 200
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM diseases WHERE LOWER(id) = LOWER(?) OR LOWER(name) = LOWER(?)", (disease_id, disease_id))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return jsonify({"success": False, "error": "Disease not found"}), 404
    
    return jsonify({
        "success": True,
        "disease": {
            "id": r["id"],
            "name": r["name"],
            "crop": r["affected_crop"],
            "type": r["type"],
            "severity": r["severity"],
            "shortDescription": r["short_description"],
            "imageUrl": r["image_url"],
            "scientificName": r["scientific_name"],
            "symptoms": json.loads(r["symptoms"]) if r["symptoms"] else [],
            "causes": json.loads(r["causes"]) if r["causes"] else [],
            "prevention": json.loads(r["prevention"]) if r["prevention"] else [],
            "treatments": json.loads(r["treatments"]) if r["treatments"] else {"organic": [], "chemical": []}
        }
    })

# ==============================================================================
# Real Weather Endpoint
# ==============================================================================
@app.route("/api/weather", methods=["GET", "OPTIONS"])
def get_weather_endpoint():
    if request.method == "OPTIONS":
        return "", 200
    lat = float(request.args.get("lat", 28.6139))
    lon = float(request.args.get("lon", 77.2090))
    location = request.args.get("location", "Regional Farm")
    return jsonify(get_real_weather(lat, lon, location))

# ==============================================================================
# Real Database-Backed Insights Endpoint
# ==============================================================================
@app.route("/api/insights", methods=["GET", "OPTIONS"])
def get_insights_endpoint():
    if request.method == "OPTIONS":
        return "", 200
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total_scans FROM scans")
    total_scans = cursor.fetchone()["total_scans"]

    if total_scans == 0:
        conn.close()
        return jsonify({
            "hasData": False,
            "totalScans": 0,
            "message": "Not enough data available to generate insights yet. Scan a crop leaf to begin tracking disease trends and health metrics."
        })

    cursor.execute("SELECT crop, COUNT(*) as count, AVG(confidence) as avg_conf FROM scans GROUP BY crop ORDER BY count DESC")
    crop_breakdown = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT disease, COUNT(*) as count FROM scans GROUP BY disease ORDER BY count DESC")
    disease_breakdown = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT AVG(confidence) as avg_conf FROM scans")
    overall_avg_conf = cursor.fetchone()["avg_conf"]

    conn.close()

    return jsonify({
        "hasData": True,
        "totalScans": total_scans,
        "avgConfidence": round(overall_avg_conf, 1) if overall_avg_conf else 0.0,
        "cropBreakdown": crop_breakdown,
        "diseaseBreakdown": disease_breakdown,
        "primaryCrop": crop_breakdown[0]["crop"] if crop_breakdown else "None"
    })

# ==============================================================================
# Real Platform Statistics
# ==============================================================================
@app.route("/api/stats", methods=["GET", "OPTIONS"])
def get_platform_stats():
    if request.method == "OPTIONS":
        return "", 200
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as user_count FROM users")
    users = cursor.fetchone()["user_count"]

    cursor.execute("SELECT COUNT(*) as scan_count FROM scans")
    scans = cursor.fetchone()["scan_count"]

    cursor.execute("SELECT COUNT(*) as post_count FROM posts")
    posts = cursor.fetchone()["post_count"]

    conn.close()

    return jsonify({
        "success": True,
        "farmersRegistered": users,
        "cropsCovered": 8,
        "totalCropsCataloged": 20,
        "verifiedDiseases": 18,
        "scansCompleted": scans,
        "discussionsCount": posts
    })

# ==============================================================================
# Global Search Endpoint
# ==============================================================================
@app.route("/api/search", methods=["GET", "OPTIONS"])
def global_search():
    if request.method == "OPTIONS":
        return "", 200
    q = request.args.get("q", "").strip().lower()
    if not q:
        return jsonify({"results": []})

    results = []

    crops_list = [
        {"id": "tomato", "name": "Tomato", "category": "Vegetables", "route": "/detect?crop=tomato"},
        {"id": "potato", "name": "Potato", "category": "Tubers", "route": "/detect?crop=potato"},
        {"id": "chili", "name": "Chili", "category": "Spices", "route": "/detect?crop=chili"},
        {"id": "cotton", "name": "Cotton", "category": "Fiber", "route": "/detect?crop=cotton"},
        {"id": "wheat", "name": "Wheat", "category": "Cereals", "route": "/detect?crop=wheat"},
        {"id": "rice", "name": "Rice", "category": "Cereals", "route": "/detect?crop=rice"},
        {"id": "maize", "name": "Maize", "category": "Cereals", "route": "/detect?crop=maize"},
        {"id": "soybean", "name": "Soybean", "category": "Legumes", "route": "/detect?crop=soybean"},
    ]
    for c in crops_list:
        if q in c["name"].lower() or q in c["category"].lower():
            results.append({
                "type": "crop",
                "title": c["name"],
                "subtitle": f"Crop Category: {c['category']}",
                "route": c["route"]
            })

    diseases_list = [
        {"name": "Early Blight", "crop": "Tomato", "type": "Fungal", "route": "/library?disease=early-blight"},
        {"name": "Late Blight", "crop": "Potato", "type": "Oomycete", "route": "/library?disease=late-blight"},
        {"name": "Bacterial Spot", "crop": "Chili", "type": "Bacterial", "route": "/library?disease=bacterial-spot"},
        {"name": "Bacterial Blight", "crop": "Cotton", "type": "Bacterial", "route": "/library?disease=bacterial-blight"},
        {"name": "Leaf Rust", "crop": "Wheat", "type": "Fungal", "route": "/library?disease=leaf-rust"},
        {"name": "Rice Blast", "crop": "Rice", "type": "Fungal", "route": "/library?disease=rice-blast"},
        {"name": "Maize Streak Virus", "crop": "Maize", "type": "Viral", "route": "/library?disease=maize-streak"},
        {"name": "Soybean Rust", "crop": "Soybean", "type": "Fungal", "route": "/library?disease=soybean-rust"},
    ]
    for d in diseases_list:
        if q in d["name"].lower() or q in d["crop"].lower() or q in d["type"].lower():
            results.append({
                "type": "disease",
                "title": d["name"],
                "subtitle": f"{d['crop']} — {d['type']} Disease",
                "route": d["route"]
            })

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, crop_tag, author_name FROM posts
        WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(crop_tag) LIKE ?
        LIMIT 5
    """, (f"%{q}%", f"%{q}%", f"%{q}%"))
    for r in cursor.fetchall():
        results.append({
            "type": "community",
            "title": r["title"],
            "subtitle": f"Discussion by {r['author_name']} ({r['crop_tag'] or 'General'})",
            "route": "/community"
        })
    conn.close()

    return jsonify({"results": results})


# ==============================================================================
# Authenticated User Dashboard & My Crops Endpoints
# ==============================================================================
@app.route("/api/dashboard", methods=["GET", "OPTIONS"])
def get_user_dashboard():
    if request.method == "OPTIONS":
        return "", 200

    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"success": False, "error": "User ID is required."}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 1. User details
    cursor.execute("SELECT id, name, email, role, avatar_url, location, bio, created_at FROM users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    if not user_row:
        conn.close()
        return jsonify({"success": False, "error": "User account not found."}), 404

    user = dict(user_row)

    # 2. Scans statistics for this user
    cursor.execute("SELECT COUNT(*) as total FROM scans WHERE user_id = ?", (user_id,))
    total_scans = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as diseased FROM scans WHERE user_id = ? AND LOWER(severity) != 'healthy'", (user_id,))
    diseased_scans = cursor.fetchone()["diseased"]

    cursor.execute("SELECT COUNT(*) as healthy FROM scans WHERE user_id = ? AND LOWER(severity) == 'healthy'", (user_id,))
    healthy_scans = cursor.fetchone()["healthy"]

    cursor.execute("SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", (user_id,))
    latest_scan_row = cursor.fetchone()

    last_scan_date = None
    last_scan_time = None
    if latest_scan_row:
        try:
            dt = datetime.fromisoformat(latest_scan_row["created_at"])
            last_scan_date = dt.strftime("%d %b %Y")
            last_scan_time = dt.strftime("%I:%M %p")
        except Exception:
            last_scan_date = latest_scan_row["created_at"][:10]
            last_scan_time = ""

    # 3. User Crops count and list
    cursor.execute("SELECT * FROM user_crops WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    user_crops_rows = cursor.fetchall()
    my_crops = []
    for uc in user_crops_rows:
        crop_name = uc["crop_name"]
        cursor.execute("SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND LOWER(crop) = LOWER(?)", (user_id, crop_name))
        c_scans = cursor.fetchone()["count"]
        my_crops.append({
            "id": uc["id"],
            "name": crop_name,
            "image": uc["crop_image"],
            "plantedDate": uc["planted_date"],
            "scanCount": c_scans,
            "areaAcres": uc["area_acres"]
        })

    # 4. Recent Scans (up to 4 scans)
    cursor.execute("SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 4", (user_id,))
    recent_scans_rows = cursor.fetchall()
    recent_scans = []
    for r in recent_scans_rows:
        try:
            symptoms = json.loads(r["symptoms"]) if r["symptoms"] else []
        except Exception:
            symptoms = []
        try:
            treatments = json.loads(r["treatments"]) if r["treatments"] else {}
        except Exception:
            treatments = {}

        formatted_date = ""
        try:
            dt = datetime.fromisoformat(r["created_at"])
            formatted_date = dt.strftime("%d %b %Y, %I:%M %p")
        except Exception:
            formatted_date = r["created_at"]

        recent_scans.append({
            "id": r["id"],
            "crop": r["crop"],
            "disease": r["disease"],
            "scientificName": r["scientific_name"],
            "confidence": r["confidence"],
            "severity": r["severity"],
            "imageUrl": r["image_url"],
            "createdAt": r["created_at"],
            "formattedDate": formatted_date,
            "symptoms": symptoms,
            "treatments": treatments
        })

    # 5. Crop Health Overview calculations
    healthy_percent = round((healthy_scans / total_scans) * 100, 1) if total_scans > 0 else 0
    diseased_percent = round((diseased_scans / total_scans) * 100, 1) if total_scans > 0 else 0
    needs_attention_scans = total_scans - healthy_scans - diseased_scans
    needs_attention_percent = 0 if total_scans == 0 else round((needs_attention_scans / total_scans) * 100, 1)

    # Distinct crops needing attention (with high/moderate/severe disease)
    cursor.execute("""
        SELECT COUNT(DISTINCT crop) as count FROM scans
        WHERE user_id = ? AND LOWER(severity) IN ('high', 'moderate', 'severe')
    """, (user_id,))
    crops_needing_attention = cursor.fetchone()["count"]

    # 6. Unread Notifications count
    cursor.execute("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0", (user_id,))
    unread_notifications = cursor.fetchone()["count"]

    # 7. Latest Community Post
    cursor.execute("""
        SELECT p.*,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
        FROM posts p
        ORDER BY p.created_at DESC LIMIT 1
    """)
    latest_post_row = cursor.fetchone()
    latest_post = None
    if latest_post_row:
        p = latest_post_row
        latest_post = {
            "id": p["id"],
            "authorName": p["author_name"],
            "authorRole": p["author_role"],
            "authorAvatar": p["author_avatar"] or "/community_assets/avatar_priya.jpg",
            "title": p["title"],
            "content": p["content"],
            "imageUrl": p["image_url"],
            "likesCount": p["likes_count"],
            "commentsCount": p["comments_count"],
            "timeAgo": "Recently",
            "createdAt": p["created_at"]
        }

    # 8. Dynamic AI Recommendations based on REAL data
    recommendations = []
    if diseased_scans > 0:
        cursor.execute("SELECT crop, disease FROM scans WHERE user_id = ? AND LOWER(severity) != 'healthy' ORDER BY created_at DESC LIMIT 2", (user_id,))
        for dis_row in cursor.fetchall():
            c_name = dis_row["crop"]
            d_name = dis_row["disease"]
            recommendations.append({
                "id": f"rec-{c_name}-{d_name}",
                "type": "disease",
                "icon": "leaf",
                "title": f"Monitor {c_name} crops",
                "description": f"Recent scans show signs of {d_name}. Keep an eye on foliage and maintain canopy aeration.",
                "route": "/library"
            })

    recommendations.append({
        "id": "rec-weather",
        "type": "weather",
        "icon": "cloud-rain",
        "title": "Weather Risk Advisory",
        "description": "Monitor local humidity levels. Reduce overhead sprinkler irrigation to avoid fungal spore germination.",
        "route": "/insights"
    })

    if len(my_crops) > 0:
        c_first = my_crops[0]["name"]
        recommendations.append({
            "id": f"rec-soil-{c_first}",
            "type": "soil",
            "icon": "sprout",
            "title": f"Improve {c_first} Soil Health",
            "description": f"Ensure balanced potassium and organic compost for robust pathogen resistance in {c_first}.",
            "route": "/crops"
        })

    conn.close()

    return jsonify({
        "success": True,
        "user": user,
        "stats": {
            "totalScans": total_scans,
            "diseasesDetected": diseased_scans,
            "healthyScans": healthy_scans,
            "lastScanDate": last_scan_date,
            "lastScanTime": last_scan_time,
            "totalCrops": len(my_crops)
        },
        "cropHealthOverview": {
            "totalScans": total_scans,
            "healthyPercent": healthy_percent,
            "diseasedPercent": diseased_percent,
            "needsAttentionPercent": needs_attention_percent,
            "cropsNeedingAttention": crops_needing_attention
        },
        "myCrops": my_crops,
        "recentScans": recent_scans,
        "unreadNotificationsCount": unread_notifications,
        "latestCommunityPost": latest_post,
        "aiRecommendations": recommendations
    })

@app.route("/api/crops/my", methods=["GET", "POST", "OPTIONS"])
def manage_my_crops():
    if request.method == "OPTIONS":
        return "", 200

    if request.method == "POST":
        data = request.get_json(force=True) or {}
        user_id = data.get("userId")
        crop_name = data.get("cropName", "").strip()
        crop_image = data.get("cropImage", "").strip() or "/crops_assets/crop_tomato_2x.jpg"
        planted_date = data.get("plantedDate", "")
        area_acres = float(data.get("areaAcres", 0) or 0)

        if not user_id or not crop_name:
            return jsonify({"success": False, "error": "User ID and Crop Name are required."}), 400

        crop_id = str(uuid.uuid4())
        now_iso = datetime.utcnow().isoformat()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_crops (id, user_id, crop_name, crop_image, planted_date, area_acres, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (crop_id, user_id, crop_name, crop_image, planted_date, area_acres, now_iso))
        conn.commit()
        conn.close()

        return jsonify({"success": True, "cropId": crop_id, "message": f"{crop_name} added to your crops."})

    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"success": True, "crops": []})

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_crops WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    crops = []
    for r in rows:
        c_name = r["crop_name"]
        cursor.execute("SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND LOWER(crop) = LOWER(?)", (user_id, c_name))
        scans_count = cursor.fetchone()["count"]
        crops.append({
            "id": r["id"],
            "name": c_name,
            "image": r["crop_image"],
            "plantedDate": r["planted_date"],
            "scanCount": scans_count,
            "areaAcres": r["area_acres"]
        })
    conn.close()
    return jsonify({"success": True, "crops": crops})

@app.route("/api/crops/my/<crop_id>", methods=["DELETE", "OPTIONS"])
def delete_my_crop(crop_id):
    if request.method == "OPTIONS":
        return "", 200
    user_id = request.args.get("userId")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_crops WHERE id = ? AND user_id = ?", (crop_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Crop removed from your list."})

@app.route("/api/notifications", methods=["GET", "OPTIONS"])
def get_user_notifications():
    if request.method == "OPTIONS":
        return "", 200
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"success": True, "notifications": [], "unreadCount": 0})

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", (user_id,))
    rows = cursor.fetchall()
    notifs = []
    unread = 0
    for r in rows:
        if r["is_read"] == 0:
            unread += 1
        notifs.append({
            "id": r["id"],
            "title": r["title"],
            "message": r["message"],
            "isRead": bool(r["is_read"]),
            "createdAt": r["created_at"]
        })
    conn.close()
    return jsonify({"success": True, "notifications": notifs, "unreadCount": unread})

@app.route("/api/notifications/read-all", methods=["POST", "OPTIONS"])
def mark_all_notifications_read():
    if request.method == "OPTIONS":
        return "", 200
    user_id = request.args.get("userId") or (request.get_json(silent=True) or {}).get("userId")
    if user_id:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
        conn.commit()
        conn.close()
    return jsonify({"success": True})


# ==============================================================================
# 7 AUTHENTICATED ACCOUNT PAGES ENDPOINTS
# ==============================================================================

@app.route("/api/user/profile", methods=["GET", "PUT", "OPTIONS"])
def user_profile_endpoint():
    if request.method == "OPTIONS":
        return "", 200
    
    if request.method == "GET":
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        u = cursor.fetchone()
        if not u:
            conn.close()
            return jsonify({"success": False, "error": "User not found"}), 404
        
        # Real statistics calculated from DB
        cursor.execute("SELECT COUNT(*) as count FROM scans WHERE user_id = ?", (user_id,))
        total_scans = cursor.fetchone()["count"]
        
        cursor.execute("SELECT COUNT(*) as count FROM user_crops WHERE user_id = ?", (user_id,))
        total_crops = cursor.fetchone()["count"]
        
        cursor.execute("SELECT COUNT(*) as count FROM saved_items WHERE user_id = ?", (user_id,))
        total_saved = cursor.fetchone()["count"]
        
        cursor.execute("SELECT COUNT(*) as count FROM posts WHERE user_id = ?", (user_id,))
        total_posts = cursor.fetchone()["count"]
        
        cols = u.keys()
        user_data = {
            "id": u["id"],
            "name": u["name"],
            "email": u["email"],
            "role": u["role"],
            "avatarUrl": u["avatar_url"],
            "location": u["location"],
            "bio": u["bio"],
            "phone": u["phone"] if "phone" in cols else "",
            "farmSize": u["farm_size"] if "farm_size" in cols else 0,
            "primaryCrops": u["primary_crops"] if "primary_crops" in cols else "",
            "farmingType": u["farming_type"] if "farming_type" in cols else "Organic",
            "soilType": u["soil_type"] if "soil_type" in cols else "Loamy",
            "language": u["language"] if "language" in cols else "English",
            "measurementUnit": u["measurement_unit"] if "measurement_unit" in cols else "Metric",
            "newsletter": bool(u["newsletter"]) if "newsletter" in cols else True,
            "createdAt": u["created_at"]
        }
        
        stats = {
            "totalScans": total_scans,
            "myCrops": total_crops,
            "savedItems": total_saved,
            "communityPosts": total_posts
        }
        conn.close()
        return jsonify({"success": True, "user": user_data, "stats": stats})

    if request.method == "PUT":
        data = request.get_json(force=True) or {}
        user_id = data.get("userId")
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        name = data.get("name")
        role = data.get("role")
        location = data.get("location")
        bio = data.get("bio")
        phone = data.get("phone")
        farm_size = data.get("farmSize")
        primary_crops = data.get("primaryCrops")
        farming_type = data.get("farmingType")
        soil_type = data.get("soilType")
        language = data.get("language")
        measurement_unit = data.get("measurementUnit")
        avatar_url = data.get("avatarUrl")
        
        updates = []
        params = []
        if name is not None: updates.append("name = ?"); params.append(name.strip())
        if role is not None: updates.append("role = ?"); params.append(role.strip())
        if location is not None: updates.append("location = ?"); params.append(location.strip())
        if bio is not None: updates.append("bio = ?"); params.append(bio.strip())
        if phone is not None: updates.append("phone = ?"); params.append(phone.strip())
        if farm_size is not None: updates.append("farm_size = ?"); params.append(float(farm_size or 0))
        if primary_crops is not None: updates.append("primary_crops = ?"); params.append(primary_crops.strip())
        if farming_type is not None: updates.append("farming_type = ?"); params.append(farming_type.strip())
        if soil_type is not None: updates.append("soil_type = ?"); params.append(soil_type.strip())
        if language is not None: updates.append("language = ?"); params.append(language.strip())
        if measurement_unit is not None: updates.append("measurement_unit = ?"); params.append(measurement_unit.strip())
        if avatar_url is not None: updates.append("avatar_url = ?"); params.append(avatar_url.strip())
        
        if updates:
            updates.append("updated_at = ?")
            params.append(datetime.utcnow().isoformat())
            params.append(user_id)
            cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", tuple(params))
            conn.commit()
        
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        u = cursor.fetchone()
        conn.close()
        
        cols = u.keys()
        return jsonify({
            "success": True,
            "message": "Profile updated successfully.",
            "user": {
                "id": u["id"],
                "name": u["name"],
                "email": u["email"],
                "role": u["role"],
                "avatarUrl": u["avatar_url"],
                "location": u["location"],
                "bio": u["bio"],
                "phone": u["phone"] if "phone" in cols else "",
                "farmSize": u["farm_size"] if "farm_size" in cols else 0,
                "primaryCrops": u["primary_crops"] if "primary_crops" in cols else "",
                "farmingType": u["farming_type"] if "farming_type" in cols else "Organic",
                "soilType": u["soil_type"] if "soil_type" in cols else "Loamy",
                "language": u["language"] if "language" in cols else "English",
                "measurementUnit": u["measurement_unit"] if "measurement_unit" in cols else "Metric"
            }
        })

@app.route("/api/user/public/<user_id>", methods=["GET", "OPTIONS"])
def public_user_profile(user_id):
    if request.method == "OPTIONS":
        return "", 200
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, role, avatar_url, location, bio, created_at FROM users WHERE id = ?", (user_id,))
    u = cursor.fetchone()
    if not u:
        conn.close()
        return jsonify({"success": False, "error": "User not found"}), 404
    
    cursor.execute("SELECT COUNT(*) as count FROM scans WHERE user_id = ?", (user_id,))
    scans_count = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM user_crops WHERE user_id = ?", (user_id,))
    crops_count = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM posts WHERE user_id = ?", (user_id,))
    posts_count = cursor.fetchone()["count"]
    conn.close()
    
    return jsonify({
        "success": True,
        "profile": {
            "id": u["id"],
            "name": u["name"],
            "role": u["role"],
            "avatarUrl": u["avatar_url"],
            "location": u["location"],
            "bio": u["bio"],
            "memberSince": u["created_at"],
            "scansCount": scans_count,
            "cropsCount": crops_count,
            "postsCount": posts_count
        }
    })

@app.route("/api/crops/my/<crop_id>", methods=["PUT"])
def update_my_crop(crop_id):
    data = request.get_json(force=True) or {}
    user_id = data.get("userId")
    crop_name = data.get("cropName")
    crop_image = data.get("cropImage")
    planted_date = data.get("plantedDate")
    area_acres = data.get("areaAcres")
    status = data.get("status")
    
    conn = get_db()
    cursor = conn.cursor()
    
    updates = []
    params = []
    if crop_name: updates.append("crop_name = ?"); params.append(crop_name.strip())
    if crop_image: updates.append("crop_image = ?"); params.append(crop_image.strip())
    if planted_date is not None: updates.append("planted_date = ?"); params.append(planted_date.strip())
    if area_acres is not None: updates.append("area_acres = ?"); params.append(float(area_acres or 0))
    if status is not None: updates.append("status = ?"); params.append(status.strip())
    
    if updates:
        params.extend([crop_id, user_id])
        cursor.execute(f"UPDATE user_crops SET {', '.join(updates)} WHERE id = ? AND user_id = ?", tuple(params))
        conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Crop updated successfully."})

@app.route("/api/scans/history", methods=["GET", "DELETE", "OPTIONS"])
def scans_history_endpoint():
    if request.method == "OPTIONS":
        return "", 200
    
    if request.method == "DELETE":
        scan_id = request.args.get("scanId") or request.view_args.get("scan_id")
        user_id = request.args.get("userId")
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM scans WHERE id = ? AND user_id = ?", (scan_id, user_id))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Scan record deleted."})
    
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"success": True, "scans": []})
    
    time_filter = request.args.get("filter", "all")
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM scans WHERE user_id = ?"
    params = [user_id]
    
    now = datetime.utcnow()
    if time_filter == "7days":
        dt_thresh = (now - timedelta(days=7)).isoformat()
        query += " AND created_at >= ?"
        params.append(dt_thresh)
    elif time_filter == "30days":
        dt_thresh = (now - timedelta(days=30)).isoformat()
        query += " AND created_at >= ?"
        params.append(dt_thresh)
    elif time_filter == "year":
        query += " AND created_at LIKE ?"
        params.append(f"{now.year}%")
        
    query += " ORDER BY created_at DESC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    
    scans = []
    for r in rows:
        try: symptoms = json.loads(r["symptoms"]) if r["symptoms"] else []
        except: symptoms = []
        try: treatments = json.loads(r["treatments"]) if r["treatments"] else {}
        except: treatments = {}
        formatted_date = ""
        try:
            dt = datetime.fromisoformat(r["created_at"])
            formatted_date = dt.strftime("%d %b %Y, %I:%M %p")
        except:
            formatted_date = r["created_at"]
            
        scans.append({
            "id": r["id"],
            "crop": r["crop"],
            "disease": r["disease"],
            "scientificName": r["scientific_name"],
            "confidence": r["confidence"],
            "severity": r["severity"],
            "imageUrl": r["image_url"],
            "createdAt": r["created_at"],
            "formattedDate": formatted_date,
            "symptoms": symptoms,
            "treatments": treatments
        })
    conn.close()
    return jsonify({"success": True, "scans": scans})

@app.route("/api/saved", methods=["GET", "POST", "DELETE", "OPTIONS"])
def saved_items_endpoint():
    if request.method == "OPTIONS":
        return "", 200
    
    if request.method == "GET":
        user_id = request.args.get("userId")
        item_type = request.args.get("type", "all").lower()
        if not user_id:
            return jsonify({"success": True, "saved": []})
        
        conn = get_db()
        cursor = conn.cursor()
        query = "SELECT * FROM saved_items WHERE user_id = ?"
        params = [user_id]
        if item_type in ["crop", "crops"]:
            query += " AND item_type = 'crop'"
        elif item_type in ["disease", "diseases"]:
            query += " AND item_type = 'disease'"
        elif item_type in ["post", "posts", "community"]:
            query += " AND item_type = 'post'"
        elif item_type in ["article", "articles"]:
            query += " AND item_type = 'article'"
            
        query += " ORDER BY created_at DESC"
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        items = []
        for r in rows:
            items.append({
                "id": r["id"],
                "itemType": r["item_type"],
                "itemId": r["item_id"],
                "title": r["title"],
                "subtitle": r["subtitle"],
                "imageUrl": r["image_url"],
                "route": r["route"],
                "createdAt": r["created_at"]
            })
        conn.close()
        return jsonify({"success": True, "saved": items})
        
    if request.method == "POST":
        data = request.get_json(force=True) or {}
        user_id = data.get("userId")
        item_type = (data.get("itemType") or "crop").lower()
        item_id = data.get("itemId")
        title = data.get("title", "")
        subtitle = data.get("subtitle", "")
        image_url = data.get("imageUrl", "")
        route = data.get("route", "")
        
        if not user_id or not item_id or not title:
            return jsonify({"success": False, "error": "Missing required fields"}), 400
            
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM saved_items WHERE user_id = ? AND item_type = ? AND item_id = ?", (user_id, item_type, item_id))
        existing = cursor.fetchone()
        if existing:
            cursor.execute("DELETE FROM saved_items WHERE id = ?", (existing["id"],))
            conn.commit()
            conn.close()
            return jsonify({"success": True, "isSaved": False, "message": "Removed from saved items."})
        else:
            saved_id = str(uuid.uuid4())
            now_iso = datetime.utcnow().isoformat()
            cursor.execute("""
                INSERT INTO saved_items (id, user_id, item_type, item_id, title, subtitle, image_url, route, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (saved_id, user_id, item_type, item_id, title, subtitle, image_url, route, now_iso))
            conn.commit()
            conn.close()
            return jsonify({"success": True, "isSaved": True, "id": saved_id, "message": "Added to saved items."})

@app.route("/api/saved/<saved_id>", methods=["DELETE", "OPTIONS"])
def delete_saved_item(saved_id):
    if request.method == "OPTIONS":
        return "", 200
    user_id = request.args.get("userId")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM saved_items WHERE id = ? AND user_id = ?", (saved_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Removed from saved items."})

@app.route("/api/user/settings", methods=["GET", "PUT", "OPTIONS"])
def user_settings_endpoint():
    if request.method == "OPTIONS":
        return "", 200
    
    if request.method == "GET":
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_settings WHERE user_id = ?", (user_id,))
        s = cursor.fetchone()
        if not s:
            # Create default settings row
            now_iso = datetime.utcnow().isoformat()
            cursor.execute("""
                INSERT INTO user_settings (user_id, scan_results, disease_alerts, community_activity, crop_reminders, appearance, language, updated_at)
                VALUES (?, 1, 1, 1, 1, 'light', 'English', ?)
            """, (user_id, now_iso))
            conn.commit()
            cursor.execute("SELECT * FROM user_settings WHERE user_id = ?", (user_id,))
            s = cursor.fetchone()
            
        settings_data = {
            "scanResults": bool(s["scan_results"]),
            "diseaseAlerts": bool(s["disease_alerts"]),
            "communityActivity": bool(s["community_activity"]),
            "cropReminders": bool(s["crop_reminders"]),
            "appearance": s["appearance"],
            "language": s["language"]
        }
        conn.close()
        return jsonify({"success": True, "settings": settings_data})

    if request.method == "PUT":
        data = request.get_json(force=True) or {}
        user_id = data.get("userId")
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 400
            
        scan_results = int(bool(data.get("scanResults", True)))
        disease_alerts = int(bool(data.get("diseaseAlerts", True)))
        community_activity = int(bool(data.get("communityActivity", True)))
        crop_reminders = int(bool(data.get("cropReminders", True)))
        appearance = data.get("appearance", "light")
        language = data.get("language", "English")
        now_iso = datetime.utcnow().isoformat()
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_settings (user_id, scan_results, disease_alerts, community_activity, crop_reminders, appearance, language, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                scan_results=excluded.scan_results,
                disease_alerts=excluded.disease_alerts,
                community_activity=excluded.community_activity,
                crop_reminders=excluded.crop_reminders,
                appearance=excluded.appearance,
                language=excluded.language,
                updated_at=excluded.updated_at
        """, (user_id, scan_results, disease_alerts, community_activity, crop_reminders, appearance, language, now_iso))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Preferences saved successfully."})

@app.route("/api/auth/change-password", methods=["POST", "OPTIONS"])
def change_password_endpoint():
    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json(force=True) or {}
    user_id = data.get("userId")
    current_password = data.get("currentPassword", "")
    new_password = data.get("newPassword", "")
    
    if not user_id or not current_password or not new_password:
        return jsonify({"success": False, "error": "All fields are required."}), 400
        
    if len(new_password) < 6:
        return jsonify({"success": False, "error": "New password must be at least 6 characters."}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({"success": False, "error": "User account not found."}), 404
        
    curr_hash = hash_password(current_password)
    if user["password_hash"] != curr_hash:
        conn.close()
        return jsonify({"success": False, "error": "Current password does not match."}), 400
        
    new_hash = hash_password(new_password)
    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Password updated securely."})

@app.route("/api/auth/account", methods=["DELETE", "OPTIONS"])
def delete_account_endpoint():
    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json(force=True) or {}
    user_id = data.get("userId")
    if not user_id:
        return jsonify({"success": False, "error": "User ID required"}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    
    # Real database deletion across all related user tables
    cursor.execute("DELETE FROM scans WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM user_crops WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM saved_items WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM user_settings WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM likes WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM comments WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM posts WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Account and all associated records permanently removed."})

@app.route("/api/notifications/<notif_id>/read", methods=["PATCH", "OPTIONS"])
def mark_single_notification_read(notif_id):
    if request.method == "OPTIONS":
        return "", 200
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (notif_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/notifications/<notif_id>", methods=["DELETE", "OPTIONS"])
def delete_single_notification(notif_id):
    if request.method == "OPTIONS":
        return "", 200
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notifications WHERE id = ?", (notif_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("FLASK_DEBUG", "0") in ("1", "true", "True")
    app.run(host=host, port=port, debug=debug)

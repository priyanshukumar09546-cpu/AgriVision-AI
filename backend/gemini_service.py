import os
import json
import urllib.request
import urllib.error

def get_gemini_api_key() -> str:
    """Read Gemini API key from environment."""
    return (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()

def get_gemini_model() -> str:
    """Read Gemini model identifier from backend environment or .env file."""
    model = None
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if k.strip() == "GEMINI_MODEL":
                            val = v.strip().strip("'\"")
                            if val:
                                model = val
                                break
        except Exception:
            pass
    if not model:
        model = os.getenv("GEMINI_MODEL", "gemini-3.6-flash").strip()

    # Enforce active supported model if deprecated model configured
    if not model or "2.5" in model or "1.5" in model or "2.0" in model:
        model = "gemini-3.6-flash"

    os.environ["GEMINI_MODEL"] = model
    return model

def generate_gemini_response(prompt: str, system_instruction: str = None, temperature: float = 0.7) -> dict:
    """
    Secure backend integration with Google Gemini API (v1beta REST API).
    Returns dict with success status, generated text, or structured error details.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        return {
            "success": False,
            "error": "Gemini API key is not configured in the backend environment. Please set GEMINI_API_KEY in backend/.env.",
            "error_type": "MISSING_KEY"
        }

    model = get_gemini_model()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    # Construct request payload for Gemini API
    payload_data = {}

    if system_instruction:
        payload_data["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    payload_data["contents"] = [
        {
            "role": "user",
            "parts": [{"text": prompt}]
        }
    ]

    payload_data["generationConfig"] = {
        "temperature": temperature,
        "maxOutputTokens": 800,
        "topP": 0.95
    }

    body_bytes = json.dumps(payload_data).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body_bytes,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "AgriVisionAI-Backend/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            resp_body = response.read().decode("utf-8")
            data = json.loads(resp_body)
            
            # Parse candidates from Gemini API response
            candidates = data.get("candidates", [])
            if not candidates:
                return {
                    "success": False,
                    "error": "Gemini API returned an empty candidate list.",
                    "error_type": "EMPTY_RESPONSE"
                }

            first_candidate = candidates[0]
            content = first_candidate.get("content", {})
            parts = content.get("parts", [])
            if not parts:
                return {
                    "success": False,
                    "error": "Gemini API returned response without text content.",
                    "error_type": "EMPTY_CONTENT"
                }

            text_output = parts[0].get("text", "").strip()
            return {
                "success": True,
                "text": text_output,
                "model_used": model
            }

    except urllib.error.HTTPError as e:
        status_code = e.code
        err_body = e.read().decode("utf-8") if e.fp else ""
        error_msg = f"Gemini API returned HTTP {status_code}"
        
        try:
            err_json = json.loads(err_body)
            if "error" in err_json:
                error_msg = err_json["error"].get("message", error_msg)
        except Exception:
            pass

        # Check for model compatibility / migration advice from Google API
        if ("no longer available" in error_msg.lower() or "use models/" in error_msg.lower()) and "models/" in error_msg:
            # Extract suggested model from error string (e.g., "models/gemini-3.6-flash")
            import re
            match = re.search(r"models/([a-zA-Z0-9.\-_]+)", error_msg)
            fallback_model = match.group(1) if match else "gemini-3.6-flash"
            
            # Avoid infinite loop if fallback model is identical to requested model
            if fallback_model and fallback_model != model:
                print(f"[Gemini API] Primary model '{model}' unavailable. Auto-migrating to recommended fallback model '{fallback_model}'...")
                # Re-run request with fallback model
                fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/{fallback_model}:generateContent?key={api_key}"
                try:
                    fb_req = urllib.request.Request(
                        fallback_url,
                        data=body_bytes,
                        headers={
                            "Content-Type": "application/json",
                            "User-Agent": "AgriVisionAI-Backend/1.0"
                        },
                        method="POST"
                    )
                    with urllib.request.urlopen(fb_req, timeout=30) as fb_resp:
                        fb_data = json.loads(fb_resp.read().decode("utf-8"))
                        fb_candidates = fb_data.get("candidates", [])
                        if fb_candidates:
                            parts = fb_candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                return {
                                    "success": True,
                                    "text": parts[0].get("text", "").strip(),
                                    "model_used": fallback_model
                                }
                except Exception as fb_err:
                    print(f"[Gemini API] Fallback model '{fallback_model}' also failed: {fb_err}")

        if status_code in (401, 403):
            return {
                "success": False,
                "error": "Authentication failed with Gemini API. Invalid or unauthorized API key.",
                "error_type": "AUTH_ERROR",
                "status_code": status_code
            }
        elif status_code == 429:
            return {
                "success": False,
                "error": "Gemini API quota or rate limit exceeded. Please try again in a few moments.",
                "error_type": "QUOTA_EXCEEDED",
                "status_code": status_code
            }
        elif status_code >= 500:
            return {
                "success": False,
                "error": "Google Gemini API service is temporarily unavailable. Please retry later.",
                "error_type": "SERVICE_UNAVAILABLE",
                "status_code": status_code
            }
        else:
            return {
                "success": False,
                "error": error_msg,
                "error_type": "API_ERROR",
                "status_code": status_code
            }

    except urllib.error.URLError as e:
        return {
            "success": False,
            "error": "Unable to connect to Google Gemini API. Please check internet connection.",
            "error_type": "NETWORK_ERROR"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Unexpected error communicating with Gemini API: {str(e)}",
            "error_type": "UNKNOWN_ERROR"
        }

def explain_disease_with_gemini(crop: str, disease: str, severity: str, symptoms: list = None, causes: list = None) -> dict:
    """
    Generates tailored agronomic advice explaining a detected crop disease using Gemini AI.
    """
    system_prompt = (
        "You are AgriVision AI's Senior Agronomist and Plant Pathologist. "
        "Provide concise, highly practical, practical agricultural guidance for farmers. "
        "Focus on actionable steps, organic treatments, chemical intervention precautions, and prevention. "
        "Keep the tone encouraging, professional, and clear."
    )

    user_prompt = (
        f"A leaf scan of a {crop} crop diagnosed '{disease}' with {severity} severity.\n"
        f"Key Symptoms: {', '.join(symptoms) if symptoms else 'Visible foliar lesions'}.\n"
        f"Known Causes: {', '.join(causes) if causes else 'Fungal/bacterial pathogen'}.\n\n"
        f"Please provide:\n"
        f"1. A concise explanation of why this outbreak happens.\n"
        f"2. Immediate emergency action steps for the farmer.\n"
        f"3. Long-term soil & canopy management tip for preventing recurrence."
    )

    return generate_gemini_response(user_prompt, system_instruction=system_prompt, temperature=0.4)

def answer_farmer_query(query: str, crop_context: str = None) -> dict:
    """
    Powers AgriVision AI's Interactive Agricultural Assistant.
    """
    system_prompt = (
        "You are AgriVision AI's intelligent farming assistant. "
        "Answer agricultural questions accurately, concisely, and specifically. "
        "Cover topics like crop health, soil fertility, irrigation, pest management, and sustainable farming. "
        "Do not answer non-agricultural queries; politely redirect the user back to farming topics if needed."
    )

    prompt = f"User Question: {query}"
    if crop_context:
        prompt = f"Selected Crop Context: {crop_context}\n" + prompt

    return generate_gemini_response(prompt, system_instruction=system_prompt, temperature=0.6)

"""
AgriVision AI - Automated Inference Consistency Test Suite
Tests crop derivation and crop-disease consistency across Tomato, Corn, Potato, Apple,
low-confidence state handling, and end-to-end Flask /api/detect execution.
"""

import os
import sys
import io
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"

sys.path.append(str(BASE_DIR))
sys.path.append(str(BACKEND_DIR))

from backend.ai_engine import extract_crop_and_disease_from_class, analyze_leaf_image

def test_crop_derivation_unit_tests():
    print("==================================================")
    print("1. CLASS -> CROP DERIVATION UNIT TESTS")
    print("==================================================")

    test_cases = [
        ("Tomato___Early_blight", "Tomato", "Early Blight"),
        ("Corn_(maize)___Northern_Leaf_Blight", "Corn (maize)", "Northern Leaf Blight"),
        ("Potato___Late_blight", "Potato", "Late Blight"),
        ("Apple___Apple_scab", "Apple", "Apple Scab"),
        ("Pepper,_bell___Bacterial_spot", "Pepper (Bell)", "Bacterial Spot"),
        ("Cherry_(including_sour)___Powdery_mildew", "Cherry", "Powdery Mildew"),
        ("Grape___Black_rot", "Grape", "Black Rot"),
        ("Tomato___healthy", "Tomato", "Healthy Crop Leaf")
    ]

    for class_name, expected_crop, expected_disease in test_cases:
        crop, disease = extract_crop_and_disease_from_class(class_name)
        print(f"Class: '{class_name}' -> Derived Crop: '{crop}', Derived Disease: '{disease}'")
        assert crop == expected_crop, f"Mismatch for {class_name}: expected crop '{expected_crop}', got '{crop}'"
        assert disease == expected_disease, f"Mismatch for {class_name}: expected disease '{expected_disease}', got '{disease}'"

    print("[PASS] All Class -> Crop derivation unit tests passed 100%!\n")

def test_low_confidence_crop_consistency():
    print("==================================================")
    print("2. LOW-CONFIDENCE CROP CONSISTENCY TEST")
    print("==================================================")

    from scripts.train_and_save_checkpoint import generate_sample
    test_img = generate_sample("Corn_(maize)___Northern_Leaf_Blight", seed=42)
    img_path = str(BACKEND_DIR / "test_corn_leaf.jpg")
    test_img.save(img_path)

    # Call analyze_leaf_image passing crop override attempt 'tomato'
    res = analyze_leaf_image(img_path, selected_crop="tomato")
    
    if os.path.exists(img_path):
        os.remove(img_path)

    print("Analyze Leaf Image Result:\n", json.dumps(res, indent=2))

    assert res["success"] is True, "Analysis failed"
    # Even if selected_crop='tomato' was passed in arguments, crop MUST NEVER be Tomato if class is Corn!
    predicted_cls = res.get("predictedClass", "")
    crop_res = res.get("crop", "")

    expected_crop, _ = extract_crop_and_disease_from_class(predicted_cls)
    print(f"Predicted Class: '{predicted_cls}' | Returned Crop: '{crop_res}' | Expected Crop: '{expected_crop}'")

    assert crop_res == expected_crop, f"Crop override bug detected! Returned '{crop_res}' instead of '{expected_crop}'"
    print("[PASS] Low-confidence crop consistency test passed! Frontend crop override rejected successfully.\n")

def test_flask_api_consistency():
    print("==================================================")
    print("3. FLASK /api/detect END-TO-END CONSISTENCY TEST")
    print("==================================================")

    from app import app
    client = app.test_client()

    from scripts.train_and_save_checkpoint import generate_sample
    test_img = generate_sample("Corn_(maize)___Northern_Leaf_Blight", seed=99)
    img_byte_arr = io.BytesIO()
    test_img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)

    # Intentionally pass cropId='tomato' to test that backend DOES NOT override ML predicted crop!
    data = {
        'file': (img_byte_arr, 'test_corn_field.jpg'),
        'cropId': 'tomato'
    }

    response = client.post('/api/detect', data=data, content_type='multipart/form-data')
    res_json = json.loads(response.data.decode('utf-8'))

    print("HTTP Status Code:", response.status_code)
    print("API Response Body:\n", json.dumps(res_json, indent=2))

    assert response.status_code == 200, f"Error: HTTP {response.status_code}"
    assert res_json.get("success") is True, "Error: success=False"

    # Crop returned by API MUST NOT be Tomato if ML predicted class is Corn!
    ret_crop = res_json.get("crop")
    assert ret_crop != "Tomato", f"CRITICAL BUG: API returned crop '{ret_crop}' from stale frontend request instead of ML predicted class!"
    assert ret_crop == "Corn (maize)" or "Corn" in ret_crop, f"Expected Corn crop, got '{ret_crop}'"

    print(f"[PASS] API returned crop '{ret_crop}' which correctly matches predicted ML class!")

if __name__ == "__main__":
    test_crop_derivation_unit_tests()
    test_low_confidence_crop_consistency()
    test_flask_api_consistency()
    print("\n==================================================")
    print("ALL INFERENCE CONSISTENCY TESTS PASSED 100%")
    print("==================================================")

"""
Automated Test Suite for AgriVision AI Production Crop Disease Detection Pipeline
Tests:
1. Model weights & architecture loading
2. Metadata & class list integrity
3. Image quality validation (rejection of blur, dark, non-plant images)
4. Model inference on real test images
5. Flask API endpoint /api/detect contract
"""

import sys
import json
import io
import os
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

def test_pipeline():
    print("[TEST 1/5] Testing Model & Metadata Checkpoint...")
    model_path = BACKEND_DIR / "plant_disease_model.pth"
    metadata_path = BACKEND_DIR / "model_metadata.json"

    assert model_path.exists(), f"Model checkpoint not found at {model_path}"
    assert metadata_path.exists(), f"Metadata not found at {metadata_path}"

    with open(metadata_path, "r") as f:
        metadata = json.load(f)

    assert "classes" in metadata, "Missing classes in metadata"
    assert len(metadata["classes"]) == 38, f"Expected 38 classes, got {len(metadata['classes'])}"
    assert "confidence_threshold" in metadata, "Missing confidence_threshold"
    print(f"  PASS: Loaded metadata for {metadata['model_architecture']} with {len(metadata['classes'])} classes.")

    print("\n[TEST 2/5] Testing Engine Initialization & Class Mapping...")
    import ai_engine
    model, loaded_meta = ai_engine.load_trained_model()
    assert model is not None, "Failed to load PyTorch model in ai_engine"
    
    # Test class string parser
    crop, disease = ai_engine.extract_crop_and_disease_from_class("Tomato___Early_blight")
    assert crop == "Tomato", f"Expected Tomato, got {crop}"
    assert "Early Blight" in disease, f"Expected Early Blight, got {disease}"
    print(f"  PASS: Class parser correctly mapped Tomato___Early_blight to '{crop}' - '{disease}'.")

    print("\n[TEST 3/5] Testing Image Quality Gate (Blur & Non-Plant Rejection)...")
    # Synthetic blurry image
    blurry_img = np.full((300, 300, 3), 128, dtype=np.uint8)
    q_blur = ai_engine.validate_image_quality(blurry_img)
    assert not q_blur["valid"], "Expected blurry image to fail quality gate"
    print(f"  PASS: Low blur variance caught correctly: {q_blur['error'][:50]}...")

    # Dark image
    dark_img = np.zeros((300, 300, 3), dtype=np.uint8)
    q_dark = ai_engine.validate_image_quality(dark_img)
    assert not q_dark["valid"], "Expected dark image to fail quality gate"
    print(f"  PASS: Dark image caught correctly: {q_dark['error'][:50]}...")

    print("\n[TEST 4/5] Testing Inference on Real Leaf Image...")
    # Find a real image from test dataset
    test_leaf_dir = BASE_DIR / "data" / "processed" / "plantvillage" / "test"
    sample_images = list(test_leaf_dir.glob("*/*.JPG")) + list(test_leaf_dir.glob("*/*.jpg"))
    assert len(sample_images) > 0, "No test images found in data/processed/plantvillage/test"
    
    sample_img_path = str(sample_images[0])
    result = ai_engine.analyze_leaf_image(sample_img_path)
    assert result["success"], f"Inference failed on real leaf image: {result}"
    print(f"  PASS: Successfully analyzed {sample_images[0].name}")
    print(f"        Predicted Class: {result.get('predictedClass')}")
    print(f"        Crop: {result.get('crop')} | Disease: {result.get('disease')}")
    print(f"        Confidence: {result.get('confidence')}%")

    print("\n[TEST 5/5] Testing Flask API /api/detect contract...")
    from app import app
    client = app.test_client()

    with open(sample_img_path, "rb") as img_f:
        data = {
            "file": (io.BytesIO(img_f.read()), "test_leaf.jpg")
        }
        res = client.post("/api/detect", data=data, content_type="multipart/form-data")

    assert res.status_code == 200, f"Expected 200 from /api/detect, got {res.status_code}: {res.data}"
    res_json = res.get_json()
    assert res_json.get("success"), f"API returned failure: {res_json}"
    assert "data" in res_json or "crop" in res_json, f"Unexpected response structure: {res_json}"
    print(f"  PASS: Flask API endpoint /api/detect returned 200 OK with valid response.")

    print("\n================ ALL PIPELINE TESTS PASSED ================")

if __name__ == "__main__":
    test_pipeline()

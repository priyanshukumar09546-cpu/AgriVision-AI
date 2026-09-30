"""
PlantDoc External Real-World Validation Pipeline
1. Downloads legitimate field images directly from the official PlantDoc GitHub repository.
2. Checks for duplicate overlap against PlantVillage using MD5 hash deduplication.
3. Maps compatible classes to standard 38 classes.
4. Evaluates production MobileNetV3 model on real field photography.
5. Computes Top-1, Top-3, Macro/Weighted F1, Per-Class metrics, Confusion Matrix,
   Average Confidence, and Confidence Rejection Rate (<65%).
"""

import os
import sys
import json
import time
import hashlib
import io
import urllib.request
from pathlib import Path
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as transforms
from torchvision.models import mobilenet_v3_large

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
PROCESSED_DIR = DATA_DIR / "processed"
BACKEND_DIR = BASE_DIR / "backend"
MODEL_PATH = BACKEND_DIR / "plant_disease_model.pth"
METADATA_PATH = BACKEND_DIR / "model_metadata.json"
PLANTDOC_DIR = PROCESSED_DIR / "plantdoc" / "test"

# Mapping PlantDoc folder names to Standard 38 Classes
PLANTDOC_CLASS_MAP = {
    "Apple Scab Leaf": "Apple___Apple_scab",
    "Apple rust leaf": "Apple___Cedar_apple_rust",
    "Bell_pepper leaf spot": "Pepper,_bell___Bacterial_spot",
    "Corn Gray leaf spot": "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn leaf blight": "Corn_(maize)___Northern_Leaf_Blight",
    "Corn rust leaf": "Corn_(maize)___Common_rust_",
    "Potato leaf early blight": "Potato___Early_blight",
    "Potato leaf late blight": "Potato___Late_blight",
    "Tomato Early blight leaf": "Tomato___Early_blight",
    "Tomato Septoria leaf spot": "Tomato___Septoria_leaf_spot",
    "Tomato leaf bacterial spot": "Tomato___Bacterial_spot",
    "Tomato leaf late blight": "Tomato___Late_blight",
    "Tomato leaf mosaic virus": "Tomato___Tomato_mosaic_virus",
    "Tomato leaf yellow virus": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato leaf": "Tomato___healthy",
    "grape leaf black rot": "Grape___Black_rot"
}

def get_plantvillage_hashes():
    """Build MD5 hash set of all images in plantvillage to detect data leakage."""
    pv_hashes = set()
    pv_dir = PROCESSED_DIR / "plantvillage"
    for img_p in pv_dir.glob("*/*/*.jpg"):
        try:
            with open(img_p, "rb") as f:
                h = hashlib.md5(f.read()).hexdigest()
                pv_hashes.add(h)
        except Exception:
            pass
    return pv_hashes

def download_plantdoc_dataset(max_per_class=6):
    """Downloads real field test images from PlantDoc GitHub repository."""
    print("==================================================")
    print("[PHASE 1] Preparing PlantDoc External Field Dataset")
    print("==================================================")
    pv_hashes = get_plantvillage_hashes()
    print(f"Loaded {len(pv_hashes)} PlantVillage image hashes for duplicate/leakage check.")

    PLANTDOC_DIR.mkdir(parents=True, exist_ok=True)
    
    # Remove any empty old directories to avoid ImageFolder errors
    for item in PLANTDOC_DIR.iterdir():
        if item.is_dir() and not any(item.iterdir()):
            item.rmdir()

    total_downloaded = 0
    duplicates_rejected = 0

    for pd_folder, std_class in PLANTDOC_CLASS_MAP.items():
        target_dir = PLANTDOC_DIR / std_class
        target_dir.mkdir(parents=True, exist_ok=True)

        existing = list(target_dir.glob("*.jpg")) + list(target_dir.glob("*.png"))
        if len(existing) >= max_per_class:
            total_downloaded += len(existing)
            continue

        folder_encoded = urllib.parse.quote(pd_folder)
        api_url = f"https://api.github.com/repos/pratikkayal/PlantDoc-Dataset/contents/test/{folder_encoded}"

        try:
            req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                files_json = json.loads(resp.read().decode("utf-8"))

            count_for_class = len(existing)
            for item in files_json:
                if count_for_class >= max_per_class:
                    break
                if item["type"] != "file":
                    continue
                download_url = item["download_url"]
                
                try:
                    file_req = urllib.request.Request(download_url, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(file_req, timeout=10) as f_resp:
                        raw_bytes = f_resp.read()

                    # Verify image can be opened
                    img = Image.open(io.BytesIO(raw_bytes))
                    img.verify()

                    # Check for MD5 duplicate / leakage against PlantVillage
                    img_hash = hashlib.md5(raw_bytes).hexdigest()
                    if img_hash in pv_hashes:
                        print(f"  [LEAKAGE REJECT] PlantDoc image {item['name']} matches PlantVillage hash! Skipping.")
                        duplicates_rejected += 1
                        continue

                    # Save verified image
                    safe_stem = Path(item["name"]).stem[:20]
                    save_path = target_dir / f"{safe_stem}.jpg"
                    img_rgb = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
                    img_rgb.save(save_path, "JPEG")
                    count_for_class += 1
                    total_downloaded += 1

                except Exception as dl_err:
                    pass

            print(f"  Class '{std_class}': {count_for_class} images ready.")

        except Exception as api_err:
            print(f"  [API NOTE] Could not fetch folder {pd_folder}: {api_err}")

    # Remove any still-empty directories
    for item in PLANTDOC_DIR.iterdir():
        if item.is_dir() and not any(item.iterdir()):
            item.rmdir()

    print(f"\n[DATASET READY] PlantDoc external field images: {total_downloaded} across {len(list(PLANTDOC_DIR.iterdir()))} classes.")
    print(f"Leakage/Duplicates rejected: {duplicates_rejected}")
    return total_downloaded

def evaluate_on_plantdoc():
    """Evaluates production MobileNetV3 model on PlantDoc field photos."""
    assert MODEL_PATH.exists(), f"Model missing: {MODEL_PATH}"
    assert METADATA_PATH.exists(), f"Metadata missing: {METADATA_PATH}"

    with open(METADATA_PATH, "r") as f:
        metadata = json.load(f)

    classes = metadata["classes"]
    class_to_idx = {c: i for i, c in enumerate(classes)}

    device = torch.device("cpu")
    model = mobilenet_v3_large(weights=None)
    in_features = model.classifier[3].in_features
    model.classifier[3] = torch.nn.Sequential(
        torch.nn.Dropout(p=0.2),
        torch.nn.Linear(in_features, len(classes))
    )
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.eval()

    eval_tf = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    test_samples = []
    for class_dir in PLANTDOC_DIR.iterdir():
        if not class_dir.is_dir():
            continue
        cls_name = class_dir.name
        if cls_name not in class_to_idx:
            continue
        for img_p in class_dir.glob("*.jpg"):
            test_samples.append((str(img_p), class_to_idx[cls_name], cls_name))

    print(f"\n==================================================")
    print(f"[EVALUATION] Running model on {len(test_samples)} PlantDoc real field images...")
    print(f"==================================================")

    y_true = []
    y_pred = []
    y_probs = []
    confidences = []
    rejected_count = 0
    threshold = 0.65

    for img_p, true_idx, true_name in test_samples:
        try:
            pil_img = Image.open(img_p).convert("RGB")
            tensor = eval_tf(pil_img).unsqueeze(0).to(device)
            with torch.no_grad():
                out = model(tensor)
                probs = torch.softmax(out, dim=1)[0].cpu().numpy()
                pred_idx = int(np.argmax(probs))
                conf = float(probs[pred_idx])

            y_true.append(true_idx)
            y_pred.append(pred_idx)
            y_probs.append(probs)
            confidences.append(conf)

            if conf < threshold:
                rejected_count += 1
        except Exception as e:
            print(f"Error evaluating {img_p}: {e}")

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    y_probs = np.array(y_probs)

    # Top-1 & Top-3
    top1_correct = np.sum(y_true == y_pred)
    top1_acc = float(top1_correct / len(y_true))

    top3_correct = 0
    for idx, true_label in enumerate(y_true):
        top3_indices = np.argsort(y_probs[idx])[-3:]
        if true_label in top3_indices:
            top3_correct += 1
    top3_acc = float(top3_correct / len(y_true))

    # Per-class metrics
    present_classes = sorted(list(set(y_true)))
    precisions = []
    recalls = []
    f1s = []
    per_class = {}

    for c in present_classes:
        c_name = classes[c]
        tp = np.sum((y_true == c) & (y_pred == c))
        fp = np.sum((y_true != c) & (y_pred == c))
        fn = np.sum((y_true == c) & (y_pred != c))
        support = int(np.sum(y_true == c))

        p = float(tp / max(tp + fp, 1))
        r = float(tp / max(tp + fn, 1))
        f1 = float((2 * p * r) / max(p + r, 1e-6))

        precisions.append(p)
        recalls.append(r)
        f1s.append(f1)

        per_class[c_name] = {
            "precision": round(p, 4),
            "recall": round(r, 4),
            "f1": round(f1, 4),
            "support": support
        }

    macro_p = float(np.mean(precisions))
    macro_r = float(np.mean(recalls))
    macro_f1 = float(np.mean(f1s))
    weighted_f1 = float(sum(f * per_class[classes[c]]["support"] for f, c in zip(f1s, present_classes)) / len(y_true))

    avg_conf = float(np.mean(confidences))
    rejection_rate = float(rejected_count / len(y_true))

    results = {
        "dataset": "PlantDoc (Singh & Kayal et al., 2019)",
        "sample_count": len(y_true),
        "supported_classes_count": len(present_classes),
        "top1_accuracy": round(top1_acc, 4),
        "top3_accuracy": round(top3_acc, 4),
        "macro_precision": round(macro_p, 4),
        "macro_recall": round(macro_r, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "average_confidence": round(avg_conf, 4),
        "rejection_rate_below_65": round(rejection_rate, 4),
        "rejected_count": rejected_count,
        "per_class": per_class
    }

    print("\n================ PLANTDOC EXTERNAL EVALUATION RESULTS ================")
    print(f"External Field Samples:        {len(y_true)}")
    print(f"Top-1 Field Accuracy:          {top1_acc*100:.2f}%")
    print(f"Top-3 Field Accuracy:          {top3_acc*100:.2f}%")
    print(f"Macro Precision:               {macro_p:.4f}")
    print(f"Macro Recall:                  {macro_r:.4f}")
    print(f"Macro F1-Score:                {macro_f1:.4f}")
    print(f"Weighted F1-Score:             {weighted_f1:.4f}")
    print(f"Average Confidence:            {avg_conf*100:.2f}%")
    print(f"Rejection Rate (<65% conf):    {rejection_rate*100:.2f}% ({rejected_count}/{len(y_true)} samples)")

    print("\n--- Per-Class Performance on Real Field Photos ---")
    for cls_name, m in per_class.items():
        print(f"  {cls_name:<45} Precision: {m['precision']:.2f} | Recall: {m['recall']:.2f} | F1: {m['f1']:.2f} (n={m['support']})")

    # Save to file
    out_path = DATA_DIR / "plantdoc_evaluation_report.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved evaluation report to {out_path}")
    return results

if __name__ == "__main__":
    download_plantdoc_dataset(max_per_class=6)
    evaluate_on_plantdoc()

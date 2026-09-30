"""
AgriVision AI - Baseline Model Benchmarking Script
Evaluates the existing model checkpoint (backend/plant_disease_model.pth)
against the held-out real PlantVillage test dataset (data/processed/plantvillage/test).
Computes exact Top-1 Accuracy, Top-3 Accuracy, Macro Precision, Macro Recall,
Macro F1, per-class metrics, and confusion matrix.
"""

import os
import sys
import json
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
from torchvision import datasets, transforms
from torchvision.models import mobilenet_v3_large

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
MODEL_PATH = BACKEND_DIR / "plant_disease_model.pth"
METADATA_PATH = BACKEND_DIR / "model_metadata.json"
TEST_DIR = BASE_DIR / "data" / "processed" / "plantvillage" / "test"
BASELINE_REPORT_PATH = BASE_DIR / "data" / "baseline_benchmark_report.json"

STANDARD_38_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

def benchmark_baseline():
    print(f"[BENCHMARK] Loading existing model checkpoint from {MODEL_PATH}...")
    if not MODEL_PATH.exists():
        print(f"[ERROR] Baseline model {MODEL_PATH} not found.")
        sys.exit(1)

    device = torch.device("cpu")
    model = mobilenet_v3_large(weights=None)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, len(STANDARD_38_CLASSES))
    )

    checkpoint = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(checkpoint)
    model.eval()

    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    test_dataset = datasets.ImageFolder(root=str(TEST_DIR), transform=eval_transform)
    test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=32, shuffle=False)

    class_names = test_dataset.classes
    num_classes = len(class_names)
    print(f"[BENCHMARK] Evaluating on {len(test_dataset)} real held-out test images across {num_classes} classes...")

    y_true = []
    y_pred_top1 = []
    y_pred_top3 = []

    with torch.no_grad():
        for images, labels in test_loader:
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            _, top1_preds = torch.max(probs, 1)
            _, top3_preds = torch.topk(probs, k=min(3, num_classes), dim=1)

            y_true.extend(labels.numpy())
            y_pred_top1.extend(top1_preds.numpy())
            y_pred_top3.extend(top3_preds.numpy())

    y_true = np.array(y_true)
    y_pred_top1 = np.array(y_pred_top1)
    
    # Top-1 & Top-3 Accuracy
    top1_acc = float(np.mean(y_true == y_pred_top1))
    top3_correct = sum(y_t in p_top3 for y_t, p_top3 in zip(y_true, y_pred_top3))
    top3_acc = float(top3_correct / len(y_true))

    # Confusion Matrix
    conf_matrix = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(y_true, y_pred_top1):
        conf_matrix[t, p] += 1

    per_class_metrics = {}
    precisions = []
    recalls = []
    f1s = []

    for c in range(num_classes):
        cls_name = class_names[c]
        tp = conf_matrix[c, c]
        fp = np.sum(conf_matrix[:, c]) - tp
        fn = np.sum(conf_matrix[c, :]) - tp

        p = float(tp / max(tp + fp, 1))
        r = float(tp / max(tp + fn, 1))
        f1 = float((2 * p * r) / max(p + r, 1e-6))

        precisions.append(p)
        recalls.append(r)
        f1s.append(f1)

        per_class_metrics[cls_name] = {
            "precision": round(p, 4),
            "recall": round(r, 4),
            "f1": round(f1, 4),
            "support": int(np.sum(conf_matrix[c, :]))
        }

    macro_precision = float(np.mean(precisions))
    macro_recall = float(np.mean(recalls))
    macro_f1 = float(np.mean(f1s))

    report = {
        "model_architecture": "MobileNetV3_Large",
        "checkpoint": str(MODEL_PATH.name),
        "dataset_evaluated": "PlantVillage Held-Out Test Set (Real Foliage Images)",
        "total_test_samples": len(y_true),
        "num_classes": num_classes,
        "metrics": {
            "top1_accuracy": round(top1_acc, 4),
            "top3_accuracy": round(top3_acc, 4),
            "macro_precision": round(macro_precision, 4),
            "macro_recall": round(macro_recall, 4),
            "macro_f1": round(macro_f1, 4)
        },
        "per_class": per_class_metrics,
        "confusion_matrix": conf_matrix.tolist()
    }

    with open(BASELINE_REPORT_PATH, 'w') as f:
        json.dump(report, f, indent=2)

    print("\n================ BASELINE BENCHMARK REPORT ================")
    print(f"Total Test Images: {len(y_true)}")
    print(f"Top-1 Accuracy:    {top1_acc * 100:.2f}%")
    print(f"Top-3 Accuracy:    {top3_acc * 100:.2f}%")
    print(f"Macro Precision:   {macro_precision:.4f}")
    print(f"Macro Recall:      {macro_recall:.4f}")
    print(f"Macro F1-Score:    {macro_f1:.4f}")
    print(f"Saved complete baseline report to {BASELINE_REPORT_PATH}")

    return report

if __name__ == "__main__":
    benchmark_baseline()

"""
AgriVision AI - Production Plant Disease Model Training & Evaluation Pipeline
Trains a MobileNetV3 Transfer Learning neural network on real PlantVillage data,
evaluates held-out test split, measures PlantDoc domain-shift accuracy,
and exports deployment-ready PyTorch model checkpoint + model metadata.
"""

import os
import sys
import json
import time
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from torchvision.models import mobilenet_v3_large, MobileNet_V3_Large_Weights

# Directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
PROCESSED_DIR = DATA_DIR / "processed"
BACKEND_DIR = BASE_DIR / "backend"
MODEL_SAVE_PATH = BACKEND_DIR / "plant_disease_model.pth"
METADATA_SAVE_PATH = BACKEND_DIR / "model_metadata.json"

# All 38 Standard PlantVillage Classes
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

def build_transforms():
    """Build data augmentation for training and normalization for evaluation."""
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_test_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    return train_transform, val_test_transform

def create_model(num_classes=38):
    """Create MobileNetV3 Large architecture with pretrained ImageNet backbone."""
    try:
        weights = MobileNet_V3_Large_Weights.DEFAULT
        model = mobilenet_v3_large(weights=weights)
    except Exception:
        model = mobilenet_v3_large(pretrained=True)
    
    # Fine-tune the classifier head for 38 plant disease classes
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, num_classes)
    )
    return model

def calculate_metrics(y_true, y_pred, num_classes=38):
    """Computes exact accuracy, macro precision, recall, F1, and confusion matrix."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    acc = float(np.mean(y_true == y_pred))

    precisions = []
    recalls = []
    f1s = []

    conf_matrix = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(y_true, y_pred):
        conf_matrix[t, p] += 1

    for c in range(num_classes):
        tp = conf_matrix[c, c]
        fp = np.sum(conf_matrix[:, c]) - tp
        fn = np.sum(conf_matrix[c, :]) - tp

        p = tp / max(tp + fp, 1)
        r = tp / max(tp + fn, 1)
        f1 = (2 * p * r) / max(p + r, 1e-6)

        precisions.append(p)
        recalls.append(r)
        f1s.append(f1)

    return {
        "accuracy": round(acc, 4),
        "precision_macro": round(float(np.mean(precisions)), 4),
        "recall_macro": round(float(np.mean(recalls)), 4),
        "f1_macro": round(float(np.mean(f1s)), 4),
        "confusion_matrix": conf_matrix.tolist()
    }

def train_and_evaluate(epochs=5, batch_size=32, lr=1e-3):
    """Main training loop."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[INFO] Training device: {device}")

    train_tf, eval_tf = build_transforms()

    pv_train_dir = PROCESSED_DIR / "plantvillage" / "train"
    pv_val_dir = PROCESSED_DIR / "plantvillage" / "val"
    pv_test_dir = PROCESSED_DIR / "plantvillage" / "test"

    if not pv_train_dir.exists():
        print(f"[ERROR] Processed training directory not found at {pv_train_dir}")
        print("Please run python scripts/download_datasets.py first.")
        sys.exit(1)

    train_dataset = datasets.ImageFolder(root=str(pv_train_dir), transform=train_tf)
    val_dataset = datasets.ImageFolder(root=str(pv_val_dir), transform=eval_tf)
    test_dataset = datasets.ImageFolder(root=str(pv_test_dir), transform=eval_tf)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    class_names = train_dataset.classes
    class_to_idx = train_dataset.class_to_idx
    idx_to_class = {v: k for k, v in class_to_idx.items()}

    print(f"[DATASET] Train samples: {len(train_dataset)}, Val: {len(val_dataset)}, Test: {len(test_dataset)}")
    print(f"[DATASET] Number of classes: {len(class_names)}")

    model = create_model(num_classes=len(class_names)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = 0.0
    start_time = time.time()

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()

            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        scheduler.step()
        epoch_loss = running_loss / total
        epoch_acc = correct / total

        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data).item()
                val_total += labels.size(0)

        val_acc = val_correct / max(val_total, 1)
        print(f"Epoch [{epoch+1}/{epochs}] - Train Loss: {epoch_loss:.4f}, Train Acc: {epoch_acc*100:.2f}% | Val Acc: {val_acc*100:.2f}%")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_SAVE_PATH)

    training_duration = round(time.time() - start_time, 2)
    print(f"[SUCCESS] Model checkpoint saved to {MODEL_SAVE_PATH}")

    # Load best model for evaluation
    model.load_state_dict(torch.load(MODEL_SAVE_PATH, map_location=device))
    model.eval()

    # 1. Held-out PlantVillage Test Evaluation
    pv_preds = []
    pv_targets = []
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            pv_preds.extend(preds.cpu().numpy())
            pv_targets.extend(labels.numpy())

    pv_test_metrics = calculate_metrics(pv_targets, pv_preds, num_classes=len(class_names))
    print("\n================ PlantVillage Test Results ================")
    print(f"Test Accuracy: {pv_test_metrics['accuracy']*100:.2f}%")
    print(f"Macro Precision: {pv_test_metrics['precision_macro']:.4f}")
    print(f"Macro Recall: {pv_test_metrics['recall_macro']:.4f}")
    print(f"Macro F1-Score: {pv_test_metrics['f1_macro']:.4f}")

    # 2. PlantDoc Field-Image Evaluation (Domain Shift)
    pd_test_dir = PROCESSED_DIR / "plantdoc" / "test"
    pd_test_metrics = None
    if pd_test_dir.exists():
        try:
            pd_dataset = datasets.ImageFolder(root=str(pd_test_dir), transform=eval_tf)
            pd_loader = DataLoader(pd_dataset, batch_size=batch_size, shuffle=False)
            pd_preds = []
            pd_targets = []

            # Map PlantDoc class indices to PlantVillage class indices where names match
            pd_class_map = {}
            for pd_cls, pd_idx in pd_dataset.class_to_idx.items():
                for pv_cls, pv_idx in class_to_idx.items():
                    if pd_cls.lower() in pv_cls.lower() or pv_cls.lower() in pd_cls.lower():
                        pd_class_map[pd_idx] = pv_idx
                        break

            with torch.no_grad():
                for images, labels in pd_loader:
                    images = images.to(device)
                    outputs = model(images)
                    _, preds = torch.max(outputs, 1)
                    for l, p in zip(labels.numpy(), preds.cpu().numpy()):
                        if l in pd_class_map:
                            pd_targets.append(pd_class_map[l])
                            pd_preds.append(p)

            if pd_targets:
                pd_test_metrics = calculate_metrics(pd_targets, pd_preds, num_classes=len(class_names))
                print("\n================ PlantDoc Field Test Results ================")
                print(f"Field Test Accuracy: {pd_test_metrics['accuracy']*100:.2f}%")
                print(f"Field Macro F1-Score: {pd_test_metrics['f1_macro']:.4f}")
        except Exception as e:
            print(f"[WARN] Could not evaluate PlantDoc domain shift: {e}")

    # Save comprehensive metadata
    metadata = {
        "model_architecture": "MobileNetV3_Large",
        "num_classes": len(class_names),
        "classes": class_names,
        "class_to_idx": class_to_idx,
        "idx_to_class": idx_to_class,
        "training_summary": {
            "epochs": epochs,
            "batch_size": batch_size,
            "learning_rate": lr,
            "training_duration_seconds": training_duration,
            "best_val_acc": round(float(best_val_acc), 4)
        },
        "plantvillage_test_performance": pv_test_metrics,
        "plantdoc_field_performance": pd_test_metrics,
        "supported_crops": sorted(list(set([c.split("___")[0].replace("_", " ") for c in class_names]))),
        "data_provenance": "data/dataset_provenance.json"
    }

    with open(METADATA_SAVE_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n[DONE] Saved complete model evaluation metadata to {METADATA_SAVE_PATH}")

if __name__ == "__main__":
    train_and_evaluate(epochs=3, batch_size=32)

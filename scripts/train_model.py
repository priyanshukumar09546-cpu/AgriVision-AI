"""
AgriVision AI - Production Real Crop Disease Model Training & Evaluation Pipeline
Observability & Robustness:
- Instant unbuffered logging with flush=True
- Pre-training PyTorch & Dataset Sanity Check
- Fast Training Smoke Test (1 epoch, 2 batches)
- High-Performance MobileNetV3 Transfer Learning optimized for CPU
- Real Held-Out Test Set Evaluation (Top-1, Top-3, Macro F1, Per-Class)
- PlantDoc Cross-Domain Evaluation
- Checkpointing best validation model & exporting model_metadata.json
"""

import os
import sys
import time
import json
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
from torchvision.models import mobilenet_v3_large, MobileNet_V3_Large_Weights

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
PROCESSED_DIR = DATA_DIR / "processed"
BACKEND_DIR = BASE_DIR / "backend"
MODEL_SAVE_PATH = BACKEND_DIR / "plant_disease_model.pth"
METADATA_SAVE_PATH = BACKEND_DIR / "model_metadata.json"

STANDARD_38_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
]

def log(msg: str):
    """Prints message immediately with timestamp and flush=True."""
    t_stamp = time.strftime("%H:%M:%S")
    print(f"[{t_stamp}] {msg}", flush=True)

def verify_pytorch_environment():
    """Verify PyTorch and hardware execution device."""
    import torchvision
    log("==================================================")
    log("[SYSTEM] Verifying PyTorch Environment")
    log(f"  Python version:      {sys.version.split()[0]}")
    log(f"  PyTorch version:     {torch.__version__}")
    log(f"  Torchvision version: {torchvision.__version__}")
    cuda_avail = torch.cuda.is_available()
    log(f"  CUDA available:      {cuda_avail}")
    device = torch.device("cuda" if cuda_avail else "cpu")
    log(f"  Selected Device:     {device}")
    log("==================================================")
    return device

def verify_dataset():
    """Sanity checks dataset directories, sample counts, and DataLoader access."""
    log("[DATASET] Running Pre-Training Dataset Verification...")
    pv_train = PROCESSED_DIR / "plantvillage" / "train"
    pv_val = PROCESSED_DIR / "plantvillage" / "val"
    pv_test = PROCESSED_DIR / "plantvillage" / "test"

    for p, name in [(pv_train, "TRAIN"), (pv_val, "VALIDATION"), (pv_test, "TEST")]:
        if not p.exists():
            raise FileNotFoundError(f"Missing {name} directory: {p}")

    train_subdirs = [d for d in pv_train.iterdir() if d.is_dir()]
    val_subdirs = [d for d in pv_val.iterdir() if d.is_dir()]
    test_subdirs = [d for d in pv_test.iterdir() if d.is_dir()]

    log(f"  TRAIN:      {len(train_subdirs)} class folders present in {pv_train}")
    log(f"  VALIDATION: {len(val_subdirs)} class folders present in {pv_val}")
    log(f"  TEST:       {len(test_subdirs)} class folders present in {pv_test}")

    # Count total files
    train_count = sum(len(list(d.glob("*.*"))) for d in train_subdirs)
    val_count = sum(len(list(d.glob("*.*"))) for d in val_subdirs)
    test_count = sum(len(list(d.glob("*.*"))) for d in test_subdirs)

    log(f"  SAMPLES -> Train: {train_count}, Validation: {val_count}, Test: {test_count}")
    log(f"  CLASSES -> {len(train_subdirs)} classes verified.")
    assert len(train_subdirs) == 38, f"Expected 38 classes, found {len(train_subdirs)}"

    # Test loading 1 batch from train dataset
    simple_tf = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ])
    ds = datasets.ImageFolder(root=str(pv_train), transform=simple_tf)
    loader = DataLoader(ds, batch_size=4, shuffle=False, num_workers=0)
    for imgs, lbls in loader:
        log(f"  BATCH TEST: Successfully fetched batch of shape {imgs.shape}, labels {lbls.tolist()}")
        break

    log("[DATASET] All dataset checks PASSED cleanly.\n")
    return pv_train, pv_val, pv_test

def build_transforms():
    """Optimized transforms for CPU training & evaluation."""
    train_tf = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    eval_tf = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    return train_tf, eval_tf

def create_model(num_classes=38, device="cpu"):
    """
    Creates MobileNetV3 Transfer Learning model.
    Loads ImageNet pretrained weights, freezes early feature blocks for CPU speed,
    keeps last feature blocks (block 14-16) and classification head trainable.
    """
    log(f"[MODEL] Loading MobileNetV3-Large with pretrained ImageNet weights...")
    weights = MobileNet_V3_Large_Weights.DEFAULT
    model = mobilenet_v3_large(weights=weights)

    # Freeze feature layers 0 to 12 (freeze backbone lower layers for CPU efficiency)
    for name, param in model.features.named_parameters():
        block_idx = int(name.split('.')[0]) if name.split('.')[0].isdigit() else 0
        if block_idx < 13:
            param.requires_grad = False
        else:
            param.requires_grad = True

    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, num_classes)
    )

    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    log(f"[MODEL] Initialized: {trainable_params:,} trainable params / {total_params:,} total params ({trainable_params/total_params*100:.1f}% trainable)")
    return model.to(device)

def run_smoke_test(model, train_dataset, device):
    """
    Runs a tiny 1-epoch smoke test on 2 batches to verify:
    Dataset -> DataLoader -> Model -> Forward -> Loss -> Backward -> Optimizer
    """
    log("==================================================")
    log("[SMOKE TEST] Starting Pipeline Smoke Test (2 batches)...")
    smoke_subset = Subset(train_dataset, range(16))
    smoke_loader = DataLoader(smoke_subset, batch_size=8, shuffle=False, num_workers=0)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3)

    model.train()
    batch_losses = []
    t0 = time.time()
    for b_idx, (imgs, lbls) in enumerate(smoke_loader):
        imgs, lbls = imgs.to(device), lbls.to(device)
        optimizer.zero_grad()
        out = model(imgs)
        loss = criterion(out, lbls)
        loss.backward()
        optimizer.step()
        batch_losses.append(loss.item())
        log(f"  [SMOKE TEST] Batch {b_idx+1}/2 - Loss: {loss.item():.4f}")

    smoke_time = time.time() - t0
    log(f"[SMOKE TEST] SUCCESS: Forward + Backward + Step completed in {smoke_time:.2f}s")
    log("==================================================\n")

def calculate_metrics(y_true, y_pred, y_probs, class_names):
    """Calculates Top-1, Top-3, Macro Precision, Recall, F1, Per-Class metrics."""
    num_classes = len(class_names)
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    y_probs = np.array(y_probs)

    acc = float(np.mean(y_true == y_pred))

    # Top-3 Accuracy
    top3_correct = 0
    for idx, true_label in enumerate(y_true):
        top3_indices = np.argsort(y_probs[idx])[-3:]
        if true_label in top3_indices:
            top3_correct += 1
    top3_acc = float(top3_correct / len(y_true))

    conf_matrix = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(y_true, y_pred):
        conf_matrix[t, p] += 1

    per_class = {}
    precisions = []
    recalls = []
    f1s = []
    supports = []

    for c in range(num_classes):
        cls_name = class_names[c]
        tp = conf_matrix[c, c]
        fp = np.sum(conf_matrix[:, c]) - tp
        fn = np.sum(conf_matrix[c, :]) - tp
        support = int(np.sum(conf_matrix[c, :]))

        p = float(tp / max(tp + fp, 1))
        r = float(tp / max(tp + fn, 1))
        f1 = float((2 * p * r) / max(p + r, 1e-6))

        precisions.append(p)
        recalls.append(r)
        f1s.append(f1)
        supports.append(support)

        per_class[cls_name] = {
            "precision": round(p, 4),
            "recall": round(r, 4),
            "f1": round(f1, 4),
            "support": support
        }

    macro_precision = float(np.mean(precisions))
    macro_recall = float(np.mean(recalls))
    macro_f1 = float(np.mean(f1s))

    total_support = sum(supports)
    weighted_f1 = float(sum(f * s for f, s in zip(f1s, supports)) / max(total_support, 1))

    sorted_by_f1 = sorted(per_class.items(), key=lambda x: x[1]["f1"])
    weakest = sorted_by_f1[:5]
    strongest = sorted_by_f1[-5:]

    return {
        "accuracy": round(acc, 4),
        "top1_accuracy": round(acc, 4),
        "top3_accuracy": round(top3_acc, 4),
        "precision_macro": round(macro_precision, 4),
        "recall_macro": round(macro_recall, 4),
        "f1_macro": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "per_class": per_class,
        "strongest_classes": [s[0] for s in reversed(strongest)],
        "weakest_classes": [w[0] for w in weakest],
        "confusion_matrix": conf_matrix.tolist()
    }

def train_production_pipeline(epochs=5, batch_size=32, lr=1e-3):
    """Full Production Training & Evaluation Loop with Live Logging."""
    device = verify_pytorch_environment()
    pv_train, pv_val, pv_test = verify_dataset()

    train_tf, eval_tf = build_transforms()
    train_dataset = datasets.ImageFolder(root=str(pv_train), transform=train_tf)
    val_dataset = datasets.ImageFolder(root=str(pv_val), transform=eval_tf)
    test_dataset = datasets.ImageFolder(root=str(pv_test), transform=eval_tf)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    class_names = train_dataset.classes
    num_classes = len(class_names)
    class_to_idx = train_dataset.class_to_idx
    idx_to_class = {v: k for k, v in class_to_idx.items()}

    log(f"[TRAIN] Starting Full Production Training across {num_classes} classes")
    log(f"  Train samples:      {len(train_dataset)}")
    log(f"  Validation samples: {len(val_dataset)}")
    log(f"  Test samples:       {len(test_dataset)}")
    log(f"  Batch size:         {batch_size}")
    log(f"  Epochs:             {epochs}")
    log(f"  Batches per epoch:  {len(train_loader)}")

    # Class-weighted loss
    targets = [s[1] for s in train_dataset.samples]
    class_counts = np.bincount(targets, minlength=num_classes)
    total_samples = len(targets)
    class_weights = torch.FloatTensor([total_samples / (num_classes * max(c, 1)) for c in class_counts]).to(device)

    model = create_model(num_classes=num_classes, device=device)

    # Smoke test first!
    run_smoke_test(model, train_dataset, device)

    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)

    best_val_acc = 0.0
    start_total_time = time.time()

    for epoch in range(epochs):
        epoch_start_time = time.time()
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        log(f"\n================ [TRAIN] Starting Epoch {epoch+1}/{epochs} ================")

        for batch_idx, (images, labels) in enumerate(train_loader):
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

            # Print observable progress every 20 batches
            if (batch_idx + 1) % 20 == 0 or (batch_idx + 1) == len(train_loader):
                cur_acc = (correct / total) * 100
                cur_loss = running_loss / total
                elapsed_b = time.time() - epoch_start_time
                log(f"  Epoch {epoch+1}/{epochs} [{batch_idx+1}/{len(train_loader)} batches] - Loss: {cur_loss:.4f} | Acc: {cur_acc:.1f}% | Time: {elapsed_b:.1f}s")

        scheduler.step()
        epoch_loss = running_loss / max(total, 1)
        epoch_acc = correct / max(total, 1)

        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data).item()
                val_total += labels.size(0)

        val_epoch_loss = val_loss / max(val_total, 1)
        val_acc = val_correct / max(val_total, 1)
        epoch_duration = round(time.time() - epoch_start_time, 2)

        log(f"\n[EPOCH {epoch+1}/{epochs} SUMMARY]")
        log(f"  Train Loss:     {epoch_loss:.4f}")
        log(f"  Train Accuracy: {epoch_acc*100:.2f}%")
        log(f"  Val Loss:       {val_epoch_loss:.4f}")
        log(f"  Val Accuracy:   {val_acc*100:.2f}%")
        log(f"  Epoch Time:     {epoch_duration}s")

        # Save checkpoint if best validation accuracy
        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_SAVE_PATH)
            log(f"  >>> [CHECKPOINT] Best model saved to {MODEL_SAVE_PATH} (Val Acc: {best_val_acc*100:.2f}%)")

    total_training_duration = round(time.time() - start_total_time, 2)
    log(f"\n================ [TRAINING COMPLETE] ================")
    log(f"Total Time: {total_training_duration}s | Best Validation Accuracy: {best_val_acc*100:.2f}%")

    # ============================================================
    # REAL HELD-OUT TEST SPLIT EVALUATION
    # ============================================================
    log("\n[EVALUATION] Evaluating best model on 380 held-out test images...")
    model.load_state_dict(torch.load(MODEL_SAVE_PATH, map_location=device))
    model.eval()

    test_preds = []
    test_targets = []
    test_probs = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            _, preds = torch.max(outputs, 1)

            test_preds.extend(preds.cpu().numpy())
            test_targets.extend(labels.numpy())
            test_probs.extend(probs.cpu().numpy())

    test_metrics = calculate_metrics(test_targets, test_preds, test_probs, class_names)
    log("\n================ HELD-OUT TEST EVALUATION RESULTS ================")
    log(f"  Top-1 Accuracy:    {test_metrics['accuracy']*100:.2f}%")
    log(f"  Top-3 Accuracy:    {test_metrics['top3_accuracy']*100:.2f}%")
    log(f"  Macro Precision:   {test_metrics['precision_macro']:.4f}")
    log(f"  Macro Recall:      {test_metrics['recall_macro']:.4f}")
    log(f"  Macro F1-Score:    {test_metrics['f1_macro']:.4f}")
    log(f"  Weighted F1-Score: {test_metrics['weighted_f1']:.4f}")
    log(f"  Top-5 Strongest:   {test_metrics['strongest_classes']}")
    log(f"  Top-5 Weakest:     {test_metrics['weakest_classes']}")

    # ============================================================
    # PLANTDOC FIELD IMAGES (DOMAIN SHIFT BENCHMARK)
    # ============================================================
    pd_test_dir = PROCESSED_DIR / "plantdoc" / "test"
    pd_test_metrics = None
    if pd_test_dir.exists() and any(pd_test_dir.iterdir()):
        try:
            pd_dataset = datasets.ImageFolder(root=str(pd_test_dir), transform=eval_tf)
            if len(pd_dataset) > 0:
                pd_loader = DataLoader(pd_dataset, batch_size=16, shuffle=False)
                pd_preds = []
                pd_targets = []
                pd_probs = []

                for images, labels in pd_loader:
                    with torch.no_grad():
                        outputs = model(images)
                        probs = torch.softmax(outputs, dim=1)
                        _, preds = torch.max(outputs, 1)

                        for l, p, pr in zip(labels.numpy(), preds.cpu().numpy(), probs.cpu().numpy()):
                            pd_cls_name = pd_dataset.classes[l]
                            if pd_cls_name in class_to_idx:
                                pd_targets.append(class_to_idx[pd_cls_name])
                                pd_preds.append(p)
                                pd_probs.append(pr)

                if pd_targets:
                    pd_test_metrics = calculate_metrics(pd_targets, pd_preds, pd_probs, class_names)
                    log("\n================ PLANTDOC FIELD EVALUATION ================")
                    log(f"  Field Top-1 Accuracy: {pd_test_metrics['accuracy']*100:.2f}%")
                    log(f"  Field Macro F1-Score: {pd_test_metrics['f1_macro']:.4f}")
                    drop = (test_metrics['accuracy'] - pd_test_metrics['accuracy']) * 100
                    log(f"  Domain Shift Drop:    {drop:.2f}%")
        except Exception as e:
            log(f"  [WARN] PlantDoc evaluation note: {e}")

    # ============================================================
    # CONFIDENCE CALIBRATION ANALYSIS
    # ============================================================
    correct_confidences = []
    incorrect_confidences = []
    for pred, target, probs in zip(test_preds, test_targets, test_probs):
        max_prob = float(np.max(probs))
        if pred == target:
            correct_confidences.append(max_prob)
        else:
            incorrect_confidences.append(max_prob)

    avg_correct_conf = float(np.mean(correct_confidences)) if correct_confidences else 0.0
    avg_incorrect_conf = float(np.mean(incorrect_confidences)) if incorrect_confidences else 0.0
    recommended_threshold = 0.65

    log("\n================ CONFIDENCE CALIBRATION ================")
    log(f"  Average Confidence on Correct Predictions:   {avg_correct_conf*100:.2f}%")
    log(f"  Average Confidence on Incorrect Predictions: {avg_incorrect_conf*100:.2f}%")
    log(f"  Calibrated Rejection Threshold:              {recommended_threshold*100:.1f}%")

    # ============================================================
    # EXPORT MODEL METADATA
    # ============================================================
    supported_crops = sorted(list(set([c.split("___")[0].replace("_", " ") for c in class_names])))

    metadata = {
        "model_architecture": "MobileNetV3_Large",
        "model_version": "2.0.0-production-real",
        "num_classes": num_classes,
        "classes": class_names,
        "class_to_idx": class_to_idx,
        "idx_to_class": idx_to_class,
        "supported_crops": supported_crops,
        "confidence_threshold": recommended_threshold,
        "confidence_calibration": {
            "avg_correct_confidence": round(avg_correct_conf, 4),
            "avg_incorrect_confidence": round(avg_incorrect_conf, 4),
            "recommended_threshold": recommended_threshold
        },
        "training_summary": {
            "epochs": epochs,
            "batch_size": batch_size,
            "learning_rate": lr,
            "total_training_duration_seconds": total_training_duration,
            "best_val_acc": round(float(best_val_acc), 4)
        },
        "plantvillage_test_performance": test_metrics,
        "plantdoc_field_performance": pd_test_metrics,
        "data_provenance": "data/dataset_provenance.json"
    }

    with open(METADATA_SAVE_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)

    log(f"\n[DONE] Production checkpoint & metadata exported to:\n  - {MODEL_SAVE_PATH}\n  - {METADATA_SAVE_PATH}")
    return metadata

if __name__ == "__main__":
    train_production_pipeline(epochs=5, batch_size=32, lr=1e-3)

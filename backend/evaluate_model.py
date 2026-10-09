import os
import json
import numpy as np
import tensorflow as tf

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

import matplotlib.pyplot as plt


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_DIR = os.path.join(
    os.path.dirname(BASE_DIR),
    "dataset"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "plant_disease_model.keras"
)

CLASS_NAMES_PATH = os.path.join(
    BASE_DIR,
    "class_names.txt"
)

METRICS_PATH = os.path.join(
    BASE_DIR,
    "model_metrics.json"
)

CONFUSION_MATRIX_PATH = os.path.join(
    BASE_DIR,
    "confusion_matrix.png"
)


# ============================================================
# SETTINGS
# ============================================================

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 32

# IMPORTANT:
# Keep this seed the same every time so that the
# 80% training / 20% testing split stays consistent.
SEED = 123


# ============================================================
# LOAD CLASS NAMES
# ============================================================

with open(CLASS_NAMES_PATH, "r") as file:

    class_names = [
        line.strip()
        for line in file
        if line.strip()
    ]


print("\n==========================================")
print("MODEL EVALUATION")
print("==========================================")

print("\nClasses:")

for index, name in enumerate(class_names):
    print(index, "->", name)


# ============================================================
# LOAD MODEL
# ============================================================

print("\nLoading trained model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully.")


# ============================================================
# LOAD 20% TEST DATASET
# ============================================================

print("\nLoading 20% unseen test dataset...")

test_dataset = tf.keras.utils.image_dataset_from_directory(

    DATASET_DIR,

    labels="inferred",

    label_mode="int",

    class_names=class_names,

    validation_split=0.20,

    subset="validation",

    seed=SEED,

    image_size=IMAGE_SIZE,

    batch_size=BATCH_SIZE,

    shuffle=False
)


# ============================================================
# COUNT TEST IMAGES
# ============================================================

test_images = 0

for images, labels in test_dataset:

    test_images += images.shape[0]


print("\nTest Images:", test_images)


# ============================================================
# GET TRUE LABELS AND MODEL PREDICTIONS
# ============================================================

print("\nRunning predictions...")

y_true = []

y_pred = []


for images, labels in test_dataset:

    predictions = model.predict(
        images,
        verbose=0
    )

    predicted_classes = np.argmax(
        predictions,
        axis=1
    )

    y_true.extend(
        labels.numpy()
    )

    y_pred.extend(
        predicted_classes
    )


y_true = np.array(y_true)

y_pred = np.array(y_pred)


# ============================================================
# CALCULATE METRICS
# ============================================================

accuracy = accuracy_score(
    y_true,
    y_pred
)


precision = precision_score(
    y_true,
    y_pred,
    average="weighted",
    zero_division=0
)


recall = recall_score(
    y_true,
    y_pred,
    average="weighted",
    zero_division=0
)


# Sensitivity is the same as Recall
sensitivity = recall


f1 = f1_score(
    y_true,
    y_pred,
    average="weighted",
    zero_division=0
)


# ============================================================
# PRINT RESULTS
# ============================================================

print("\n==========================================")
print("EVALUATION RESULTS")
print("==========================================")

print(
    f"Accuracy    : {accuracy * 100:.2f}%"
)

print(
    f"Precision   : {precision * 100:.2f}%"
)

print(
    f"Recall      : {recall * 100:.2f}%"
)

print(
    f"Sensitivity : {sensitivity * 100:.2f}%"
)

print(
    f"F1 Score    : {f1 * 100:.2f}%"
)

print(
    f"Test Images : {test_images}"
)


# ============================================================
# SAVE METRICS
# ============================================================

metrics = {

    "accuracy": float(accuracy),

    "precision": float(precision),

    "recall": float(recall),

    "sensitivity": float(sensitivity),

    "f1_score": float(f1),

    "test_images": int(test_images)
}


with open(
    METRICS_PATH,
    "w"
) as file:

    json.dump(
        metrics,
        file,
        indent=4
    )


print("\nMetrics saved to:")

print(METRICS_PATH)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\nCreating confusion matrix...")

cm = confusion_matrix(
    y_true,
    y_pred
)


plt.figure(
    figsize=(12, 10)
)

plt.imshow(
    cm,
    interpolation="nearest"
)

plt.title(
    "Confusion Matrix"
)

plt.colorbar()


tick_marks = np.arange(
    len(class_names)
)

plt.xticks(
    tick_marks,
    class_names,
    rotation=90
)

plt.yticks(
    tick_marks,
    class_names
)


plt.xlabel(
    "Predicted Label"
)

plt.ylabel(
    "True Label"
)


# Write numbers inside the matrix

for i in range(cm.shape[0]):

    for j in range(cm.shape[1]):

        plt.text(
            j,
            i,
            str(cm[i, j]),
            ha="center",
            va="center"
        )


plt.tight_layout()


plt.savefig(
    CONFUSION_MATRIX_PATH,
    dpi=150
)

plt.close()


print(
    "Confusion matrix saved to:"
)

print(
    CONFUSION_MATRIX_PATH
)


print("\n==========================================")
print("EVALUATION COMPLETE")
print("==========================================")
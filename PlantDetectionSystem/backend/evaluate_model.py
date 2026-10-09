import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import json

from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    ConfusionMatrixDisplay,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)


# ==========================================
# SETTINGS
# ==========================================

TEST_PATH = "../split_dataset/test"

MODEL_PATH = "plant_disease_model.keras"

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 16


# ==========================================
# LOAD TEST DATA
# ==========================================

print("Loading test dataset...")

test_data = tf.keras.utils.image_dataset_from_directory(
    TEST_PATH,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)


class_names = test_data.class_names


print("\nClasses:")

for name in class_names:
    print(name)


# ==========================================
# LOAD TRAINED MODEL
# ==========================================

print("\nLoading trained model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("Model loaded successfully!")


# ==========================================
# GET TRUE LABELS
# ==========================================

actual_labels = []

for images, labels in test_data:

    actual_labels.extend(
        labels.numpy()
    )


actual_labels = np.array(
    actual_labels
)


# ==========================================
# GET AI PREDICTIONS
# ==========================================

print("\nPredicting unseen test images...")

predictions = model.predict(
    test_data
)


predicted_labels = np.argmax(
    predictions,
    axis=1
)


# ==========================================
# ACCURACY
# ==========================================

accuracy = accuracy_score(
    actual_labels,
    predicted_labels
)


# ==========================================
# PRECISION
# ==========================================

precision = precision_score(
    actual_labels,
    predicted_labels,
    average="weighted",
    zero_division=0
)


# ==========================================
# RECALL / SENSITIVITY
# ==========================================

recall = recall_score(
    actual_labels,
    predicted_labels,
    average="weighted",
    zero_division=0
)


# Sensitivity is same as Recall
sensitivity = recall


# ==========================================
# F1 SCORE
# ==========================================

f1 = f1_score(
    actual_labels,
    predicted_labels,
    average="weighted",
    zero_division=0
)


# ==========================================
# DISPLAY MAIN RESULTS
# ==========================================

print("\n===================================")

print("MODEL EVALUATION RESULTS")

print("===================================")

print(
    "Accuracy:",
    round(accuracy * 100, 2),
    "%"
)

print(
    "Precision:",
    round(precision * 100, 2),
    "%"
)

print(
    "Recall:",
    round(recall * 100, 2),
    "%"
)

print(
    "Sensitivity:",
    round(sensitivity * 100, 2),
    "%"
)

print(
    "F1 Score:",
    round(f1 * 100, 2),
    "%"
)

print("===================================")


# ==========================================
# CLASSIFICATION REPORT
# ==========================================

print("\nClassification Report:\n")

report = classification_report(
    actual_labels,
    predicted_labels,
    target_names=class_names,
    digits=4,
    zero_division=0
)

print(report)


# ==========================================
# CONFUSION MATRIX
# ==========================================

cm = confusion_matrix(
    actual_labels,
    predicted_labels
)


display = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=class_names
)


fig, ax = plt.subplots(
    figsize=(11, 9)
)


display.plot(
    ax=ax,
    xticks_rotation=45,
    values_format="d"
)


plt.title(
    "PlantCare Disease Detection - Confusion Matrix"
)


plt.tight_layout()


plt.savefig(
    "confusion_matrix.png",
    dpi=300,
    bbox_inches="tight"
)


print(
    "\nconfusion_matrix.png created"
)


# ==========================================
# SAVE METRICS AS JSON
# ==========================================

metrics = {

    "accuracy":
    round(accuracy * 100, 2),

    "precision":
    round(precision * 100, 2),

    "recall":
    round(recall * 100, 2),

    "sensitivity":
    round(sensitivity * 100, 2),

    "f1_score":
    round(f1 * 100, 2),

    "test_images":
    int(len(actual_labels))
}


with open(
    "model_metrics.json",
    "w"
) as file:

    json.dump(
        metrics,
        file,
        indent=4
    )


print(
    "model_metrics.json created successfully!"
)


plt.show()
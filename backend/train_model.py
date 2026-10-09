import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
import json
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2

# ==============================
# SETTINGS
# ==============================

DATASET_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "dataset"))
MODEL_FILE = "plant_disease_model.keras"
CLASS_NAMES_FILE = "class_names.txt"
METRICS_FILE = "model_metrics.json"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10
SEED = 42

# ==============================
# LOAD DATASET
# 80% TRAIN
# 20% TEST
# ==============================

train_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.20,
    subset="training",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int"
)

test_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.20,
    subset="validation",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int"
)

class_names = train_dataset.class_names

print("\nClasses:")
for i, name in enumerate(class_names):
    print(i, "->", name)

# ==============================
# SAVE CLASS NAMES
# ==============================

with open(CLASS_NAMES_FILE, "w") as file:
    for name in class_names:
        file.write(name + "\n")

# ==============================
# PERFORMANCE
# ==============================

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(AUTOTUNE)
test_dataset = test_dataset.prefetch(AUTOTUNE)

# ==============================
# DATA AUGMENTATION
# ==============================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1)
])

# ==============================
# MODEL
# ==============================

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

model = models.Sequential([
    data_augmentation,

    layers.Rescaling(1./127.5, offset=-1),

    base_model,

    layers.GlobalAveragePooling2D(),

    layers.Dropout(0.3),

    layers.Dense(128, activation="relu"),

    layers.Dropout(0.2),

    layers.Dense(
        len(class_names),
        activation="softmax"
    )
])

# ==============================
# COMPILE
# ==============================

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ==============================
# TRAIN
# ==============================

history = model.fit(
    train_dataset,
    epochs=EPOCHS,
    validation_data=test_dataset
)

# ==============================
# TEST / EVALUATION
# ==============================

test_loss, test_accuracy = model.evaluate(test_dataset)

print("\n==============================")
print("TEST RESULTS")
print("==============================")
print("Test Loss:", test_loss)
print("Test Accuracy:", test_accuracy)

# ==============================
# SAVE MODEL
# ==============================

model.save(MODEL_FILE)

print("\nModel saved as:", MODEL_FILE)

# ==============================
# SAVE METRICS
# ==============================

metrics = {
    "accuracy": float(test_accuracy),
    "test_images": int(
        tf.data.experimental.cardinality(test_dataset).numpy()
        * BATCH_SIZE
    ),
    "train_split": 0.80,
    "test_split": 0.20,
    "num_classes": len(class_names),
    "classes": class_names
}

with open(METRICS_FILE, "w") as file:
    json.dump(metrics, file, indent=4)

print("Metrics saved as:", METRICS_FILE)
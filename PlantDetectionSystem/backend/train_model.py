import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2


# ==========================================
# PATHS
# ==========================================

TRAIN_PATH = "../split_dataset/train"
TEST_PATH = "../split_dataset/test"


# ==========================================
# SETTINGS
# ==========================================

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 5


print("Loading training dataset...")


# ==========================================
# LOAD 80% TRAINING DATA
# ==========================================

train_data = tf.keras.utils.image_dataset_from_directory(
    TRAIN_PATH,
    seed=123,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True
)


print("\nLoading testing dataset...")


# ==========================================
# LOAD 20% TEST DATA
# ==========================================

test_data = tf.keras.utils.image_dataset_from_directory(
    TEST_PATH,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)


# ==========================================
# CLASS NAMES
# ==========================================

class_names = train_data.class_names


print("\nClasses found:")

for name in class_names:
    print(name)


print(
    "\nTotal classes:",
    len(class_names)
)


# ==========================================
# CHECK TRAIN / TEST CLASS MATCH
# ==========================================

if class_names != test_data.class_names:

    print(
        "\nERROR: Training and testing class names do not match!"
    )

    print(
        "Training:",
        class_names
    )

    print(
        "Testing:",
        test_data.class_names
    )

    raise ValueError(
        "Train and test folders must contain the same classes."
    )


# ==========================================
# IMPROVE PERFORMANCE
# ==========================================

AUTOTUNE = tf.data.AUTOTUNE


train_data = train_data.prefetch(
    buffer_size=AUTOTUNE
)


test_data = test_data.prefetch(
    buffer_size=AUTOTUNE
)


# ==========================================
# DATA AUGMENTATION
# ONLY APPLIED DURING TRAINING
# ==========================================

data_augmentation = keras.Sequential([

    layers.RandomFlip(
        "horizontal"
    ),

    layers.RandomRotation(
        0.1
    ),

    layers.RandomZoom(
        0.1
    )

])


# ==========================================
# LOAD MOBILENETV2
# ==========================================

print(
    "\nLoading MobileNetV2..."
)


base_model = MobileNetV2(

    input_shape=(224, 224, 3),

    include_top=False,

    weights="imagenet"

)


# Freeze pretrained MobileNetV2 layers

base_model.trainable = False


# ==========================================
# BUILD MODEL
# ==========================================

inputs = keras.Input(
    shape=(224, 224, 3)
)


# Augmentation

x = data_augmentation(
    inputs
)


# MobileNetV2 preprocessing

x = tf.keras.applications.mobilenet_v2.preprocess_input(
    x
)


# Pretrained feature extractor

x = base_model(
    x,
    training=False
)


# Convert extracted features to vector

x = layers.GlobalAveragePooling2D()(
    x
)


# Reduce overfitting

x = layers.Dropout(
    0.2
)(
    x
)


# Final classification layer

outputs = layers.Dense(

    len(class_names),

    activation="softmax"

)(
    x
)


model = keras.Model(
    inputs,
    outputs
)


# ==========================================
# COMPILE MODEL
# ==========================================

model.compile(

    optimizer="adam",

    loss="sparse_categorical_crossentropy",

    metrics=["accuracy"]

)


model.summary()


# ==========================================
# TRAIN MODEL
# ONLY split_dataset/train IS USED HERE
# ==========================================

print(
    "\n===================================="
)

print(
    "Starting training..."
)

print(
    "Only images inside split_dataset/train are used."
)

print(
    "Test images are NOT used during training."
)

print(
    "====================================\n"
)


history = model.fit(

    train_data,

    epochs=EPOCHS

)


# ==========================================
# FINAL TEST
# ==========================================

print(
    "\n===================================="
)

print(
    "Training finished."
)

print(
    "Now testing on unseen images..."
)

print(
    "Using split_dataset/test only."
)

print(
    "====================================\n"
)


test_loss, test_accuracy = model.evaluate(
    test_data
)


# ==========================================
# DISPLAY TEST RESULTS
# ==========================================

print(
    "\n===================================="
)

print(
    "FINAL TEST RESULTS"
)

print(
    "===================================="
)


print(
    "TEST ACCURACY:",
    round(
        test_accuracy * 100,
        2
    ),
    "%"
)


print(
    "TEST LOSS:",
    round(
        test_loss,
        4
    )
)


print(
    "===================================="
)


# ==========================================
# SAVE MODEL
# ==========================================

print(
    "\nSaving model..."
)


model.save(
    "plant_disease_model.keras"
)


# ==========================================
# SAVE CLASS NAMES
# ==========================================

with open(
    "class_names.txt",
    "w"
) as file:

    for name in class_names:

        file.write(
            name + "\n"
        )


print(
    "\nTraining completed successfully!"
)

print(
    "plant_disease_model.keras created"
)

print(
    "class_names.txt created"
)


print(
    "\nIMPORTANT:"
)

print(
    "You can now choose any image from:"
)

print(
    "../split_dataset/test"
)

print(
    "That image was NOT used for training."
)
import os
import random
import shutil

# ==========================================
# SETTINGS
# ==========================================

SOURCE_DATASET = "../dataset"
OUTPUT_DATASET = "../split_dataset"

TRAIN_RATIO = 0.80
RANDOM_SEED = 123

# Makes the split reproducible
random.seed(RANDOM_SEED)


# ==========================================
# CREATE MAIN FOLDERS
# ==========================================

train_path = os.path.join(
    OUTPUT_DATASET,
    "train"
)

test_path = os.path.join(
    OUTPUT_DATASET,
    "test"
)

# Delete old split if it already exists
if os.path.exists(OUTPUT_DATASET):

    print("Removing old split_dataset folder...")

    shutil.rmtree(
        OUTPUT_DATASET
    )

os.makedirs(
    train_path,
    exist_ok=True
)

os.makedirs(
    test_path,
    exist_ok=True
)


# ==========================================
# GET CLASS FOLDERS
# ==========================================

class_names = [

    folder

    for folder in os.listdir(SOURCE_DATASET)

    if os.path.isdir(
        os.path.join(
            SOURCE_DATASET,
            folder
        )
    )
]


print("\nClasses found:")

for class_name in class_names:
    print(class_name)


# ==========================================
# SPLIT EACH CLASS
# ==========================================

total_train = 0
total_test = 0


for class_name in class_names:

    source_class = os.path.join(
        SOURCE_DATASET,
        class_name
    )

    train_class = os.path.join(
        train_path,
        class_name
    )

    test_class = os.path.join(
        test_path,
        class_name
    )

    os.makedirs(
        train_class,
        exist_ok=True
    )

    os.makedirs(
        test_class,
        exist_ok=True
    )


    # Get image files
    images = [

        file_name

        for file_name in os.listdir(
            source_class
        )

        if file_name.lower().endswith(
            (
                ".jpg",
                ".jpeg",
                ".png"
            )
        )
    ]


    # Randomize images
    random.shuffle(images)


    # Calculate 80% position
    split_index = int(
        len(images)
        * TRAIN_RATIO
    )


    train_images = images[
        :split_index
    ]

    test_images = images[
        split_index:
    ]


    # ======================================
    # COPY TRAINING IMAGES
    # ======================================

    for image_name in train_images:

        source_file = os.path.join(
            source_class,
            image_name
        )

        destination_file = os.path.join(
            train_class,
            image_name
        )

        shutil.copy2(
            source_file,
            destination_file
        )


    # ======================================
    # COPY TEST IMAGES
    # ======================================

    for image_name in test_images:

        source_file = os.path.join(
            source_class,
            image_name
        )

        destination_file = os.path.join(
            test_class,
            image_name
        )

        shutil.copy2(
            source_file,
            destination_file
        )


    total_train += len(
        train_images
    )

    total_test += len(
        test_images
    )


    print(
        "\n",
        class_name
    )

    print(
        "Total:",
        len(images)
    )

    print(
        "Training:",
        len(train_images)
    )

    print(
        "Testing:",
        len(test_images)
    )


# ==========================================
# FINAL RESULT
# ==========================================

total_images = (
    total_train
    + total_test
)


print("\n====================================")

print(
    "TOTAL IMAGES:",
    total_images
)

print(
    "TRAINING IMAGES:",
    total_train
)

print(
    "TEST IMAGES:",
    total_test
)

print(
    "TRAINING:",
    round(
        total_train / total_images * 100,
        2
    ),
    "%"
)

print(
    "TESTING:",
    round(
        total_test / total_images * 100,
        2
    ),
    "%"
)

print("====================================")

print(
    "\nDataset split completed successfully!"
)

print(
    "\nTraining folder:",
    train_path
)

print(
    "Testing folder:",
    test_path
)
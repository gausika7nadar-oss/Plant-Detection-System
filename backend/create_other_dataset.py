import os
from tensorflow.keras.datasets import cifar100
from PIL import Image

# Path to Other folder
OTHER_FOLDER = "../dataset/Other"

os.makedirs(OTHER_FOLDER, exist_ok=True)

print("Downloading CIFAR-100 images...")

# Download CIFAR-100
(x_train, y_train), (x_test, y_test) = cifar100.load_data(
    label_mode="fine"
)

# Combine some training + testing images
images = x_train[:2500]

print("Saving miscellaneous images...")

for i, img_array in enumerate(images):

    img = Image.fromarray(img_array)

    file_path = os.path.join(
        OTHER_FOLDER,
        f"other_{i}.jpg"
    )

    img.save(file_path)

print("Done!")
print("2500 miscellaneous images saved inside dataset/Other")
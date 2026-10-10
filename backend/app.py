
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageOps, UnidentifiedImageError
from io import BytesIO
import numpy as np
import cv2
import base64

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


# Convert an RGB image to a Base64 image URL
def image_to_base64(rgb):
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

    success, buffer = cv2.imencode(".jpg", bgr)

    if not success:
        raise ValueError("Image encoding failed")

    encoded = base64.b64encode(buffer.tobytes()).decode("utf-8")

    return "data:image/jpeg;base64," + encoded


# Analyze visible leaf discoloration using OpenCV
def analyze_leaf(rgb):
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)

    # Estimate the leaf region from its colors.
    # Works best with one leaf and a plain background.
    candidate = cv2.inRange(
        hsv,
        np.array([5, 35, 25]),
        np.array([100, 255, 255])
    )

    count, labels, stats, _ = cv2.connectedComponentsWithStats(
        candidate
    )

    leaf_mask = np.zeros(candidate.shape, dtype=np.uint8)

    if count > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest = 1 + int(np.argmax(areas))

        if areas.max() >= 0.025 * candidate.size:
            leaf_mask[labels == largest] = 255

            kernel = np.ones((7, 7), np.uint8)

            leaf_mask = cv2.morphologyEx(
                leaf_mask,
                cv2.MORPH_CLOSE,
                kernel,
                iterations=2
            )

    total_leaf_pixels = cv2.countNonZero(leaf_mask)

    if total_leaf_pixels < 0.025 * leaf_mask.size:
        return None

    # Identify yellow regions
    yellow_mask = cv2.inRange(
        hsv,
        np.array([18, 35, 45]),
        np.array([36, 255, 255])
    )

    # Identify brown regions
    brown_mask = cv2.inRange(
        hsv,
        np.array([5, 45, 20]),
        np.array([19, 255, 200])
    )

    # Identify dark regions
    dark_mask = cv2.inRange(
        hsv,
        np.array([0, 30, 10]),
        np.array([179, 255, 75])
    )

    damaged_mask = cv2.bitwise_or(
        yellow_mask,
        brown_mask
    )

    damaged_mask = cv2.bitwise_or(
        damaged_mask,
        dark_mask
    )

    damaged_mask = cv2.bitwise_and(
        damaged_mask,
        leaf_mask
    )

    kernel = np.ones((3, 3), np.uint8)

    damaged_mask = cv2.morphologyEx(
        damaged_mask,
        cv2.MORPH_OPEN,
        kernel
    )

    # Remove very small isolated regions
    count, labels, stats, _ = cv2.connectedComponentsWithStats(
        damaged_mask
    )

    cleaned_mask = np.zeros_like(damaged_mask)

    minimum_area = max(
        12,
        int(total_leaf_pixels * 0.0003)
    )

    for index in range(1, count):
        area = stats[index, cv2.CC_STAT_AREA]

        if area >= minimum_area:
            cleaned_mask[labels == index] = 255

    affected_pixels = cv2.countNonZero(cleaned_mask)

    affected_percentage = round(
        (affected_pixels / total_leaf_pixels) * 100,
        2
    )

    # Rule-based symptom descriptions
    if affected_percentage < 3:
        severity = "Low visible discoloration"
        disease = "No prominent discoloration detected"

        information = (
            "No prominent yellow, brown, or dark regions were "
            "detected. This does not guarantee the plant is healthy."
        )

        treatment = (
            "Continue regular monitoring, suitable watering, "
            "and proper plant care."
        )

    elif affected_percentage < 15:
        severity = "Mild visible discoloration"
        disease = "Possible leaf discoloration"

        information = (
            "Some yellow, brown, or dark regions are visible. "
            "These may result from several environmental or "
            "biological causes."
        )

        treatment = (
            "Check watering, nutrients, and both sides of the leaf. "
            "Monitor whether the affected areas spread."
        )

    elif affected_percentage < 35:
        severity = "Moderate visible discoloration"
        disease = "Noticeable leaf discoloration"

        information = (
            "Noticeable discolored regions were detected. "
            "Image colors alone cannot determine the exact cause."
        )

        treatment = (
            "Inspect nearby plants, check soil moisture, "
            "improve airflow, and seek agricultural guidance "
            "if symptoms continue."
        )

    else:
        severity = "Extensive visible discoloration"
        disease = "Extensive leaf discoloration"

        information = (
            "A large proportion of the estimated leaf region "
            "contains yellow, brown, or dark colors. "
            "This is not a confirmed disease diagnosis."
        )

        treatment = (
            "Consider an in-person agricultural assessment "
            "before selecting a treatment."
        )

    # Create highlighted image
    highlighted = rgb.copy()

    affected_region = cleaned_mask > 0

    red = np.array([255, 0, 0], dtype=np.float32)

    highlighted[affected_region] = (
        0.45 * highlighted[affected_region]
        + 0.55 * red
    ).astype(np.uint8)

    contours, _ = cv2.findContours(
        cleaned_mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    cv2.drawContours(
        highlighted,
        contours,
        -1,
        (255, 0, 0),
        2
    )

    return {
        "success": True,
        "plant": "Unknown (not identified)",
        "disease": disease,
        "confidence": None,
        "severity": severity,
        "affected_percentage": affected_percentage,
        "information": information,
        "treatment": treatment,
        "original_image": image_to_base64(rgb),
        "highlighted_image": image_to_base64(highlighted),
        "analysis_method": "OpenCV rule-based image processing",
        "top_predictions": [],
        "message": (
            "Results describe visible color abnormalities, "
            "not a confirmed plant disease."
        )
    }


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "PlantCare OpenCV backend is running",
        "method": "Digital image processing"
    })


@app.route("/upload", methods=["POST"])
def upload_image():
    uploaded_file = request.files.get("image")

    if uploaded_file is None or uploaded_file.filename == "":
        return jsonify({
            "success": False,
            "message": "Please select a leaf image."
        }), 400

    try:
        image_bytes = uploaded_file.read()

        image = Image.open(BytesIO(image_bytes))
        image = ImageOps.exif_transpose(image)
        image = image.convert("RGB")

        image.thumbnail((900, 900))

        rgb = np.array(image, dtype=np.uint8)

        result = analyze_leaf(rgb)

        if result is None:
            return jsonify({
                "success": False,
                "invalid_image": True,
                "message": (
                    "Could not isolate a suitable leaf region. "
                    "Try one leaf against a plain contrasting "
                    "background with even lighting."
                )
            }), 400

        return jsonify(result)

    except (UnidentifiedImageError, OSError, ValueError):
        return jsonify({
            "success": False,
            "message": "Please upload a valid JPG or PNG image."
        }), 400


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}

    message = str(data.get("message", "")).strip()

    if not message:
        return jsonify({
            "success": False,
            "message": "Please enter a question."
        }), 400

    question = message.lower()

    if "yellow" in question:
        reply = (
            "Yellow leaves may be caused by nutrient issues, "
            "watering problems, natural aging, or disease. "
            "Check the plant's growing conditions."
        )

    elif "brown" in question or "spot" in question:
        reply = (
            "Brown spots can have several causes. Check leaf "
            "moisture, spot patterns, and the surrounding plants. "
            "A local agricultural expert can help identify the cause."
        )

    elif "water" in question or "irrigation" in question:
        reply = (
            "Water requirements depend on crop, soil, and weather. "
            "Check soil moisture and avoid waterlogging."
        )

    elif "fertilizer" in question or "nutrient" in question:
        reply = (
            "Use suitable nutrients based on crop requirements "
            "and soil conditions. A soil test can help."
        )

    elif "treatment" in question or "fungicide" in question:
        reply = (
            "Treatment depends on the actual cause. "
            "Do not select chemicals based only on leaf color. "
            "Seek appropriate agricultural advice."
        )

    elif "healthy" in question or "prevent" in question:
        reply = (
            "Regular inspection, suitable watering, good airflow, "
            "and balanced nutrition support plant health."
        )

    else:
        reply = (
            "PlantCare can help with leaf discoloration, "
            "watering, crop care, and general prevention. "
            "It does not provide confirmed disease diagnoses."
        )

    return jsonify({
        "success": True,
        "reply": reply
    })


@app.route("/model-metrics", methods=["GET"])
def model_metrics():
    return jsonify({
        "success": False,
        "message": (
            "No machine-learning model is used. "
            "Model accuracy and precision are not applicable."
        )
    })


@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "success": False,
        "message": "The uploaded image exceeds 10 MB."
    }), 413


if __name__ == "__main__":
    print("PlantCare OpenCV Backend Starting...")
    print("No Machine Learning, Deep Learning, or CNN")
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )

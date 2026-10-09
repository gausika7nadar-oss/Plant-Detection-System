from flask import Flask, request, jsonify
from flask_cors import CORS

import tensorflow as tf
import numpy as np
import cv2
import base64
import os
import json
from PIL import Image
from io import BytesIO

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "plant_disease_model.keras"
)

CLASS_FILE = os.path.join(
    BASE_DIR,
    "class_names.txt"
)

METRICS_FILE = os.path.join(
    BASE_DIR,
    "model_metrics.json"
)



print("Loading Plant Disease AI Model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("AI Model Loaded Successfully!")


# =========================================================
# LOAD CLASS NAMES
# =========================================================

with open(
    CLASS_FILE,
    "r"
) as file:

    class_names = [
        line.strip()
        for line in file.readlines()
        if line.strip()
    ]


print("\nClasses loaded:")

for class_name in class_names:
    print(class_name)


# =========================================================
# DISEASE INFORMATION
# =========================================================

disease_information = {

    "Tomato___Early_blight": {

        "plant": "Tomato",

        "disease": "Early Blight",

        "information":
        "Early blight is a fungal disease that causes dark or brown spots on tomato leaves.",

        "treatment":
        "Remove infected leaves, avoid excess moisture on the leaves and use an appropriate fungicide when required."
    },


    "Tomato___Late_blight": {

        "plant": "Tomato",

        "disease": "Late Blight",

        "information":
        "Late blight can rapidly affect tomato leaves, stems and fruits.",

        "treatment":
        "Remove infected plant material, improve air circulation and use suitable disease-control treatment."
    },


    "Tomato___healthy": {

        "plant": "Tomato",

        "disease": "Healthy",

        "information":
        "The tomato leaf appears healthy.",

        "treatment":
        "Continue normal watering, nutrition and regular plant monitoring."
    },


    "Potato___Early_blight": {

        "plant": "Potato",

        "disease": "Early Blight",

        "information":
        "Early blight commonly causes dark or brown spots on potato leaves.",

        "treatment":
        "Remove infected foliage, maintain proper spacing and use an appropriate fungicide if necessary."
    },


    "Potato___Late_blight": {

        "plant": "Potato",

        "disease": "Late Blight",

        "information":
        "Late blight can quickly damage potato leaves and stems.",

        "treatment":
        "Remove infected plant material, reduce excess leaf moisture and use appropriate disease-control measures."
    },


    "Potato___healthy": {

        "plant": "Potato",

        "disease": "Healthy",

        "information":
        "The potato leaf appears healthy.",

        "treatment":
        "Continue proper watering, nutrition and regular crop monitoring."
    }
}


# =========================================================
# CONVERT PIL IMAGE TO BASE64
# =========================================================

def pil_to_base64(pil_image):

    buffer = BytesIO()

    pil_image.convert("RGB").save(
        buffer,
        format="JPEG",
        quality=90
    )

    encoded_image = base64.b64encode(
        buffer.getvalue()
    ).decode("utf-8")

    return (
        "data:image/jpeg;base64,"
        + encoded_image
    )


# =========================================================
# MAKE CLASS NAME READABLE
# =========================================================

def make_readable_class_name(class_name):

    if "___" in class_name:

        plant_part, disease_part = class_name.split(
            "___",
            1
        )

        plant_part = plant_part.replace(
            "_",
            " "
        )

        disease_part = disease_part.replace(
            "_",
            " "
        )

        return (
            plant_part
            + " - "
            + disease_part
        )

    return class_name.replace(
        "_",
        " "
    )


# =========================================================
# SEVERITY + AFFECTED AREA VISUALIZATION
# =========================================================

def estimate_severity(
    pil_image,
    disease_name
):

    # Convert image to RGB array
    rgb_image = np.array(
        pil_image.convert("RGB")
    )


    # -----------------------------------------------------
    # HEALTHY LEAF
    # -----------------------------------------------------

    if disease_name.lower() == "healthy":

        highlighted_bgr = cv2.cvtColor(
            rgb_image,
            cv2.COLOR_RGB2BGR
        )

        success, buffer = cv2.imencode(
            ".jpg",
            highlighted_bgr
        )

        highlighted_base64 = ""

        if success:

            highlighted_base64 = (
                "data:image/jpeg;base64,"
                + base64.b64encode(
                    buffer
                ).decode("utf-8")
            )

        return {

            "severity": "Healthy",

            "affected_percentage": 0.0,

            "highlighted_image":
            highlighted_base64
        }


    # -----------------------------------------------------
    # CONVERT IMAGE TO HSV
    # -----------------------------------------------------

    hsv_image = cv2.cvtColor(
        rgb_image,
        cv2.COLOR_RGB2HSV
    )


    # -----------------------------------------------------
    # LEAF MASK
    # -----------------------------------------------------

    leaf_lower = np.array(
        [5, 25, 20]
    )

    leaf_upper = np.array(
        [100, 255, 255]
    )

    leaf_mask = cv2.inRange(
        hsv_image,
        leaf_lower,
        leaf_upper
    )


    # -----------------------------------------------------
    # POSSIBLE DAMAGED AREA
    # -----------------------------------------------------

    damaged_lower = np.array(
        [5, 40, 30]
    )

    damaged_upper = np.array(
        [35, 255, 230]
    )

    damaged_mask = cv2.inRange(
        hsv_image,
        damaged_lower,
        damaged_upper
    )


    # Keep damaged pixels only inside leaf
    damaged_mask = cv2.bitwise_and(
        damaged_mask,
        leaf_mask
    )


    # -----------------------------------------------------
    # CLEAN THE MASK
    # -----------------------------------------------------

    kernel = np.ones(
        (3, 3),
        np.uint8
    )

    damaged_mask = cv2.morphologyEx(
        damaged_mask,
        cv2.MORPH_OPEN,
        kernel
    )

    damaged_mask = cv2.morphologyEx(
        damaged_mask,
        cv2.MORPH_CLOSE,
        kernel
    )


    # -----------------------------------------------------
    # COUNT PIXELS
    # -----------------------------------------------------

    total_leaf_pixels = cv2.countNonZero(
        leaf_mask
    )

    damaged_pixels = cv2.countNonZero(
        damaged_mask
    )


    # -----------------------------------------------------
    # CALCULATE AFFECTED PERCENTAGE
    # -----------------------------------------------------

    if total_leaf_pixels == 0:

        affected_percentage = 0.0

        severity = "Unable to estimate"

    else:

        affected_percentage = (
            damaged_pixels
            /
            total_leaf_pixels
        ) * 100

        affected_percentage = round(
            affected_percentage,
            2
        )


        # -------------------------------------------------
        # SEVERITY LEVEL
        # -------------------------------------------------

        if affected_percentage < 10:

            severity = "Very Mild"

        elif affected_percentage < 25:

            severity = "Mild"

        elif affected_percentage < 50:

            severity = "Moderate"

        else:

            severity = "Severe"


    # -----------------------------------------------------
    # CREATE RED HIGHLIGHT
    # -----------------------------------------------------

    highlighted = rgb_image.copy()

    red_overlay = np.zeros_like(
        highlighted
    )

    # RGB red
    red_overlay[:, :, 0] = 255


    affected_pixels = (
        damaged_mask > 0
    )


    highlighted[
        affected_pixels
    ] = (

        0.45
        * highlighted[
            affected_pixels
        ]

        +

        0.55
        * red_overlay[
            affected_pixels
        ]

    ).astype(
        np.uint8
    )


    # -----------------------------------------------------
    # DRAW RED OUTLINES
    # -----------------------------------------------------

    contours, _ = cv2.findContours(
        damaged_mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )


    highlighted_bgr = cv2.cvtColor(
        highlighted,
        cv2.COLOR_RGB2BGR
    )


    cv2.drawContours(
        highlighted_bgr,
        contours,
        -1,
        (0, 0, 255),
        2
    )


    # -----------------------------------------------------
    # CONVERT HIGHLIGHTED IMAGE TO BASE64
    # -----------------------------------------------------

    success, buffer = cv2.imencode(
        ".jpg",
        highlighted_bgr
    )

    highlighted_base64 = ""

    if success:

        highlighted_base64 = (
            "data:image/jpeg;base64,"
            + base64.b64encode(
                buffer
            ).decode("utf-8")
        )


    return {

        "severity":
        severity,

        "affected_percentage":
        affected_percentage,

        "highlighted_image":
        highlighted_base64
    }


# =========================================================
# HOME ROUTE
# =========================================================

@app.route("/")
def home():

    return jsonify({

        "status": "success",

        "message":
        "PlantCare AI Backend is Running"
    })


# =========================================================
# UPLOAD + AI PREDICTION ROUTE
# =========================================================

@app.route(
    "/upload",
    methods=["POST"]
)
def upload_image():

    # -----------------------------------------------------
    # CHECK IMAGE
    # -----------------------------------------------------

    if "image" not in request.files:

        return jsonify({

            "success": False,

            "message":
            "No image received"

        }), 400


    uploaded_image = request.files[
        "image"
    ]


    if uploaded_image.filename == "":

        return jsonify({

            "success": False,

            "message":
            "No image selected"

        }), 400


    print(
        "\nImage received:",
        uploaded_image.filename
    )


    try:

        # =================================================
        # READ IMAGE
        # =================================================

        image_bytes = uploaded_image.read()

        img = Image.open(
            BytesIO(image_bytes)
        )

        img = img.convert(
            "RGB"
        )


        # Original image for frontend
        original_image_base64 = pil_to_base64(
            img
        )


        # =================================================
        # PREPARE IMAGE FOR MODEL
        # =================================================

        model_image = img.resize(
            (224, 224)
        )

        img_array = np.array(
            model_image,
            dtype=np.float32
        )

        img_array = np.expand_dims(
            img_array,
            axis=0
        )


        # =================================================
        # AI PREDICTION
        # =================================================

        predictions = model.predict(
            img_array
        )


        prediction_scores = predictions[0]


        # =================================================
        # TOP 3 AI PREDICTIONS
        # =================================================

        top_indices = np.argsort(
            prediction_scores
        )[-3:][::-1]


        top_predictions = []


        for index in top_indices:

            class_name = class_names[
                index
            ]

            score = float(
                prediction_scores[index]
                * 100
            )

            readable_name = (
                make_readable_class_name(
                    class_name
                )
            )

            top_predictions.append({

                "name":
                readable_name,

                "confidence":
                round(
                    score,
                    2
                )
            })


        # Print Top 3 in terminal
        print("\nTop 3 Predictions:")

        for prediction in top_predictions:

            print(
                prediction["name"],
                "-",
                prediction["confidence"],
                "%"
            )


        # =================================================
        # MAIN PREDICTION
        # =================================================

        predicted_index = int(
            np.argmax(
                prediction_scores
            )
        )


        confidence = float(
            prediction_scores[
                predicted_index
            ]
            * 100
        )


        predicted_class = class_names[
            predicted_index
        ]


        print(
            "\nPrediction:",
            predicted_class
        )


        print(
            "AI Confidence:",
            round(
                confidence,
                2
            ),
            "%"
        )


        # =================================================
        # REJECT OTHER
        # =================================================

        if predicted_class == "Other":

            return jsonify({

                "success": False,

                "invalid_image": True,

                "message":
                "This does not appear to be a supported tomato or potato leaf."

            }), 400


        # =================================================
        # GET DISEASE DETAILS
        # =================================================

        details = disease_information.get(
            predicted_class
        )


        # Fallback for future plant classes
        if details is None:

            if "___" in predicted_class:

                plant_name, disease_name = (
                    predicted_class.split(
                        "___",
                        1
                    )
                )

                plant_name = (
                    plant_name.replace(
                        "_",
                        " "
                    )
                )

                disease_name = (
                    disease_name.replace(
                        "_",
                        " "
                    )
                )

            else:

                plant_name = (
                    predicted_class.replace(
                        "_",
                        " "
                    )
                )

                disease_name = (
                    "Unknown"
                )


            details = {

                "plant":
                plant_name,

                "disease":
                disease_name,

                "information":
                "Plant condition detected.",

                "treatment":
                "Consult an agricultural expert for detailed treatment advice."
            }


        # =================================================
        # SEVERITY ANALYSIS
        # =================================================

        severity_result = estimate_severity(
            img,
            details["disease"]
        )


        print(
            "Severity:",
            severity_result[
                "severity"
            ]
        )


        print(
            "Estimated affected area:",
            severity_result[
                "affected_percentage"
            ],
            "%"
        )


        # =================================================
        # SEND EVERYTHING TO FRONTEND
        # =================================================

        return jsonify({

            "success":
            True,


            "plant":
            details["plant"],


            "disease":
            details["disease"],


            "confidence":
            round(
                confidence,
                2
            ),


            "top_predictions":
            top_predictions,


            "severity":
            severity_result[
                "severity"
            ],


            "affected_percentage":
            severity_result[
                "affected_percentage"
            ],


            "original_image":
            original_image_base64,


            "highlighted_image":
            severity_result[
                "highlighted_image"
            ],


            "information":
            details["information"],


            "treatment":
            details["treatment"]

        })


    # =====================================================
    # ERROR HANDLING
    # =====================================================

    except Exception as error:

        print(
            "Prediction Error:",
            error
        )

        return jsonify({

            "success": False,

            "message":
            str(error)

        }), 500



# =========================================================
# MODEL METRICS API
# =========================================================

@app.route("/model-metrics", methods=["GET"])
def model_metrics():

    try:

        with open(
            METRICS_FILE,
            "r"
        ) as file:

            metrics = json.load(file)

        return jsonify({
            "success": True,
            "metrics": metrics
        })

    except Exception as error:

        print(
            "Model Metrics Error:",
            error
        )

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500



# =========================================================
# AGRICULTURE AI CHATBOT
# =========================================================

def agriculture_chat_response(message):
    text = message.lower().strip()

    if (text == "hi" or text == "hello" or text == "hey"
            or text.startswith("hi ") or text.startswith("hello ")
            or text.startswith("hey ")):
        return ("Hello! 🌱 I am your Agriculture AI Assistant. "
                "You can ask me about crop diseases, symptoms, "
                "prevention, treatment and general plant health.")

    if "early blight" in text:
        return ("Early blight commonly causes dark or brown spots on crop leaves. "
                "Remove severely infected leaves, improve air circulation, avoid "
                "unnecessary leaf wetness and follow appropriate disease-control guidance.")

    if "late blight" in text:
        return ("Late blight can spread quickly under favorable cool and humid conditions. "
                "Monitor leaves carefully, remove severely affected plant material "
                "and follow appropriate disease-control guidance.")

    if "tomato" in text:
        return ("For tomato crops, common diseases in this project include Early Blight "
                "and Late Blight. Upload a clear tomato leaf image to the detector "
                "for an AI-based prediction.")

    if "potato" in text:
        return ("For potato crops, common diseases in this project include Early Blight "
                "and Late Blight. Maintain good spacing, monitor leaves regularly "
                "and upload a clear image for an AI-based prediction.")

    if "maize" in text or "corn" in text:
        return ("Maize can develop different leaf diseases that may cause spots, "
                "discoloration or leaf damage. Regular monitoring and good crop "
                "management are useful. Upload a clear leaf image for a prediction.")

    if "rice" in text:
        return ("Rice can be affected by several fungal and bacterial diseases. "
                "Monitor leaves regularly and maintain good crop management. "
                "Upload a clear rice leaf image for a specific prediction.")

    if "soybean" in text or "soyabean" in text:
        return ("Soybean diseases can cause leaf spots, yellowing or other visible damage. "
                "Regular monitoring and good field management can help identify problems early.")

    if "prevent" in text or "prevention" in text:
        return ("General crop-disease prevention includes healthy planting material, "
                "proper spacing, regular crop monitoring, removing severely affected "
                "plant material and avoiding unnecessary pesticide use.")

    if "treatment" in text or "medicine" in text or "cure" in text:
        return ("Treatment depends on the crop and confirmed disease. Use the detector "
                "as a prediction aid, but confirm important chemical-treatment decisions "
                "with a qualified agricultural expert and follow the product label.")

    if "healthy" in text:
        return ("A healthy-looking leaf usually has normal color and no obvious disease "
                "symptoms. Visual appearance alone cannot guarantee that a crop is "
                "disease-free. You can upload an image for an AI-based prediction.")

    if "confidence" in text:
        return ("AI confidence is the model's score for its predicted class. It is not "
                "a guarantee that the diagnosis is correct. Use the result together "
                "with visible symptoms and agricultural expert guidance.")

    return ("I can help with crop diseases, symptoms, prevention, treatment and general "
            "plant health. Try asking about tomato, potato, maize, rice, soybean, "
            "early blight, late blight or disease prevention.")


@app.route("/chat", methods=["POST"])
def agriculture_chat():
    try:
        data = request.get_json(silent=True) or {}
        user_message = str(data.get("message", "")).strip()

        if not user_message:
            return jsonify({
                "success": False,
                "message": "Please enter a message."
            }), 400

        return jsonify({
            "success": True,
            "reply": agriculture_chat_response(user_message)
        })

    except Exception as error:
        print("Chatbot Error:", error)
        return jsonify({
            "success": False,
            "message": "Unable to process the chatbot request."
        }), 500


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )
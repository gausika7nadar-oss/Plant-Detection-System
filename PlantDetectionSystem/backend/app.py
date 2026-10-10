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

# =========================================================

# FLASK APP

# =========================================================

app = Flask(__name__)

CORS(app)

# =========================================================

# PATHS

# =========================================================

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

# =========================================================

# LOAD MODEL

# =========================================================

print("\n========================================")

print("Loading Plant Disease AI Model...")

print("========================================")

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

for name in class_names:

    print(name)

print(

    "\nTotal classes:",

    len(class_names)

)

# =========================================================

# DISEASE INFORMATION

# =========================================================

disease_information = {

    "Apple___Apple_scab": {

        "plant": "Apple",

        "disease": "Apple Scab",

        "information":

        "Apple scab is a fungal disease that can cause dark olive or brown spots on apple leaves.",

        "treatment":

        "Remove affected leaves, maintain good air circulation and follow suitable disease-management practices."

    },

    "Apple___Black_rot": {

        "plant": "Apple",

        "disease": "Black Rot",

        "information":

        "Black rot is a fungal disease that can affect apple leaves, branches and fruit.",

        "treatment":

        "Remove infected plant material and maintain proper orchard sanitation."

    },

    "Apple___healthy": {

        "plant": "Apple",

        "disease": "Healthy",

        "information":

        "The apple leaf appears healthy.",

        "treatment":

        "Continue normal watering, nutrition and regular plant monitoring."

    },

    "Corn_(maize)___Common_rust_": {

        "plant": "Corn",

        "disease": "Common Rust",

        "information":

        "Common rust produces rust-colored spots on corn leaves.",

        "treatment":

        "Maintain crop health and use suitable disease-management practices when required."

    },

    "Corn_(maize)___healthy": {

        "plant": "Corn",

        "disease": "Healthy",

        "information":

        "The corn leaf appears healthy.",

        "treatment":

        "Continue proper watering, nutrition and regular crop monitoring."

    },

    "Corn_(maize)___Northern_Leaf_Blight": {

        "plant": "Corn",

        "disease": "Northern Leaf Blight",

        "information":

        "Northern leaf blight can produce long gray or brown lesions on corn leaves.",

        "treatment":

        "Remove severely affected material where practical and follow appropriate crop disease-management practices."

    },

    "Grape___Black_rot": {

        "plant": "Grape",

        "disease": "Black Rot",

        "information":

        "Grape black rot is a fungal disease that can produce dark lesions on leaves.",

        "treatment":

        "Remove infected plant material and maintain good air circulation."

    },

    "Grape___Esca_(Black_Measles)": {

        "plant": "Grape",

        "disease": "Esca (Black Measles)",

        "information":

        "Esca is a grapevine disease associated with leaf discoloration and other plant symptoms.",

        "treatment":

        "Remove severely affected material and follow appropriate vineyard disease-management practices."

    },

    "Grape___healthy": {

        "plant": "Grape",

        "disease": "Healthy",

        "information":

        "The grape leaf appears healthy.",

        "treatment":

        "Continue normal watering, nutrition and regular monitoring."

    },

    "Potato___Early_blight": {

        "plant": "Potato",

        "disease": "Early Blight",

        "information":

        "Early blight commonly causes dark or brown spots on potato leaves.",

        "treatment":

        "Remove infected foliage, maintain proper spacing and use appropriate disease-management measures when necessary."

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

    },

    "Tomato___Early_blight": {

        "plant": "Tomato",

        "disease": "Early Blight",

        "information":

        "Early blight is a fungal disease that can cause dark or brown spots on tomato leaves.",

        "treatment":

        "Remove infected leaves, avoid excess moisture on the leaves and use appropriate disease-management measures when required."

    },

    "Tomato___healthy": {

        "plant": "Tomato",

        "disease": "Healthy",

        "information":

        "The tomato leaf appears healthy.",

        "treatment":

        "Continue normal watering, nutrition and regular plant monitoring."

    },

    "Tomato___Late_blight": {

        "plant": "Tomato",

        "disease": "Late Blight",

        "information":

        "Late blight can rapidly affect tomato leaves, stems and fruits.",

        "treatment":

        "Remove infected plant material, improve air circulation and use suitable disease-control treatment."

    }

}

# =========================================================

# CONVERT PIL IMAGE TO BASE64

# =========================================================

def pil_to_base64(pil_image):

    buffer = BytesIO()

    pil_image.convert(

        "RGB"

    ).save(

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

# SEVERITY ANALYSIS

# =========================================================

def estimate_severity(

    pil_image,

    disease_name

):

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

    # HSV IMAGE

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

    # DAMAGED AREA MASK

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

    # CLEAN MASK

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

    # CALCULATE AFFECTED AREA

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

    # CONVERT TO BASE64

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

        "status":

        "success",

        "message":

        "PlantCare AI Backend is Running"

    })

# =========================================================

# UPLOAD + AI PREDICTION

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

        # =================================================

        # ORIGINAL IMAGE

        # =================================================

        original_image_base64 = pil_to_base64(

            img

        )

        # =================================================

        # PREPARE IMAGE

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

        # The saved model includes MobileNetV2 preprocessing.
        # Do not preprocess the image a second time here.

        print("\nRunning AI prediction...")
        predictions = model.predict(img_array, verbose=0)
        prediction_scores = predictions[0]

        # =================================================

        # TOP 3 PREDICTIONS

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

                prediction_scores[

                    index

                ]

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

        # -------------------------------------------------

        # PRINT TOP 3

        # -------------------------------------------------

        print(

            "\nTop 3 Predictions:"

        )

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

                "This does not appear to be a supported plant leaf."

            }), 400

        # =================================================

        # GET DISEASE DETAILS

        # =================================================

        details = disease_information.get(

            predicted_class

        )

        # =================================================

        # FALLBACK FOR ANY CLASS

        # =================================================

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

                disease_name = "Unknown"

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

        # SEND RESULT TO FRONTEND

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

            "\nPrediction Error:",

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

@app.route(

    "/model-metrics",

    methods=["GET"]

)

def model_metrics():

    try:

        with open(

            METRICS_FILE,

            "r"

        ) as file:

            metrics = json.load(

                file

            )

        return jsonify({

            "success":

            True,

            "metrics":

            metrics

        })

    except Exception as error:

        print(

            "Model Metrics Error:",

            error

        )

        return jsonify({

            "success":

            False,

            "message":

            str(error)

        }), 500

def fallback_agriculture_answer(message):

    text = message.lower().strip()

    # ----------------------------------------------------

    # GREETING

    # ----------------------------------------------------

    if (

        text == "hi"

        or text == "hello"

        or text == "hey"

        or text.startswith("hi ")

        or text.startswith("hello ")

        or text.startswith("hey ")

    ):

        return (

            "Hello! 🌱 I'm your Agriculture AI Assistant. "

            "You can ask me about plant diseases, symptoms, "

            "prevention and general crop care."

        )

    # ----------------------------------------------------

    # RICE

    # ----------------------------------------------------

    if "rice" in text:

        return (

            "Rice can be affected by diseases such as "

            "blast, bacterial leaf blight and sheath blight. "

            "Common warning signs include leaf spots, "

            "discoloration and lesions. Regular crop "

            "monitoring and good field management can help "

            "reduce disease problems."

        )

    # ----------------------------------------------------

    # SOYBEAN

    # ----------------------------------------------------

    if (

        "soybean" in text

        or "soyabean" in text

    ):

        return (

            "Soybean diseases may cause leaf spots, "

            "yellowing or premature leaf damage. "

            "Regular field monitoring, healthy planting "

            "material and good crop management can help "

            "identify problems early."

        )

    # ----------------------------------------------------

    # MAIZE

    # ----------------------------------------------------

    if (

        "maize" in text

        or "corn" in text

    ):

        return (

            "Maize diseases can cause leaf spots, "

            "discoloration and damage to leaves. "

            "Good field hygiene, suitable spacing and "

            "regular monitoring can help reduce disease "

            "problems."

        )

    # ----------------------------------------------------

    # TOMATO

    # ----------------------------------------------------

    if "tomato" in text:

        return (

            "Common tomato diseases include early blight "

            "and late blight. Look for unusual leaf spots, "

            "yellowing or lesions. For a more specific "

            "prediction, upload a clear leaf image to "

            "the disease detection section."

        )

    # ----------------------------------------------------

    # POTATO

    # ----------------------------------------------------

    if "potato" in text:

        return (

            "Potato plants can be affected by early blight "

            "and late blight. Monitor the leaves regularly, "

            "maintain good spacing and remove severely "

            "affected plant material where appropriate."

        )

    # ----------------------------------------------------

    # EARLY BLIGHT

    # ----------------------------------------------------

    if "early blight" in text:

        return (

            "Early blight commonly produces dark leaf spots "

            "and progressive yellowing. Good air circulation, "

            "avoiding unnecessary leaf wetness and removing "

            "severely affected plant material can help manage "

            "the problem."

        )

    # ----------------------------------------------------

    # LATE BLIGHT

    # ----------------------------------------------------

    if "late blight" in text:

        return (

            "Late blight can spread quickly under favorable "

            "cool and humid conditions. Monitor plants "

            "carefully and seek agricultural guidance for "

            "appropriate disease management."

        )

    # ----------------------------------------------------

    # PREVENTION

    # ----------------------------------------------------

    if (

        "prevent" in text

        or "prevention" in text

    ):

        return (

            "General crop disease prevention includes using "

            "healthy planting material, maintaining proper "

            "spacing, monitoring crops regularly, removing "

            "severely affected plant material and avoiding "

            "unnecessary pesticide use."

        )

    # ----------------------------------------------------

    # TREATMENT

    # ----------------------------------------------------

    if (

        "treatment" in text

        or "medicine" in text

        or "pesticide" in text

    ):

        return (

            "Treatment depends on the crop and confirmed "

            "disease. Our system can help provide an image "

            "based prediction, but chemical treatment "

            "decisions should be confirmed with a qualified "

            "agricultural expert and the product label."

        )

    # ----------------------------------------------------

    # DEFAULT

    # ----------------------------------------------------

    return (

        "I can help with general questions about crop "

        "diseases, symptoms, prevention and plant health. "

        "You can also upload a clear leaf image in the "

        "detector for an AI-based prediction."

    )

# ========================================================

# CHAT API

# ========================================================

@app.route(

    "/chat",

    methods=["POST"]

)

def chat():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "message":

                    "Invalid request."

            }), 400

        user_message = (

            data.get(

                "message",

                ""

            )

            .strip()

        )

        if not user_message:

            return jsonify({

                "success": False,

                "message":

                    "Please enter a message."

            }), 400

        answer = (

            fallback_agriculture_answer(

                user_message

            )

        )

        return jsonify({

            "success": True,

            "reply": answer

        })

    except Exception as error:

        print(

            "Chat error:",

            error

        )

        return jsonify({

            "success": False,

            "message": str(error)

        }), 500

# =========================================================

# START SERVER

# =========================================================

if __name__ == "__main__":

    print(

        "\n========================================"

    )

    print(

        "PlantCare Flask Server Starting..."

    )

    print(

        "http://127.0.0.1:5000"

    )

    print(

        "========================================\n"

    )

    app.run(

        debug=True,

        port=5000

    )
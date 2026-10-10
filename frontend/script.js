console.log("PlantCare JavaScript loaded successfully!");


// =====================================================
// HTML ELEMENTS
// =====================================================

const uploadBtn = document.getElementById("uploadBtn");
const cameraBtn = document.getElementById("cameraBtn");

const imageInput = document.getElementById("imageInput");
const chooseImageBtn = document.getElementById("chooseImageBtn");

const uploadBox = document.getElementById("uploadBox");
const previewContainer = document.getElementById("previewContainer");

const imagePreview = document.getElementById("imagePreview");
const fileName = document.getElementById("fileName");

const changeImageBtn = document.getElementById("changeImageBtn");
const removeImageBtn = document.getElementById("removeImageBtn");

const detectBtn = document.getElementById("detectBtn");

const resultSection = document.getElementById("resultSection");


// =====================================================
// CAMERA VARIABLES
// =====================================================

let cameraStream = null;


// =====================================================
// MAIN UPLOAD BUTTON
// =====================================================

if (uploadBtn) {

    uploadBtn.addEventListener("click", function () {

        const uploadSection =
            document.getElementById("uploadSection");

        if (uploadSection) {

            uploadSection.scrollIntoView({
                behavior: "smooth"
            });

        }

        imageInput.click();

    });

}


// =====================================================
// CHOOSE IMAGE BUTTON
// =====================================================

if (chooseImageBtn) {

    chooseImageBtn.addEventListener("click", function () {

        imageInput.click();

    });

}


// =====================================================
// IMAGE SELECTED
// =====================================================

if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = imageInput.files[0];

        if (!file) {
            return;
        }


        // Check file type
        if (!file.type.startsWith("image/")) {

            alert("Please select an image file.");

            imageInput.value = "";

            return;
        }


        const reader = new FileReader();


        reader.onload = function (event) {

            imagePreview.src =
                event.target.result;


            fileName.textContent =
                "Selected file: " + file.name;


            if (uploadBox) {

                uploadBox.style.display =
                    "none";

            }


            if (previewContainer) {

                previewContainer.style.display =
                    "block";

            }


            if (resultSection) {

                resultSection.style.display =
                    "none";

            }


            if (detectBtn) {

                detectBtn.disabled =
                    false;

            }

        };


        reader.readAsDataURL(file);

    });

}


// =====================================================
// CHANGE IMAGE
// =====================================================

if (changeImageBtn) {

    changeImageBtn.addEventListener("click", function () {

        imageInput.click();

    });

}


// =====================================================
// REMOVE IMAGE
// =====================================================

if (removeImageBtn) {

    removeImageBtn.addEventListener("click", function () {

        imageInput.value = "";

        imagePreview.src = "";

        fileName.textContent = "";


        if (previewContainer) {

            previewContainer.style.display =
                "none";

        }


        if (uploadBox) {

            uploadBox.style.display =
                "block";

        }


        if (resultSection) {

            resultSection.style.display =
                "none";

        }


        if (detectBtn) {

            detectBtn.disabled =
                true;

        }

    });

}


// =====================================================
// CAMERA BUTTON
// =====================================================

if (cameraBtn) {

    cameraBtn.addEventListener("click", async function () {

        try {

            // Stop old camera if still running
            stopCamera();


            cameraStream =
                await navigator.mediaDevices.getUserMedia({

                    video: {
                        facingMode: "environment"
                    },

                    audio: false

                });


            showCameraWindow(
                cameraStream
            );


        } catch (error) {

            console.error(
                "Camera error:",
                error
            );


            alert(
                "Camera could not be opened. Please allow camera permission or use Upload Image."
            );

        }

    });

}


// =====================================================
// CREATE CAMERA WINDOW
// =====================================================

function showCameraWindow(stream) {

    // Remove previous camera modal
    const oldModal =
        document.getElementById(
            "cameraModal"
        );


    if (oldModal) {

        oldModal.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "cameraModal";


    modal.style.position =
        "fixed";

    modal.style.top =
        "0";

    modal.style.left =
        "0";

    modal.style.width =
        "100%";

    modal.style.height =
        "100%";

    modal.style.background =
        "rgba(0,0,0,0.85)";

    modal.style.zIndex =
        "9999";

    modal.style.display =
        "flex";

    modal.style.flexDirection =
        "column";

    modal.style.alignItems =
        "center";

    modal.style.justifyContent =
        "center";

    modal.style.padding =
        "20px";


    modal.innerHTML = `

        <div style="
            background:white;
            padding:20px;
            border-radius:18px;
            width:min(600px, 95%);
            text-align:center;
        ">

            <h2 style="
                color:#1b5e20;
                margin-bottom:15px;
            ">
                📷 Capture Plant Image
            </h2>


            <video
                id="cameraVideo"
                autoplay
                playsinline
                style="
                    width:100%;
                    max-height:420px;
                    object-fit:contain;
                    background:black;
                    border-radius:12px;
                "
            ></video>


            <canvas
                id="cameraCanvas"
                style="display:none;"
            ></canvas>


            <div style="
                margin-top:18px;
                display:flex;
                gap:12px;
                justify-content:center;
                flex-wrap:wrap;
            ">

                <button
                    type="button"
                    id="capturePhotoBtn"
                    style="
                        border:none;
                        background:#2e7d32;
                        color:white;
                        padding:12px 20px;
                        border-radius:25px;
                        cursor:pointer;
                        font-weight:bold;
                    "
                >
                    📸 Capture
                </button>


                <button
                    type="button"
                    id="closeCameraBtn"
                    style="
                        border:none;
                        background:#e53935;
                        color:white;
                        padding:12px 20px;
                        border-radius:25px;
                        cursor:pointer;
                        font-weight:bold;
                    "
                >
                    ✖ Close
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const video =
        document.getElementById(
            "cameraVideo"
        );


    video.srcObject =
        stream;


    const capturePhotoBtn =
        document.getElementById(
            "capturePhotoBtn"
        );


    const closeCameraBtn =
        document.getElementById(
            "closeCameraBtn"
        );


    capturePhotoBtn.addEventListener(
        "click",
        captureCameraPhoto
    );


    closeCameraBtn.addEventListener(
        "click",
        function () {

            stopCamera();

            modal.remove();

        }
    );

}


// =====================================================
// CAPTURE CAMERA PHOTO
// =====================================================

function captureCameraPhoto() {

    const video =
        document.getElementById(
            "cameraVideo"
        );


    const canvas =
        document.getElementById(
            "cameraCanvas"
        );


    if (!video || !canvas) {

        return;

    }


    if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {

        alert(
            "Camera is still loading. Please try again."
        );

        return;

    }


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    const context =
        canvas.getContext("2d");


    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    canvas.toBlob(

        function (blob) {

            if (!blob) {

                alert(
                    "Could not capture the image."
                );

                return;

            }


            const capturedFile =
                new File(
                    [blob],
                    "camera_capture.jpg",
                    {
                        type: "image/jpeg"
                    }
                );


            // Put camera image into image input
            const dataTransfer =
                new DataTransfer();


            dataTransfer.items.add(
                capturedFile
            );


            imageInput.files =
                dataTransfer.files;


            // Show preview
            imagePreview.src =
                URL.createObjectURL(
                    capturedFile
                );


            fileName.textContent =
                "Selected file: camera_capture.jpg";


            if (uploadBox) {

                uploadBox.style.display =
                    "none";

            }


            if (previewContainer) {

                previewContainer.style.display =
                    "block";

            }


            if (resultSection) {

                resultSection.style.display =
                    "none";

            }


            if (detectBtn) {

                detectBtn.disabled =
                    false;

            }


            stopCamera();


            const modal =
                document.getElementById(
                    "cameraModal"
                );


            if (modal) {

                modal.remove();

            }


            const uploadSection =
                document.getElementById(
                    "uploadSection"
                );


            if (uploadSection) {

                uploadSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        },

        "image/jpeg",

        0.92

    );

}


// =====================================================
// STOP CAMERA
// =====================================================

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();

                }
            );


        cameraStream =
            null;

    }

}


// =====================================================
// DETECT PLANT & DISEASE
// =====================================================

if (detectBtn) {

    detectBtn.addEventListener(
        "click",
        async function () {

            console.log(
                "Detect button clicked"
            );


            if (
                !imageInput.files ||
                !imageInput.files.length
            ) {

                alert(
                    "Please upload or capture an image first."
                );

                return;

            }


            const imageFile =
                imageInput.files[0];


            const formData =
                new FormData();


            formData.append(
                "image",
                imageFile
            );


            // Save old button content
            const oldButtonContent =
                detectBtn.innerHTML;


            detectBtn.disabled =
                true;


            detectBtn.innerHTML =
                "⏳ AI Analyzing...";


            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:5000/upload",
                        {

                            method: "POST",

                            body: formData

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Backend response:",
                    data
                );


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Could not analyze this image."
                    );

                    return;

                }


                if (!data.success) {

                    alert(
                        data.message ||
                        "Prediction failed."
                    );

                    return;

                }


                // Show everything
                showResult(
                    data
                );


            } catch (error) {

                console.error(
                    "Upload error:",
                    error
                );


                alert(
                    "Could not connect to PlantCare backend.\n\nMake sure python app.py is running."
                );


            } finally {

                detectBtn.disabled =
                    false;


                detectBtn.innerHTML =
                    oldButtonContent;

            }

        }
    );

}


// =====================================================
// SHOW AI RESULT ON WEBSITE
// =====================================================

function showResult(data) {

    // =================================================
    // PLANT
    // =================================================

    const resultPlant =
        document.getElementById(
            "resultPlant"
        );


    if (resultPlant) {

        resultPlant.textContent =
            data.plant || "-";

    }


    // =================================================
    // DISEASE
    // =================================================

    const resultDisease =
        document.getElementById(
            "resultDisease"
        );


    if (resultDisease) {

        resultDisease.textContent =
            data.disease || "-";

    }


    // =================================================
    // AI CONFIDENCE
    // =================================================

    const resultConfidence =
        document.getElementById(
            "resultConfidence"
        );


    if (resultConfidence) {

        
resultConfidence.textContent =
    "Not applicable (rule-based analysis)";

    }


    // =================================================
    // SEVERITY
    // =================================================

    const resultSeverity =
        document.getElementById(
            "resultSeverity"
        );


    if (resultSeverity) {

        resultSeverity.textContent =
            data.severity || "-";

    }


    // =================================================
    // AFFECTED AREA
    // =================================================

    const resultAffected =
        document.getElementById(
            "resultAffected"
        );


    if (resultAffected) {

        resultAffected.textContent =
            data.affected_percentage + "%";

    }


    // =================================================
    // CONDITION INFORMATION
    // =================================================

    const resultInformation =
        document.getElementById(
            "resultInformation"
        );


    if (resultInformation) {

        resultInformation.textContent =
            data.information || "";

    }


    // =================================================
    // TREATMENT
    // =================================================

    const resultTreatment =
        document.getElementById(
            "resultTreatment"
        );


    if (resultTreatment) {

        resultTreatment.textContent =
            data.treatment || "";

    }


    // =================================================
    // ORIGINAL IMAGE
    // =================================================

    const resultOriginalImage =
        document.getElementById(
            "resultOriginalImage"
        );


    if (
        resultOriginalImage &&
        data.original_image
    ) {

        resultOriginalImage.src =
            data.original_image;

    }


    // =================================================
    // HIGHLIGHTED AFFECTED REGION
    // =================================================

    const resultHighlightedImage =
        document.getElementById(
            "resultHighlightedImage"
        );


    if (
        resultHighlightedImage &&
        data.highlighted_image
    ) {

        resultHighlightedImage.src =
            data.highlighted_image;

    }


    // =====================================================
    // OPENCV SYMPTOM ANALYSIS
    // =====================================================

    const topPredictionsContainer =
        document.getElementById("topPredictions");

    if (topPredictionsContainer) {

        topPredictionsContainer.innerHTML = "";}

        const analysisMessage =
            document.createElement("div");

        analysisMessage.className = "prediction-row";

        analysisMessage.textContent =
            "Analysis Method: OpenCV Digital Image Processing. " +
            "Visible yellow, brown, and dark regions are analyzed " +
            "using image processing rules. " +
            "No AI predictions or confidence scores are used.";

        topPredictionsContainer.appendChild(
            analysisMessage
        );
    }

    


// =====================================================
// INITIAL PAGE STATE
// =====================================================

if (previewContainer) {

    previewContainer.style.display =
        "none";

}


if (resultSection) {

    resultSection.style.display =
        "none";

}


if (detectBtn) {

    detectBtn.disabled =
        true;

}


// =====================================================
// STOP CAMERA IF PAGE CLOSES
// =====================================================

window.addEventListener(
    "beforeunload",
    function () {

        stopCamera();

    }
);


// =====================================================
// LOAD MODEL PERFORMANCE METRICS
// =====================================================

async function loadModelMetrics() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/model-metrics"
        );

        const data = await response.json();

        if (!data.success) {
            console.log("Model metrics unavailable");
            return;
        }

        const metrics = data.metrics;


        // ==========================================
        // ACCURACY
        // ==========================================

        let accuracy = Number(metrics.accuracy);

        if (accuracy <= 1) {
            accuracy = accuracy * 100;
        }

        document.getElementById(
            "metricAccuracy"
        ).textContent =
            accuracy.toFixed(2) + "%";


        // ==========================================
        // PRECISION
        // ==========================================

        let precision = Number(metrics.precision);

        if (!isNaN(precision)) {

            if (precision <= 1) {
                precision = precision * 100;
            }

            document.getElementById(
                "metricPrecision"
            ).textContent =
                precision.toFixed(2) + "%";

        } else {

            document.getElementById(
                "metricPrecision"
            ).textContent =
                "N/A";
        }


        // ==========================================
        // RECALL
        // ==========================================

        let recall = Number(metrics.recall);

        if (!isNaN(recall)) {

            if (recall <= 1) {
                recall = recall * 100;
            }

            document.getElementById(
                "metricRecall"
            ).textContent =
                recall.toFixed(2) + "%";

        } else {

            document.getElementById(
                "metricRecall"
            ).textContent =
                "N/A";
        }


        // ==========================================
        // SENSITIVITY
        // ==========================================

        let sensitivity =
            Number(metrics.sensitivity);

        if (!isNaN(sensitivity)) {

            if (sensitivity <= 1) {
                sensitivity = sensitivity * 100;
            }

            document.getElementById(
                "metricSensitivity"
            ).textContent =
                sensitivity.toFixed(2) + "%";

        } else {

            document.getElementById(
                "metricSensitivity"
            ).textContent =
                "N/A";
        }


        // ==========================================
        // F1 SCORE
        // ==========================================

        let f1 = Number(metrics.f1_score);

        if (!isNaN(f1)) {

            if (f1 <= 1) {
                f1 = f1 * 100;
            }

            document.getElementById(
                "metricF1"
            ).textContent =
                f1.toFixed(2) + "%";

        } else {

            document.getElementById(
                "metricF1"
            ).textContent =
                "N/A";
        }


        // ==========================================
        // TEST IMAGES
        // ==========================================

        document.getElementById(
            "metricTestImages"
        ).textContent =
            metrics.test_images;


    } catch (error) {

        console.error(
            "Metrics loading error:",
            error
        );

    }
}


// Load metrics when page opens

loadModelMetrics();

// ==========================================
// GPS LOCATION - MAHARASHTRA ONLY
// ==========================================

function getLocation() {

    const result =
        document.getElementById(
            "locationResult"
        );


    if (!navigator.geolocation) {

        result.innerHTML =
            "❌ GPS location is not supported by this browser.";

        return;
    }


    result.innerHTML =
        "📍 Detecting your location...";


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            result.innerHTML =
                "📍 Location detected!<br>" +
                "Latitude: " +
                latitude.toFixed(6) +
                "<br>" +
                "Longitude: " +
                longitude.toFixed(6) +
                "<br><br>🔍 Checking Maharashtra location...";


            checkMaharashtraLocation(
                latitude,
                longitude
            );

        },


        function(error) {

            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {

                result.innerHTML =
                    "❌ Location permission was denied.<br>" +
                    "Please allow location access and try again.";

            }

            else {

                result.innerHTML =
                    "❌ Unable to detect your location.";

            }

        },


        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}


async function checkMaharashtraLocation(
    latitude,
    longitude
) {

    const result =
        document.getElementById(
            "locationResult"
        );


    try {

        const response =
            await fetch(

                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`

            );


        const data =
            await response.json();


        if (!data.address) {

            result.innerHTML =
                "❌ Could not identify the location.";

            return;

        }


        const state =
            data.address.state || "";


        const district =
            data.address.state_district ||
            data.address.county ||
            "Unknown";


        const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Unknown";


        if (
            state
                .toLowerCase()
                .includes("maharashtra")
        ) {

            result.innerHTML = `

                <h3>
                    ✅ Location is in Maharashtra
                </h3>

                <p>
                    <b>District:</b>
                    ${district}
                </p>

                <p>
                    <b>City / Area:</b>
                    ${city}
                </p>

                <p>
                    <b>Latitude:</b>
                    ${latitude.toFixed(6)}
                </p>

                <p>
                    <b>Longitude:</b>
                    ${longitude.toFixed(6)}
                </p>

                <hr>

                <h3>
                    🌾 Regional Agriculture Information
                </h3>

                <p>
                    Your location can now be used to
                    provide Maharashtra-specific crop information.
                </p>

            `;

        }

        else {

            result.innerHTML = `

                <h3>
                    ❌ Location Not Supported
                </h3>

                <p>
                    This project currently supports
                    locations only within Maharashtra.
                </p>

                <p>
                    Detected location:
                    ${state || "Unknown"}
                </p>

            `;

        }

    }

    catch (error) {

        console.error(
            error
        );


        result.innerHTML =
            "❌ Unable to identify your location. Please try again.";

    }

}


// ==========================================
// AGRICULTURE AI CHATBOT
// ==========================================

(function () {

    const chatbot =
        document.getElementById(
            "agriChatbot"
        );


    const openBtn =
        document.getElementById(
            "chatOpenBtn"
        );


    const minimizeBtn =
        document.getElementById(
            "chatMinimizeBtn"
        );


    const messages =
        document.getElementById(
            "chatMessages"
        );


    const input =
        document.getElementById(
            "chatInput"
        );


    const sendBtn =
        document.getElementById(
            "chatSendBtn"
        );


    const quickButtons =
        document.querySelectorAll(
            ".chat-quick-btn"
        );


    // Stop if chatbot elements don't exist
    if (
        !chatbot ||
        !messages ||
        !input ||
        !sendBtn
    ) {

        return;

    }


    // ==========================================
    // ADD MESSAGE
    // ==========================================

    function addMessage(
        text,
        sender
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "chat-message " +
            sender;


        // Bot avatar
        if (sender === "bot") {

            const avatar =
                document.createElement(
                    "div"
                );


            avatar.className =
                "chat-avatar";


            avatar.textContent =
                "🤖";


            row.appendChild(
                avatar
            );

        }


        const bubble =
            document.createElement(
                "div"
            );


        bubble.className =
            "chat-bubble";


        bubble.textContent =
            text;


        row.appendChild(
            bubble
        );


        messages.appendChild(
            row
        );


        messages.scrollTop =
            messages.scrollHeight;

    }


    // ==========================================
    // TYPING INDICATOR
    // ==========================================

    function showTyping() {

        const oldTyping =
            document.getElementById(
                "chatTyping"
            );


        if (oldTyping) {

            oldTyping.remove();

        }


        const row =
            document.createElement(
                "div"
            );


        row.id =
            "chatTyping";


        row.className =
            "chat-message bot";


        const avatar =
            document.createElement(
                "div"
            );


        avatar.className =
            "chat-avatar";


        avatar.textContent =
            "🤖";


        const bubble =
            document.createElement(
                "div"
            );


        bubble.className =
            "chat-bubble";


        bubble.textContent =
            "Typing...";


        row.appendChild(
            avatar
        );


        row.appendChild(
            bubble
        );


        messages.appendChild(
            row
        );


        messages.scrollTop =
            messages.scrollHeight;

    }


    // ==========================================
    // REMOVE TYPING INDICATOR
    // ==========================================

    function hideTyping() {

        const typing =
            document.getElementById(
                "chatTyping"
            );


        if (typing) {

            typing.remove();

        }

    }


    // ==========================================
    // SEND CHAT MESSAGE
    // ==========================================

    async function sendMessage(
        quickMessage
    ) {

        const message =
            quickMessage !== undefined
                ? quickMessage
                : input.value.trim();


        if (!message) {

            return;

        }


        // Show user message
        addMessage(
            message,
            "user"
        );


        // Clear input
        input.value = "";


        // Show typing
        showTyping();


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:5000/chat",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                message:
                                    message

                            })

                    }
                );


            const data =
                await response.json();


            hideTyping();


            if (
                data.success
            ) {

                addMessage(
                    data.reply ||
                    "I could not generate a response.",
                    "bot"
                );

            }

            else {

                addMessage(
                    data.message ||
                    "Sorry, something went wrong.",
                    "bot"
                );

            }

        }

        catch (error) {

            console.error(
                "Chatbot error:",
                error
            );


            hideTyping();


            addMessage(

                "I could not connect to the Agriculture Assistant. Please make sure python app.py is running.",

                "bot"

            );

        }

    }


    // ==========================================
    // SEND BUTTON
    // ==========================================

    sendBtn.addEventListener(
        "click",
        function () {

            sendMessage();

        }
    );


    // ==========================================
    // ENTER KEY
    // ==========================================

    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    // ==========================================
    // QUICK QUESTION BUTTONS
    // ==========================================

    quickButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const question =
                        button.dataset.question;


                    sendMessage(
                        question
                    );

                }
            );

        }
    );


    // ==========================================
    // MINIMIZE CHATBOT
    // ==========================================

    if (minimizeBtn) {

        minimizeBtn.addEventListener(
            "click",
            function () {

                chatbot.classList.add(
                    "minimized"
                );


                if (openBtn) {

                    openBtn.style.display =
                        "block";

                }

            }
        );

    }


    // ==========================================
    // OPEN CHATBOT
    // ==========================================

    if (openBtn) {

        openBtn.addEventListener(
            "click",
            function () {

                chatbot.classList.remove(
                    "minimized"
                );


                openBtn.style.display =
                    "none";


                input.focus();

            }
        );

    }

})();
/* =========================================================
   PLANTCARE MULTI-LANGUAGE SUPPORT
   10 LANGUAGES
========================================================= */

(function () {

    const translations = {

        /* ================= ENGLISH ================= */

        en: {

    languageName: "English",

    home: "Home",
    plantDetection: "Plant Detection",
    diseaseDetection: "Disease Detection",
    treatments: "Treatments",
    about: "About",

    plantIdentification: "Plant Identification",

    plantIdentificationDesc:
        "Identify supported crops using leaf images.",

    diseaseDetection: "Disease Detection",

    diseaseDetectionDesc:
        "Detect common crop diseases using AI.",

    treatment: "Treatment",

    treatmentDesc:
        "Receive basic treatment recommendations.",

    languages: "Languages",

    languagesDesc:
        "Select your preferred regional language.",

    selectPlantImage: "Select a plant image",
    chooseImage: "Choose image",
    changeImage: "Change image",
    remove: "Remove",
    detectPlant: "Detect plant and disease",
    uploadLeaf: "🌿 Upload plant leaf",
    selectedImage: "Selected image",
    capturePlantLeaf: "📷 Capture a plant leaf",
    capturePhoto: "Capture photo",
    retake: "Retake",
    closeCamera: "Close camera",
    aiResult: "🌿 AI analysis result",
    plant: "🌱 Plant",
    disease: "🦠 Disease",
    confidence: "🤖 AI confidence",
    topPredictions: "🤖 Top 3 AI predictions",
    severity: "🍂 Disease severity",
    affectedArea: "📉 Affected area",
    affectedAnalysis: "🔬 AI affected area analysis",
    originalLeaf: "Original leaf",
    detectedRegion: "Detected affected region",
    condition: "ℹ️ About the condition",
    recommendedTreatment: "🌿 Recommended treatment",
    modelPerformance: "📊 AI model performance",
    accuracy: "🎯 Accuracy",
    precision: "✅ Precision",
    recall: "🔍 Recall",
    sensitivity: "🧪 Sensitivity",
    f1Score: "📈 F1 score",
    testImages: "🖼 Test images",
    aboutPlantCare: "About PlantCare",
    chatbot: "Agriculture AI assistant",
    online: "● Online",
    chatbotPlaceholder: "Ask about plant health..."
},
        /* ================= HINDI ================= */

        hi: {
            languageName: "हिंदी",

            home: "होम",
            plantDetection: "पौधे की पहचान",
            diseaseDetection: "रोग का पता लगाना",
            treatments: "उपचार",
            about: "हमारे बारे में",

            heroTitle: "पौधे की पहचान और फसल रोग का पता लगाना",

            uploadImage: "चित्र अपलोड करें",
            openCamera: "कैमरा खोलें",
            plantIdentification: "पौधे की पहचान",
            diseaseDetection: "रोग का पता लगाना",
            treatment: "उपचार",
            languages: "भाषाएँ",
            plantIdentificationDesc:
    "पत्तियों की तस्वीरों का उपयोग करके समर्थित फसलों की पहचान करें।",

diseaseDetectionDesc:
    "AI का उपयोग करके सामान्य फसल रोगों का पता लगाएं।",

treatmentDesc:
    "बुनियादी उपचार की सिफारिशें प्राप्त करें।",

languagesDesc:
    "अपनी पसंदीदा क्षेत्रीय भाषा चुनें।",

            selectPlantImage: "पौधे की तस्वीर चुनें",
            chooseImage: "तस्वीर चुनें",
            changeImage: "तस्वीर बदलें",
            remove: "हटाएँ",
            detectPlant: "पौधे और रोग का पता लगाएँ",

            uploadLeaf: "🌿 पौधे की पत्ती अपलोड करें",
            selectedImage: "चयनित तस्वीर",

            capturePlantLeaf: "📷 पौधे की पत्ती की तस्वीर लें",
            capturePhoto: "तस्वीर लें",
            retake: "फिर से लें",
            closeCamera: "कैमरा बंद करें",

            aiResult: "🌿 AI विश्लेषण परिणाम",
            plant: "🌱 पौधा",
            disease: "🦠 रोग",
            confidence: "🤖 AI विश्वसनीयता",
            topPredictions: "🤖 शीर्ष 3 AI अनुमान",

            severity: "🍂 रोग की गंभीरता",
            affectedArea: "📉 प्रभावित क्षेत्र",

            affectedAnalysis: "🔬 AI प्रभावित क्षेत्र विश्लेषण",
            originalLeaf: "मूल पत्ती",
            detectedRegion: "पहचाना गया प्रभावित क्षेत्र",

            condition: "ℹ️ रोग के बारे में",
            recommendedTreatment: "🌿 अनुशंसित उपचार",

            modelPerformance: "📊 AI मॉडल प्रदर्शन",
            accuracy: "🎯 सटीकता",
            precision: "✅ प्रिसीजन",
            recall: "🔍 रिकॉल",
            sensitivity: "🧪 संवेदनशीलता",
            f1Score: "📈 F1 स्कोर",
            testImages: "🖼 परीक्षण तस्वीरें",

            aboutPlantCare: "PlantCare के बारे में",

            chatbot: "कृषि AI सहायक",
            online: "● ऑनलाइन",
            chatbotPlaceholder: "पौधों के स्वास्थ्य के बारे में पूछें..."
          
    
        },


        /* ================= MARATHI ================= */

        mr: {
            languageName: "मराठी",

            home: "मुख्यपृष्ठ",
            plantDetection: "वनस्पती ओळख",
            diseaseDetection: "रोग शोध",
            treatments: "उपचार",
            about: "आमच्याबद्दल",

            heroTitle: "वनस्पती ओळख आणि पिकांच्या रोगांचे निदान",

            uploadImage: "प्रतिमा अपलोड करा",
            openCamera: "कॅमेरा उघडा",

            plantIdentification: "वनस्पती ओळख",
            diseaseDetection: "रोग शोध",
            treatment: "उपचार",
            languages: "भाषा",
            plantIdentificationDesc:
                "पानांच्या प्रतिमांचा वापर करून समर्थित पिकांची ओळख करा.",

diseaseDetectionDesc:
    "AI चा वापर करून सामान्य पिकांचे रोग शोधा.",

treatmentDesc:
    "मूलभूत उपचारांच्या शिफारसी मिळवा.",

languagesDesc:
    "तुमची पसंतीची प्रादेशिक भाषा निवडा.",

            selectPlantImage: "वनस्पतीची प्रतिमा निवडा",
            chooseImage: "प्रतिमा निवडा",
            changeImage: "प्रतिमा बदला",
            remove: "काढा",
            detectPlant: "वनस्पती आणि रोग शोधा",

            uploadLeaf: "🌿 वनस्पतीची पाने अपलोड करा",
            selectedImage: "निवडलेली प्रतिमा",

            capturePlantLeaf: "📷 वनस्पतीच्या पानाचा फोटो घ्या",
            capturePhoto: "फोटो घ्या",
            retake: "पुन्हा घ्या",
            closeCamera: "कॅमेरा बंद करा",

            aiResult: "🌿 AI विश्लेषण परिणाम",
            plant: "🌱 वनस्पती",
            disease: "🦠 रोग",
            confidence: "🤖 AI विश्वास पातळी",
            topPredictions: "🤖 शीर्ष 3 AI अंदाज",

            severity: "🍂 रोगाची तीव्रता",
            affectedArea: "📉 प्रभावित क्षेत्र",

            affectedAnalysis: "🔬 AI प्रभावित क्षेत्र विश्लेषण",
            originalLeaf: "मूळ पान",
            detectedRegion: "शोधलेले प्रभावित क्षेत्र",

            condition: "ℹ️ रोगाबद्दल",
            recommendedTreatment: "🌿 शिफारस केलेला उपचार",

            modelPerformance: "📊 AI मॉडेल कामगिरी",
            accuracy: "🎯 अचूकता",
            precision: "✅ प्रिसीजन",
            recall: "🔍 रिकॉल",
            sensitivity: "🧪 संवेदनशीलता",
            f1Score: "📈 F1 स्कोअर",
            testImages: "🖼 चाचणी प्रतिमा",

            aboutPlantCare: "PlantCare बद्दल",

            chatbot: "कृषी AI सहाय्यक",
            online: "● ऑनलाइन",
            chatbotPlaceholder: "वनस्पतीच्या आरोग्याबद्दल विचारा..."
    
        },


        /* ================= TAMIL ================= */

        ta: {
            languageName: "தமிழ்",

            home: "முகப்பு",
            plantDetection: "தாவர அடையாளம்",
            diseaseDetection: "நோய் கண்டறிதல்",
            treatments: "சிகிச்சைகள்",
            about: "எங்களைப் பற்றி",

            heroTitle: "தாவர அடையாளம் மற்றும் பயிர் நோய் கண்டறிதல்",

            uploadImage: "படத்தை பதிவேற்றவும்",
            openCamera: "கேமராவை திறக்கவும்",

            plantIdentification: "தாவர அடையாளம்",
            diseaseDetection: "நோய் கண்டறிதல்",
            treatment: "சிகிச்சை",
            languages: "மொழிகள்",
            plantIdentificationDesc:
    "இலை படங்களைப் பயன்படுத்தி ஆதரிக்கப்படும் பயிர்களை அடையாளம் காணவும்.",

diseaseDetectionDesc:
    "AI-ஐப் பயன்படுத்தி பொதுவான பயிர் நோய்களைக் கண்டறியவும்.",

treatmentDesc:
    "அடிப்படை சிகிச்சை பரிந்துரைகளைப் பெறவும்.",

languagesDesc:
    "உங்களுக்கு விருப்பமான பிராந்திய மொழியைத் தேர்ந்தெடுக்கவும்.",

            selectPlantImage: "தாவர படத்தை தேர்ந்தெடுக்கவும்",
            chooseImage: "படத்தை தேர்ந்தெடுக்கவும்",
            changeImage: "படத்தை மாற்றவும்",
            remove: "நீக்கவும்",
            detectPlant: "தாவரம் மற்றும் நோயை கண்டறியவும்",

            uploadLeaf: "🌿 தாவர இலையை பதிவேற்றவும்",
            selectedImage: "தேர்ந்தெடுக்கப்பட்ட படம்",

            capturePlantLeaf: "📷 தாவர இலையின் படத்தை எடுக்கவும்",
            capturePhoto: "புகைப்படம் எடுக்கவும்",
            retake: "மீண்டும் எடுக்கவும்",
            closeCamera: "கேமராவை மூடவும்",

            aiResult: "🌿 AI பகுப்பாய்வு முடிவு",
            plant: "🌱 தாவரம்",
            disease: "🦠 நோய்",
            confidence: "🤖 AI நம்பகத்தன்மை",
            topPredictions: "🤖 முதல் 3 AI கணிப்புகள்",

            severity: "🍂 நோயின் தீவிரம்",
            affectedArea: "📉 பாதிக்கப்பட்ட பகுதி",

            affectedAnalysis: "🔬 AI பாதிக்கப்பட்ட பகுதி பகுப்பாய்வு",
            originalLeaf: "அசல் இலை",
            detectedRegion: "கண்டறியப்பட்ட பகுதி",

            condition: "ℹ️ நோய் பற்றிய தகவல்",
            recommendedTreatment: "🌿 பரிந்துரைக்கப்பட்ட சிகிச்சை",

            modelPerformance: "📊 AI மாதிரி செயல்திறன்",
            accuracy: "🎯 துல்லியம்",
            precision: "✅ துல்லிய விகிதம்",
            recall: "🔍 மீள்பெறுதல்",
            sensitivity: "🧪 உணர்திறன்",
            f1Score: "📈 F1 மதிப்பெண்",
            testImages: "🖼 சோதனை படங்கள்",

            aboutPlantCare: "PlantCare பற்றி",

            chatbot: "விவசாய AI உதவியாளர்",
            online: "● ஆன்லைன்",
            chatbotPlaceholder: "தாவர ஆரோக்கியத்தைப் பற்றி கேளுங்கள்..."
        },


        /* ================= TELUGU ================= */

        te: {
            languageName: "తెలుగు",

            home: "హోమ్",
            plantDetection: "మొక్క గుర్తింపు",
            diseaseDetection: "వ్యాధి గుర్తింపు",
            treatments: "చికిత్సలు",
            about: "మా గురించి",

            heroTitle: "మొక్కల గుర్తింపు మరియు పంట వ్యాధి గుర్తింపు",

            uploadImage: "చిత్రాన్ని అప్‌లోడ్ చేయండి",
            openCamera: "కెమెరాను తెరవండి",

            plantIdentification: "మొక్క గుర్తింపు",
            diseaseDetection: "వ్యాధి గుర్తింపు",
            treatment: "చికిత్స",
            languages: "భాషలు",
            plantIdentificationDesc:
    "ఆకు చిత్రాలను ఉపయోగించి మద్దతు ఉన్న పంటలను గుర్తించండి.",

diseaseDetectionDesc:
    "AIని ఉపయోగించి సాధారణ పంట వ్యాధులను గుర్తించండి.",

treatmentDesc:
    "ప్రాథమిక చికిత్స సిఫార్సులను పొందండి.",

languagesDesc:
    "మీకు ఇష్టమైన ప్రాంతీయ భాషను ఎంచుకోండి.",

            selectPlantImage: "మొక్క చిత్రాన్ని ఎంచుకోండి",
            chooseImage: "చిత్రాన్ని ఎంచుకోండి",
            changeImage: "చిత్రాన్ని మార్చండి",
            remove: "తొలగించండి",
            detectPlant: "మొక్క మరియు వ్యాధిని గుర్తించండి",

            uploadLeaf: "🌿 మొక్క ఆకును అప్‌లోడ్ చేయండి",
            selectedImage: "ఎంచుకున్న చిత్రం",

            capturePlantLeaf: "📷 మొక్క ఆకు ఫోటో తీయండి",
            capturePhoto: "ఫోటో తీయండి",
            retake: "మళ్లీ తీయండి",
            closeCamera: "కెమెరాను మూసివేయండి",

            aiResult: "🌿 AI విశ్లేషణ ఫలితం",
            plant: "🌱 మొక్క",
            disease: "🦠 వ్యాధి",
            confidence: "🤖 AI నమ్మక స్థాయి",
            topPredictions: "🤖 టాప్ 3 AI అంచనాలు",

            severity: "🍂 వ్యాధి తీవ్రత",
            affectedArea: "📉 ప్రభావిత ప్రాంతం",

            affectedAnalysis: "🔬 AI ప్రభావిత ప్రాంత విశ్లేషణ",
            originalLeaf: "అసలు ఆకు",
            detectedRegion: "గుర్తించిన ప్రభావిత ప్రాంతం",

            condition: "ℹ️ వ్యాధి గురించి",
            recommendedTreatment: "🌿 సిఫార్సు చేసిన చికిత్స",

            modelPerformance: "📊 AI మోడల్ పనితీరు",
            accuracy: "🎯 ఖచ్చితత్వం",
            precision: "✅ ప్రెసిషన్",
            recall: "🔍 రీకాల్",
            sensitivity: "🧪 సెన్సిటివిటీ",
            f1Score: "📈 F1 స్కోర్",
            testImages: "🖼 పరీక్ష చిత్రాలు",

            aboutPlantCare: "PlantCare గురించి",

            chatbot: "వ్యవసాయ AI సహాయకుడు",
            online: "● ఆన్‌లైన్",
            chatbotPlaceholder: "మొక్క ఆరోగ్యం గురించి అడగండి..."
        },


        /* ================= KANNADA ================= */

        kn: {
            languageName: "ಕನ್ನಡ",

            home: "ಮುಖಪುಟ",
            plantDetection: "ಸಸ್ಯ ಗುರುತಿಸುವಿಕೆ",
            diseaseDetection: "ರೋಗ ಪತ್ತೆ",
            treatments: "ಚಿಕಿತ್ಸೆಗಳು",
            about: "ನಮ್ಮ ಬಗ್ಗೆ",

            heroTitle: "ಸಸ್ಯ ಗುರುತಿಸುವಿಕೆ ಮತ್ತು ಬೆಳೆ ರೋಗ ಪತ್ತೆ",

            uploadImage: "ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
            openCamera: "ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ",

            plantIdentification: "ಸಸ್ಯ ಗುರುತಿಸುವಿಕೆ",
            diseaseDetection: "ರೋಗ ಪತ್ತೆ",
            treatment: "ಚಿಕಿತ್ಸೆ",
            languages: "ಭಾಷೆಗಳು",
            plantIdentificationDesc:
    "ಎಲೆಗಳ ಚಿತ್ರಗಳನ್ನು ಬಳಸಿಕೊಂಡು ಬೆಂಬಲಿತ ಬೆಳೆಗಳನ್ನು ಗುರುತಿಸಿ.",

diseaseDetectionDesc:
    "AI ಬಳಸಿ ಸಾಮಾನ್ಯ ಬೆಳೆ ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ.",

treatmentDesc:
    "ಮೂಲಭೂತ ಚಿಕಿತ್ಸಾ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ.",

languagesDesc:
    "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",

            selectPlantImage: "ಸಸ್ಯದ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
            chooseImage: "ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ",
            changeImage: "ಚಿತ್ರ ಬದಲಾಯಿಸಿ",
            remove: "ತೆಗೆದುಹಾಕಿ",
            detectPlant: "ಸಸ್ಯ ಮತ್ತು ರೋಗವನ್ನು ಪತ್ತೆ ಮಾಡಿ",

            uploadLeaf: "🌿 ಸಸ್ಯದ ಎಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
            selectedImage: "ಆಯ್ಕೆಮಾಡಿದ ಚಿತ್ರ",

            capturePlantLeaf: "📷 ಸಸ್ಯದ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ",
            capturePhoto: "ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ",
            retake: "ಮತ್ತೆ ತೆಗೆದುಕೊಳ್ಳಿ",
            closeCamera: "ಕ್ಯಾಮೆರಾ ಮುಚ್ಚಿ",

            aiResult: "🌿 AI ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ",
            plant: "🌱 ಸಸ್ಯ",
            disease: "🦠 ರೋಗ",
            confidence: "🤖 AI ವಿಶ್ವಾಸ",
            topPredictions: "🤖 ಟಾಪ್ 3 AI ಊಹೆಗಳು",

            severity: "🍂 ರೋಗದ ತೀವ್ರತೆ",
            affectedArea: "📉 ಬಾಧಿತ ಪ್ರದೇಶ",

            affectedAnalysis: "🔬 AI ಬಾಧಿತ ಪ್ರದೇಶ ವಿಶ್ಲೇಷಣೆ",
            originalLeaf: "ಮೂಲ ಎಲೆ",
            detectedRegion: "ಪತ್ತೆಯಾದ ಬಾಧಿತ ಪ್ರದೇಶ",

            condition: "ℹ️ ರೋಗದ ಬಗ್ಗೆ",
            recommendedTreatment: "🌿 ಶಿಫಾರಸು ಮಾಡಿದ ಚಿಕಿತ್ಸೆ",

            modelPerformance: "📊 AI ಮಾದರಿ ಕಾರ್ಯಕ್ಷಮತೆ",
            accuracy: "🎯 ನಿಖರತೆ",
            precision: "✅ ಪ್ರಿಸಿಷನ್",
            recall: "🔍 ರಿಕಾಲ್",
            sensitivity: "🧪 ಸೆನ್ಸಿಟಿವಿಟಿ",
            f1Score: "📈 F1 ಸ್ಕೋರ್",
            testImages: "🖼 ಪರೀಕ್ಷಾ ಚಿತ್ರಗಳು",

            aboutPlantCare: "PlantCare ಬಗ್ಗೆ",

            chatbot: "ಕೃಷಿ AI ಸಹಾಯಕ",
            online: "● ಆನ್‌ಲೈನ್",
            chatbotPlaceholder: "ಸಸ್ಯ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕೇಳಿ..."
        },


        /* ================= MALAYALAM ================= */

        ml: {
            languageName: "മലയാളം",

            home: "ഹോം",
            plantDetection: "സസ്യ തിരിച്ചറിയൽ",
            diseaseDetection: "രോഗ കണ്ടെത്തൽ",
            treatments: "ചികിത്സകൾ",
            about: "ഞങ്ങളെക്കുറിച്ച്",

            heroTitle: "സസ്യ തിരിച്ചറിയലും വിള രോഗ കണ്ടെത്തലും",

            uploadImage: "ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
            openCamera: "ക്യാമറ തുറക്കുക",

            plantIdentification: "സസ്യ തിരിച്ചറിയൽ",
            diseaseDetection: "രോഗ കണ്ടെത്തൽ",
            treatment: "ചികിത്സ",
            languages: "ഭാഷകൾ",
            plantIdentificationDesc:
    "ഇലകളുടെ ചിത്രങ്ങൾ ഉപയോഗിച്ച് പിന്തുണയ്ക്കുന്ന വിളകളെ തിരിച്ചറിയുക.",

diseaseDetectionDesc:
    "AI ഉപയോഗിച്ച് സാധാരണ വിള രോഗങ്ങൾ കണ്ടെത്തുക.",

treatmentDesc:
    "അടിസ്ഥാന ചികിത്സാ നിർദ്ദേശങ്ങൾ നേടുക.",

languagesDesc:
    "നിങ്ങൾക്ക് ഇഷ്ടമുള്ള പ്രാദേശിക ഭാഷ തിരഞ്ഞെടുക്കുക.",

            selectPlantImage: "സസ്യ ചിത്രം തിരഞ്ഞെടുക്കുക",
            chooseImage: "ചിത്രം തിരഞ്ഞെടുക്കുക",
            changeImage: "ചിത്രം മാറ്റുക",
            remove: "നീക്കം ചെയ്യുക",
            detectPlant: "സസ്യവും രോഗവും കണ്ടെത്തുക",

            uploadLeaf: "🌿 സസ്യ ഇല അപ്‌ലോഡ് ചെയ്യുക",
            selectedImage: "തിരഞ്ഞെടുത്ത ചിത്രം",

            capturePlantLeaf: "📷 സസ്യ ഇലയുടെ ചിത്രം എടുക്കുക",
            capturePhoto: "ചിത്രം എടുക്കുക",
            retake: "വീണ്ടും എടുക്കുക",
            closeCamera: "ക്യാമറ അടയ്ക്കുക",

            aiResult: "🌿 AI വിശകലന ഫലം",
            plant: "🌱 സസ്യം",
            disease: "🦠 രോഗം",
            confidence: "🤖 AI വിശ്വാസ്യത",
            topPredictions: "🤖 മികച്ച 3 AI പ്രവചനങ്ങൾ",

            severity: "🍂 രോഗത്തിന്റെ തീവ്രത",
            affectedArea: "📉 ബാധിച്ച പ്രദേശം",

            affectedAnalysis: "🔬 AI ബാധിച്ച പ്രദേശ വിശകലനം",
            originalLeaf: "യഥാർത്ഥ ഇല",
            detectedRegion: "കണ്ടെത്തിയ ബാധിത പ്രദേശം",

            condition: "ℹ️ രോഗത്തെക്കുറിച്ച്",
            recommendedTreatment: "🌿 ശുപാർശ ചെയ്യുന്ന ചികിത്സ",

            modelPerformance: "📊 AI മോഡൽ പ്രകടനം",
            accuracy: "🎯 കൃത്യത",
            precision: "✅ പ്രിസിഷൻ",
            recall: "🔍 റിക്കോൾ",
            sensitivity: "🧪 സെൻസിറ്റിവിറ്റി",
            f1Score: "📈 F1 സ്കോർ",
            testImages: "🖼 പരീക്ഷണ ചിത്രങ്ങൾ",

            aboutPlantCare: "PlantCare-നെ കുറിച്ച്",

            chatbot: "കൃഷി AI സഹായി",
            online: "● ഓൺലൈൻ",
            chatbotPlaceholder: "സസ്യ ആരോഗ്യത്തെക്കുറിച്ച് ചോദിക്കുക..."
        },


        /* ================= BENGALI ================= */

        bn: {
            languageName: "বাংলা",

            home: "হোম",
            plantDetection: "উদ্ভিদ শনাক্তকরণ",
            diseaseDetection: "রোগ শনাক্তকরণ",
            treatments: "চিকিৎসা",
            about: "আমাদের সম্পর্কে",

            heroTitle: "উদ্ভিদ শনাক্তকরণ এবং ফসলের রোগ শনাক্তকরণ",

            uploadImage: "ছবি আপলোড করুন",
            openCamera: "ক্যামেরা খুলুন",

            plantIdentification: "উদ্ভিদ শনাক্তকরণ",
            diseaseDetection: "রোগ শনাক্তকরণ",
            treatment: "চিকিৎসা",
            languages: "ভাষা",
            plantIdentificationDesc:
    "পাতার ছবি ব্যবহার করে সমর্থিত ফসল শনাক্ত করুন।",

diseaseDetectionDesc:
    "AI ব্যবহার করে সাধারণ ফসলের রোগ শনাক্ত করুন।",

treatmentDesc:
    "প্রাথমিক চিকিৎসার পরামর্শ পান।",

languagesDesc:
    "আপনার পছন্দের আঞ্চলিক ভাষা নির্বাচন করুন।",

            selectPlantImage: "উদ্ভিদের ছবি নির্বাচন করুন",
            chooseImage: "ছবি নির্বাচন করুন",
            changeImage: "ছবি পরিবর্তন করুন",
            remove: "সরান",
            detectPlant: "উদ্ভিদ ও রোগ শনাক্ত করুন",

            uploadLeaf: "🌿 উদ্ভিদের পাতা আপলোড করুন",
            selectedImage: "নির্বাচিত ছবি",

            capturePlantLeaf: "📷 উদ্ভিদের পাতার ছবি তুলুন",
            capturePhoto: "ছবি তুলুন",
            retake: "আবার তুলুন",
            closeCamera: "ক্যামেরা বন্ধ করুন",

            aiResult: "🌿 AI বিশ্লেষণের ফলাফল",
            plant: "🌱 উদ্ভিদ",
            disease: "🦠 রোগ",
            confidence: "🤖 AI নির্ভরযোগ্যতা",
            topPredictions: "🤖 শীর্ষ ৩টি AI পূর্বাভাস",

            severity: "🍂 রোগের তীব্রতা",
            affectedArea: "📉 আক্রান্ত এলাকা",

            affectedAnalysis: "🔬 AI আক্রান্ত এলাকা বিশ্লেষণ",
            originalLeaf: "মূল পাতা",
            detectedRegion: "শনাক্ত করা আক্রান্ত এলাকা",

            condition: "ℹ️ রোগ সম্পর্কে",
            recommendedTreatment: "🌿 প্রস্তাবিত চিকিৎসা",

            modelPerformance: "📊 AI মডেলের কার্যক্ষমতা",
            accuracy: "🎯 নির্ভুলতা",
            precision: "✅ প্রিসিশন",
            recall: "🔍 রিকল",
            sensitivity: "🧪 সেনসিটিভিটি",
            f1Score: "📈 F1 স্কোর",
            testImages: "🖼 পরীক্ষার ছবি",

            aboutPlantCare: "PlantCare সম্পর্কে",

            chatbot: "কৃষি AI সহকারী",
            online: "● অনলাইন",
            chatbotPlaceholder: "উদ্ভিদের স্বাস্থ্য সম্পর্কে জিজ্ঞাসা করুন..."
        },


        /* ================= GUJARATI ================= */

        gu: {
            languageName: "ગુજરાતી",

            home: "હોમ",
            plantDetection: "છોડની ઓળખ",
            diseaseDetection: "રોગની ઓળખ",
            treatments: "સારવાર",
            about: "અમારા વિશે",

            heroTitle: "છોડની ઓળખ અને પાકના રોગની તપાસ",

            uploadImage: "છબી અપલોડ કરો",
            openCamera: "કેમેરા ખોલો",

            plantIdentification: "છોડની ઓળખ",
            diseaseDetection: "રોગની તપાસ",
            treatment: "સારવાર",
            languages: "ભાષાઓ",
            plantIdentificationDesc:
    "પાંદડાની છબીઓનો ઉપયોગ કરીને સમર્થિત પાકોની ઓળખ કરો.",

diseaseDetectionDesc:
    "AI નો ઉપયોગ કરીને સામાન્ય પાકના રોગો શોધો.",

treatmentDesc:
    "મૂળભૂત સારવારની ભલામણો મેળવો.",

languagesDesc:
    "તમારી પસંદગીની પ્રાદેશિક ભાષા પસંદ કરો.",

            selectPlantImage: "છોડની છબી પસંદ કરો",
            chooseImage: "છબી પસંદ કરો",
            changeImage: "છબી બદલો",
            remove: "દૂર કરો",
            detectPlant: "છોડ અને રોગ શોધો",

            uploadLeaf: "🌿 છોડનું પાન અપલોડ કરો",
            selectedImage: "પસંદ કરેલી છબી",

            capturePlantLeaf: "📷 છોડના પાનનો ફોટો લો",
            capturePhoto: "ફોટો લો",
            retake: "ફરીથી લો",
            closeCamera: "કેમેરા બંધ કરો",

            aiResult: "🌿 AI વિશ્લેષણ પરિણામ",
            plant: "🌱 છોડ",
            disease: "🦠 રોગ",
            confidence: "🤖 AI વિશ્વાસ",
            topPredictions: "🤖 ટોચના 3 AI અનુમાનો",

            severity: "🍂 રોગની ગંભીરતા",
            affectedArea: "📉 અસરગ્રસ્ત વિસ્તાર",

            affectedAnalysis: "🔬 AI અસરગ્રસ્ત વિસ્તાર વિશ્લેષણ",
            originalLeaf: "મૂળ પાન",
            detectedRegion: "શોધાયેલ અસરગ્રસ્ત વિસ્તાર",

            condition: "ℹ️ રોગ વિશે",
            recommendedTreatment: "🌿 ભલામણ કરેલ સારવાર",

            modelPerformance: "📊 AI મોડેલ કામગીરી",
            accuracy: "🎯 ચોકસાઈ",
            precision: "✅ પ્રિસિઝન",
            recall: "🔍 રિકોલ",
            sensitivity: "🧪 સેન્સિટિવિટી",
            f1Score: "📈 F1 સ્કોર",
            testImages: "🖼 પરીક્ષણ છબીઓ",

            aboutPlantCare: "PlantCare વિશે",

            chatbot: "કૃષિ AI સહાયક",
            online: "● ઓનલાઇન",
            chatbotPlaceholder: "છોડના સ્વાસ્થ્ય વિશે પૂછો..."
        },


        /* ================= PUNJABI ================= */

        pa: {
            languageName: "ਪੰਜਾਬੀ",

            home: "ਮੁੱਖ ਪੰਨਾ",
            plantDetection: "ਪੌਦੇ ਦੀ ਪਛਾਣ",
            diseaseDetection: "ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ",
            treatments: "ਇਲਾਜ",
            about: "ਸਾਡੇ ਬਾਰੇ",

            heroTitle: "ਪੌਦੇ ਦੀ ਪਛਾਣ ਅਤੇ ਫਸਲਾਂ ਦੀ ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ",

            uploadImage: "ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
            openCamera: "ਕੈਮਰਾ ਖੋਲ੍ਹੋ",

            plantIdentification: "ਪੌਦੇ ਦੀ ਪਛਾਣ",
            diseaseDetection: "ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ",
            treatment: "ਇਲਾਜ",
            languages: "ਭਾਸ਼ਾਵਾਂ",
            plantIdentificationDesc:
    "ਪੱਤਿਆਂ ਦੀਆਂ ਤਸਵੀਰਾਂ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਸਮਰਥਿਤ ਫਸਲਾਂ ਦੀ ਪਛਾਣ ਕਰੋ।",

diseaseDetectionDesc:
    "AI ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਆਮ ਫਸਲਾਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦੀ ਪਛਾਣ ਕਰੋ।",

treatmentDesc:
    "ਮੁੱਢਲੀਆਂ ਇਲਾਜ ਦੀਆਂ ਸਿਫ਼ਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ।",

languagesDesc:
    "ਆਪਣੀ ਪਸੰਦੀਦਾ ਖੇਤਰੀ ਭਾਸ਼ਾ ਚੁਣੋ।",

            selectPlantImage: "ਪੌਦੇ ਦੀ ਤਸਵੀਰ ਚੁਣੋ",
            chooseImage: "ਤਸਵੀਰ ਚੁਣੋ",
            changeImage: "ਤਸਵੀਰ ਬਦਲੋ",
            remove: "ਹਟਾਓ",
            detectPlant: "ਪੌਦੇ ਅਤੇ ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ ਕਰੋ",

            uploadLeaf: "🌿 ਪੌਦੇ ਦਾ ਪੱਤਾ ਅਪਲੋਡ ਕਰੋ",
            selectedImage: "ਚੁਣੀ ਗਈ ਤਸਵੀਰ",

            capturePlantLeaf: "📷 ਪੌਦੇ ਦੇ ਪੱਤੇ ਦੀ ਤਸਵੀਰ ਲਓ",
            capturePhoto: "ਤਸਵੀਰ ਲਓ",
            retake: "ਦੁਬਾਰਾ ਲਓ",
            closeCamera: "ਕੈਮਰਾ ਬੰਦ ਕਰੋ",

            aiResult: "🌿 AI ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ",
            plant: "🌱 ਪੌਦਾ",
            disease: "🦠 ਬਿਮਾਰੀ",
            confidence: "🤖 AI ਭਰੋਸੇਯੋਗਤਾ",
            topPredictions: "🤖 ਚੋਟੀ ਦੇ 3 AI ਅਨੁਮਾਨ",

            severity: "🍂 ਬਿਮਾਰੀ ਦੀ ਗੰਭੀਰਤਾ",
            affectedArea: "📉 ਪ੍ਰਭਾਵਿਤ ਖੇਤਰ",

            affectedAnalysis: "🔬 AI ਪ੍ਰਭਾਵਿਤ ਖੇਤਰ ਵਿਸ਼ਲੇਸ਼ਣ",
            originalLeaf: "ਅਸਲ ਪੱਤਾ",
            detectedRegion: "ਪਛਾਣਿਆ ਪ੍ਰਭਾਵਿਤ ਖੇਤਰ",

            condition: "ℹ️ ਬਿਮਾਰੀ ਬਾਰੇ",
            recommendedTreatment: "🌿 ਸਿਫਾਰਸ਼ ਕੀਤਾ ਇਲਾਜ",

            modelPerformance: "📊 AI ਮਾਡਲ ਪ੍ਰਦਰਸ਼ਨ",
            accuracy: "🎯 ਸ਼ੁੱਧਤਾ",
            precision: "✅ ਪ੍ਰਿਸੀਜ਼ਨ",
            recall: "🔍 ਰੀਕਾਲ",
            sensitivity: "🧪 ਸੰਵੇਦਨਸ਼ੀਲਤਾ",
            f1Score: "📈 F1 ਸਕੋਰ",
            testImages: "🖼 ਟੈਸਟ ਤਸਵੀਰਾਂ",

            aboutPlantCare: "PlantCare ਬਾਰੇ",

            chatbot: "ਖੇਤੀਬਾੜੀ AI ਸਹਾਇਕ",
            online: "● ਔਨਲਾਈਨ",
            chatbotPlaceholder: "ਪੌਦੇ ਦੀ ਸਿਹਤ ਬਾਰੇ ਪੁੱਛੋ..."
        }

    };


    /* =====================================================
       LANGUAGE SELECTOR
    ===================================================== */

    const languageButton = document.getElementById("languageButton");
    const languageMenu = document.getElementById("languageMenu");
    const currentLanguage = document.getElementById("currentLanguage");


    if (!languageButton || !languageMenu) {
        console.warn("PlantCare language selector not found.");
        return;
    }


    /* Open / close language menu */

    languageButton.addEventListener("click", function (event) {

        event.stopPropagation();

        languageMenu.classList.toggle("show");

        const isOpen = languageMenu.classList.contains("show");

        languageButton.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });


    /* Close menu when clicking outside */

    document.addEventListener("click", function (event) {

        if (
            !languageMenu.contains(event.target) &&
            !languageButton.contains(event.target)
        ) {

            languageMenu.classList.remove("show");

            languageButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });


    /* =====================================================
       APPLY LANGUAGE
    ===================================================== */

    function applyLanguage(language) {

        const selectedTranslation = translations[language];

        if (!selectedTranslation) {
            console.error("Translation not found:", language);
            return;
        }


        /* Translate elements with data-i18n */

        document.querySelectorAll("[data-i18n]").forEach(function (element) {

            const key = element.getAttribute("data-i18n");

            const translatedText =
                selectedTranslation[key] || translations.en[key];

            if (translatedText) {

                element.textContent = translatedText;

            }

        });


        /* Translate placeholders */

        document
            .querySelectorAll("[data-i18n-placeholder]")
            .forEach(function (element) {

                const key =
                    element.getAttribute("data-i18n-placeholder");

                const translatedPlaceholder =
                    selectedTranslation[key] || translations.en[key];

                if (translatedPlaceholder) {

                    element.placeholder =
                        translatedPlaceholder;

                }

            });


        /* Update selected language */

        if (currentLanguage) {
            currentLanguage.textContent =
                selectedTranslation.languageName;
        }


        /* Update HTML language */

        document.documentElement.lang = language;


        /* Save language */

        localStorage.setItem(
            "plantCareLanguage",
            language
        );


        /* Close menu */

        languageMenu.classList.remove("show");

        languageButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    /* =====================================================
       LANGUAGE BUTTONS
    ===================================================== */

    document
        .querySelectorAll("[data-language]")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const language =
                    this.getAttribute("data-language");

                applyLanguage(language);

            });

        });


    /* =====================================================
       LOAD SAVED LANGUAGE
    ===================================================== */

    const savedLanguage =
        localStorage.getItem("plantCareLanguage") || "en";


    if (translations[savedLanguage]) {

        applyLanguage(savedLanguage);

    } else {

        applyLanguage("en");

    }


    /* Make function available if needed elsewhere */

    window.applyPlantCareLanguage = applyLanguage;

})();

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
            data.confidence + "%";

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


    // =================================================
    // TOP 3 AI PREDICTIONS
    // =================================================

    const topPredictionsContainer =
        document.getElementById(
            "topPredictions"
        );


    if (topPredictionsContainer) {

        // Remove previous predictions
        topPredictionsContainer.innerHTML =
            "";


        if (
            Array.isArray(
                data.top_predictions
            )
        ) {

            data.top_predictions.forEach(
                function (prediction) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "prediction-row";


                    const confidence =
                        Number(
                            prediction.confidence
                        ) || 0;


                    item.innerHTML = `

                        <div class="prediction-header">

                            <span>
                                ${prediction.name}
                            </span>

                            <strong>
                                ${confidence.toFixed(2)}%
                            </strong>

                        </div>


                        <div class="prediction-bar">

                            <div
                                class="prediction-fill"
                                style="width: ${Math.min(
                                    confidence,
                                    100
                                )}%;">
                            </div>

                        </div>

                    `;


                    topPredictionsContainer
                        .appendChild(
                            item
                        );

                }
            );

        }

    }


    // =================================================
    // SHOW RESULT SECTION
    // =================================================

    if (resultSection) {

        resultSection.style.display =
            "block";


        // Scroll to result
        resultSection.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }

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

        const response =
            await fetch(
                "http://127.0.0.1:5000/model-metrics"
            );


        const data =
            await response.json();


        if (!data.success) {

            console.log(
                "Model metrics unavailable"
            );

            return;
        }


        const metrics =
            data.metrics;


        document
            .getElementById(
                "metricAccuracy"
            )
            .textContent =
            metrics.accuracy + "%";


        document
            .getElementById(
                "metricPrecision"
            )
            .textContent =
            metrics.precision + "%";


        document
            .getElementById(
                "metricRecall"
            )
            .textContent =
            metrics.recall + "%";


        document
            .getElementById(
                "metricSensitivity"
            )
            .textContent =
            metrics.sensitivity + "%";


        document
            .getElementById(
                "metricF1"
            )
            .textContent =
            metrics.f1_score + "%";


        document
            .getElementById(
                "metricTestImages"
            )
            .textContent =
            metrics.test_images;


    }

    catch (error) {

        console.error(
            "Metrics error:",
            error
        );

    }

}


// Load metrics when website opens

loadModelMetrics();
// PlantCare assistant, isolated from the existing detection flow
(() => {
    const launcher = document.getElementById('chatLauncher');
    const panel = document.getElementById('chatPanel');
    const closeButton = document.getElementById('chatClose');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    if (!launcher || !panel || !form || !input || !messages) return;
    const setOpen = (open) => {
        panel.classList.toggle('is-open', open);
        panel.setAttribute('aria-hidden', String(!open));
        launcher.setAttribute('aria-expanded', String(open));
        if (open) input.focus();
    };
    launcher.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
    closeButton?.addEventListener('click', () => setOpen(false));
    const addMessage = (text, sender) => {
        const bubble = document.createElement('div');
        bubble.className = 'plantcare-chat-message ' + sender;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
        return bubble;
    };
    const sendMessage = async (text) => {
        const message = text.trim();
        if (!message) return;
        setOpen(true);
        addMessage(message, 'user');
        input.value = '';
        const submit = form.querySelector('button[type="submit"]');
        input.disabled = true;
        if (submit) submit.disabled = true;
        const pending = addMessage('Thinking…', 'bot');
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await response.json();
            pending.textContent = data.reply || data.message || 'I could not answer that just now.';
        } catch (error) {
            pending.textContent = 'The assistant could not connect. Please try again.';
        } finally {
            input.disabled = false;
            if (submit) submit.disabled = false;
            input.focus();
            messages.scrollTop = messages.scrollHeight;
        }
    };
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        sendMessage(input.value);
    });
    panel.querySelectorAll('[data-question]').forEach((button) => {
        button.addEventListener('click', () => sendMessage(button.dataset.question || ''));
    });
})();
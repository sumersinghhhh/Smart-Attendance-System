// ================================
// STUDENT DATABASE
// ================================

const students = [
    {
        name: "Sumer Singh",
        roll: "25BCS180"
    },
    {
        name: "Rahul Sharma",
        roll: "25BCS101"
    },
    {
        name: "Aman Kumar",
        roll: "25BCS102"
    },
    {
        name: "Priya Singh",
        roll: "25BCS103"
    },
    {
        name: "Anjali Verma",
        roll: "25BCS104"
    }
];


// ================================
// GLOBAL VARIABLES
// ================================

let selectedStudent = null;

let qrScanner = null;

let faceStream = null;

let faceTimerInterval = null;

let qrTimerInterval = null;


// ================================
// LOAD STUDENTS INTO DROPDOWN
// ================================

function loadStudents() {

    const select = document.getElementById("studentSelect");

    // Student page par nahi hai to kuch mat karo
    if (!select) {
        return;
    }

    // Purane options remove karo except first one
    select.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;

    students.forEach(function (student) {

        const option = document.createElement("option");

        option.value = student.roll;

        option.textContent =
            student.name +
            " - " +
            student.roll;

        select.appendChild(option);

    });

}


// ================================
// CONFIRM SELECTED STUDENT
// ================================

function confirmStudent() {

    const select = document.getElementById("studentSelect");

    if (!select || !select.value) {

        alert("Please select your identity.");

        return;

    }


    selectedStudent = students.find(function (student) {

        return student.roll === select.value;

    });


    if (!selectedStudent) {

        alert("Student not found.");

        return;

    }


    const step1 = document.getElementById("step1");

    const step2 = document.getElementById("step2");


    if (step1) {
        step1.classList.add("hidden");
    }


    if (step2) {
        step2.classList.remove("hidden");
    }


    // QR scanner start karo
    startRealQRScanner();

}


// ================================
// GENERATE DYNAMIC QR SESSION
// ================================

function generateSession() {

    const session = {

        id:
            "SESSION-" +
            Date.now() +
            "-" +
            Math.floor(Math.random() * 10000),

        expiry:
            Date.now() + 20000

    };


    // Save session in browser
    localStorage.setItem(
        "attendanceSession",
        JSON.stringify(session)
    );


    const qrBox =
        document.getElementById("qrcode");


    if (!qrBox) {
        return;
    }


    // Previous QR remove karo
    qrBox.innerHTML = "";


    // Check QR library loaded
    if (typeof QRCode === "undefined") {

        qrBox.innerHTML =
            "<strong>QR Library Not Loaded</strong>";

        return;

    }


    // Generate QR
    new QRCode(
        qrBox,
        {
            text: JSON.stringify(session),
            width: 220,
            height: 220
        }
    );


    const status =
        document.getElementById("sessionStatus");


    if (status) {

        status.textContent =
            "Active session: scan within 20 seconds.";

    }


    let seconds = 20;


    const timer =
        document.getElementById("qrTimer");


    if (timer) {

        timer.textContent = seconds;

    }


    clearInterval(qrTimerInterval);


    qrTimerInterval =
        setInterval(function () {

            seconds--;


            if (timer) {

                timer.textContent =
                    Math.max(seconds, 0);

            }


            if (seconds <= 0) {

                clearInterval(qrTimerInterval);


                localStorage.removeItem(
                    "attendanceSession"
                );


                if (status) {

                    status.textContent =
                        "QR expired. Generate a new QR.";

                }

            }

        }, 1000);

}


// ================================
// START REAL QR SCANNER
// ================================

function startRealQRScanner() {

    const reader =
        document.getElementById("reader");


    if (!reader) {
        return;
    }


    // QR library available nahi hai
    if (typeof Html5Qrcode === "undefined") {

        console.log(
            "Html5Qrcode library not loaded."
        );

        return;

    }


    // Purana scanner stop karo
    if (qrScanner) {

        qrScanner.stop()
            .catch(function () {})
            .finally(function () {

                qrScanner = null;

            });

    }


    qrScanner =
        new Html5Qrcode("reader");


    qrScanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,

            qrbox: {
                width: 250,
                height: 250
            }

        },

        function (decodedText) {

            validateScannedQR(decodedText);

        },

        function () {

            // QR scan errors continuously aate hain
            // Ignore karna normal hai

        }

    )
    .catch(function (error) {

        console.log(
            "QR scanner error:",
            error
        );

    });

}


// ================================
// VALIDATE SCANNED QR
// ================================

function validateScannedQR(qrMessage) {

    let scannedSession;


    try {

        scannedSession =
            JSON.parse(qrMessage);

    }

    catch (error) {

        alert("Invalid attendance QR.");

        return;

    }


    validateSession(scannedSession);

}


// ================================
// DEMO QR VALIDATION
// ================================

function demoValidateQR() {

    const storedSession =
        localStorage.getItem(
            "attendanceSession"
        );


    if (!storedSession) {

        alert(
            "No active teacher QR session found. Please ask teacher to generate QR."
        );

        return;

    }


    let session;


    try {

        session =
            JSON.parse(storedSession);

    }

    catch (error) {

        alert("Invalid session data.");

        return;

    }


    validateSession(session);

}


// ================================
// VALIDATE QR SESSION
// ================================

function validateSession(session) {

    if (!session || !session.expiry) {

        alert("Invalid QR session.");

        return;

    }


    // Check expiry
    if (Date.now() > session.expiry) {

        alert(
            "This QR has expired. Please ask teacher to generate a new QR."
        );

        return;

    }


    // Stop QR scanner
    if (qrScanner) {

        qrScanner.stop()
            .catch(function () {});

        qrScanner = null;

    }


    const step2 =
        document.getElementById("step2");

    const step3 =
        document.getElementById("step3");


    if (step2) {

        step2.classList.add("hidden");

    }


    if (step3) {

        step3.classList.remove("hidden");

    }


    startFaceCamera();

}


// ================================
// START FACE CAMERA
// ================================

async function startFaceCamera() {

    try {

        faceStream =
            await navigator.mediaDevices.getUserMedia({

                video: true,
                audio: false

            });


        const video =
            document.getElementById(
                "faceVideo"
            );


        if (video) {

            video.srcObject =
                faceStream;

        }

    }

    catch (error) {

        console.log(
            "Face camera error:",
            error
        );


        alert(
            "Camera permission not available. Demo verification can still continue."
        );

    }


    startFaceTimer();

}


// ================================
// FACE VERIFICATION TIMER
// ================================

function startFaceTimer() {

    let seconds = 15;


    const timer =
        document.getElementById(
            "faceTimer"
        );


    if (!timer) {
        return;
    }


    timer.textContent = seconds;


    clearInterval(
        faceTimerInterval
    );


    faceTimerInterval =
        setInterval(function () {

            seconds--;


            timer.textContent =
                Math.max(seconds, 0);


            if (seconds <= 0) {

                clearInterval(
                    faceTimerInterval
                );


                verifyFace();

            }

        }, 1000);

}


// ================================
// FACE VERIFICATION DEMO
// ================================

function verifyFace() {

    clearInterval(
        faceTimerInterval
    );


    // Stop camera
    if (faceStream) {

        faceStream
            .getTracks()
            .forEach(function (track) {

                track.stop();

            });

        faceStream = null;

    }


    if (!selectedStudent) {

        alert(
            "Student identity missing. Please restart."
        );

        return;

    }


    // Check duplicate BEFORE success screen
    const attendance =
        JSON.parse(
            localStorage.getItem(
                "attendance"
            )
        ) || [];


    const alreadyPresent =
        attendance.some(function (item) {

            return item.roll ===
                selectedStudent.roll;

        });


    if (alreadyPresent) {

        alert(
            "Attendance already marked for " +
            selectedStudent.name
        );

        return;

    }


    // Save attendance
    markAttendance(selectedStudent);


    const step3 =
        document.getElementById("step3");

    const step4 =
        document.getElementById("step4");


    if (step3) {

        step3.classList.add("hidden");

    }


    if (step4) {

        step4.classList.remove("hidden");

    }


    const successText =
        document.getElementById(
            "successText"
        );


    if (successText) {

        successText.textContent =
            selectedStudent.name +
            " (" +
            selectedStudent.roll +
            ") verified successfully.";

    }


    const attendanceId =
        document.getElementById(
            "attendanceId"
        );


    if (attendanceId) {

        attendanceId.textContent =
            "ATT-" +
            Date.now();

    }

}


// ================================
// SAVE ATTENDANCE
// ================================

function markAttendance(student) {

    let attendance =
        JSON.parse(
            localStorage.getItem(
                "attendance"
            )
        ) || [];


    attendance.push({

        name: student.name,

        roll: student.roll,

        time:
            new Date()
                .toLocaleString(),

        status: "Present"

    });


    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );

}


// ================================
// LOAD TEACHER DASHBOARD
// ================================

function loadDashboard() {

    const attendanceList =
        document.getElementById(
            "attendanceList"
        );


    // Teacher page nahi hai
    if (!attendanceList) {
        return;
    }


    const attendance =
        JSON.parse(
            localStorage.getItem(
                "attendance"
            )
        ) || [];


    // Present Count
    const presentCount =
        document.getElementById(
            "presentCount"
        );


    if (presentCount) {

        presentCount.textContent =
            attendance.length;

    }


    // Absent Count
    const absentCount =
        document.getElementById(
            "absentCount"
        );


    if (absentCount) {

        absentCount.textContent =
            students.length -
            attendance.length;

    }


    // Recent Attendance List
    if (attendance.length === 0) {

        attendanceList.innerHTML =
            "No attendance yet.";

    }

    else {

        let recentHTML = "";


        const recentAttendance =
            attendance
                .slice()
                .reverse();


        recentAttendance.forEach(
            function (item) {

                recentHTML +=
                    '<div class="attendance-item">' +

                        '<div>' +

                            '<strong>' +
                            item.name +
                            '</strong>' +

                            '<br>' +

                            '<small>' +
                            item.roll +
                            '</small>' +

                        '</div>' +

                        '<div class="present">' +
                            '✓ Present' +
                        '</div>' +

                    '</div>';

            }
        );


        attendanceList.innerHTML =
            recentHTML;

    }


    // Attendance Table
    const table =
        document.getElementById(
            "attendanceTable"
        );


    if (!table) {
        return;
    }


    let tableHTML = "";


    attendance.forEach(
        function (item) {

            tableHTML +=
                '<tr>' +

                    '<td>' +
                        item.name +
                    '</td>' +

                    '<td>' +
                        item.roll +
                    '</td>' +

                    '<td>' +
                        item.time +
                    '</td>' +

                    '<td class="present">' +
                        '✓ ' +
                        item.status +
                    '</td>' +

                '</tr>';

        }
    );


    table.innerHTML =
        tableHTML;

}


// ================================
// RESET ATTENDANCE
// ================================

function resetAttendance() {

    const confirmReset =
        confirm(
            "Are you sure you want to reset all attendance?"
        );


    if (!confirmReset) {

        return;

    }


    localStorage.removeItem(
        "attendance"
    );


    loadDashboard();


    alert(
        "Attendance has been reset successfully."
    );

}


// ================================
// DOWNLOAD ATTENDANCE CSV
// ================================

function downloadCSV() {

    const attendance =
        JSON.parse(
            localStorage.getItem(
                "attendance"
            )
        ) || [];


    if (attendance.length === 0) {

        alert(
            "No attendance data available."
        );

        return;

    }


    let csv =
        "Name,Roll Number,Time,Status\n";


    attendance.forEach(
        function (item) {

            csv +=

                '"' +
                item.name +
                '",' +

                '"' +
                item.roll +
                '",' +

                '"' +
                item.time +
                '",' +

                '"' +
                item.status +
                '"\n';

        }
    );


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        "attendance-report.csv";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}


// ================================
// INITIAL LOAD
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadStudents();

        loadDashboard();

    }
);


// Teacher dashboard live refresh
setInterval(
    function () {

        loadDashboard();

    },
    1000
);
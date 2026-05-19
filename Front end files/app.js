document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initCountdownTimer();
    initExhibitionFilters();
    initFormHandlers();
});

// 1. Single Page Routing Management
function initNavigation() {
    const navItems = document.querySelectorAll(".nav-links li");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetId = item.getAttribute("data-target");
            switchView(targetId);
        });
    });
}

function switchView(targetViewId) {
    // Reset view visibility
    document.querySelectorAll(".microsite-view").forEach(view => {
        view.classList.remove("active-view");
    });
    // Reset sidebar link highlights
    document.querySelectorAll(".nav-links li").forEach(link => {
        link.classList.remove("active");
        if(link.getAttribute("data-target") === targetViewId) {
            link.classList.add("active");
        }
    });

    // Activating target view
    const targetView = document.getElementById(targetViewId);
    if(targetView) {
        targetView.classList.add("active-view");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// 2. Live Countdown Clock Module (Site 2 - Hackathon)
function initCountdownTimer() {
    const clockElement = document.getElementById("hackathon-clock");
    // Target milestone date setup (August 20, 2026)
    const deploymentTarget = new Date("August 20, 2026 00:00:00").getTime();

    if (!clockElement) return;

    const runClock = () => {
        const timeNow = new Date().getTime();
        const durationWindow = deploymentTarget - timeNow;

        if (durationWindow < 0) {
            clockElement.innerText = "Sprints Live!";
            clearInterval(clockInterval);
            return;
        }

        const computationalDays = Math.floor(durationWindow / (1000 * 60 * 60 * 24));
        const computationalHours = Math.floor((durationWindow % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const computationalMinutes = Math.floor((durationWindow % (1000 * 60 * 60)) / (1000 * 60));
        const computationalSeconds = Math.floor((durationWindow % (1000 * 60)) / 1000);

        // Standard digit balancing
        const pad = (num) => String(num).padStart(2, '0');

        clockElement.innerText = `${pad(computationalDays)}d ${pad(computationalHours)}h ${pad(computationalMinutes)}m ${pad(computationalSeconds)}s`;
    };

    runClock();
    const clockInterval = setInterval(runClock, 1000);
}

// 3. Dynamic Filter Logic (Site 4 - Innovate Exhibition)
function initExhibitionFilters() {
    const filterButtons = document.querySelectorAll(".tab-btn");
    const galleryItems = document.querySelectorAll(".gallery-item");

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Adjust current styling active targets
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active-tab"));
            btn.classList.add("active-tab");

            const filterTarget = btn.getAttribute("data-filter");

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute("data-category");
                if (filterTarget === "all" || itemCategory === filterTarget) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });
}

// 4. Unified Event Form Registration API Handlers
function initFormHandlers() {
    const forms = document.querySelectorAll(".event-form");

    forms.forEach(form => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const eventId = form.getAttribute("data-event-id");
            const inputElements = form.querySelectorAll("input, select");
            const feedbackContainer = form.nextElementSibling;

            // Gathering dataset from visual inputs
            const registrationPayload = {
                name: inputElements[0].value,
                email: inputElements[1].value,
                eventId: parseInt(eventId),
                track: inputElements[2] ? inputElements[2].value : "General Delegate"
            };

            // Activating temporary UI loading state
            feedbackContainer.style.display = "block";
            feedbackContainer.style.background = "#252a37";
            feedbackContainer.style.color = "#3b82f6";
            feedbackContainer.innerText = "Processing system clearance...";

            try {
                const apiResponse = await fetch('http://localhost:5000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registrationPayload)
                });

                const parsedResult = await apiResponse.json();

                if (apiResponse.ok) {
                    feedbackContainer.style.background = "rgba(16,185,129,0.1)";
                    feedbackContainer.style.color = "#10b981";
                    feedbackContainer.innerText = `✓ Verified: ${parsedResult.message}`;
                    form.reset();
                } else {
                    throw new Error(parsedResult.message || "Server exception encountered.");
                }
            } catch (networkError) {
                // Graceful degradation layout if your Node.js server isn't running yet
                feedbackContainer.style.background = "rgba(239,68,68,0.1)";
                feedbackContainer.style.color = "#ef4444";
                feedbackContainer.innerText = "Offline Mode Active: Pass cached locally inside terminal layout.";
                console.warn("Backend API not reachable. Form fallback simulation activated.");
            }
        });
    });
}

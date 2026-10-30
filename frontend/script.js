// ======================================================
// SKILLSWAP FRONTEND
// ======================================================

const API_URL = "http://127.0.0.1:5000";


// ======================================================
// PAGE NAVIGATION
// ======================================================

function showPage(pageId) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.add("hidden");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }
}


// ======================================================
// GET LOGGED-IN USER
// ======================================================

function getLoggedInUser() {

    const user = localStorage.getItem("skillswapUser");

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}


// ======================================================
// REGISTER
// ======================================================

document.getElementById("registerForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const bio =
            document.getElementById("registerBio").value.trim();

        const message =
            document.getElementById("registerMessage");

        message.textContent = "Creating account...";
        message.className = "message";

        try {

            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        bio: bio
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                message.textContent =
                    data.message || "Registration failed.";

                message.className =
                    "message error";

                return;
            }

            message.textContent =
                "Account created successfully!";

            message.className =
                "message success";

            document.getElementById("registerForm").reset();

            setTimeout(() => {
                showPage("loginPage");
            }, 1000);

        } catch (error) {

            console.error(error);

            message.textContent =
                "Cannot connect to the backend server.";

            message.className =
                "message error";
        }

    }
);


// ======================================================
// LOGIN
// ======================================================

document.getElementById("loginForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");

        message.textContent = "Logging in...";
        message.className = "message";

        try {

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                message.textContent =
                    data.message || "Login failed.";

                message.className =
                    "message error";

                return;
            }

            localStorage.setItem(
    "skillswapUser",
    JSON.stringify(data.user)
);

localStorage.setItem(
    "skillswapToken",
    data.access_token
);

            message.textContent =
                "Login successful";

            message.className =
                "message success";

            document.getElementById(
                "loginPassword"
            ).value = "";

            setTimeout(() => {
                openDashboard();
            }, 500);

        } catch (error) {

            console.error(error);

            message.textContent =
                "Cannot connect to the backend server.";

            message.className =
                "message error";
        }

    }
);


// ======================================================
// OPEN DASHBOARD
// ======================================================

function openDashboard() {

    const user = getLoggedInUser();

    if (!user) {

        showPage("loginPage");

        return;
    }

    document.getElementById(
        "dashboardName"
    ).textContent = user.name;

    document.getElementById(
        "dashboardBio"
    ).textContent = user.bio || "SkillSwap member";

    showPage("dashboardPage");

    loadSkills();
    loadConnections();

    document.getElementById(
        "matchesContainer"
    ).innerHTML = `
        <p class="empty-message">
            Click "Find Matches" to discover people.
        </p>
    `;

    document.getElementById(
        "requestsContainer"
    ).innerHTML = `
        <p class="empty-message">
            No requests loaded.
        </p>
    `;

    const receivedContainer =
        document.getElementById(
            "receivedRequestsContainer"
        );

    if (receivedContainer) {

        receivedContainer.innerHTML = `
            <div class="loading-message">
                <span class="spinner"></span>
                <span>Loading incoming requests...</span>
            </div>
        `;

        loadReceivedRequests();
    }
}


// ======================================================
// ADD SKILL
// ======================================================

document.getElementById("skillForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const user = getLoggedInUser();

        if (!user) {

            showPage("loginPage");

            return;
        }

        const skillName =
            document.getElementById("skillName")
                .value.trim();

        const skillType =
            document.getElementById("skillType")
                .value;

        const message =
            document.getElementById("skillMessage");

        if (!skillName || !skillType) {

            message.textContent =
                "Please enter a skill and select a type.";

            message.className =
                "message error";

            return;
        }

        message.textContent =
            "Adding skill...";

        message.className =
            "message";

        try {

            const response = await fetch(
                `${API_URL}/api/skills`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: skillName,
                        type: skillType,
                        user_id: user.id
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                message.textContent =
                    data.message || "Could not add skill.";

                message.className =
                    "message error";

                return;
            }

            message.textContent =
                "Skill added successfully!";

            message.className =
                "message success";

            document.getElementById(
                "skillName"
            ).value = "";

            document.getElementById(
                "skillType"
            ).value = "";

            await loadSkills();

        } catch (error) {

            console.error(error);

            message.textContent =
                "Cannot connect to backend.";

            message.className =
                "message error";
        }

    }
);


// ======================================================
// LOAD USER SKILLS
// ======================================================

async function loadSkills() {

    const user = getLoggedInUser();

    if (!user) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/skills/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {

            console.error(data);

            return;
        }

        const teachList =
            document.getElementById("teachSkills");

        const learnList =
            document.getElementById("learnSkills");

        teachList.innerHTML = "";
        learnList.innerHTML = "";


        // TEACH SKILLS

        if (
            data.teach &&
            data.teach.length > 0
        ) {

            data.teach.forEach(skill => {

                const li =
                    document.createElement("li");

                li.textContent = skill;

                teachList.appendChild(li);

            });

        } else {

            teachList.innerHTML =
                "<li>No skills added yet</li>";
        }


        // LEARN SKILLS

        if (
            data.learn &&
            data.learn.length > 0
        ) {

            data.learn.forEach(skill => {

                const li =
                    document.createElement("li");

                li.textContent = skill;

                learnList.appendChild(li);

            });

        } else {

            learnList.innerHTML =
                "<li>No skills added yet</li>";
        }

    } catch (error) {

        console.error(
            "Error loading skills:",
            error
        );

    }
}


// ======================================================
// FIND MATCHES
// ======================================================

// ======================================================
// FIND MATCHES
// ======================================================

async function loadMatches() {

    const user = getLoggedInUser();

    if (!user) {
        showPage("loginPage");
        return;
    }

    const container =
        document.getElementById("matchesContainer");

    container.innerHTML = `
        <div class="loading-message">
            <span class="spinner"></span>
            <span>Finding people for you...</span>
        </div>
    `;

    try {

        // Load matches and sent requests together
        const [matchesResponse, requestsResponse] =
            await Promise.all([
                fetch(`${API_URL}/api/matches/${user.id}`),
                fetch(`${API_URL}/api/requests/sent/${user.id}`)
            ]);

        const matchesData =
            await matchesResponse.json();

        const requestsData =
            await requestsResponse.json();


        if (!matchesResponse.ok) {

            container.innerHTML = `
                <p class="empty-message">
                    Could not load matches.
                </p>
            `;

            return;
        }


        if (
            !matchesData.matches ||
            matchesData.matches.length === 0
        ) {

            container.innerHTML = `
                <p class="empty-message">
                    No matches found yet.
                    Add some "I Want To Learn" skills first.
                </p>
            `;

            return;
        }


        // Create a quick lookup for sent requests
        const sentRequests =
            requestsData.requests || [];


        container.innerHTML = "";


       matchesData.matches
    .filter(match => Number(match.user_id) !== Number(user.id))
    .forEach(match => {

            // Find an existing request
            const existingRequest =
    sentRequests
        .filter(request =>
            Number(request.receiver_id) === Number(match.user_id)
            &&
            request.skill.toLowerCase() === match.teaches.toLowerCase()
        )
        .sort((a, b) => b.request_id - a.request_id)[0];


            let buttonText = "Send Request";
            let buttonClass = "request-btn";
            let disabled = "";


            if (existingRequest) {

                if (
                    existingRequest.status ===
                    "pending"
                ) {

                    buttonText =
                        "⏳ Request Pending";

                    buttonClass =
                        "request-btn request-pending";

                    disabled = "disabled";

                }

                else if (
                    existingRequest.status ===
                    "accepted"
                ) {

                    buttonText =
                        "✅ Exchange Accepted";

                    buttonClass =
                        "request-btn request-accepted";

                    disabled = "disabled";

                }

                else if (
                    existingRequest.status ===
                    "rejected"
                ) {

                    buttonText =
                        "Send Request";

                    buttonClass =
                        "request-btn";

                }

            }


            const card =
                document.createElement("div");

            card.className =
                "match-card";


            card.innerHTML = `

                <div class="match-info">

                    <h3>
                        ${escapeHTML(match.name)}
                    </h3>

                    <p>
                        ${escapeHTML(match.email)}
                    </p>

                    <span class="match-skill">
                        Can teach:
                        ${escapeHTML(match.teaches)}
                    </span>

                </div>


                <button
    type="button"
    class="${buttonClass}"
    ${disabled}
    onclick="event.preventDefault(); event.stopPropagation(); sendExchangeRequest(
        ${match.user_id},
        '${escapeJS(match.teaches)}'
    )">

    ${buttonText}
</button>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p class="empty-message">
                Cannot connect to backend.
            </p>
        `;

    }

}


// ======================================================
// SEND EXCHANGE REQUEST
// ======================================================

async function sendExchangeRequest(receiverId, skill) {

    const user = getLoggedInUser();

    if (!user) {
        showPage("loginPage");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/requests`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    sender_id: user.id,
                    receiver_id: receiverId,
                    skill: skill
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Could not send request."
            );

            return;
        }


        // Immediately refresh both sections
        await loadRequests();

        await loadMatches();

    }

    catch (error) {

        console.error(error);

        alert(
            "Cannot connect to backend."
        );

    }

}


// ======================================================
// LOAD SENT EXCHANGE REQUESTS
// ======================================================

async function loadRequests() {

    const user = getLoggedInUser();

    if (!user) {
        return;
    }

    const container =
        document.getElementById("requestsContainer");

    container.innerHTML = `
        <div class="loading-message">
            <span class="spinner"></span>
            <span>Loading your exchange requests...</span>
        </div>
    `;

    try {

        const response = await fetch(
            `${API_URL}/api/requests/sent/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {

            container.innerHTML = `
                <p class="empty-message">
                    Could not load exchange requests.
                </p>
            `;

            return;
        }

        if (
            !data.requests ||
            data.requests.length === 0
        ) {

            container.innerHTML = `
                <p class="empty-message">
                    You haven't sent any exchange requests yet.
                </p>
            `;

            return;
        }

       container.innerHTML = "";

// Show only the latest request
// for the same person + same skill
const latestRequests = new Map();

data.requests.forEach(request => {

    const key =
        `${request.receiver_id}-${request.skill.toLowerCase()}`;

    const existing = latestRequests.get(key);

    if (
        !existing ||
        Number(request.request_id) >
        Number(existing.request_id)
    ) {
        latestRequests.set(key, request);
    }
});

latestRequests.forEach(request => {

    const card =
        document.createElement("div");

    card.className =
        "request-card";

    card.innerHTML = `
        <div class="request-info">

            <h3>
                🤝 ${escapeHTML(request.receiver_name)}
            </h3>

            <p>
                Skill:
                <strong>
                    ${escapeHTML(request.skill)}
                </strong>
            </p>

        </div>

        <span class="status ${escapeHTML(request.status)}">
            ${escapeHTML(request.status)}
        </span>
    `;

    container.appendChild(card);
});

    } catch (error) {

        console.error(
            "Error loading requests:",
            error
        );

        container.innerHTML = `
            <p class="empty-message">
                Cannot connect to backend.
            </p>
        `;
    }
}


// ======================================================
// LOAD RECEIVED EXCHANGE REQUESTS
// ======================================================

async function loadReceivedRequests() {

    const user = getLoggedInUser();

    if (!user) {
        return;
    }

    const container =
        document.getElementById(
            "receivedRequestsContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="loading-message">
            <span class="spinner"></span>
            <span>Loading incoming requests...</span>
        </div>
    `;

    try {

        const response = await fetch(
            `${API_URL}/api/requests/received/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {

            container.innerHTML = `
                <p class="empty-message">
                    Could not load incoming requests.
                </p>
            `;

            return;
        }

        if (
            !data.requests ||
            data.requests.length === 0
        ) {

            container.innerHTML = `
                <p class="empty-message">
                    No incoming exchange requests.
                </p>
            `;

            return;
        }

        container.innerHTML = "";

        data.requests.forEach(request => {

            const card =
                document.createElement("div");

            card.className =
                "request-card";

            let buttons = "";

            if (request.status === "pending") {

                buttons = `
                    <div class="request-actions">

                        <button
                            class="accept-btn"
                            onclick="updateRequest(
                                ${request.request_id},
                                'accepted'
                            )">

                            Accept

                        </button>

                        <button
                            class="reject-btn"
                            onclick="updateRequest(
                                ${request.request_id},
                                'rejected'
                            )">

                            Reject

                        </button>

                    </div>
                `;
            }

            card.innerHTML = `
    <div class="request-info">

        <h3>
            🤝 ${escapeHTML(request.sender_name)}
        </h3>

        <p>
            Skill:
            <strong>${escapeHTML(request.skill)}</strong>
        </p>

        <p>
            Request ID:
            ${request.request_id}
        </p>

    </div>

    <div class="request-right">

        <span class="status ${escapeHTML(request.status)}">
            ${escapeHTML(request.status)}
        </span>

        ${buttons}

    </div>
`;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Error loading incoming requests:",
            error
        );

        container.innerHTML = `
            <p class="empty-message">
                Cannot connect to backend.
            </p>
        `;
    }
}


// ======================================================
// ACCEPT / REJECT REQUEST
// ======================================================

async function updateRequest(
    requestId,
    status
) {

    const action =
        status === "accepted"
            ? "accept"
            : "reject";

    const confirmed = confirm(
        `Are you sure you want to ${action} this exchange request?`
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/requests/${requestId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Could not update request."
            );

            return;
        }

        alert(data.message);

        await loadReceivedRequests();

    } catch (error) {

        console.error(
            "Error updating request:",
            error
        );

        alert(
            "Cannot connect to backend."
        );
    }
}


// ======================================================
// REFRESH RECEIVED REQUESTS BUTTON
// ======================================================

const refreshReceivedBtn =
    document.getElementById(
        "refreshReceivedBtn"
    );

if (refreshReceivedBtn) {

    refreshReceivedBtn.addEventListener(
        "click",
        loadReceivedRequests
    );
}


// ======================================================
// LOGOUT
// ======================================================


function logout() {
   

    localStorage.removeItem("skillswapUser");
    localStorage.removeItem("skillswapToken");

   

    window.activeChatUserId = null;
    showPage("homePage");
}

// ======================================================
// SECURITY HELPERS
// ======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeJS(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}


// ======================================================
// PAGE STARTUP
// ======================================================

window.addEventListener(
    "DOMContentLoaded",
    function() {

        const user =
            getLoggedInUser();

        if (user) {

            openDashboard();

        } else {

            showPage("homePage");
        }

    }
);

// ======================================================
// EDIT PROFILE
// ======================================================

function openEditProfile() {

    const user = getLoggedInUser();

    if (!user) {
        showPage("loginPage");
        return;
    }

    document.getElementById("editName").value =
        user.name || "";

    document.getElementById("editBio").value =
        user.bio || "";

    document.getElementById("editProfileSection")
        .classList.remove("hidden");
}


function closeEditProfile() {

    document.getElementById("editProfileSection")
        .classList.add("hidden");
}


document.getElementById("editProfileForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const user = getLoggedInUser();

        if (!user) {
            showPage("loginPage");
            return;
        }

        const name =
            document.getElementById("editName")
                .value.trim();

        const bio =
            document.getElementById("editBio")
                .value.trim();

        const message =
            document.getElementById("editProfileMessage");

        if (!name) {

            message.textContent =
                "Name is required.";

            message.className =
                "message error";

            return;
        }

        message.textContent =
            "Saving changes...";

        message.className =
            "message";

        try {

            const response = await fetch(
                `${API_URL}/api/auth/profile/${user.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        bio: bio
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Could not update profile.";

                message.className =
                    "message error";

                return;
            }

            // Update logged-in user
            localStorage.setItem(
                "skillswapUser",
                JSON.stringify(data.user)
            );

            // Update dashboard immediately
            document.getElementById(
                "dashboardName"
            ).textContent = data.user.name;

            document.getElementById(
                "dashboardBio"
            ).textContent =
                data.user.bio || "SkillSwap member";

            message.textContent =
                "Profile updated successfully!";

            message.className =
                "message success";

            setTimeout(() => {
                closeEditProfile();
            }, 1000);

        } catch (error) {

            console.error(error);

            message.textContent =
                "Cannot connect to backend.";

            message.className =
                "message error";
        }
    });

    // ======================================================
// MY CONNECTIONS
// ======================================================

async function loadConnections() {

    const user = getLoggedInUser();

    if (!user) {
        showPage("loginPage");
        return;
    }

    const connectionsList =
        document.getElementById("connectionsList");

    connectionsList.innerHTML =
        `<p class="empty-message">Loading connections...</p>`;

    try {

        const response = await fetch(
            `${API_URL}/api/connections/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {

            connectionsList.innerHTML =
                `<p class="message error">
                    ${data.message || "Could not load connections."}
                </p>`;

            return;
        }

        window.skillswapConnections = data.connections;
        if (!data.connections || data.connections.length === 0) {

            connectionsList.innerHTML =
                `<p class="empty-message">
                    You don't have any connections yet.
                </p>`;

            return;
        }

        connectionsList.innerHTML =
            data.connections.map(connection => {

                return `
                    <div class="connection-card">

                       <div class="connection-info">

    <h3>
        ${connection.name}
    </h3>

    <p>
        ${connection.bio || "SkillSwap member"}
    </p>

    <small>
        ${connection.email}
    </small>

    <button
        type="button"
        class="view-profile-btn"
        onclick="viewConnectionProfile(${connection.user_id})">
        View Profile
    </button>

    <button
    type="button"
    class="message-btn"
    onclick="openChat(${connection.user_id})">
    Message
</button>

</div>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(error);

        connectionsList.innerHTML =
            `<p class="message error">
                Cannot connect to backend.
            </p>`;
    }
}

// ======================================================
// VIEW CONNECTION PROFILE
// ======================================================

function viewConnectionProfile(userId) {

    const connection =
        window.skillswapConnections?.find(
            user => Number(user.user_id) === Number(userId)
        );

    if (!connection) {
        alert("Connection profile could not be found.");
        return;
    }

    document.getElementById("profileModalName").textContent =
        connection.name;

    document.getElementById("profileModalBio").textContent =
        connection.bio || "SkillSwap member";

    document.getElementById("profileModalEmail").textContent =
        connection.email;

    document.getElementById("profileModalTeach").innerHTML =
        connection.teach && connection.teach.length > 0
            ? connection.teach.map(skill =>
                `<span class="profile-skill-tag">${skill}</span>`
              ).join("")
            : "No skills added yet.";

    document.getElementById("profileModalLearn").innerHTML =
        connection.learn && connection.learn.length > 0
            ? connection.learn.map(skill =>
                `<span class="profile-skill-tag">${skill}</span>`
              ).join("")
            : "No skills added yet.";

    document.getElementById("connectionProfileModal")
        .classList.remove("hidden");
}


function closeConnectionProfile() {

    document.getElementById("connectionProfileModal")
        .classList.add("hidden");
}


/* ======================================================
   RIGHT-SIDE CHAT DRAWER
   ====================================================== */

async function openChat(userId) {
    const user = getLoggedInUser();

    if (!user) {
        showPage("loginPage");
        return;
    }

    const connection = (window.skillswapConnections || []).find(
        person => Number(person.user_id) === Number(userId)
    );

    if (!connection) {
        alert("Connection details not found. Please refresh My Connections.");
        return;
    }

    window.activeChatUserId = Number(userId);

    document.getElementById("chatUserName").textContent =
        connection.name;

    document.getElementById("chatUserBio").textContent =
        connection.bio || "SkillSwap connection";

    document.getElementById("chatDrawer").classList.add("open");

    await loadChatMessages();
    document.getElementById("chatInput").focus();
}

function closeChat() {
    document.getElementById("chatDrawer").classList.remove("open");
}

async function loadChatMessages() {
    const user = getLoggedInUser();
    const otherUserId = window.activeChatUserId;
    const messagesContainer = document.getElementById("chatMessages");

    if (!user || !otherUserId) return;

    messagesContainer.textContent = "Loading messages...";

    try {
       const response = await fetch(
    `${API_URL}/api/messages/${user.id}/${otherUserId}`,
    {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("skillswapToken")}`
        }
    }
);

        const data = await response.json();

        if (!response.ok) {
            messagesContainer.textContent =
                data.message || "Could not load messages.";
            return;
        }

        if (!data.messages || data.messages.length === 0) {
            messagesContainer.innerHTML =
                `<p class="empty-message">No messages yet. Say hello!</p>`;
            return;
        }

       


let previousSenderId = null;

messagesContainer.innerHTML = data.messages.map(message => {
    const isMine = Number(message.sender_id) === Number(user.id);

    const senderId = Number(message.sender_id);
    const senderName = isMine ? "You" : (
        document.getElementById("chatUserName").textContent || "Connection"
    );

    const showSender = senderId !== previousSenderId;
    previousSenderId = senderId;

    return `
        <div class="message-row ${isMine ? "sent-row" : "received-row"}">
            ${showSender ? `<div class="message-sender">${senderName}</div>` : ""}
            <div class="chat-bubble ${isMine ? "sent" : "received"}"></div>
        </div>
    `;
}).join("");

const bubbles = messagesContainer.querySelectorAll(".chat-bubble");

data.messages.forEach((message, index) => {
    bubbles[index].textContent = message.content;
});

messagesContainer.scrollTop = messagesContainer.scrollHeight;



    } catch (error) {
        console.error("Loading messages failed:", error);
        messagesContainer.textContent = "Cannot connect to the messaging API.";
    }
}


/* ======================================================
   SEND CHAT MESSAGE
   ====================================================== */

async function sendChatMessage(event) {
    console.log("SEND STARTED");

    const user = getLoggedInUser();
    const receiverId = window.activeChatUserId;
    const input = document.getElementById("chatInput");
    const content = input.value.trim();

    if (!user || !receiverId || !content) {
        return;
    }

    const sendButton = document.querySelector("#chatForm button");
    sendButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/messages`, {
            method: "POST",
            headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("skillswapToken")}`
},
            body: JSON.stringify({
                sender_id: Number(user.id),
                receiver_id: Number(receiverId),
                content: content
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Could not send message.");
            return;
        }

        input.value = "";
await loadChatMessages();
console.log(
    "AFTER LOADING MESSAGES:",
    document.getElementById("chatDrawer").className
);

const drawer = document.getElementById("chatDrawer");
drawer.classList.add("open");

requestAnimationFrame(() => {
    drawer.classList.add("open");
    document.getElementById("chatInput").focus();
});

    } catch (error) {
        console.error("Sending message failed:", error);
        alert("Cannot connect to the messaging API.");
    } finally {
        sendButton.disabled = false;
    }
}


const chatForm = document.getElementById("chatForm");

if (chatForm) {
    chatForm.addEventListener("submit", function (event) {
        event.preventDefault();
        sendChatMessage(event);
    });
}


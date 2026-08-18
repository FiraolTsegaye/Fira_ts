document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "/api"; 
    const loginView = document.getElementById("login-view");
    const setupView = document.getElementById("setup-view");
    const dashboardView = document.getElementById("dashboard-view");
    const loginForm = document.getElementById("login-form");
    const setupForm = document.getElementById("setup-form");
    const portfolioForm = document.getElementById("portfolio-form");
    const logoutBtn = document.getElementById("logout-btn");
    const loginError = document.getElementById("login-error");
    const setupError = document.getElementById("setup-error");
    const updateMessage = document.getElementById("update-message");

    function getToken() {
        return localStorage.getItem("adminToken");
    }

    function isTokenValid() {
        const token = getToken();
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                localStorage.removeItem("adminToken");
                return false;
            }
            return true;
        } catch (e) {
            localStorage.removeItem("adminToken");
            return false;
        }
    }

    function showDashboard() {
        loginView.classList.add("hidden");
        setupView.classList.add("hidden");
        dashboardView.classList.remove("hidden");
        fetchPortfolioData();
    }

    function showLogin() {
        loginView.classList.remove("hidden");
        setupView.classList.add("hidden");
        dashboardView.classList.add("hidden");
    }

    function showSetup() {
        loginView.classList.add("hidden");
        setupView.classList.remove("hidden");
        dashboardView.classList.add("hidden");
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        loginError.textContent = "";
        
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            localStorage.setItem("adminToken", data.accessToken);

            if (!data.has_setup) {
                showSetup();
            } else {
                showDashboard();
            }
        } catch (err) {
            loginError.textContent = err.message;
        }
    });

    setupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        setupError.textContent = "";
        setupError.style.color = "var(--error-color)";

        const newEmail = document.getElementById("setup-email").value;
        const newPassword = document.getElementById("setup-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (newPassword !== confirmPassword) {
            setupError.textContent = "Passwords do not match.";
            return;
        }

        try {
            const response = await fetch(`${API_URL}/setup`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({ newEmail, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("adminToken");
                    showLogin();
                    loginError.textContent = "Session expired. Please log in again.";
                    return;
                }
                throw new Error(data.error || "Setup failed");
            }

            localStorage.removeItem("adminToken");
            setupError.style.color = "var(--success-color)";
            setupError.textContent = "Credentials updated! Please log in with your new details.";
            
            setTimeout(() => {
                setupForm.reset();
                loginForm.reset();
                setupError.textContent = "";
                showLogin();
            }, 2000);

        } catch (err) {
            setupError.textContent = err.message;
        }
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("adminToken");
        loginForm.reset();
        showLogin();
    });

    async function fetchPortfolioData() {
        try {
            const response = await fetch(`${API_URL}/portfolio`);
            const data = await response.json();

            document.getElementById("portfolio-name").value = data.name || "";
            document.getElementById("portfolio-hero_text").value = data.hero_text || "";
            document.getElementById("portfolio-about_me").value = data.about_me || "";
            document.getElementById("portfolio-email").value = data.email || "";
            document.getElementById("portfolio-social_links").value = data.social_links || "";
            document.getElementById("portfolio-years_learning").value = data.years_learning || "";
            document.getElementById("portfolio-projects_built").value = data.projects_built || "";
            document.getElementById("portfolio-technologies_used").value = data.technologies_used || "";
        } catch (err) {
            console.error("Error fetching portfolio:", err);
        }
    }

    portfolioForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        updateMessage.textContent = "";

        const formData = {
            name: document.getElementById("portfolio-name").value,
            hero_text: document.getElementById("portfolio-hero_text").value,
            about_me: document.getElementById("portfolio-about_me").value,
            email: document.getElementById("portfolio-email").value,
            social_links: document.getElementById("portfolio-social_links").value,
            years_learning: document.getElementById("portfolio-years_learning").value,
            projects_built: document.getElementById("portfolio-projects_built").value,
            technologies_used: document.getElementById("portfolio-technologies_used").value
        };

        try {
            const response = await fetch(`${API_URL}/portfolio`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("adminToken");
                    showLogin();
                    loginError.textContent = "Session expired. Please log in again.";
                    return;
                }
                throw new Error(data.error || "Update failed");
            }

            updateMessage.textContent = "Portfolio updated successfully.";
            setTimeout(() => {
                updateMessage.textContent = "";
            }, 3000);
        } catch (err) {
            updateMessage.textContent = err.message;
        }
    });

    if (isTokenValid()) {
        showDashboard();
    } else {
        showLogin();
    }
});
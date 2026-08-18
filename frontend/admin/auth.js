const API_URL = "/api";

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

function logout() {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/";
}


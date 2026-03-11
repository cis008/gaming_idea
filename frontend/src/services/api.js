import axios from "axios";

const api = axios.create({
  baseURL: "https://gaming-idea-backend-production.up.railway.app/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Auto-logout on 401 for protected endpoints only (not signup/login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/signup") || url.includes("/login");
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("username");
      sessionStorage.removeItem("quizPayload");
      sessionStorage.removeItem("resultPayload");
      // Redirect to login with a message
      window.location.href = "/login?reason=session_expired";
    }
    return Promise.reject(error);
  }
);

export const signup = (payload) => api.post("/signup", payload);
export const login = (payload) => api.post("/login", payload);
export const fetchMe = () => api.get("/me");
export const trackActivity = (payload) => api.post("/track-activity", payload);
export const explainTopic = (payload) => api.post("/explain-topic", payload);
export const studyChat = (payload) => api.post("/study-chat", payload);
export const fetchPrerecordedLectures = () => api.get("/prerecorded-lectures");
export const fetchTopicProgress = () => api.get("/topic-progress");
export const generateQuiz = (payload) => api.post("/generate-quiz", payload);
export const submitQuiz = (payload) => api.post("/submit-quiz", payload);
export const fetchDashboard = () => api.get("/dashboard");
export const fetchProgress = () => api.get("/progress");
export const generateBattleRoadmap = (payload) => api.post("/battle-roadmap", payload);
export const fetchBattleFlashcards = (payload) => api.post("/battle-flashcards", payload);
export const startBattle = (payload) => api.post("/battle-start", payload);
export const nextBattleQuestion = (payload) => api.post("/battle-question", payload);
export const submitBattleAnswer = (payload) => api.post("/battle-answer", payload);
export const summarizeVideo = (payload) => api.post("/video-summary", payload);

export default api;

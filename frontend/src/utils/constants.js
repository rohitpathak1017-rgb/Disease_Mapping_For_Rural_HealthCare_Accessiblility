// ── API Base URL ──────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ── Roles ─────────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:        "admin",
  HEALTHWORKER: "healthworker",
  PUBLIC:       "public",
};

// ── Frontend Routes ───────────────────────────────────────────────────────────
export const ROUTES = {
  // Auth
  LOGIN:    "/login",
  REGISTER: "/register",

  // Admin
  ADMIN_DASHBOARD:  "/admin/dashboard",
  ADMIN_WORKERS:    "/admin/workers",
  ADMIN_ASSIGN:     "/admin/assign-worker",
  ADMIN_VILLAGES:   "/admin/villages",
  ADMIN_DISEASES:   "/admin/diseases",

  // Health Worker
  WORKER_DASHBOARD: "/worker/dashboard",
  WORKER_REPORT:    "/worker/report",
  WORKER_CHARTS:    "/worker/charts",
  WORKER_CAMP:      "/worker/camp",
  WORKER_FEEDBACK:  "/worker/feedback",

  // Public
  PUBLIC_HOME:      "/",
  VILLAGE_DETAILS:  "/village/:id",
  GIVE_FEEDBACK:    "/feedback/:workerId",
};

// ── Disease Categories ────────────────────────────────────────────────────────
export const DISEASE_CATEGORIES = [
  "Communicable",
  "Non-Communicable",
  "Vector-Borne",
  "Water-Borne",
  "Air-Borne",
  "Nutritional",
  "Maternal & Child",
  "Other",
];

// ── Disease Severity ──────────────────────────────────────────────────────────
export const SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"];

// ── Camp Status ───────────────────────────────────────────────────────────────
export const CAMP_STATUS = ["Scheduled", "Ongoing", "Completed", "Cancelled"];

// ── Feedback Categories ───────────────────────────────────────────────────────
export const FEEDBACK_CATEGORIES = [
  "Camp Service",
  "Doctor Behaviour",
  "Medicine Supply",
  "Response Time",
  "Overall Experience",
  "Other",
];

// ── Months ────────────────────────────────────────────────────────────────────
export const MONTHS = [
  { value: 1,  label: "January"   },
  { value: 2,  label: "February"  },
  { value: 3,  label: "March"     },
  { value: 4,  label: "April"     },
  { value: 5,  label: "May"       },
  { value: 6,  label: "June"      },
  { value: 7,  label: "July"      },
  { value: 8,  label: "August"    },
  { value: 9,  label: "September" },
  { value: 10, label: "October"   },
  { value: 11, label: "November"  },
  { value: 12, label: "December"  },
];
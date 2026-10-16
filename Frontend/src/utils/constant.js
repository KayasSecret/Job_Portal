const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const USER_API_ENDPOINT = `${API_BASE_URL}/api/v1/user`;
export const JOB_API_ENDPOINT = `${API_BASE_URL}/api/v1/job`;
export const APPLICANT_API_ENDPOINT = `${API_BASE_URL}/api/v1/application`;
export const COMPANY_API_ENDPOINT = `${API_BASE_URL}/api/v1/company`;
export const EVENT_API_ENDPOINT = `${API_BASE_URL}/api/v1/event`;
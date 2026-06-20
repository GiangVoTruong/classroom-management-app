import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({ baseURL: API_URL });

export const createAccessCode = (phoneNumber) =>
  api.post('/createAccessCode', { phoneNumber });

export const validateAccessCode = (phoneNumber, accessCode) =>
  api.post('/validateAccessCode', { phoneNumber, accessCode });

export const getStudents = () => api.get('/students');

export const getStudent = (phone) => api.get(`/student/${phone}`);

export const addStudent = (data) => api.post('/addStudent', data);

export const editStudent = (phone, data) => api.put(`/editStudent/${phone}`, data);

export const deleteStudent = (phone) => api.delete(`/student/${phone}`);

export const assignLesson = (data) => api.post('/assignLesson', data);

export const getInstructor = () => api.get('/instructor');

export const studentLoginEmail = (email) =>
  api.post('/student/loginEmail', { email });

export const studentValidateCode = (email, accessCode) =>
  api.post('/student/validateAccessCode', { email, accessCode });

export const studentLogin = (username, password) =>
  api.post('/student/login', { username, password });

export const getSetupInfo = (token) => api.get(`/student/setup/${token}`);

export const setupAccount = (data) => api.post('/student/setup-account', data);

export const getMyLessons = (phone) =>
  api.get('/student/myLessons', { params: { phone } });

export const markLessonDone = (phone, lessonId) =>
  api.post('/student/markLessonDone', { phone, lessonId });

export const editProfile = (data) => api.put('/student/editProfile', data);

export default api;

import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = 'https://expertapp.onrender.com/api'; 

export const api = axios.create({
  baseURL: BASE_URL,
});

export const socket = io('https://expertapp.onrender.com');
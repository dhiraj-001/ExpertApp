import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL 

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

export const socket = io(process.env.EXPO_PUBLIC_BASE_URL);
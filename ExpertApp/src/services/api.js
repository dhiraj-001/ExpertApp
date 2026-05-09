import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = 'http://10.161.248.90:5000/api'; 

export const api = axios.create({
  baseURL: BASE_URL,
});

export const socket = io('http://10.161.248.90:5000');
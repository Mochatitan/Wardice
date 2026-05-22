import { io } from "socket.io-client";

const ENDPOINT = "http://66.94.108.155:3000"; // Your server URL
export const k_socket = io(ENDPOINT);

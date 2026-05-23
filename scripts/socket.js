import { io } from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:3000"; // Your server URL
export const k_socket = io(ENDPOINT);

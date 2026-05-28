import { io } from "socket.io-client";

const IP = import.meta.env.VITE_SERVER_IP;
const ENDPOINT = "https://" + IP; // Your server URL
console.log(IP);
console.log(ENDPOINT);
export const k_socket = io(ENDPOINT);

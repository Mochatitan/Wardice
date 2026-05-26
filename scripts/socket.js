import { io } from "socket.io-client";

const IP = import.meta.env.VITE_SERVER_IP;
const ENDPOINT = "http://" + IP + ":3000"; // Your server URL
console.log(IP);
console.log(ENDPOINT);
export const k_socket = io(ENDPOINT);

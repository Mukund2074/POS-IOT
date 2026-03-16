// import { getToken } from "firebase/messaging";
// import { messaging } from "../firebase";
// import { v4 as uuidv4 } from 'uuid';

// export const requestPermissionAndGetToken = async () => {
//   try {
//     const permission = await Notification.requestPermission();

//     if (permission === "granted") {
//       const currentToken = await getToken(messaging, { vapidKey: `${process.env.REACT_APP_FIREBASE_VAPID_KEY}` });

//       if (currentToken) {
//         const deviceId = getOrGenerateDeviceId();
//         await sendTokenToServer(currentToken, deviceId);
//       } else {
//       }
//     } else {
//     }
//   } catch (error) {
//     console.error("Error getting token:", error);
//   }
// };

// const getOrGenerateDeviceId = () => {
//   let deviceId = localStorage.getItem('device_id');
//   if (!deviceId) {
//     deviceId = uuidv4();
//     localStorage.setItem('device_id', deviceId);
//   } else {
//   }
//   return deviceId;
// };

// const sendTokenToServer = async (token, deviceId) => {
//   const userId = localStorage.getItem('userId');
//   const authtoken = localStorage.getItem('token');
//   try {
//     const response = await fetch(`${process.env.REACT_APP_URL}/notification/requesttoken?isWeb=true`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${authtoken}`
//       },
//       body: JSON.stringify({
//         userId :  userId,
//         webFireBaseToken :  token,
//         deviceId: deviceId }),
//     });

//     if (response.ok) {
//     } else {
//       console.error("Failed to send token to the server. Response status:", response.status);
//     }
//   } catch (error) {
//     console.error("Error sending token to server:", error);
//   }
// };

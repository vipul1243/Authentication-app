import axios from "axios";
// import jwt_decode from 'jwt-decode';
import { jwtDecode } from "jwt-decode";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/** To get username from Token */
export async function getUsername() {
  const token = localStorage.getItem("token");
  if (!token) return Promise.reject("Cannot find Token");
  let decode = jwtDecode(token);
  return decode;
}

/** authenticate function */
export async function authenticate(username) {
  try {
    return await axios.post("/api/v1/user/authenticate", { username });
  } catch (error) {
    return { error: "Username doesn't exist...!" };
  }
}

/** get User details */
export async function getUser({ username }) {
  try {
    const { data } = await axios.get(`/api/v1/user/user/${username}`);
    return { data };
  } catch (error) {
    return { error: "Password doesn't Match...!" };
  }
}

/** register user function */
export async function registerUser(credentials, values) {
  try {
    const { data, status } = await axios.post(
      `/api/v1/user/register`,
      credentials
    );

    if (!data.success) {
      return Promise.reject({ message: data.message });
    }

    let { username, email } = values;

    /** send email */
    if (status === 201) {
      await axios.post("/api/v1/user/registerMail", {
        username,
        userEmail: email,
        text: data.message,
      });
    }

    return Promise.resolve(data.message);
  } catch (error) {
    return Promise.reject({ error });
  }
}

/** login function */
export async function verifyPassword({ username, password }) {
  try {
    if (username) {
      const { data } = await axios.post("/api/v1/user/login", {
        username,
        password,
      });
      if (!data.success) {
        return Promise.reject({ message: data.message });
      }
      return Promise.resolve({ data });
    }
  } catch (error) {
    return Promise.reject({ error: "Password doesn't Match...!" });
  }
}

/** update user profile function */
export async function updateUser(response) {
  try {
    const token = await localStorage.getItem("token");
    const data = await axios.put("/api/v1/user/updateUser", response, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return Promise.resolve({ data });
  } catch (error) {
    return Promise.reject({ error: "Couldn't Update Profile...!" });
  }
}

/** generate OTP */
export async function generateOTP(username) {
  try {
    const {
      data: { code },
      status,
    } = await axios.get("/api/v1/user/generateOTP", { params: { username } });

    // send mail with the OTP
    if (status === 201) {
      let { data } = await getUser({ username });
      let text = `Your Password Recovery OTP is ${code}. Verify and recover your password.`;
      await axios.post("/api/v1/user/registerMail", {
        username,
        userEmail: data.data.email,
        text,
        subject: "Password Recovery OTP",
      });
    }
    return Promise.resolve(code);
  } catch (error) {
    return Promise.reject({ error });
  }
}

/** verify OTP */
export async function verifyOTP({ username, code }) {
  try {
    const { data, status } = await axios.get("/api/v1/user/verifyOTP", {
      params: { username, code },
    });
    return { data, status };
  } catch (error) {
    return Promise.reject(error);
  }
}

/** reset password */
export async function resetPassword({ username, password }) {
  try {
    const { data, status } = await axios.put("/api/v1/user/resetPassword", {
      username,
      password,
    });
    return Promise.resolve({ data, status });
  } catch (error) {
    return Promise.reject({ error });
  }
}

/** Get Current IP */
export async function getCurrentIPAddress() {
  try {
    const { data } = await axios.get("https://api.ipify.org?format=json");
    return Promise.resolve(data.ip);
  } catch (error) {
    return Promise.reject(error);
  }
}

// export async function getCurrentData(ip) {
//   try {
//     const res = await axios.get(`https://ipinfo.io/${ip}/geo`);
//     return Promise.resolve(res.data);
//   } catch (error) {
//     if (error.response && error.response.status === 429) {
//       console.log("Rate limited. Retrying after some time...");
//       // Implement exponential backoff, e.g., wait for 1 second and then retry
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       return getCurrentData(ip); // Retry the request
//     } else {
//       console.error("Error fetching Geo Data:", error);
//       return Promise.reject(error);
//     }
//   }
// }

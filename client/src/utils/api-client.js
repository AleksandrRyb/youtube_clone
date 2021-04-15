import axios from "axios";

export const client = axios.create({
  baseURL: "/api/v1",
});

export function authenticate(response) {
  client({
    method: "POST",
    url: "/auth/google-signin",
    data: { idToken: response.tokenId },
  })
    .then((response) => {
      console.log("Sign in success: ", response);
      window.location.assign(window.location.href);
    })
    .catch((error) => {
      console.log("Sign in error: ", error.response);
    });
}

export async function signoutUser() {
  await client.get("/auth/signout");
  window.location.pathname = "/";
}

export async function updateUser() {}

export async function addVideoView() {}

export async function addComment() {}

export async function addVideo() {}

export async function subscribeUser() {}

export async function unsubscribeUser() {}

export async function likeVideo() {}

export async function dislikeVideo() {}

export async function deleteVideo(videoId) {
  await client.delete(`/videos/${videoId}`);
  window.location.pathname = "/";
}

export async function deleteComment() {}

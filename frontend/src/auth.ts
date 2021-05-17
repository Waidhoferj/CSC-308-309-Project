import GoTrue from "gotrue-js";

const auth = new GoTrue({
  APIUrl: "https://geoart.netlify.app/.netlify/identity",
  audience: "",
  setCookie: true,
});

export default auth;

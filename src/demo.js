// Import the module we're demoing
import EventEmitter from "./index";

// Some vars we'll need
const $messageForm = document.querySelector(".message-form");
const $message = document.querySelector(".message");
const $usernameForm = document.querySelector(".username-form");
const $username = document.querySelector(".username");
const $output = document.querySelector(".log");
const events = new EventEmitter();
let username = "anonymous" + Math.floor(Math.random() * 1000);

// Expose the base class and the instance we're working with
// Just to be able to poke around in the dev tools
window.EventEmitter = EventEmitter;
window.events = events;

// Event listeners
const onMessage = e => {
  let $line = document.createElement("p");
  $line.textContent = `${e.emulated ? "You" : e.data.username}: ${e.data.msg}`;
  $output.appendChild($line);
}

const onSendMessage = e => {
  e.preventDefault();
  let data = {msg: $message.value, username};
  events.emit("message", data);
  $message.value = "";
}

const onUsername = e => {
  let $line = document.createElement("p");
  $line.innerHTML = `<em>${e.emulated ? "You" : e.data.old} changed ${e.emulated ? "your" : "his / her"} username to ${e.data.username}.</em>`;
  $output.appendChild($line);
}

const onSetUsername = e => {
  e.preventDefault();
  let old = username;
  username = $username.value;
  let data = {username, old};
  events.emit("username", data);
  $username.value = "";
}

const onLeave = e => {
  if(!e.emulated) {
    let $line = document.createElement("p");
    $line.innerHTML = `<em>${e.data} left the chat.</em>`;
    $output.appendChild($line);
  }
}

const onUnload = e => {
  events.emit("leave", username);
}

const onJoin = e => {
  let $line = document.createElement("p");
  $line.innerHTML = `<em>${e.emulated ? "You" : e.data} joined the chat.</em>`;
  $output.appendChild($line);
}

const onLoad = e => {
  events.emit("join", username);
}


// Attach event listeners
$messageForm.addEventListener("submit", onSendMessage);
$usernameForm.addEventListener("submit", onSetUsername);
window.addEventListener("beforeunload", onUnload);
window.addEventListener("load", onLoad);
events.on("message", onMessage);
events.on("username", onUsername);
events.on("leave", onLeave);
events.on("join", onJoin);

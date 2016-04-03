(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Some vars we'll need
const $messageForm = document.querySelector(".message-form"); // Import the module we're demoing

const $message = document.querySelector(".message");
const $usernameForm = document.querySelector(".username-form");
const $username = document.querySelector(".username");
const $output = document.querySelector(".log");
const events = new _index2.default();
let username = "anonymous" + Math.floor(Math.random() * 1000);

// Expose the base class and the instance we're working with
// Just to be able to poke around in the dev tools
window.EventEmitter = _index2.default;
window.events = events;

// Event listeners
const onMessage = e => {
  let $line = document.createElement("p");
  $line.textContent = `${ e.emulated ? "You" : e.data.username }: ${ e.data.msg }`;
  $output.appendChild($line);
};

const onSendMessage = e => {
  e.preventDefault();
  let data = { msg: $message.value, username };
  events.emit("message", data);
  $message.value = "";
};

const onUsername = e => {
  let $line = document.createElement("p");
  $line.innerHTML = `<em>${ e.emulated ? "You" : e.data.old } changed ${ e.emulated ? "your" : "his / her" } username to ${ e.data.username }.</em>`;
  $output.appendChild($line);
};

const onSetUsername = e => {
  e.preventDefault();
  let old = username;
  username = $username.value;
  let data = { username, old };
  events.emit("username", data);
  $username.value = "";
};

const onLeave = e => {
  if (!e.emulated) {
    let $line = document.createElement("p");
    $line.innerHTML = `<em>${ e.data } left the chat.</em>`;
    $output.appendChild($line);
  }
};

const onUnload = e => {
  events.emit("leave", username);
};

const onJoin = e => {
  let $line = document.createElement("p");
  $line.innerHTML = `<em>${ e.emulated ? "You" : e.data } joined the chat.</em>`;
  $output.appendChild($line);
};

const onLoad = e => {
  events.emit("join", username);
};

// Attach event listeners
$messageForm.addEventListener("submit", onSendMessage);
$usernameForm.addEventListener("submit", onSetUsername);
window.addEventListener("beforeunload", onUnload);
window.addEventListener("load", onLoad);
events.on("message", onMessage);
events.on("username", onUsername);
events.on("leave", onLeave);
events.on("join", onJoin);
},{"./index":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const randIdMultiplier = Math.pow(10, 20);
const randId = () => Math.floor(Math.random() * randIdMultiplier).toString();

const getChromeVersion = () => {
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
};

const timestamp = () => {
  if (getChromeVersion() >= 49) {
    return performance.now();
  } else {
    return Date.now && Date.now() || new Date().getTime();
  }
};

const merge = (base, obj) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      base[key] = obj[key];
    }
  }
};

const mimickEvent = e => {
  let val = `${ e.id },${ JSON.stringify(e) }`;

  e.emulated = true;
  e.bubbles = false;
  e.cancelBubble = false;
  e.cancelable = false;
  e.currentTarget = window;
  e.originalTarget = window;
  e.explicitOriginalTarget = window;
  e.defaultPrevented = false;
  e.eventPhase = 2;
  e.key = "__events__";
  e.newValue = val;
  e.oldValue = null;
  e.path = [window];
  e.returnValue = true;
  e.srcElement = window;
  e.storageArea = localStorage;
  e.target = window;
  e.url = location.href;
  e.timestamp = timestamp();
  e.isTrusted = false;
};

class EventEmitter {
  constructor(room, opts = {}) {
    if (typeof room === "object") {
      opts = room;
      room = null;
    }

    this.listeners = {};
    this.room = room || EventEmitter.NO_ROOM;
    this.options = {
      attach: opts.attach !== false,
      emulate: opts.emulate !== false
    };

    if (this.options.attach) {
      this.attach();
    }
  }

  static get NO_ROOM() {
    return "__no room ID assigned__";
  }

  get NO_ROOM() {
    return EventEmitter.NO_ROOM;
  }

  static get version() {
    return "0.0.2";
  }

  get version() {
    return EventEmitter.version;
  }

  attach(origin = window) {
    origin.addEventListener("storage", this);
  }

  detach(origin = window) {
    origin.removeEventListener("storage", this);
  }

  handleEvent(e) {
    let val = e.newValue;
    let c1 = val.indexOf(",");
    let room = val.slice(0, c1);

    if (e.key === "__events__" && room === this.room) {
      let c2 = val.indexOf(",", c1 + 1);
      let dataStr = val.slice(c2 + 1);
      let data = JSON.parse(dataStr);
      merge(e, data);
      e.version = this.version;
      this._emit(e);
    }
  }

  _emit(e) {
    var listeners = this.listeners[e.event];

    if (listeners) {
      listeners.forEach(listener => listener(e));
    }
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(listener);
  }

  emit(event, data) {
    let e = {
      event: event,
      data: data,
      room: this.room,
      srcUrl: location.href,
      srcVersion: this.version
    };
    let str = JSON.stringify(e);

    localStorage.setItem("__events__", `${ this.room },${ randId() },${ str }`);

    if (this.options.emulate) {
      mimickEvent(e);
      e.version = this.version;
      this._emit(e);
    }
  }
}
exports.default = EventEmitter;
},{}]},{},[1]);

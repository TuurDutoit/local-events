(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const randIdMultiplier = Math.pow(10, 20);
const randId = () => Math.floor(Math.random() * randIdMultiplier);

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
    let ci = val.indexOf(",");
    let room = val.slice(0, ci);

    if (e.key === "__events__" && room === this.room) {
      let dataStr = val.slice(ci + 22);
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

import EventEmitter from "./index";

const $form = document.querySelector("form");
const $input = document.querySelector(".input");
const $output = document.querySelector(".log");
const events = new EventEmitter("a");

const onMessage = function(e) {
  let $line = document.createElement("p");
  $line.textContent = `${e.event}: ${e.data.msg}`;
  $output.appendChild($line);
}

const onSubmit = function(e) {
  e.preventDefault();
  let data = {msg: $input.value};
  events.emit("message", data);
  $input.value = "";
}

$form.addEventListener("submit", onSubmit);
events.on("message", onMessage);

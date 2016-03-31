local-events
============

An EventEmitter that works over localStorage.

## API
This module exposes a single class, `EventEmitter`. Just create an instance of this class and start emitting events.

### new EventEmitter([string room], [object options])
Creates a new EventEmitter, which lets you emit and listen for events.  
The room ID is used to distinguish between different connections or rooms: when an EventEmitter emits an event, all open tabs in the same origin are notified of the event. With rooms, you can separate different channels: only EventEmitters with the same room ID as the source, will fire an event.  
Rooms are optional: all emitters that don't have a room ID assigned, will behave as one room.

Options:
 * attach: a boolean indicating whether to automatically start listening for events. Default: true
 * emulate: a boolean indicating whether events should be emulated on the source emitter. When a key in localStorage is changed, all tabs in the same origin are notified, except the one that changed the key. Setting this to true (the default) will emulate the event on the source EventEmitter.

### EventEmitter#listeners : object
*Private*  
An object mapping event names to arrays or registered listeners.

### EventEmitter#room : string
*Read only*  
The room ID of this emitter.

### EventEmitter#options : options
*Read only*  
The sanitized options for this emitter.

### EventEmitter#version : string
*Read only*  
The version of the library.

### EventEmitter#attach([object origin (window)]) : this
Start listening for events; calls `addEventListener` on `origin`, or `window` if `origin` is not defined. Called automatically on creation when options.attach is not `false`.

### EventEmitter#detach([object origin (window)]) : this
Stop listening for events; calls `removeEventListener` on `origin`, or `window` if `origin` is not defined.

### EventEmitter#handleEvent(StorageEvent event) : void
*Private*  
The listener for the `storage` event.

### EventEmitter#\_emit(Event event) : this
*Private*  
Emit `event` on this emitter, i.e. call all listeners registered with this emitter.

### EventEmitter#on(string event, function listener) : this
Registers `listener` on this emitter for `event`.

### EventEmitter#emit(string event, any data) : this
Emits `event` with some data. `data` must be abel to be passed through `JSON.stringify` and will be added to the event object as `Event.data`.

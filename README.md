# CMD++ Core

[![Join the chat at https://gitter.im/cmdPP/core](https://badges.gitter.im/cmdPP/core.svg)](https://gitter.im/cmdPP/core?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


### ToDos
- [x] Fully integrate code from previous repository before storage was added.
- [x] Implement help delimiter (In Node application, &nbsp is plain text, not HTML).
- [ ] Implement [original todos](https://github.com/jettcrowson/jettcrowson.github.io#todo).
- [x] Add storage
- [x] Add unit tests.

## API
A CLI environment-like game

<a name="module_cmdpp-core..CMD"></a>

### cmdpp-core~CMD
Class representing the game object.

**Kind**: inner class of <code>[cmdpp-core](#module_cmdpp-core)</code>  

* [~CMD](#module_cmdpp-core..CMD)
    * [new CMD(options)](#new_module_cmdpp-core..CMD_new)
    * [.gameLoop()](#module_cmdpp-core..CMD+gameLoop)
    * [.respond(...txt)](#module_cmdpp-core..CMD+respond)
    * [.checkStorage(increment)](#module_cmdpp-core..CMD+checkStorage) ⇒ <code>boolean</code>
    * [.command(str)](#module_cmdpp-core..CMD+command)
    * [.update()](#module_cmdpp-core..CMD+update)
    * [.save()](#module_cmdpp-core..CMD+save)
    * [.load()](#module_cmdpp-core..CMD+load)
    * [.addData(amt)](#module_cmdpp-core..CMD+addData) ⇒ <code>boolean</code>
    * [.removeData(amt)](#module_cmdpp-core..CMD+removeData) ⇒ <code>boolean</code>
    * [.addMoney(amt)](#module_cmdpp-core..CMD+addMoney)
    * [.removeMoney(amt)](#module_cmdpp-core..CMD+removeMoney) ⇒ <code>boolean</code>
    * [.formatBytes()](#module_cmdpp-core..CMD+formatBytes) ⇒
    * [.formatter(size)](#module_cmdpp-core..CMD+formatter) ⇒
    * [.loadStorage()](#module_cmdpp-core..CMD+loadStorage)
    * [.reset()](#module_cmdpp-core..CMD+reset)

<a name="new_module_cmdpp-core..CMD_new"></a>

#### new CMD(options)
Instantiate the CMD object


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | Options |
| opts.debug | <code>Boolean</code> | <code>false</code> | Debug mode. |
| opts.funcs | <code>Object</code> |  | Object containing functions to be used by CMD. |
| opts.funcs.respond | <code>[respondCallback](#CMD..respondCallback)</code> |  | Function for responding. |
| opts.funcs.save | <code>[saveCallback](#CMD..saveCallback)</code> |  | Function for saving. |
| opts.funcs.load | <code>[loadCallback](#CMD..loadCallback)</code> |  | Function for loading. |
| opts.funcs.update | <code>[updateCallback](#CMD..updateCallback)</code> |  | Function for updating. |
| opts.errorHandler | <code>[errorHandlerCallback](#CMD..errorHandlerCallback)</code> |  | Function for error handling. |
| opts.commandProvider | <code>[commandProviderCallback](#CMD..commandProviderCallback)</code> |  | Function to provide custom commands. Cannot be ES6 arrow function. |

**Example**  
```js
import { CMD } from 'cmdpp-core';
import fs from 'fs';
var cmdContainer = {
  data: 0,
  money: 0
};
var cmd = new CMD({
  debug: false,
  funcs: {
    respond: (...txt) => console.log(...txt),
    save: (cmdData) => fs.writeFileSync('save.json', JSON.stringify(cmdData, null, 2)),
    load: () => return JSON.parse(fs.readFileSync('save.json')),
    update: (cmdObj) => {
      cmdContainer.data = cmdObj.data;
      cmdContainer.money = cmdObj.money;
    }
  },
  errorHandler: (err) => console.error(err),
  commandProvider: function() {
    return {
      stringDesc: {
        func: () => this.respond("First test run!"),
        desc: "Desc can be a string"
      },
      functionDesc: {
        func: () => this.respond("Second test run!"),
        desc: () => "Desc can also be a function that returns a string or an array of strings."
      },
      buyableCommand: {
        func: () => this.respond("buyable command!"),
        desc: 'This command must be bought with the "buyCommand" command.',
        price: 10
      }
    };
  }
});
```
<a name="module_cmdpp-core..CMD+gameLoop"></a>

#### cmd.gameLoop()
Start the game loop.

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
<a name="module_cmdpp-core..CMD+respond"></a>

#### cmd.respond(...txt)
Send response to respond function from constructor

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  

| Param | Type | Description |
| --- | --- | --- |
| ...txt | <code>string</code> | Strings to be sent to respond function. |

<a name="module_cmdpp-core..CMD+checkStorage"></a>

#### cmd.checkStorage(increment) ⇒ <code>boolean</code>
Check if storage is full.

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
**Returns**: <code>boolean</code> - If storage has enough space.  

| Param | Type | Description |
| --- | --- | --- |
| increment | <code>number</code> &#124; <code>undefined</code> | Increment to check against. If null, equal to CMD#increment. |

<a name="module_cmdpp-core..CMD+command"></a>

#### cmd.command(str)
Run command

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | Command to be ran. |

<a name="module_cmdpp-core..CMD+update"></a>

#### cmd.update()
Run update function from constructor to update game values

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
<a name="module_cmdpp-core..CMD+save"></a>

#### cmd.save()
Save game progress

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
<a name="module_cmdpp-core..CMD+load"></a>

#### cmd.load()
Load game progress

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
<a name="module_cmdpp-core..CMD+addData"></a>

#### cmd.addData(amt) ⇒ <code>boolean</code>
Add data

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
**Returns**: <code>boolean</code> - if data was able to be added.  

| Param | Type | Description |
| --- | --- | --- |
| amt | <code>number</code> | Amount to add. |

<a name="module_cmdpp-core..CMD+removeData"></a>

#### cmd.removeData(amt) ⇒ <code>boolean</code>
Remove data

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
**Returns**: <code>boolean</code> - if data was able to be removed.  

| Param | Type | Description |
| --- | --- | --- |
| amt | <code>number</code> | Amount to remove. |

<a name="module_cmdpp-core..CMD+addMoney"></a>

#### cmd.addMoney(amt)
Add money

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  

| Param | Type | Description |
| --- | --- | --- |
| amt | <code>number</code> | Amount to add. |

<a name="module_cmdpp-core..CMD+removeMoney"></a>

#### cmd.removeMoney(amt) ⇒ <code>boolean</code>
Remove money

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
**Returns**: <code>boolean</code> - if money was able to be removed.  

| Param | Type | Description |
| --- | --- | --- |
| amt | <code>number</code> | Amount to remove. |

<a name="module_cmdpp-core..CMD+formatBytes"></a>

#### cmd.formatBytes() ⇒
Format bytes into a human-readable format

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
**Returns**: CMD#data in human-readable format  
<a name="module_cmdpp-core..CMD+formatter"></a>

#### cmd.formatter(size) ⇒
Format number into a human-readable format

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
**Returns**: size in human-readable format  

| Param | Type | Description |
| --- | --- | --- |
| size | <code>number</code> | Number to be formatted. |

<a name="module_cmdpp-core..CMD+loadStorage"></a>

#### cmd.loadStorage()
Load storage options

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  
<a name="module_cmdpp-core..CMD+reset"></a>

#### cmd.reset()
Reset game progress

**Kind**: instance method of <code>[CMD](#module_cmdpp-core..CMD)</code>  

<a name="CMD..respondCallback"></a>

#### respondCallback(...txt)
Function to handle responses from the CMD object.

**Kind**: anonymous function passed to <code>[new CMD(options)](#new_module_cmdpp-core..CMD_new)</code>

| Param | Type | Description |
| --- | --- | --- |
| ...txt | <code>string</code> | Responses |

<a name="CMD..saveCallback"></a>

#### saveCallback(cmdData)
Function to handle saving progress.

**Kind**: anonymous function passed to <code>[new CMD(options)](#new_module_cmdpp-core..CMD_new)</code>  
**Returns**: <code>[Error](https://nodejs.org/api/errors.html)</code> &#124; <code>null</code> - An error if encountered.

| Param | Type | Description |
| --- | --- | --- |
| cmdData | <code>object</code> | Game progress to be saved. |
| cmdData.data | <code>number</code> | Data collected. |
| cmdData.money | <code>number</code> | Money collected. |
| cmdData.increment | <code>number</code> | Increment value for mineData. |
| cmdData.autoIncrement | <code>number</code> | Increment value for autoMine. |
| cmdData.storage | <code>string</code> | Current storage value. |
| cmdData.unlocked | <code>string[]</code> | Commands bought with buyCommand |

<a name="CMD..loadCallback"></a>

#### loadCallback()
Function to handle saving progress.

**Kind**: anonymous function passed to <code>[new CMD(options)](#new_module_cmdpp-core..CMD_new)</code>  
**Returns**: <code>Object</code> - Game progress loaded from save.

<a name="CMD..updateCallback"></a>

#### updateCallback(cmdObj)
Function to handle updating game values.

**Kind**: anonymous function passed to <code>[new CMD(options)](#new_module_cmdpp-core..CMD_new)</code>

| Param | Type | Description |
| --- | --- | --- |
| cmdObj | <code>[CMD](#module_cmdpp-core..CMD)</code> | CMD object. |

<a name="CMD..errorHandlerCallback"></a>

#### errorHandlerCallback(err)
Function to handle thrown errors.

**Kind**: anonymous function passed to <code>[new CMD(options)](#new_module_cmdpp-core..CMD_new)</code>

| Param | Type | Description |
| --- | --- | --- |
| err | <code>[Error](https://nodejs.org/api/errors.html)</code> | Error thrown |

<a name="CMD..commandProviderCallback"></a>

#### commandProviderCallback()
Function to provide custom commands.

**Kind**: anonymous function passed to <code>[new CMD(options)](#new_module_cmdpp-core..CMD_new)</code>  
**Returns**: <code>{[Command](#module_cmdpp-core..Command)}</code> - Object of custom commands.

<a name="module_cmdpp-core..Command"></a>

### Command : <code>Object</code>
An object representing a command.

**Kind**: inner typedef of <code>[cmdpp-core](#module_cmdpp-core)</code>  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| func | <code>function</code> |  | Function called when command is run. |
| desc | <code>string</code> &#124; <code>function</code> |  | Description for command. |
| usage | <code>string</code> &#124; <code>function</code> &#124; <code>undefined</code> | <code>null</code> | How to use the command. |
| price | <code>number</code> &#124; <code>undefined</code> | <code>0</code> | Price to pay in bytes for command. |

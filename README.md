# CMD++ Core

[![Join the chat at https://gitter.im/cmdPP/core](https://badges.gitter.im/cmdPP/core.svg)](https://gitter.im/cmdPP/core?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


### ToDos
- [x] Fully integrate code from previous repository before storage was added.
- [x] Implement help delimiter (In Node application, &nbsp is plain text, not HTML).
- [ ] Implement [original todos](https://github.com/jettcrowson/jettcrowson.github.io#todo).
- [x] Add storage
- [x] Add unit tests.

## API  
### Classes  
* <code>[CMD](#CMD)</code> - Class representing the main game logic
* <code>[Storage](#Storage)</code> - Class representing a storage object.
* <code>[StorageContainer](#StorageContainer)</code> - Class representing a container for all Storage instances, as well as a representation of the current Storage instance.

<a name="CMD"></a>

## CMD
Class representing the main game logic.

**Kind**: global class  

* [CMD](#CMD)
    * [new CMD(options)](#new_CMD_new)
    * _instance_
        * [.gameLoop()](#CMD+gameLoop)
        * [.respond(...txt)](#CMD+respond)
        * [.checkStorage(increment)](#CMD+checkStorage) ⇒ <code>boolean</code>
        * [.command(str)](#CMD+command)
        * [.update()](#CMD+update)
        * [.save()](#CMD+save)
        * [.load()](#CMD+load)
        * [.addData(amt)](#CMD+addData) ⇒ <code>boolean</code>
        * [.removeData(amt)](#CMD+removeData) ⇒ <code>boolean</code>
        * [.addMoney(amt)](#CMD+addMoney)
        * [.removeMoney(amt)](#CMD+removeMoney) ⇒ <code>boolean</code>
        * [.formatBytes()](#CMD+formatBytes) ⇒
        * [.formatter(size)](#CMD+formatter) ⇒
        * [.reset()](#CMD+reset)
    * _inner_
        * [~respondCallback](#CMD..respondCallback) : <code>function</code>
        * [~saveCallback](#CMD..saveCallback) ⇒ <code>Error</code> &#124; <code>null</code>
        * [~loadCallback](#CMD..loadCallback) ⇒ <code>Object</code>
        * [~updateCallback](#CMD..updateCallback) : <code>function</code>
        * [~errorHandlerCallback](#CMD..errorHandlerCallback) : <code>function</code>
        * [~commandProviderCallback](#CMD..commandProviderCallback) ⇒ <code>Command</code>

<a name="new_CMD_new"></a>

### new CMD(options)
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
<a name="CMD+gameLoop"></a>

### cmd.gameLoop()
Start the game loop.

**Kind**: instance method of <code>[CMD](#CMD)</code>  
<a name="CMD+respond"></a>

### cmd.respond(...txt)
Send response to respond function from constructor

**Kind**: instance method of <code>[CMD](#CMD)</code>  

| Param | Type | Description |
| --- | --- | --- |
| ...txt | <code>string</code> | Strings to be sent to respond function. |

<a name="CMD+checkStorage"></a>

### cmd.checkStorage(increment) ⇒ <code>boolean</code>
Check if storage is full.

**Kind**: instance method of <code>[CMD](#CMD)</code>  
**Returns**: <code>boolean</code> - If storage has enough space.  

| Param | Type | Description |
| --- | --- | --- |
| increment | <code>number</code> &#124; <code>undefined</code> | Increment to check against. If undefined, equal to CMD#increment. |

<a name="CMD+command"></a>

### cmd.command(str)
Run command

**Kind**: instance method of <code>[CMD](#CMD)</code>  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | Command to be ran. |

<a name="CMD+update"></a>

### cmd.update()
Run update function from constructor to update game values

**Kind**: instance method of <code>[CMD](#CMD)</code>  
<a name="CMD+save"></a>

### cmd.save()
Save game progress

**Kind**: instance method of <code>[CMD](#CMD)</code>  
<a name="CMD+load"></a>

### cmd.load()
Load game progress

**Kind**: instance method of <code>[CMD](#CMD)</code>  
<a name="CMD+addData"></a>

### cmd.addData(amt) ⇒ <code>boolean</code>
Add data

**Kind**: instance method of <code>[CMD](#CMD)</code>  
**Returns**: <code>boolean</code> - if data was able to be added.  

| Param | Type | Description |
| --- | --- | --- |
| amt | <code>number</code> | Amount to add. |

<a name="CMD+removeData"></a>

### cmd.removeData(amt) ⇒ <code>boolean</code>
Remove data

**Kind**: instance method of <code>[CMD](#CMD)</code>  
**Returns**: <code>boolean</code> - if data was able to be removed.  

| Param | Type | Description |
| --- | --- | --- |
| amt | <code>number</code> | Amount to remove. |

<a name="CMD+addMoney"></a>

### cmd.addMoney(amt)
Add money

**Kind**: instance method of <code>[CMD](#CMD)</code>  

| Param | Type | Description |
| --- | --- | --- |
| amt | <code>number</code> | Amount to add. |

<a name="CMD+removeMoney"></a>

### cmd.removeMoney(amt) ⇒ <code>boolean</code>
Remove money

**Kind**: instance method of <code>[CMD](#CMD)</code>  
**Returns**: <code>boolean</code> - if money was able to be removed.  

| Param | Type | Description |
| --- | --- | --- |
| amt | <code>number</code> | Amount to remove. |

<a name="CMD+formatBytes"></a>

### cmd.formatBytes() ⇒
Format bytes into a human-readable format

**Kind**: instance method of <code>[CMD](#CMD)</code>  
**Returns**: CMD#data in human-readable format  
<a name="CMD+formatter"></a>

### cmd.formatter(size) ⇒
Format number into a human-readable format

**Kind**: instance method of <code>[CMD](#CMD)</code>  
**Returns**: size in human-readable format  

| Param | Type | Description |
| --- | --- | --- |
| size | <code>number</code> | Number to be formatted. |

<a name="CMD+reset"></a>

### cmd.reset()
Reset game progress

**Kind**: instance method of <code>[CMD](#CMD)</code>  
<a name="CMD..respondCallback"></a>

### cmd~respondCallback : <code>function</code>
Function to handle responses from the CMD object.

**Kind**: inner typedef of <code>[CMD](#CMD)</code>  

| Param | Type | Description |
| --- | --- | --- |
| ...txt | <code>\*</code> | Responses |

<a name="CMD..saveCallback"></a>

### cmd~saveCallback ⇒ <code>Error</code> &#124; <code>null</code>
Function to handle saving progress.

**Kind**: inner typedef of <code>[CMD](#CMD)</code>  
**Returns**: <code>Error</code> &#124; <code>null</code> - An error if encountered.  

| Param | Type | Description |
| --- | --- | --- |
| cmdData | <code>Object</code> | Game progress to be saved. |
| cmdData.data | <code>number</code> | Data collected. |
| cmdData.money | <code>number</code> | Money collected. |
| cmdData.increment | <code>number</code> | Increment value for mineData. |
| cmdData.autoIncrement | <code>number</code> | Increment value for autoMine. |
| cmdData.storage | <code>string</code> | Current storage value. |
| cmdData.unlocked | <code>Array.&lt;string&gt;</code> | Commands bought with buyCommand. |

<a name="CMD..loadCallback"></a>

### cmd~loadCallback ⇒ <code>Object</code>
Function to handle saving progress.

**Kind**: inner typedef of <code>[CMD](#CMD)</code>  
**Returns**: <code>Object</code> - Game progress loaded from save.  
<a name="CMD..updateCallback"></a>

### cmd~updateCallback : <code>function</code>
Function to handle updating game values.

**Kind**: inner typedef of <code>[CMD](#CMD)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cmdObj | <code>[CMD](#CMD)</code> | CMD object. |

<a name="CMD..errorHandlerCallback"></a>

### cmd~errorHandlerCallback : <code>function</code>
Function to handle thrown errors.

**Kind**: inner typedef of <code>[CMD](#CMD)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Error thrown. |

<a name="CMD..commandProviderCallback"></a>

### cmd~commandProviderCallback ⇒ <code>Command</code>
Function to provide custom commands.

**Kind**: inner typedef of <code>[CMD](#CMD)</code>  
**Returns**: <code>Command</code> - Object of custom commands.  

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

<a name="Storage"></a>

## Storage
Class representing a storage object.

**Kind**: global class  
**Typeicalname**: storageObj  

* [Storage](#Storage)
    * [new Storage(name, idx, prev)](#new_Storage_new)
    * [.name](#Storage+name)
    * [.idx](#Storage+idx)
    * [.capacity](#Storage+capacity)
    * [.price](#Storage+price)
    * [.prev](#Storage+prev)

<a name="new_Storage_new"></a>

### new Storage(name, idx, prev)
Instantiate a Storage object


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of storage object. |
| idx | <code>number</code> | Index in list of StorageContainer's storage objects. |
| prev | <code>string</code> &#124; <code>undefined</code> | Name of Storage object preceding this object in list of StorageContainer's storage objects. |

<a name="Storage+name"></a>

### storage.name
**Kind**: instance property of <code>[Storage](#Storage)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of storage object |

<a name="Storage+idx"></a>

### storage.idx
**Kind**: instance property of <code>[Storage](#Storage)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| idx | <code>number</code> | Index in list of StorageContainer's storage objects. |

<a name="Storage+capacity"></a>

### storage.capacity
**Kind**: instance property of <code>[Storage](#Storage)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| capacity | <code>number</code> | Capacity of storage object |

<a name="Storage+price"></a>

### storage.price
**Kind**: instance property of <code>[Storage](#Storage)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| price | <code>number</code> | Price of storage object |

<a name="Storage+prev"></a>

### storage.prev
**Kind**: instance property of <code>[Storage](#Storage)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| prev | <code>string</code> &#124; <code>undefined</code> | Name of Storage object preceding this object in list of StorageContainer's storage objects. |


<a name="StorageContainer"></a>

## StorageContainer
Class representing a container for all Storage instances, as well as a representation of the current Storage instance.

**Kind**: global class  
**Typeicalname**: storage  

* [StorageContainer](#StorageContainer)
    * _instance_
        * [.name](#StorageContainer+name) : <code>string</code>
        * [.capacity](#StorageContainer+capacity) : <code>number</code>
        * [.price](#StorageContainer+price) : <code>number</code>
        * [.idx](#StorageContainer+idx) : <code>number</code>
        * [.current](#StorageContainer+current) : <code>[Storage](#Storage)</code>
        * [.upgrade](#StorageContainer+upgrade) : <code>[Storage](#Storage)</code>
        * [.otherNames](#StorageContainer+otherNames) : <code>Array.&lt;string&gt;</code>
        * [.others](#StorageContainer+others) : <code>Object</code>
        * [.allNames](#StorageContainer+allNames) : <code>Array.&lt;string&gt;</code>
        * [.all](#StorageContainer+all) : <code>Object</code>
        * [.checkStorage(data, increment)](#StorageContainer+checkStorage) ⇒ <code>boolean</code>
    * _static_
        * [.getStorage(storages)](#StorageContainer.getStorage) ⇒ <code>[StorageContainer](#StorageContainer)</code>

<a name="StorageContainer+name"></a>

### storageContainer.name : <code>string</code>
Name of current storage.

**Kind**: instance property of <code>[StorageContainer](#StorageContainer)</code>  
<a name="StorageContainer+capacity"></a>

### storageContainer.capacity : <code>number</code>
Capacity of current storage.

**Kind**: instance property of <code>[StorageContainer](#StorageContainer)</code>  
<a name="StorageContainer+price"></a>

### storageContainer.price : <code>number</code>
Price of current storage.

**Kind**: instance property of <code>[StorageContainer](#StorageContainer)</code>  
<a name="StorageContainer+idx"></a>

### storageContainer.idx : <code>number</code>
ID of current storage.

**Kind**: instance property of <code>[StorageContainer](#StorageContainer)</code>  
<a name="StorageContainer+current"></a>

### storageContainer.current : <code>[Storage](#Storage)</code>
Current storage.

**Kind**: instance property of <code>[StorageContainer](#StorageContainer)</code>  
<a name="StorageContainer+upgrade"></a>

### storageContainer.upgrade : <code>[Storage](#Storage)</code>
Next storage in upgrade list.

**Kind**: instance property of <code>[StorageContainer](#StorageContainer)</code>  
<a name="StorageContainer+otherNames"></a>

### storageContainer.otherNames : <code>Array.&lt;string&gt;</code>
Names of all storages excluding the currently selected.

**Kind**: instance property of <code>[StorageContainer](#StorageContainer)</code>  
<a name="StorageContainer+others"></a>

### storageContainer.others : <code>Object</code>
All storages excluding the currently selected.

**Kind**: instance property of <code>[StorageContainer](#StorageContainer)</code>  
<a name="StorageContainer+allNames"></a>

### storageContainer.allNames : <code>Array.&lt;string&gt;</code>
Names of all storages.

**Kind**: instance property of <code>[StorageContainer](#StorageContainer)</code>  
<a name="StorageContainer+all"></a>

### storageContainer.all : <code>Object</code>
All storages.

**Kind**: instance property of <code>[StorageContainer](#StorageContainer)</code>  
<a name="StorageContainer+checkStorage"></a>

### storageContainer.checkStorage(data, increment) ⇒ <code>boolean</code>
Check if storage is full.

**Kind**: instance method of <code>[StorageContainer](#StorageContainer)</code>  
**Returns**: <code>boolean</code> - If storage has enough space.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>number</code> | Data to check against. |
| increment | <code>number</code> | Increment to check against. |

<a name="StorageContainer.getStorage"></a>

### StorageContainer.getStorage(storages) ⇒ <code>[StorageContainer](#StorageContainer)</code>
Instantiate StorageContainer

**Kind**: static method of <code>[StorageContainer](#StorageContainer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| storages | <code>Array.&lt;string&gt;</code> &#124; <code>undefined</code> | Names of storages. If undefined, use default storages. |


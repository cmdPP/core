/*eslint no-console: 0*/

// /**
//  * A CLI environment-like game
//  * @module cmdpp-core
//  */

import filesize from 'filesize';
import { loadCommands as loadCMDs } from './commands';
import { getStorage } from './storage';
import pJSON from '../package.json';

// TODO: Replace current CMD#storage with an object containing storage data
// TODO: Move CMD#_commands to CMD#Commands
// TODO: Create more JSDoc

/** Class representing the main game logic.
 * @typicalname cmd
 * @class
 * @example <caption>Instantiate a CMD object.</caption>
 * import { CMD } from 'cmdpp-core';
 * import fs from 'fs';
 * var cmdContainer = {
 *   data: 0,
 *   money: 0
 * };
 * var cmd = new CMD({
 *   (...txt) => console.log(...txt),
 *   (cmdData) => fs.writeFileSync('save.json', JSON.stringify(cmdData, null, 2)),
 *   () => return JSON.parse(fs.readFileSync('save.json')),
 *   (cmdObj) => {
 *     cmdContainer.data = cmdObj.data;
 *     cmdContainer.money = cmdObj.money;
 *   },
 *   function() {
 *     return {
 *       stringDesc: {
 *         func: () => this.respond("First test run!"),
 *         desc: "Desc can be a string"
 *       },
 *       functionDesc: {
 *         func: () => this.respond("Second test run!"),
 *         desc: () => "Desc can also be a function that returns a string or an array of strings."
 *       },
 *       buyableCommand: {
 *         func: () => this.respond("buyable command!"),
 *         desc: 'This command must be bought with the "buyCommand" command.',
 *         price: 10
 *       }
 *     };
 *   },
 *   (err) => console.error(err),
 *   true
 * });
 */
class CMD {

    /**
     * Instantiate the CMD object
     * @param {!CMD~respondCallback} respond - Function for responding.
     * @param {!CMD~saveCallback} save - Function for saving.
     * @param {!CMD~loadCallback} load - Function for loading.
     * @param {!CMD~updateCallback} update - Function for updating.
     * @param {!CMD~commandProviderCallback} commandProvider - Function to provide custom commands. Cannot be ES6 arrow function.
     * @param {!CMD~errorHandlerCallback} errorHandler - Function for error handling.
     * @param {boolean} debug=false - Debug mode.
     */
    // constructor(options) {
    constructor(respond, save, load, update, commandProvider, errorHandler, debug) {
        // var defaults = {
        //     debug: false,
        //     funcs: {
        //         respond: (...txt) => console.log(...txt),
        //         save: () => console.warn('No save function has been set.'),
        //         load: () => console.warn('No load function has been set.'),
        //         update: () => console.warn('No update function has been set.'),
        //         // reset: () => console.warn('No reset function has been set.'),
        //         errorHandler: (e) => console.error(e)
        //     },
        //     errorHandler: (e) => console.error(e),
        //     commandProvider: function() {}
        // };
        
        respond = respond || ((...txt) => console.log(...txt));
        save = save || (() => console.warn('No save function has been set.'));
        load = load || (() => console.warn('No load function has been set.'));
        update = update || (() => console.warn('No update function has been set.'));
        
        commandProvider = commandProvider || function() {};
        errorHandler = errorHandler || ((e) => console.error(e));
        debug = debug || false;
        
        var options = {
            funcs: {
                respond,
                save,
                load,
                update
            },
            commandProvider,
            errorHandler,
            debug
        };
        // var opts = Object.assign({}, defaults, options);
        // options = opts;

        this.version = pJSON.version;

        this.loadCommands = loadCMDs;
        this.commandProvider = options.commandProvider;
        this.money = 0;
        this.increment = 1;
        this.autoIncrement = 1;
        this.isAutoMining = false;
        // this.storage = "selectronTube";
        this.data = 0;
        this.counter = 0;

        this.debug = options.debug;

        this.respondFunc = options.funcs.respond;
        this.saveFunc = options.funcs.save;
        this.loadFunc = options.funcs.load;
        this.updateFunc = options.funcs.update;
        this.resetFunc = options.funcs.reset;
        this.errHandlerFunc = options.funcs.errorHandler;
        // this.loadStorage();
        this.storage = getStorage();
        // this.storage = this.storages["selectronTube"];
        this.loadCommands();
        var customCommands = this.commandProvider();
        Object.assign(this._commands, customCommands);

        for (let cmdName in this._commands) {
            var cmd = this._commands[cmdName];
            if (!('price' in cmd)) {
                cmd.price = 0;
            }
            cmd.unlocked = cmd.price === 0;

            this._commands[cmdName] = cmd;
        }

        // this.command("load");
        this.load();
        this.gameLoopInterval = undefined;
        this.gameLoop();
    }
    
    /**
     * Function to handle responses from the CMD object.
     * @callback CMD~respondCallback
     * @param {...*} txt - Responses
     */
    
    /**
     * Function to handle saving progress.
     * @callback CMD~saveCallback
     * @param {!Object} cmdData - Game progress to be saved.
     * @param {number} cmdData.data - Data collected.
     * @param {number} cmdData.money - Money collected.
     * @param {number} cmdData.increment - Increment value for mineData.
     * @param {number} cmdData.autoIncrement - Increment value for autoMine.
     * @param {string} cmdData.storage - Current storage value.
     * @param {string[]} cmdData.unlocked - Commands bought with buyCommand.
     * @return {?Error} An error if encountered.
     */
    
    /**
     * Function to handle saving progress.
     * @callback CMD~loadCallback
     * @return {Object} Game progress loaded from save.
     */
    
    /**
     * Function to handle updating game values.
     * @callback CMD~updateCallback
     * @param {CMD} cmdObj - CMD object.
     */
      
    /**
     * An object representing a command.
     * @typedef {Object} CMD~Command
     * @property {function} func - Function called when command is run.
     * @property {(string|function)} desc - Description for command.
     * @property {?(string|function)} usage=undefined - How to use the command.
     * @property {?number} price=0 - Price to pay in bytes for command.
     */
     
    /**
     * Function to provide custom commands.
     * @callback CMD~commandProviderCallback
     * @return {CMD~Command} Object of custom commands.
     */
     
    /**
     * Function to handle thrown errors.
     * @callback CMD~errorHandlerCallback
     * @param {Error} err - Error thrown.
     */
    
    /**
     * Start the game loop.
     */
    gameLoop() {
        if (this.gameLoopInterval === undefined) {
            this.gameLoopInterval = setInterval(() => {
                this.counter++;
                if (this.counter % 10 === 0) {
                    // this.command.save(false);
                    // this.command("save");
                    this.save();
                }
                if (this.isAutoMining) {
                    if (this.checkStorage(this.autoIncrement)) {
                        this.addData(this.autoIncrement);
                    } else {
                        this.respond("Please upgrade your storage with upgradeStorage");
                        this.command("autoMine stop");
                    }
                    this.update();
                }
            }, 1000);
        } else {
            console.error('Game loop has already been started.');
        }
    }

    /**
     * Send response to respond function from constructor
     * @param {...*} txt - Strings to be sent to respond function.
     */
    respond(...txt) {
        this.respondFunc(...txt);
    }

    /**
     * Check if storage is full.
     * @param {?number} increment - Increment to check against. If undefined, equal to CMD#increment.
     * @return {boolean} If storage has enough space.
     */
    checkStorage(increment = this.increment) {
        // if (increment === undefined) {
        //     increment = this.increment;
        // }
        // return (this.data <= this.storages[this.storage].capacity);
        // return ((this.data + increment) <= this.storages[this.storage].capacity);
        var check = this.storage.checkStorage(this.data, increment);
        if (this.debug) {
            console.log("Current data:", this.data);
            console.log("Increment:", increment);
            console.log("Check storage:", check);
        }
        return check;
    }

    /**
     * Run command
     * @param {!string} str - Command to be ran.
     */
    command(str) {
        if (str) {
            this.runCommand(str);
            if (this.historyBufferEnabled) {
                if (this.historyBuffer[0] !== str) {
                    this.historyBuffer.unshift(str);
                }
                if (this.historyBuffer.length > 10) {
                    this.historyBuffer.pop();
                }
            }
        }
    }

    runCommand(cmd) {
        if (this.debug) {
            console.log("Command:", cmd);
        }
        if (cmd.indexOf(" ") !== -1 && cmd[cmd.indexOf(" ") + 1] === undefined) {
            this.respond("Command not found.");
            if (this.debug) {
                console.log('Command not found.');
            }
        } else {
            var cmdWArgs = cmd.split(' ');
            if (!(cmdWArgs[0] in this._commands)) {
                this.respond("Command not found.");
            } else {
                // console.log(cmdWArgs);
                if (this._commands[cmdWArgs[0]].unlocked) {
                    this._commands[cmdWArgs[0]].func(...cmdWArgs.slice(1));
                }
            }
        }
    }

    /**
     * Run update function from constructor to update game values
     */
    update() {
        this.updateFunc(this);
    }

    /**
     * Save game progress
     */
    save() {
        var saveObj = {
            data: this.data,
            money: this.money,
            increment: this.increment,
            autoIncrement: this.autoIncrement,
            // storage: this.storage,
            storage: this.storage.name,
            unlocked: []
        };
        for (let cmdName in this._commands) {
            var cmd = this._commands[cmdName];
            if ('price' in cmd && cmd.price !== 0 && cmd.unlocked) {
                saveObj.unlocked.push(cmdName);
            }
        }
        this.saveFunc(saveObj);
    }

    /**
     * Load game progress
     */
    load() {
        var loadData = this.loadFunc();

        var previousSave = true;
        if (!loadData) {
            previousSave = false;
        }
        for (var k in loadData) {
            if (loadData[k] === null) {
                previousSave = false;
                break;
            }
        }
        if (previousSave) {
            if (this.debug) {
                console.log(loadData);
            }
            this.data = loadData.data;
            this.money = loadData.money;
            this.increment = loadData.increment;
            this.autoIncrement = loadData.autoIncrement;
            this.storage.current = loadData.storage;
            for (let cmdName in this._commands) {
                var cmd = this._commands[cmdName];
                if (loadData.unlocked.indexOf(cmdName) === -1 && 'price' in cmd && cmd.price !== 0) {
                    this._commands[cmdName].unlocked = false;
                } else {
                    this._commands[cmdName].unlocked = true;
                }
            }
            // for (var unlockedCMD of loadData.unlocked) {
            //     this._commands[unlockedCMD].unlocked = true;
            // }
            this.respond("Save loaded.");
        } else {
            this.respond("No save found.");
        }
        this.update();
    }

    /**
     * Add data
     * @param {number} amt - Amount to add.
     * @return {boolean} if data was able to be added.
     */
    addData(amt) {
        var hasRoom = false;
        if (this.checkStorage(amt)) {
            this.data += amt;
            hasRoom = true;
        }
        this.update();
        return hasRoom;
    }
    /**
     * Remove data
     * @param {number} amt - Amount to remove.
     * @return {boolean} if data was able to be removed.
     */
    removeData(amt) {
        var hasEnough = false;
        if (this.data >= amt) {
            this.data -= amt;
            hasEnough = true;
        }
        this.update();
        return hasEnough;
    }

    /**
     * Add money
     * @param {number} amt - Amount to add.
     */
    addMoney(amt) {
        this.money += amt;
        this.update();
    }

    /**
     * Remove money
     * @param {number} amt - Amount to remove.
     * @return {boolean} if money was able to be removed.
     */
    removeMoney(amt) {
        var hasEnough = false;
        if (this.money >= amt) {
            this.money -= amt;
            hasEnough = true;
        }
        this.update();
        return hasEnough;
    }

    /**
     * Format bytes into a human-readable format
     * @return {string} CMD#data in human-readable format
     */
    formatBytes() {
        return this.formatter(this.data);
    }

    /**
     * Format number into a human-readable format
     * @param {number} size - Number to be formatted.
     * @return {string} size in human-readable format
     */
    formatter(size) {
        return filesize(size);
    }

    /**
     * Reset game progress
     */
    reset() {
        this.saveFunc({
            data: 0,
            money: 0,
            increment: 1,
            autoIncrement: 1,
            storage: "selectronTube",
            unlocked: []
        });
        this.load();
    }
}


export { CMD };
export default CMD;

// /**
//  * Function to handle responses from the CMD object.
//  * @callback respondCallback
//  * @param {...*} txt - Responses
//  */
// 
// /**
//  * Function to handle saving progress.
//  * @callback CMD~saveCallback
//  * @param {Object} cmdData - Game progress to be saved.
//  * @param {number} cmdData.data - Data collected.
//  * @param {number} cmdData.money - Money collected.
//  * @param {number} cmdData.increment - Increment value for mineData.
//  * @param {number} cmdData.autoIncrement - Increment value for autoMine.
//  * @param {string} cmdData.storage - Current storage value.
//  * @param {string[]} cmdData.unlocked - Commands bought with buyCommand.
//  * @return {Error | null} An error if encountered.
//  */
// 
// /**
//  * Function to handle saving progress.
//  * @callback CMD~loadCallback
//  * @return {Object} Game progress loaded from save.
//  */
// 
// /**
//  * Function to handle updating game values.
//  * @callback CMD~updateCallback
//  * @param {CMD} cmdObj - CMD object.
//  */
// 
// /**
//  * Function to handle thrown errors.
//  * @callback CMD~errorHandlerCallback
//  * @param {Error} err - Error thrown.
//  */
// 
// /**
//  * An object representing a command.
//  * @typedef {Object} Command
//  * @property {function} func - Function called when command is run.
//  * @property {string|function} desc - Description for command.
//  * @property {string|function|undefined} usage=null - How to use the command.
//  * @property {number|undefined} price=0 - Price to pay in bytes for command.
//  */
// 
// /**
//  * Function to provide custom commands.
//  * @callback CMD~commandProviderCallback
//  * @return {Command} Object of custom commands.
//  */

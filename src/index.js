/*eslint no-console: 0*/

import filesize from 'filesize';
import { loadCommands as loadCMDs } from './commands';
import pJSON from '../package.json';

/** Class representing the game object. */
class CMD {

    /**
     * Function to handle responses from the CMD object.
     * @name respond
     * @function
     * @param {...*} txt - Responses
     */

    /**
     * Function to handle saving progress.
     * @name save
     * @function
     * @param {Object} cmdData - Game progress to be saved.
     * @param {Number} cmdData.data - Data collected.
     * @param {Number} cmdData.money - Money collected.
     * @param {Number} cmdData.increment - Increment value for mineData.
     * @param {Number} cmdData.autoIncrement - Increment value for autoMine.
     * @param {String} cmdData.storage - Current storage value.
     * @param {String[]} cmdData.unlocked - Commands bought with buyCommand.
     * @return {Error} An error if encountered.
     */

    /**
     * Function to handle loading progress.
     * @name load
     * @function
     * @return {Object} Game progress loaded from save.
     */

    /**
     * Function to handle updating game values.
     * @name update
     * @function
     * @param {CMD} cmdObj - CMD object.
     */

    // /**
    //  * Function to handle resetting game progress.
    //  * @name reset
    //  * @function
    //  */

    /**
     * Function to handle thrown errors.
     * @name errorHandler
     * @function
     * @param {Error} err - Error thrown.
     */

    /**
     * Function to provide custom commands.
     * @name commandProvider
     * @function
     * @returns {Object} Object of custom commands.

    /**
     * Instantiate the CMD object
     * @constructor
     * @param {Object} opts - Options
     * @param {Boolean} [opts.debug=false] - Debug mode.
     * @param {Object} opts.funcs - Object containing functions to be used by CMD.
     * @param {respond} opts.funcs.respond - Function for responding.
     * @param {save} opts.funcs.save - Function for saving.
     * @param {load} opts.funcs.load - Function for loading.
     * @param {update} opts.funcs.update - Function for updating.
    //  * @param {reset} opts.funcs.reset - Function for resetting.
     * @param {errorHandler} opts.errorHandler - Function for error handling.
     * @param {commandProvider} [commandProvider] - Function to provide custom commands Cannot be ES6 arrow function.
     */
    constructor(opts) {
        var defaults = {
            debug: false,
            funcs: {
                respond: (...txt) => console.log(...txt),
                save: () => console.warn('No save function has been set.'),
                load: () => console.warn('No load function has been set.'),
                update: () => console.warn('No update function has been set.'),
                // reset: () => console.warn('No reset function has been set.'),
                errorHandler: (e) => console.error(e)
            },
            errorHandler: (e) => console.error(e),
            commandProvider: function() {}
        };
        var options = Object.assign({}, defaults, opts);

        this.version = pJSON.version;

        this.loadCommands = loadCMDs;
        this.commandProvider = options.commandProvider;
        this.money = 0;
        this.increment = 1;
        this.autoIncrement = 1;
        this.isAutoMining = false;
        this.storage = "selectronTube";
        this.historyBufferEnabled = true;
        this.historyBuffer = [];
        this.historyBufferCurrentIdx = -1;
        this.historyLastDirection = null;
        this.unit = "byte";
        this.dataShow = 0;
        this.data = 0;
        this.counter = 0;

        this.debug = options.debug;

        this.respondFunc = options.funcs.respond;
        this.saveFunc = options.funcs.save;
        this.loadFunc = options.funcs.load;
        this.updateFunc = options.funcs.update;
        this.resetFunc = options.funcs.reset;
        this.errHandlerFunc = options.funcs.errorHandler;
        this.loadStorage();
        this.loadCommands();
        var customCommands = this.commandProvider();
        Object.assign(this._commands, customCommands);

        // this.command("load");
        this.load();
        this.gameLoopInterval = undefined;
        this.gameLoop();
    }

    gameLoop() {
        this.gameLoopInterval = setInterval(() => {
            this.counter++;
            if (this.counter % 10 === 0) {
                // this.command.save(false);
                // this.command("save");
                this.save();
            }
            if (this.isAutoMining) {
                if (this.checkStorage()) {
                    this.addData(this.autoIncrement);
                } else {
                    this.respond("Please upgrade your storage with upgradeStorage");
                    this.command("autoMine stop");
                }
                this.update();
            }
        }, 1000);

        return this.gameLoopInterval;
    }

    respond(...txt) {
        this.respondFunc(...txt);
    }

    checkStorage() {
        return (this.data <= this.storages[this.storage].capacity);
    }

    command(str = "") {
        if (str !== "") {
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
            console.log('Command not found.');
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

    update() {
        this.updateFunc(this);
    }

    save() {
        var saveObj = {
            data: this.data,
            money: this.money,
            increment: this.increment,
            autoIncrement: this.autoIncrement,
            storage: this.storage,
            unlocked: []
        };
        for (var cmdName in this._commands) {
            var cmd = this._commands[cmdName];
            if ('price' in cmd && cmd.price !== 0 && cmd.unlocked) {
                saveObj.unlocked.push(cmdName);
            }
        }
        this.saveFunc(saveObj);
    }

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
            console.log(loadData);
            this.data = loadData.data;
            this.money = loadData.money;
            this.increment = loadData.increment;
            this.autoIncrement = loadData.autoIncrement;
            for (var unlockedCMD of loadData.unlocked) {
                this._commands[unlockedCMD].unlocked = true;
            }
            this.respond("Save loaded.");
        } else {
            this.respond("No save found.");
        }
        this.update();
    }

    addData(amt) {
        this.data += amt;
        this.update();
    }

    removeData(amt) {
        this.data -= amt;
        this.update();
    }

    addMoney(amt) {
        this.money += amt;
        this.update();
    }

    removeMoney(amt) {
        this.money -= amt;
        this.update();
    }

    formatBytes() {
        return this.formatter(this.data);
    }

    formatter(size) {
        return filesize(size);
    }

    loadStorage() {
        var storages = [
            'selectronTube',
            'floppyDisk',
            'zipDrive',
            'DVD',
            'sdCard',
            'flashDrive',
            'SSD',
            'ssdArray',
            'serverRack',
            'serverRoom',
            'serverWarehouse',
            'multipleLocations',
            'smallAfricanCountry',
            'multipleCountries',
            'alienSpaceArray',
            'enslavedHumans'
        ];

        var storageObj = {};
        for (var i = 0; i < storages.length; i++) {
            storageObj[storages[i]] = {
                capacity: Math.pow(1024, i+1),
                price: Math.pow(1024, i) - 1
            };
        }

        this.storages = storageObj;
    }

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

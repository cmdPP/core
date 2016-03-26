import { Name } from 'charlatan';
import Moniker from 'moniker';

function loadCommands() {
    this._commands = {
        help: {
            func: (subject) => {
                if (subject) {
                    if (!(subject in this._commands)) {
                        this.respond("Command not found or no help is available. Type 'help' with no arguments to see a list of commands.");
                        return;
                    }
                    // let { desc, usage } = this._commands[subject];
                    let cmd = this._commands[subject];
                    let { desc, usage } = cmd;
                    if (!usage) {
                        usage = subject;
                        let usageParams = cmd.func.toString().match(/\(.*?\)/)[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',');
                        if (usageParams.length > 0 && usageParams[0] !== "") {
                            for (let paramName of usageParams) {
                                usage += ` ${paramName}`;
                            }
                        }
                    } else {
                        usage = (typeof usage === "function" ? usage() : usage);
                    }
                    desc = (typeof desc === "function" ? desc() : desc);
                    if (Array.isArray(desc)) {
                        this.respond(`${subject}: ${desc[0]}`, `To use: ${usage}\n\n`, ...desc.slice(1));
                    } else {
                        this.respond(`${subject}: ${desc}`, `To use: ${usage}`);
                    }
                } else {
                    var availableCommands = [];
                    for (var cmdName in this._commands) {
                        var cmd = this._commands[cmdName];
                        if (cmd.unlocked) {
                            availableCommands.push(`\t${cmdName}`);
                        }
                    }
                    var responseList = [
                        "########################################",
                        "List of commands",
                        ""
                    ];
                    responseList.push(...availableCommands);
                    responseList.push(...[
                        '\nFor specific command help type "help [command]"',
                        "########################################"
                    ]);
                    this.respond(...responseList);
                }
            },
            desc: "Gives list of commands or specific instructions for commands.",
            unlocked: true
        },
        mineData: {
            func: () => {
                this.respond("Data mined.");
                this.addData(this.increment);
            },
            desc: "Increments data by your increment amount. The default is 1 byte.",
            unlocked: true
        },
        save: {
            func: () => {
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
                // this.saveFunc(saveObj);
                try {
                    this.saveFunc(saveObj);
                } catch (e) {
                    this.errHandlerFunc(e);
                }
            },
            desc: "Saves progress.",
            unlocked: true
        },
        autoMine: {
            func: (light) => {
                if (light === "start" && this.checkStorage()) {
                    this.isAutoMining = true;
                    this.respond(`Automatic mining beginning at a rate of ${this.autoIncrement} byte per second.`);
                } else if (light === "stop") {
                    this.isAutoMining = false;
                    this.respond("Automatic mining has stopped.");
                } else {
                    this.respond("Unrecognized parameter.");
                    this.command("help autoMine");
                }
            },
            desc: "Every second, increments your data by the auto increment amount. Default is 1 byte per second.",
            usage: "autoMine (start | stop)",
            unlocked: false,
            price: 20
        },
        sellData: {
            func: (amt, unit = "B") => {
                if (amt && !isNaN(amt)) {
                    amt = parseInt(amt);
                    switch (unit) {
                        case "YB":
                            amt *= 1024;
                        case "ZB":
                            amt *= 1024;
                        case "EB":
                            amt *= 1024;
                        case "PB":
                            amt *= 1024;
                        case "TB":
                            amt *= 1024;
                        case "GB":
                            amt *= 1024;
                        case "MB":
                            amt *= 1024;
                        case "KB":
                            amt *= 1024;
                            break;
                        case "B":
                            break;
                        default:
                            this.respond("Unrecognized byte size.");
                    }
                    console.log('Sell Data Unit:', unit);
                    console.log('Sell Data Amount:', amt);
                    // amt = Number(amt);
                    // if (this.data >= amt && this.data >= 100 && typeof amt !== "number") {
                    if (this.data >= amt && amt >= 100) {
                        var loss = Math.floor(Math.random() * 15 + 10);
                        // console.log('Loss:', loss);
                        var transfer = Math.round(amt * (1 - loss / 100));
                        // this.money += transfer;
                        // this.data -= transfer;
                        this.addMoney(transfer);
                        this.removeData(transfer);
                        this.respond(`${loss}% data integrity lost in transfer. Data sold: ${amt}. Money gained: $${transfer}.`);
                    } else {
                        this.respond('You must sell at least 100 data. Please make sure you have 100 data.');
                    }
                } else {
                    this.respond("Argument needed.");
                    this.respond(' ');
                    this._commands.help.func('sellData');
                }
            },
            desc: "Converts data to money. The conversion is 1 byte for $1, but the data deteriorates during transfer.",
            usage: "sellData amount [unit]",
            unlocked: false,
            price: 250
        },
        buyData: {
            func: (amt, unit = "B") => {
                if (amt && !isNaN(amt)) {
                    amt = parseInt(amt);
                    switch (unit) {
                        case "YB":
                            amt *= 1024;
                        case "ZB":
                            amt *= 1024;
                        case "EB":
                            amt *= 1024;
                        case "PB":
                            amt *= 1024;
                        case "TB":
                            amt *= 1024;
                        case "GB":
                            amt *= 1024;
                        case "MB":
                            amt *= 1024;
                        case "KB":
                            amt *= 1024;
                            break;
                        case "B":
                            break;
                        default:
                            this.respond("Unrecognized byte size.");
                    }

                    var cost = amt * 2;
                    // if (this.money >= cost && typeof amt !== "number") {
                    if (this.money >= cost) {
                        // this.money -= cost;
                        // this.data += Number(amt);
                        this.removeMoney(cost);
                        this.addData(Number(amt));
                        this.respond(`${amt} data bought with $${cost}`);
                    } else {
                        this.respond("You do not have enough money.");
                    }
                } else {
                    this.respond("Argument needed. Try: buyData [amount]");
                }
            },
            desc: "Converts money to data. The conversion is 1 byte for $2.",
            usage: "buyData amount [unit]",
            unlocked: false,
            price: 150
        },
        buyCommand: {
            func: (cmdName) => {
                if (cmdName && cmdName in this._commands) {
                    var cmd = this._commands[cmdName];
                    if (this.data >= cmd.price) {
                        if (!cmd.unlocked) {
                            cmd.unlocked = true;
                            this.removeData(cmd.price);
                            this.respond(`Command unlocked: ${cmdName}`);
                        } else {
                            this.respond("Command already unlocked.");
                        }
                    } else {
                        this.respond("You don't have enough data to buy this command.");
                    }
                } else {
                    this.respond("Command not found for purchase.");
                }
            },
            desc: () => {
                var cmdList = [];
                for (var cmdName in this._commands) {
                    var cmd = this._commands[cmdName];
                    if (!cmd.unlocked && cmd.price !== 0) {
                        cmdList.push(`\t${cmdName}: ${cmd.price}`);
                    }
                }
                return [
                    "Purchases and unlocks a command.",
                    "Available commands:",
                    ...cmdList
                ];
            },
            unlocked: true
        },
        load: {
            func: () => {
                var loadData = this.loadFunc();
                // if () {
                //     this.respond("No save found.");
                //     return;
                // }
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
            },
            desc: "Loads previously saved games.",
            unlocked: true
        },
        sampleData: {
            func: () => {
                if (this.data > 0) {
                    var name = Name.firstName();
                    var verb = (Math.random() < 0.5 ? 'likes' : 'dislikes');
                    var sub = Moniker.generator([Moniker.noun]).choose();
                    this.respond(`${name} ${verb} ${sub}`);
                } else {
                    this.respond("You do not have enought data to use this command.");
                }
            },
            desc: "Prints a read-out sampling some collected data.",
            unlocked: true
        },
        upgradeStorage: {
            func: (targetStorage) => {
                if (targetStorage) {
                    if (targetStorage === this.storage) {
                        this.respond("This storage has already been unlocked.");
                        return;
                    }
                    if (targetStorage in this.storages) {
                        var target = this.storages[targetStorage];
                        if (target.capacity < this.storages[this.storage].capacity) {
                            this.respond(`You possess storage with a capacity greater than "${targetStorage}"`);
                        }
                        if (this.money >= target.price) {
                            this.removeMoney(target.price);
                            this.storage = targetStorage;
                            this.respond(`Storage upgraded to: ${targetStorage}`, `New capacity: ${this.formatter(target.capacity)}`);
                        } else {
                            this.respond("You do not have enough money to purchase this upgrade.");
                        }
                    } else {
                        this.respond("Storage does not exist.");
                    }
                } else {
                    this.command("help upgradeStorage");
                }
            },
            // desc: "Upgrades your storage capacity.",
            desc: () => {
                var storList = [];
                for (var storName in this.storages) {
                    var stor = this.storages[storName];
                    if (this.storage === storName) {
                        storName = "* "+storName;
                    }
                    var capacity = this.formatter(stor.capacity);
                    storList.push(...[
                        `\t${storName}`,
                        `\t\tCapacity: ${capacity}`,
                        `\t\tPrice: $${stor.price}`
                    ]);
                }
                return [
                    "Upgrades your storage capacity",
                    "Available storage options:",
                    ...storList
                ];
            },
            unlocked: true
        },
        currentStorage: {
            func: () => {
                var stor = this.storages[this.storage];
                this.respond(...['Your current storage is:', `\tName: ${this.storage}`, `\tCapacity: ${stor.capacity}`]);
            },
            desc: "Responds with your current storage.",
            unlocked: true
        },
        upgradeMine: {
            func: () => {
                var currentCost = Math.floor((this.increment + 1) * 1.5);
                if (this.money >= currentCost) {
                    this.money -= currentCost;
                    this.increment++;
                    this.respond(`mineData upgraded to increment {${this.increment}} for {$${currentCost}}`);
                } else {
                    this.respond(`You require $${currentCost} to purchase this upgrade.`);
                }
            },
            desc: "Upgrades your mining power.",
            unlocked: true
        },
        reset: {
            func: () => {
                this.respond("Resetting all progress.");
                this.reset();
            },
            desc: "Resets all progress.",
            unlocked: true
        }
        // cheat: {
        //     func: () => {
        //         this.addData(10000);
        //     },
        //     desc: "For testing purposes.",
        //     usage: "cheat",
        //     unlocked: true
        // }
    };

    if (Name === undefined || Moniker === undefined) {
        delete this._commands.sampleData;
    }
    if (this.debug) {
        this._commands.cheat = {
            func: () => {
                this.addData(10000);
            },
            desc: "For testing purposes.",
            unlocked: true
        };
    }
}

export { loadCommands };
export default loadCommands;

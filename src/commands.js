import { Name } from 'charlatan';
import Moniker from 'moniker';

function loadCommands() {
    this._commands = {
        help: {
            func: (toHelp) => {
                if (toHelp) {
                    if (!(toHelp in this._commands)) {
                        this.respond("Command not found or no help is available. Type 'help' with no arguments to see a list of commands.");
                        return;
                    }
                    let { desc, usage } = this._commands[toHelp];
                    desc = (typeof desc === "function" ? desc() : desc);
                    usage = (typeof usage === "function" ? usage() : usage);
                    if (Array.isArray(desc)) {
                        // this.respond(`${toHelp}:`, desc[0]);
                        // this.respond("To use:", `${toHelp},`, usage);
                        // this.respond('');
                        this.respond(`${toHelp}: ${desc[0]}`, `To use: ${usage}\n\n`, ...desc.slice(1));
                        // this.respond(`To use: ${usage}\n`);
                        // for (var resp of desc.slice(1)) {
                        //     this.respond(resp);
                        // }
                        // this.respond(...desc.slice(1));
                    } else {
                        // this.respond(`${toHelp}:`, desc);
                        // this.respond("To use:", `${toHelp},`, usage);
                        this.respond(`${toHelp}: ${desc}`, `To use: ${usage}`);
                        // this.respond(`To use: ${usage}`);
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
                        "########################################",
                    ]);
                    this.respond(...responseList);
                }
            },
            desc: "Gives list of commands or specific instructions for commands.",
            usage: "help [command]",
            unlocked: true,
            price: 0
        },
        mineData: {
            func: () => {
                this.respond("Data mined.");
                this.addData(this.increment);
            },
            desc: "Increments data by your increment amount. The default is 1 byte.",
            usage: "mineData",
            unlocked: true,
            price: 0
        },
        save: {
            func: () => {
                // this.saveFunc(this);
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
                    if (cmd.price !== 0 && cmd.unlocked) {
                        saveObj.unlocked.push(cmdName);
                    }
                }
                this.saveFunc(saveObj);
            },
            desc: "Saves progress.",
            usage: "save",
            unlocked: true,
            price: 0
        },
        autoMine: {
            func: (light) => {
                if (light === "start" && !this.checkStorage()) {
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
            usage: "autoMine [start|stop]",
            unlocked: false,
            price: 20
        },
        sellData: {
            func: (amt) => {
                if (amt) {
                    // amt = Number(amt);
                    if (this.data >= amt && this.data >= 100 && typeof amt !== "number") {
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
            usage: "sellData [amount]",
            unlocked: false,
            price: 250
        },
        buyData: {
            func: (amt) => {
                if (amt) {
                    var cost = amt * 2;
                    if (this.money >= cost && typeof amt !== "number") {
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
            usage: "buyData [amount]",
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
                // this.respond("Purchases and unlocks a command.");
                // this.respond("Available commands:\n\t", cmdList.join("\n\t"));
                return [
                    "Purchases and unlocks a command.",
                    "Available commands:",
                    ...cmdList
                ];
            },
            usage: "buyCommand [command]",
            unlocked: true,
            price: 0
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
            usage: "load",
            unlocked: true,
            price: 0
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
            usage: "sampleData",
            unlocked: true,
            price: 0
        },
        upgradeStorage: {
            func: (tStorName) => {
                if (tStorName) {
                    if (tStorName === this.storage) {
                        this.respond("This storage has already been unlocked.");
                        return;
                    }
                    if (tStorName in this.storages) {
                        var target = this.storages[tStorName];
                        if (target.capacity < this.storages[this.storage].capacity) {
                            this.respond(`You possess storage with a capacity greater than "${tStorName}"`);
                        }
                        if (this.money >= target.price) {
                            this.removeMoney(target.price);
                            this.storage = tStorName;
                            this.respond(`Storage upgraded to: ${tStorName}`, `New capacity: ${this.formatter(target.capacity)}`);
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
            desc: "Upgrades your storage capacity.",
            usage: "upgradeStorage [storage]",
            unlocked: true,
            price: 0
        },
        currentStorage: {
            func: () => {
                var stor = this.storages[this.storage];
                this.respond(...['Your current storage is:', `\tName: ${this.storage}`, `\tCapacity: ${stor.capacity}`]);
            },
            desc: "Responds with your current storage.",
            usage: "currentStorage",
            unlocked: true,
            price: 0
        },
        upgradeMine: {
            func: () => {
                var currentCost = Math.floor((this.increment + 1) * 1.5);
                if (this.money >= currentCost) {
                    this.money -= currentCost;
                    this.increment++;
                    this.respond(`mineData upgraded to increment {${this.increment}} for {$${currentCost}}`);
                } else {
                    this.respond("You do not have enough money to purchase this upgrade.");
                }
            },
            desc: "Upgrades your mining power.",
            usage: "upgradeMine",
            unlocked: true,
            price: 0
        }
        // cheat: {
        //     func: () => {
        //         this.addData(10000);
        //     },
        //     desc: "For testing purposes.",
        //     usage: "cheat",
        //     unlocked: true,
        //     price: 0
        // }
    };

    if (Name === undefined || Moniker === undefined) {
        delete this._commands.sampleData;
    }
}

export { loadCommands };
export default loadCommands;

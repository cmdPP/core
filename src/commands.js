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
                    this.respond(`${toHelp}:`, desc);
                    this.respond("To use:", `${toHelp},`, usage);
                } else {
                    var availableCommands = [];
                    for (var cmdName in this._commands) {
                        var cmd = this._commands[cmdName];
                        if (cmd.unlocked) {
                            availableCommands.push(cmdName);
                        }
                    }
                    // var cmdList = availableCommands.join("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
                    var cmdList = availableCommands.join("\n\t");
                    this.respond("########################################");
                    this.respond('List of commands:');
                    this.respond(cmdList);
                    this.respond(" ");
                    this.respond("For specific command help type 'help [command]'");
                    this.respond("########################################");
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
            func: () => {
                this.autoIncrement = 1;
                this.respond(`Automatic mining beginning at a rate of ${this.autoIncrement} byte per second.`);
            },
            desc: "Every second, increments your data by the auto increment amount. Default is 1 byte per second.",
            usage: "autoMine",
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
                        cmdList.push(`${cmdName}: ${cmd.price}`);
                    }
                }
                this.respond("Purchases and unlocks a command.");
                this.respond("Available commands:\n\t", cmdList.join("\n\t"));
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
                for (var k in loadData) {
                    if (loadData[k] === null) {
                        previousSave = false;
                        break;
                    }
                }
                console.log(previousSave);
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
            },
            desc: "Loads previously saved games.",
            usage: "load",
            unlocked: true,
            price: 0
        },
        cheat: {
            func: () => {
                this.addData(10000);
            },
            desc: "For testing purposes.",
            usage: "cheat",
            unlocked: true,
            price: 0
        }
    };
}

export { loadCommands };
export default loadCommands;

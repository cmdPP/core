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
                    let { desc, usage, aliases } = cmd;
                    
                    // Removed until further notice due to minification problems with reflection.
                    
                    // if (!usage) {
                    //     usage = subject;
                    //     let usageParams = cmd.func.toString().match(/\(.*?\)/)[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',');
                    //     if (usageParams.length > 0 && usageParams[0] !== "") {
                    //         for (let paramName of usageParams) {
                    //             usage += ` ${paramName}`;
                    //         }
                    //     }
                    // } else {
                    //     usage = (typeof usage === "function" ? usage() : usage);
                    // }
                    usage = (typeof usage === "function" ? usage() : usage);
                    
                    var response;
                    desc = (typeof desc === "function" ? desc() : desc);
                    if (Array.isArray(desc)) {
                        // this.respond(`${subject}: ${desc[0]}`, `To use: ${usage}\n\n`, ...desc.slice(1));
                        response = [`${subject}: ${desc[0]}`, `To use: ${usage}\n\n`, ...desc.slice(1)];
                    } else {
                        // this.respond(`${subject}: ${desc}`, `To use: ${usage}`);
                        response = [`${subject}: ${desc}`, `To use: ${usage}`];
                    }
                    // console.log('Aliases:', aliases);
                    if (aliases.length > 0) {
                        response.splice(1, 0, `Aliases: ${aliases.join(' ')}`);
                    }
                    
                    this.respond(...response);
                } else {
                    var availableCommands = [];
                    for (var cmdName in this._commands) {
                        var cmd = this._commands[cmdName];
                        if (cmd.unlocked) {
                            availableCommands.push(`\t${cmdName}`);
                        }
                    }
                    var responseList = [
                        // "########################################",
                        "List of commands",
                        ""
                    ];
                    responseList.push(...availableCommands);
                    responseList.push(...[
                        '\nFor specific command help type "help [command]"'
                        // "########################################"
                    ]);
                    this.respond(...responseList);
                }
            },
            desc: "Gives list of commands or specific instructions for commands.",
            usage: "help {subject}",
            aliases: ['?']
        },
        mineData: {
            func: () => {
                if (this.checkStorage()) {
                    this.respond("Data mined.");
                    this.addData(this.increment);
                } else {
                    this.respond("Your storage is full. Please upgrade storage to continue.");
                }
            },
            desc: "Increments data by your increment amount. The default is 1 byte.",
            usage: "mineData"
        },
        save: {
            func: () => {
                this.save();
            },
            desc: "Saves progress.",
            usage: "save"
            // unlocked: true
        },
        autoMine: {
            func: (light) => {
                if (light === "start") {
                    if (this.checkStorage()) {
                        this.isAutoMining = true;
                        this.respond(`Automatic mining beginning at a rate of ${this.autoIncrement} byte per second.`);
                    } else {
                        this.respond("Your storage is full. Please upgrade storage to continue.")
                    }
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
                    if (this.debug) {
                        console.log('Sell Data Unit:', unit);
                        console.log('Sell Data Amount:', amt);
                    }
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
            usage: "sellData {amount} [unit]",
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
            usage: "buyData {amount} [unit]",
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
            usage: "buyCommand {command}",
            aliases: ['apt-get']
        },
        load: {
            func: () => {
                this.load();
            },
            desc: "Loads previously saved games.",
            usage: "load"
        },
        // sampleData: {
        //     func: () => {
        //         if (this.data > 0) {
        //             var name = Name.firstName();
        //             var verb = (Math.random() < 0.5 ? 'likes' : 'dislikes');
        //             var sub = Moniker.generator([Moniker.noun]).choose();
        //             this.respond(`${name} ${verb} ${sub}`);
        //         } else {
        //             this.respond("You do not have enought data to use this command.");
        //         }
        //     },
        //     desc: "Prints a read-out sampling some collected data."
        // },
        // upgradeStorage: {
        //     func: (targetStorage) => {
        //         if (targetStorage) {
        //             if (targetStorage === this.storage) {
        //                 this.respond("This storage has already been unlocked.");
        //                 return;
        //             }
        //             if (targetStorage in this.storages) {
        //                 var target = this.storages[targetStorage];
        //                 if (target.capacity < this.storages[this.storage].capacity) {
        //                     this.respond(`You possess storage with a capacity greater than "${targetStorage}"`);
        //                 }
        //                 if (this.money >= target.price) {
        //                     this.removeMoney(target.price);
        //                     this.storage = targetStorage;
        //                     this.respond(`Storage upgraded to: ${targetStorage}`, `New capacity: ${this.formatter(target.capacity)}`);
        //                 } else {
        //                     this.respond("You do not have enough money to purchase this upgrade.");
        //                 }
        //             } else {
        //                 this.respond("Storage does not exist.");
        //             }
        //         } else {
        //             this.command("help upgradeStorage");
        //         }
        //     },
        //     // desc: "Upgrades your storage capacity.",
        //     desc: () => {
        //         var storList = [];
        //         for (var storName in this.storages) {
        //             var stor = this.storages[storName];
        //             if (this.storage === storName) {
        //                 storName = "* "+storName;
        //             }
        //             var capacity = this.formatter(stor.capacity);
        //             storList.push(...[
        //                 `\t${storName}`,
        //                 `\t\tCapacity: ${capacity}`,
        //                 `\t\tPrice: $${stor.price}`
        //             ]);
        //         }
        //         return [
        //             "Upgrades your storage capacity",
        //             "Available storage options:",
        //             ...storList
        //         ];
        //     }
        // },
        currentStorage: {
            func: () => {
                // var stor = this.storages[this.storage];
                this.respond(...['Your current storage is:', `\tName: ${this.storage.name}`, `\tCapacity: ${this.storage.capacity}`]);
            },
            desc: "Responds with your current storage.",
            usage: "currentStorage"
            // unlocked: true
        },
        // upgradeMine: {
        //     func: () => {
        //         var currentCost = Math.floor((this.increment + 1) * 1.5);
        //         if (this.money >= currentCost) {
        //             this.money -= currentCost;
        //             this.increment++;
        //             this.respond(`mineData upgraded to increment {${this.increment}} for {$${currentCost}}`);
        //         } else {
        //             this.respond(`You require $${currentCost} to purchase this upgrade.`);
        //         }
        //     },
        //     desc: "Upgrades your mining power."
        // },
        reset: {
            func: () => {
                this.respond("Resetting all progress.");
                this.reset();
            },
            desc: "Resets all progress.",
            usage: "reset"
            // unlocked: true
        },
        version: {
            func: () => {
                this.respond(`v${this.version}`);
            },
            desc: "Displays the current version.",
            usage: "version"
        },
        upgrade: {
            func: (command = "") => {
                if (command === "mineData") {
                    var currentCost = Math.floor((this.increment + 1) * 1.5);
                    if (this.removeMoney(currentCost)) {
                        // this.money -= currentCost;
                        this.increment++;
                        this.respond(`mineData upgraded to increment {${this.increment}} for {$${currentCost}}.`);
                    } else {
                        this.respond(`You require $${currentCost} to purchase this upgrade.`);
                    }
                } else if (command === "storage") {
                    // var targetStorage = this.storageArr[this.storageArr.indexOf(this.storage) + 1];
                    // var currentStor = this.storageArr.indexOf(this.storage);
                    var target = this.storage.upgrade;
                    if (!target) {
                        this.respond("You already have the largest storage capacity.");
                        return;
                    }
                    // var targetStorage = this.storageArr[currentStor + 1];
                    // var target = this.storages[targetStorage];
                    if (this.removeMoney(target.price)) {
                        // this.storage = targetStorage;
                        this.storage.current = target;
                        // this.respond(`Storage upgraded to: ${targetStorage}`, `New capacity: ${this.formatter(target.capacity)}`);
                        this.respond(`Storage upgraded to {${target.name}} for {$${target.price}}`,
                            `New capacity: {${this.formatter(target.capacity)}}`);
                    } else {
                        this.respond(`You require $${target.price} to purhcase this upgrade.`)
                    }
                } else {
                    this.respond(`Command "${command}" either does not exist or cannot be upgraded.`);
                }
            },
            desc: () => {
                var response = [];
                var incrementValue = this.increment + 1;
                var incrementCost = Math.floor(incrementValue * 1.5);
                
                response.push(...[
                    "mineData:",
                    `\tCurrent value: {${this.increment}}`,
                    "\tNext upgrade:",
                    `\t\tValue: {${incrementValue}}`,
                    `\t\tPrice: {${incrementCost}}`
                ]);
                
                // var currentStor = this.storageArr.indexOf(this.storage);
                var target = this.storage.upgrade;
                if (target) {
                    // var targetStorage = this.storageArr[currentStor + 1];
                    // var target = this.storages[targetStorage];
                    response.push(...[
                        "storage:",
                        `\tCurrent name: {${this.storage.name}}`,
                        `\tCurrent capacity: {${this.formatter(this.storage.capacity)}}`,
                        "\tNext upgrade:",
                        `\t\tName: {${target.name}}`,
                        `\t\tCapacity: {${this.formatter(target.capacity)}}`,
                        `\t\tPrice: {$${target.price}}`
                    ]);
                }
                
                // return response;
                var newResponse = [];
                for (var res of response) {
                    newResponse.push(`\t${res}`);
                }
                return [
                    "Purchases upgrades for certain commands.",
                    "Available upgrades:",
                    ...newResponse
                ];
            },
            usage: "upgrade {thing}"
        },
        alias: {
            func: (action, name, command) => {
                // if (!name || !command) {
                //     this.respond("Insufficient parameters.");
                //     return;
                // }
                // if (!(command in this._commands)) {
                //     this.respond("Command not found for aliasing.");
                // }
                // 
                // this.playerAliases[name] = command;
                // this.aliases[name] = command;
                // this.respond(`Alias created: ${name} -> ${command}`);
                if (!action || !name) {
                    this.respond("Insufficient parameters.");
                } else if (action === "add" && !command) {
                    this.respond("Insufficient parameters.");
                } else if (action !== "add" || action !== "remove") {
                    this.respond("Unrecognized action.");
                }
                
                if (action === "add") {
                    this.playerAliases[name] = command;
                    this.aliases[name] = command;
                } else if (action === "remove") {
                    if (name in this.playerAliases) {
                        delete this.playerAliases[name];
                        delete this.aliases[name];
                    } else {
                        this.respond("Player alias does not exist.");
                    }
                }
            },
            desc: () => {
                var aliases = [];
                for (let aliasName in this.playerAliases) {
                    var alias = this.playerAliases[aliasName];
                    aliases.push(`\t${aliasName} -> ${alias}`);
                }
                return [
                    "Creates aliases for commonly used commands.",
                    "Current player aliases:",
                    ...aliases
                ];
            },
            usage: "alias (add | remove) {name} {command}"
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

    // if (Name === undefined || Moniker === undefined) {
    //     delete this._commands.sampleData;
    // }
    if (this.debug) {
        this._commands.cheat = {
            func: () => {
                this.addData(10000);
            },
            desc: "For testing purposes."
        };
    }
}

export { loadCommands };
export default loadCommands;

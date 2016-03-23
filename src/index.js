import { loadCommands as loadCMDs } from './commands';

class CMD {
    constructor(options = {
        respond: (text) => console.warn('No respond function has been set.'),
        // storage: (cmdObj) => console.warn('No storage function has been set.'),
        save: (cmdObj) => console.warn('No save function has been set.'),
        load: (cmdObj) => console.warn('No load function has been set.'),
        update: (cmdObj) => console.warn('No update function has been set.')
    }) {
        this.loadCommands = loadCMDs;
        this.money = 0;
        this.increment = 1;
        this.autoIncrement = 0;
        this.historyBufferEnabled = true;
        this.historyBuffer = [];
        this.historyBufferCurrentIdx = -1;
        this.historyLastDirection = null;
        this.unit = "byte";
        this.dataShow = 0;
        this.data = 0;
        this.counter = 0;

        this.respondFunc = options.respond;
        this.saveFunc = options.save;
        this.loadFunc = options.load;
        this.updateFunc = options.update;
        this.loadCommands();
    }

    gameLoop() {
        return setInterval(() => {
            this.counter++;
            if (this.counter % 10 === 0) {
                this.command.save(false);
            }
        }, 1000);
    }

    command(str = "") {
        if (cmd !== "") {
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
        // if (cmd.indexOf(" ") !== -1 && cmd[cmd.indexOf(" ") + 1] === undefined) {
        //     this.respond("Command not found.");
        //     console.log('Command not found.');
        // } else {
        //     var cmdWArgs = cmd.split(" ");
        //     if (this.commandList.indexOf(cmdWArgs[0]) === -1) {
        //         this.respond("Command not found.");
        //     } else {
        //         console.log(cmdWArgs);
        //         var cmdIndex = this.commandList.indexOf(cmdWArgs[0]);
        //         if (this.commandUnlocked[cmdIndex]) {
        //             this.commands(...cmdWArgs);
        //         } else {
        //             this.respond("Command locked. Use buyCommand to unlock new commands.");
        //         }
        //     }
        // }
        if (cmd.indexOf(" ") !== -1 && cmd[cmd.indexOf(" ") + 1] === undefined) {
            this.respond("Command not found.");
            console.log('Command not found.');
        } else {
            var cmdWArgs = cmd.split(' ');
            if (cmdWArgs[0] in this._commands) {
                this.respond("Command not found.");
            } else {
                console.log(cmdWArgs);
                if (this._commands[cmdWArgs[0]].unlocked) {
                    this._commands[cmdWArgs[0]].func(cmdWArgs);
                }
            }
        }
    }

    update() {
        this.updateFunc(this);
    }

    addData(amt) {
        this.data += amt;
        this.update();
    }

    addMoney(amt) {
        this.money += amt;
        this.update();
    }
}

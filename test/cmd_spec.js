import { expect } from 'chai';
import { CMD } from '../src';
import pJSON from '../package.json';
import jsonfile from 'jsonfile';

// var cmd = new CMD({
//     respond: (...txt) => {},
//     save: (cmdData) => {
//         jsonfile.writeFileSync('test_save.json', cmdData, { spaces: 2 });
//     },
//     load: () => {
//         // console.log(this);
//         // console.log(cmdObj);
//         return jsonfile.readFileSync('test_save.json');
//     },
//     update: (cmdObj) => {}
// });
var responses = [];
var cmd = new CMD({
    debug: false,
    funcs: {
        respond: (...txt) => {responses.push(...txt)},
        save: (cmdData) => jsonfile.writeFileSync('test_save.json', cmdData, { spaces: 2 }),
        load: () => jsonfile.readFileSync('test_save.json'),
        update: () => {},
        // reset: () => {
        //     var cmdData = {
        //         data: 0,
        //         money: 0,
        //         increment: 1,
        //         autoIncrement: 1,
        //         storage: "selectronTube",
        //         unlocked: []
        //     };
        //     jsonfile.writeFileSync('test_save.json', cmdData, { spaces: 2 });
        // }
    },
    commandProvider: function() {
        return {
            cmdOne: {
                func: (arg) => {
                    this.addMoney(999);
                },
                desc: "tests commandProvider",
                unlocked: true
            }
        }
    }
})

describe('CMD', () => {
    it('returns the correct version', () => {
        expect(cmd.version).to.equal(pJSON.version);
    });

    it('resets a save', () => {
        cmd.data = 100;
        cmd._commands.sellData.unlocked = true;
        expect(cmd.data).to.equal(100);
        expect(cmd._commands.sellData.unlocked).to.equal(true);
        cmd.reset();
        expect(cmd.data).to.equal(0);
        expect(cmd._commands.sellData.unlocked).to.equal(false);
    });

    it('loads a save', () => {
        expect(cmd.data).to.equal(0);
    });

    it('adds data', () => {
        var currentData = cmd.data;
        cmd.addData(5);
        expect(cmd.data).to.equal(currentData + 5);
    });

    it('mines data', () => {
        var currentData = cmd.data;
        cmd.command('mineData');
        expect(cmd.data).to.equal(currentData + 1);
    });

    it('adds money', () => {
        var currentMoney = cmd.money;
        cmd.addMoney(10);
        expect(cmd.money).to.equal(currentMoney + 10);
    });

    it('unlocks commands', () => {
        var sellUnlocked = cmd._commands.sellData.unlocked;
        var buyUnlocked = cmd._commands.buyData.unlocked;
        cmd.addData(400);
        cmd.command("buyCommand sellData");
        cmd.command("buyCommand buyData");
        expect(sellUnlocked).to.equal(false);
        expect(buyUnlocked).to.equal(false);
        expect(cmd._commands.sellData.unlocked).to.equal(true);
        expect(cmd._commands.buyData.unlocked).to.equal(true);
    });

    it('converts data to money', () => {
        cmd.addData(100);
        var currentData = cmd.data;
        var currentMoney = cmd.money;
        cmd.command("sellData 100");
        expect(cmd.data).to.be.below(currentData);
        expect(cmd.money).to.be.above(currentMoney);
    });

    it('converts money to data', () => {
        var currentData = cmd.data;
        var currentMoney = cmd.money;
        cmd.command("buyData 5");
        expect(cmd.data).to.above(currentData);
        expect(cmd.money).to.below(currentMoney);
        cmd.money = 10000;
    });

    it('outputs human readable bytes', () => {
        cmd.data = 10000;
        expect(cmd.formatBytes()).to.equal("9.77 KB");
    });

    it('checks storage', () => {
        cmd.data = 1025;
        cmd.command("mineData");
        expect(cmd.data).to.equal(1025);
    });

    it('upgrades increment', () => {
        expect(cmd.increment).to.not.equal(2);
        cmd.command("upgrade mineData");
        expect(cmd.increment).to.equal(2);
    });

    it('upgrades storage', () => {
        expect(cmd.storage.name).to.equal('selectronTube');
        // cmd.command('upgradeStorage floppyDisk');
        cmd.command('upgrade storage');
        expect(cmd.storage.name).to.equal('floppyDisk');
    });

    it('saves', () => {
        expect(cmd.data).to.not.equal(5);
        expect(cmd.money).to.not.equal(0);
        expect(cmd.increment).to.not.equal(1);
        // expect(cmd.autoIncrement).to.not.equal(1);
        expect(cmd.storage.name).to.not.equal('selectronTube');
        expect(cmd.unlocked).to.not.eql([]);

        cmd.data = 5;
        cmd.money = 0;
        cmd.increment = 1;
        cmd.autoIncrement = 1;
        cmd.storage.current = "selectronTube";
        for (var cmdName in cmd._commands) {
            if (cmd._commands[cmdName].price !== 0) {
                cmd._commands[cmdName].unlocked = false;
            }
        }

        // cmd.command("save");
        // cmd.command("load");
        cmd.save();
        cmd.load();

        expect(cmd.data).to.equal(5);
        expect(cmd.money).to.equal(0);
        expect(cmd.increment).to.equal(1);
        expect(cmd.autoIncrement).to.equal(1);
        expect(cmd.storage.name).to.equal('selectronTube');
        for (cmdName in cmd._commands) {
            if ('price' in cmd._commands[cmdName] && cmd._commands[cmdName].price !== 0) {
                expect(cmd._commands[cmdName].unlocked).to.equal(false);
            }
        }
    });
});

// if (cmd.debug) {
//     console.log(JSON.stringify(responses, null, 2));
// }

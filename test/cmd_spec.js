import { expect } from 'chai';
import { CMD } from '../src';
import jsonfile from 'jsonfile';

var cmd = new CMD({
    respond: (...txt) => {},
    save: (cmdObj) => {
        // console.log(this);
        // console.log(cmdObj);

        var saveObj = {
            data: cmdObj.data,
            money: cmdObj.money,
            increment: cmdObj.increment,
            autoIncrement: cmdObj.autoIncrement,
            unlocked: [],
        };
        for (var cmdName in cmdObj._commands) {
            // console.log(`${cmdName}:`, cmdObj._commands[cmdName].unlocked);
            var cmd = cmdObj._commands[cmdName];
            if (cmd.price !== 0 && cmd.unlocked) {
                saveObj.unlocked.push(cmdName);
            }
        }

        jsonfile.writeFileSync('test_save.json', saveObj, { spaces: 2 });
    },
    load: (cmdObj) => {
        // console.log(this);
        // console.log(cmdObj);
        return jsonfile.readFileSync('test_save.json');
    },
    update: (cmdObj) => {}
});

describe('CMD', () => {
    it('loads a save', () => {
        expect(cmd.data).to.equal(5);
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
    });

    it('saves', () => {
        expect(cmd.data).to.not.equal(5);
        expect(cmd.money).to.not.equal(0);
        // expect(cmd.increment).to.not.equal(1);
        // expect(cmd.autoIncrement).to.not.equal(0);
        expect(cmd.unlocked).to.not.eql([]);

        cmd.data = 5;
        cmd.money = 0;
        cmd.increment = 1;
        cmd.autoIncrement = 0;
        for (var cmdName in cmd._commands) {
            if (cmd._commands[cmdName].price !== 0) {
                cmd._commands[cmdName].unlocked = false;
            }
        }

        cmd.command("save");
        cmd.command("load");

        expect(cmd.data).to.equal(5);
        expect(cmd.money).to.equal(0);
        expect(cmd.increment).to.equal(1);
        expect(cmd.autoIncrement).to.equal(0);
        for (cmdName in cmd._commands) {
            if (cmd._commands[cmdName].price !== 0) {
                expect(cmd._commands[cmdName].unlocked).to.equal(false);
            }
        }
    });
});

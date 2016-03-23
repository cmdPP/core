import $ from 'jquery';
import { CMD } from './cmd';

$(function() {
    var cmd = new CMD({
        respond: function() {
            for (var i = 0; i < arguments.length; i++) {
                $('#responses').append('<tr class="response"><td class="response">'+arguments[i]+'</td></tr>');
            }
        },
        save: function(cmdData) {
            if (typeof Storage !== "undefined") {
                for (var i in cmdData) {
                    localStorage.setItem(i, JSON.stringify(cmdData[i]));
                }
            }
        },
        load: function() {
            var storedDataNames = ['data', 'money', 'increment', 'autoIncrement', 'unlocked'];
            var loadObj = {};
            for (var i = 0; i < storedDataNames.length; i++) {
                var dataName = storedDataNames[i];
                loadObj[dataName] = JSON.parse(localStorage.getItem(dataName));
            }
            return loadObj;
        },
        update: function(cmdObj) {
            $('#dataCount').html(cmdObj.formatBytes());
            $('#moneyCount').html('$'+cmdObj.money);
        }
    });
    $(document).keypress(function(e) {
        if (e.which == 13) {
            cmd.command($('#input').val());
            cmd.historyBufferCurrentIdx = -1;
            $('#cmdWindow').scrollTop($('#cmdWindow')[0].scrollHeight);
            $('#input').val('');
        }
    });

    $('#input').keyup(function(e) {
        if (e.which === 38 || e.which === 40) {
            cmd.respond("Arrow key functionality has not yet been implemented.");
            console.log("Arrow key functionality has not yet been implemented.");
        }
    });
});

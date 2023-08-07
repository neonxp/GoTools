const vscode = require('vscode');
const { dirname } = require('path');
const cp = require('child_process');
const { provideInterfaces } = require('./interfaces-provider');
const debounce = require('lodash.debounce');

function selectReceiver() {
    const receiverInput = vscode.window.createInputBox();
    const pattern = /^([a-zA-Z_][a-zA-Z0-9_]*)\s+(\*?(?:[a-zA-Z_][a-zA-Z0-9]*\.)?[a-zA-Z_][a-zA-Z0-9_]*)$/;
    receiverInput.placeholder = "Enter receiver (ex: 'm *MyType')";

    receiverInput.onDidChangeValue(value => {
        if (value != "" && !value.match(pattern)) {
            receiverInput.validationMessage = `Valid format: "f *File", "m MyType", "c CustomType"`;
        } else {
            receiverInput.validationMessage = '';
        }
    });

    receiverInput.onDidAccept(() => {
        const receiver = receiverInput.value;
        const matches = receiver.match(pattern);
        if (!matches) {
            vscode.window.showWarningMessage(`Receiver is not in the correct format. Valid: "f *File", "m MyType", "c CustomType"`);
            return undefined;
        }
        selectInterface({ name: matches[1], type_: matches[2] });
        receiverInput.hide();
    });

    receiverInput.onDidHide(() => {
        receiverInput.dispose();
    });
    receiverInput.show();
}

/**
 * 
 * @param {*} receiver 
 */
function selectInterface(receiver) {
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = "Which interface would you like to implement?";
    const debounced = debounce((value) => {
        provideInterfaces(value, (interfaces) => {
            quickPick.items = interfaces;
        });
    }, 400, { trailing: true });

    quickPick.onDidChangeValue(value => {
        debounced(value);
    });

    quickPick.onDidChangeSelection(selection => {
        if (selection[0]) {
            implement(selection[0].detail + '.' + selection[0].label, receiver);
        }
        quickPick.hide();
    });

    quickPick.onDidHide(() => {
        quickPick.dispose();
    });
    quickPick.show();
}

function implement(interface_, receiver) {
    const editor = vscode.window.activeTextEditor;
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating stub methods..."
    }, () => {
        return new Promise((resolve) => {
            const r = `${receiver.name} ${receiver.type_}`
            cp.exec(`impl "${r}" ${interface_}`,
                { cwd: dirname(editor.document.fileName) },
                (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showInformationMessage(stderr);
                        return resolve(true);
                    }

                    const position = editor.selection.active;
                    editor.insertSnippet(new vscode.SnippetString("\n" + stdout), position.with(position.line + 1, 0));
                    resolve(true);
                });
        });
    });
}

module.exports = selectReceiver;
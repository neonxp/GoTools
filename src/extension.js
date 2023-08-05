// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fnRegex = /^(\t*)(.*)err\s?:?=.+?$/;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let wrapErrorCommand = vscode.commands.registerCommand('gotools.wrap-error', wrapError);
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			'go',
			new ErrorsWrapper(),
			{
				providedCodeActionKinds: [
					vscode.CodeActionKind.RefactorRewrite
				]
			}
		)
	);
	context.subscriptions.push(wrapErrorCommand);
}

// This method is called when your extension is deactivated
function deactivate() { }

class ErrorsWrapper {

	provideCodeActions(document, range) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return undefined;
		}

		const line = document.lineAt(editor.selection.start.line);
		if (!fnRegex.test(line.text)) {
			vscode.commands.executeCommand('setContext', 'allowWrapIferr', false);
			return undefined;
		}
		vscode.commands.executeCommand('setContext', 'allowWrapIferr', true);
		const action = new vscode.CodeAction('Add error checking', vscode.CodeActionKind.RefactorRewrite);
		action.command = { command: 'gotools.wrap-error', title: 'Add error checking block', tooltip: '' };
		return [
			action,
		];
	}
}

module.exports = {
	activate,
	deactivate
}

const wrapError = () => {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	const document = editor.document;

	const line = document.lineAt(editor.selection.start.line);
	const matches = line.text.match(fnRegex);
	if (matches === null || matches.length === 0) {
		return;
	}
	const extravars = matches[2].split(',').map(x => x.trim()).filter(x => x);
	if (extravars.filter(x => x !== "_").length > 0) {
		editor.insertSnippet(
			new vscode.SnippetString(`\nif err != nil {\n\treturn \${1:nil, }\${2:err}\n}\n`),
			new vscode.Position(line.range.end.line, line.range.end.character + line.firstNonWhitespaceCharacterIndex),
		);
	} else {
		const tabs = matches[1];
		const original = matches[0].trimStart()
		editor.insertSnippet(
			new vscode.SnippetString(`${tabs}if ${original}; err != nil {\n${tabs}\treturn \${2:nil, }\${3:err}\n${tabs}}\n`),
			line.range,
			{
				undoStopBefore: true,
				undoStopAfter: true
			}
		);
	}
};

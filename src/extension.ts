// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider('go', new ErrorsWrapper(), {
		providedCodeActionKinds: ErrorsWrapper.providedCodeActionKinds
	}));
	context.subscriptions.push(
		vscode.commands.registerCommand('gotools.wrap-error', () => {
			const editor = vscode.window.activeTextEditor;

			if (editor) {
				const document = editor.document;
				const selection = editor.selection;
				const line = document.lineAt(editor.selection.start.line)
				const idx = line.firstNonWhitespaceCharacterIndex
				const word = document.getText(selection);
				const space = "\t".repeat(idx)
				let errPrefix = ""
				if (word.indexOf("=") == -1) {
					errPrefix = "err :="
				}
				editor.edit(editBuilder => {
					editBuilder.replace(selection, `if ${errPrefix}${word}; err != nil {\n${space}\rreturn err\n${space}}`);
				});
			}
		})
	);

}

// this method is called when your extension is deactivated
export function deactivate() { }

export class ErrorsWrapper implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.RefactorRewrite
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
		const action = new vscode.CodeAction('Wrap error', vscode.CodeActionKind.RefactorRewrite);
		action.command = { command: 'gotools.wrap-error', title: 'Wrap with error block', tooltip: '' };
		return [
			action
		]
	}
}


const vscode = require('vscode');
const process = require('child_process');
const stderr = require('./lib/stdout_vaild');
const fs = require('fs');

const extPath = vscode.extensions.getExtension('gfc.demo').extensionPath+'\\.vscode';
const drive = extPath.slice(0,2)

const batPath = `${drive} && cd ${extPath} && deploy.bat`;
let inputBoxTitle = '',
		inputBoxPlaceHolder = '',
		inputBoxExtension = '',
		promptText = '',
		batCommand = ``;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.info('插件已啟動');

	//檢查有沒有設定過帳密
	fs.readFile(extPath+'\\deploy.bat',{encoding:'utf-8'},(e,buffer)=>{
		if(buffer.includes('defaultUserName')||buffer.includes('defaultPassword')){
			setUserAndPass(buffer);
		}
	})
	//插件啟動時(只執行一次)
	setEncoding(vscode.window.activeTextEditor.document);

	//偵測換檔案(每次開啟檔案)
	vscode.workspace.onDidOpenTextDocument(t=>{
			setEncoding(t);
	})
  //偵測存檔
	vscode.workspace.onDidSaveTextDocument(t=>{
			setEncoding(t);
	})

	let download4gl = vscode.commands.registerTextEditorCommand('download4gl', (textEditor) => {
		inputBoxTitle = '下載4gl';
		inputBoxPlaceHolder = '4GL檔名(可不加.4gl)';
		inputBoxExtension = '.4gl';
		promptText = '從3.1的mistest下載4gl';
		batCommand = `31 Download`;
		executeCommand('download',textEditor);
  });

	let upload4gl = vscode.commands.registerTextEditorCommand('upload4gl', (textEditor) => {
		batCommand = `31 Upload`;
		executeCommand('upload',textEditor);
	});

	let downloadNewEraHelp = vscode.commands.registerTextEditorCommand('downloadNewEraHelp', (textEditor) => {
		inputBoxTitle = '從3.8的htdocs/gfchelp下載htm';
		inputBoxPlaceHolder = 'htm檔名(可不加.htm)';
		inputBoxExtension = '.htm';
		promptText = '從3.8的htdocs/gfchelp下載htm';
		batCommand = `38help Download`;
		executeCommand('download',textEditor);
	});

	let uploadNewEraHelp = vscode.commands.registerTextEditorCommand('uploadNewEraHelp', (textEditor) => {
		batCommand = `38help Upload`;
		executeCommand('upload',textEditor);
	});

	let downloadFile38 = vscode.commands.registerTextEditorCommand('downloadFile3.8', (textEditor) => {
		inputBoxTitle = '從3.8下載檔案';
		inputBoxPlaceHolder = '完整檔名(包含附檔名)';
		inputBoxExtension = '';
		promptText = '從3.8的 htdocs/(你的上層資料夾) 下載檔案(須加上完整副檔名) 例：htdocs/docd400w';
		batCommand = `38 Download`;
		executeCommand('download',textEditor);
	});

	let uploadFile38 = vscode.commands.registerTextEditorCommand('uploadFile3.8', (textEditor) => {
		batCommand = `38 Upload`;
		executeCommand('upload',textEditor);
	});

	let openWIOPage = vscode.commands.registerTextEditorCommand('openWIOPage', (textEditor) => {
		batCommand = `WIO`;
		executeCommand('open',textEditor);
	});
	
	let uploadfrontend = vscode.commands.registerTextEditorCommand('uploadfrontend', (textEditor) => {
		batCommand = `38frontend Uploads`;
		executeCommand('upload',textEditor);
  });

	let logIn = vscode.commands.registerCommand('logIn', () => {
		fs.readFile(extPath+'\\deploy.bat',{encoding:'utf-8'},(e,buffer)=>{
				setUserAndPass(buffer);
		})
  });

	context.subscriptions.push(
		download4gl,
		upload4gl,
		downloadNewEraHelp,
		uploadNewEraHelp,
		downloadFile38,
		uploadFile38,
		openWIOPage,
		uploadfrontend,
		logIn
	);
}

/**
 * 
 * @param {String} buf 
 */
const setUserAndPass = async (buf) =>{
	
	let userIndexEnd = buf.indexOf('PASSWORD=')-5;
	let passIndexStart = buf.indexOf('PASSWORD=')+9;
	let passIndexEnd = buf.indexOf('IF')-3;
	let userName = '',
			password = '';
	await vscode.window.showInputBox({
		ignoreFocusOut:true,
		title: '請輸入UserName',
		prompt: '請設定連線至3.1和3.8的UserName'
	}).then(inputUserName=>{
		userName = inputUserName;
	})

	await vscode.window.showInputBox({
		ignoreFocusOut:true,
		title: '請輸入Password',
		password: true,
		prompt: '請設定連線至3.1和3.8的Password'
	}).then(inputPassword=>{
		password = inputPassword;
	})

	if(password&&userName){
		buf = buf.slice(0,151)+userName+buf.slice(userIndexEnd,passIndexStart)+password+buf.slice(passIndexEnd);
		fs.writeFile(extPath+'\\deploy.bat',buf,e=>{
			if(e){
				vscode.window.showErrorMessage(e.message);
			}else{
				vscode.window.showInformationMessage('設定成功');
			}
		})
	}else{
		vscode.window.showInformationMessage('尚未設定帳號密碼');
	}
}

/**
	 * @param {vscode.TextDocument} t 依照TextDocument內容更改語言
	 */
 const setEncoding = (t) =>{
	if(t.getText().match(/<\?MI/i)){
		vscode.languages.setTextDocumentLanguage(t,'wio');
		}
}

/**
 * @param {vscode.TextEditor} t
 * @param {String} command
 */
 const executeCommand = (command,t) =>{
		
	let file = t.document.fileName,
			fileArr = file.split('\\').reverse(),
			fileExtname = fileArr[0].replace(/.*\.(.+)/,'$1'),
			fileBaseName = fileArr[0],
			relativeFileDirname = fileArr[1],
			relativeFilePath = file.replace(/(.+\\).+/,'$1'),
			fileBasenameNoExtension = fileBaseName.replace(/(.*)\..+/,'$1');

	//fileExtname = t.document.languageId(The selected language mode not file extension)
	//${file}=c:\root\your-project\folder\file.ext
	//${fileExtname}=ext
	//${fileBaseName}=file.ext
	//${relativeFileDirname}=folder
	//${relativeFilePath}=c:\root\your-project\folder\
	//${fileBasenameNoExtension}=file

	//InputBox參數 https://code.visualstudio.com/api/references/vscode-api#InputBoxOptions
	if(command == 'download'){
		vscode.window.showInputBox({
			ignoreFocusOut:true,
			title: inputBoxTitle,
			value: fileBaseName,
			placeHolder: inputBoxPlaceHolder,
			prompt:promptText
		}).then(input=>{
			if(!input){
				vscode.window.showInformationMessage('已取消');
				return;
			}
			input = input.slice(-inputBoxExtension.length)==inputBoxExtension?input:input+inputBoxExtension;
			relativeFilePath = relativeFilePath+input;
			process.exec(`${batPath} ${relativeFilePath} ${batCommand} ${input} ${relativeFileDirname}`,(error,stdout)=>{
				if(error){
					vscode.window.showErrorMessage(error.message);
					return;
				}
			
				if(stderr(stdout)[0]){
					vscode.window.showErrorMessage(stderr(stdout)[1]);
					return;
				}
				vscode.workspace.openTextDocument(vscode.Uri.file(relativeFilePath)).then((doc)=>{	
					vscode.window.showTextDocument(doc);
				});
			});
		});
	}

	if(command == 'upload'){
		//workSpaceRootName = vscode.workspace.workspaceFolders[0].name
		//workSpaceRootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
		if(batCommand == `38frontend Uploads`){
			file = vscode.workspace.workspaceFolders[0].uri.fsPath+'\\dist\\';
			relativeFileDirname = vscode.workspace.workspaceFolders[0].name;
		}
		process.exec(`${batPath} ${file} ${batCommand} ${fileBaseName} ${relativeFileDirname}`,(error,stdout)=>{
			if(error){
				vscode.window.showErrorMessage(error.message);
				return;
			}
		
			if(stderr(stdout)[0]){
				vscode.window.showErrorMessage(stderr(stdout)[1]);
				return;
			}
			vscode.window.showInformationMessage('上傳成功');
		});
	}

	if(command == 'open'){
		process.exec(`${batPath} ${fileBasenameNoExtension} ${batCommand} ${relativeFileDirname} ${fileExtname}`,(error,stdout)=>{
			if(error){
				vscode.window.showErrorMessage(error.message);
				return;
			}
		
			if(stderr(stdout)[0]){
				vscode.window.showErrorMessage(stderr(stdout)[1]);
				return;
			}
			vscode.window.showInformationMessage('開啟成功');
		});
	}
};

function deactivate() {}

module.exports = {
	activate,
	deactivate,
}

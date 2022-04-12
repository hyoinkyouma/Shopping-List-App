const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

//SET ENV
process.env.NODE_ENV = "production";

let mainWindow;
let addWindow;

// listen for app to be ready
app.on("ready", function () {
  //create new window
  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  //load html file into window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  //quit when window closed
  mainWindow.on("closed", () => app.quit());
  //build menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //insert menu
  Menu.setApplicationMenu(mainMenu);
});

//remove menu for new window
electron.app.on("browser-window-created", (e, window) => window.removeMenu());

//remove menu when out of focus
electron.app.on("browser-window-blur", (e, window) =>
  window.setMenuBarVisibility(false)
);
electron.app.on("browser-window-focus", (e, window) =>
  window.setMenuBarVisibility(true)
);

//handle add window
function createAddWindow() {
  addWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    width: 300,
    height: 200,
    title: "Add Shopping List Item",
  });
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  //Garbage Collection Handle
  addWindow.on("close", () => (addWindow = null));
}

//Catch Item Add
ipcMain.on("item:add", (e, item) => {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear Items",
        click() {
          mainWindow.webContents.send("item:clear");
        },
      },
      {
        label: "Quit",
        accelerator: process.platform == "win32" ? "Ctrl+Q" : "Command+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

//if mac, add {}
if (process.platform == "darwin") {
  mainMenuTemplate.unshift({});
}

//dev mode if not in prod
if (process.env.NODE_ENV != "production") {
  mainMenuTemplate.push({
    label: "Dev Tools",
    submenu: [
      {
        label: "Toggle Devtools",
        accelerator: process.platform == "win32" ? "Ctrl+I" : "Command+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        label: "Reload",
        role: "reload",
      },
    ],
  });
}

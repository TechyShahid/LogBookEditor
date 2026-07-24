# LogBook Editor

LogBook Editor is a lightweight, Notepad++-style text editor built with plain HTML, CSS, and JavaScript, and packaged as a desktop application with Electron. It is designed to feel familiar for users who want a simple editor with multi-tab support, file handling, find/replace tools, session persistence, a status bar, and theme switching.

## Overview
LogBook Editor provides a clean, minimal interface for creating and editing text files. It supports working with multiple documents at once through tabs, preserving content in each tab until the user saves it, and includes session caching so your unsaved tabs and edits are never lost when closing the application.

## Main Features
- **Multiple Tabbed Editing**: Create, rename, switch, and close multiple tabs effortlessly.
- **Automatic Session Restore & Cache**: Unsaved tabs, draft text, and tab states are saved automatically and restored seamlessly when reopening the app.
- **Enhanced Find and Replace**:
  - **Find Next** and **Find Prev** for forward/reverse searching.
  - Automatic document wrap-around when searching.
  - Case-insensitive search with auto-scrolling to highlighted matches.
  - **Replace** and **Replace All** with automatic syntax update.
- **Syntax Highlighting**: Built-in syntax highlighting for HTML, CSS, JavaScript, JSON, and Markdown.
- **File Operations**: Open existing files from disk, save, save as, and save all open tabs.
- **Editor Info**: Real-time line numbers, cursor position (`Ln X, Col Y`), and word count in the status bar.
- **Theme Support**: Dark mode and light mode toggling.
- **Desktop Packaging**: macOS Electron desktop application with DMG installer support.

## Keyboard Shortcuts
- `Ctrl/Cmd + N`: Create a new tab
- `Ctrl/Cmd + O`: Open a file
- `Shift + Ctrl/Cmd + O`: Open a file in a new tab
- `Ctrl/Cmd + S`: Save the current document
- `Shift + Ctrl/Cmd + S`: Save all modified documents
- `Ctrl/Cmd + F`: Open/close the find/replace panel
- `Enter` *(inside Find input)*: Find Next
- `Shift + Enter` *(inside Find input)*: Find Prev
- `Escape` *(inside Find input)*: Close search panel

## Project Structure
- [index.html](file:///Users/shahidkhan/LogBook/index.html): Main application layout and search panel markup.
- [styles.css](file:///Users/shahidkhan/LogBook/styles.css): Visual styling, dark/light themes, and editor layer layout.
- [app.js](file:///Users/shahidkhan/LogBook/app.js): Core editor logic, tab management, find/replace engine, syntax highlighting, and session storage cache.
- [desktop-app.js](file:///Users/shahidkhan/LogBook/desktop-app.js): Electron entry point for desktop application.
- [package.json](file:///Users/shahidkhan/LogBook/package.json): Build scripts and dependencies.
- [appdmg.json](file:///Users/shahidkhan/LogBook/appdmg.json): Configuration for creating the macOS DMG installer.

## Run Locally
Install dependencies and launch the app:

```bash
npm install
npm start
```

This starts the Electron desktop app.

## Run the Web Version
If you want to preview the editor in a browser instead of the desktop app, run:

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000` in your browser.

## Build a macOS Desktop App
To build macOS app bundles (for both Apple Silicon `arm64` and Intel `x64`):

```bash
npm run package:mac
```

## Create a macOS DMG Installer
To create a disk image installer (`LogBookEditor.dmg`):

```bash
npm run build:dmg
```

## Installation on macOS
1. Open the generated `LogBookEditor.dmg` file.
2. Drag `LogBookEditor` into the `Applications` folder shortcut.
3. Launch `LogBookEditor` from your Applications folder.

If macOS shows a security warning, right-click the app and choose **Open**, then confirm.

## Notes
- Session cache uses persistent local storage to guarantee unsaved text is preserved across app restarts.
- The application is focused on a lightweight, fast editor experience.

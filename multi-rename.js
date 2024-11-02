const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Global variable to hold the current directory path
let currentDirPath = '';

// Main menu display
function mainMenu() {
  console.clear();
  console.log('=======================================');
  console.log('                Welcome                ');
  console.log('=======================================\n');
  console.log('Please select an option:');
  console.log('1. Rename Single / Multiple Files');
  console.log('2. Rename Single / Multiple Folders');
  console.log('3. Organized Rename');
  console.log('4. Clear chosen directory');
  console.log('5. Exit\n');

  rl.question('Enter your choice (1-5): ', handleMenuChoice);
}

function handleMenuChoice(choice) {
  switch (choice) {
    case '1':
      handleFileRename(renameFiles);
      break;
    case '2':
      handleFileRename(renameFolders);
      break;
    case '3':
      handleFileRename(organizedRename);
      break;
    case '4':
      clearDirectory();
      break;
    case '5':
      console.log('Exiting the application. Goodbye!');
      rl.close();
      break;
    default:
      console.log('Invalid choice. Please try again.');
      mainMenu();
  }
}

function handleFileRename(callback) {
  if (!currentDirPath) {
    const type = callback === renameFiles ? 'files' : 'folders';
    getDir(type)
      .then(dirPath => {
        currentDirPath = dirPath;
        callback();
      })
      .catch(err => console.error(err));
  } else {
    callback();
  }
}

// Clear the chosen directory
function clearDirectory() {
  currentDirPath = '';
  console.log('Chosen directory cleared. Please select a new directory next time.');
  rl.question('Press Enter to return to the menu...', mainMenu);
}

// Organized rename function
function organizedRename() {
  console.log(`Current directory: ${currentDirPath}\n`);
  console.log('Choose a case transformation option:');
  console.log('1. Uppercase');
  console.log('2. Lowercase');
  console.log('3. Sentence Case');
  console.log('4. Capitalize Each Word');
  console.log('5. Toggle Case');
  console.log('6. Back to Main Menu\n'); // Added back option

  rl.question('Enter your choice (1-6): ', (option) => {
    if (option === '6') {
      return mainMenu(); // Go back to main menu
    }

    const caseTypes = ['uppercase', 'lowercase', 'sentence', 'capitalize', 'toggle'];
    const selectedType = caseTypes[option - 1];

    if (selectedType) {
      changeCase(currentDirPath, selectedType);
    } else {
      console.log('Invalid choice. Returning to main menu.');
      mainMenu();
    }
  });
}

// Case transformation logic
function changeCase(dirPath, type) {
  fs.readdir(dirPath, (err, files) => {
    if (err) throw err;
    
    const renamePromises = files.map(file => {
      const oldPath = path.join(dirPath, file);
      let newFileName;

      switch (type) {
        case 'uppercase':
          newFileName = file.toUpperCase();
          break;
        case 'lowercase':
          newFileName = file.toLowerCase();
          break;
        case 'sentence':
          newFileName = file.charAt(0).toUpperCase() + file.slice(1).toLowerCase();
          break;
        case 'capitalize':
          newFileName = file.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          break;
        case 'toggle':
          newFileName = [...file].map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()).join('');
          break;
      }

      if (newFileName !== file) {
        const newPath = path.join(dirPath, newFileName);
        return fs.promises.rename(oldPath, newPath).then(() => {
          console.log(`Renamed: ${file} to ${newFileName}`);
        });
      }
    });

    Promise.all(renamePromises)
      .then(() => {
        console.log('Files renamed successfully using organized rename.\n');
        rl.question('Press Enter to return to the menu...', mainMenu);
      })
      .catch(err => console.error(err));
  });
}

// File renaming functions
function renameFiles() {
  console.log(`Current directory: ${currentDirPath}\n`);
  console.log('Choose renaming option:\n1. Manual rename\n2. Random rename\n3. Back to Main Menu\n'); // Added back option

  rl.question('Enter your choice (1-3): ', (option) => {
    if (option === '3') {
      return mainMenu(); // Go back to main menu
    } else if (option === '1') {
      manualRenameFiles(currentDirPath);
    } else if (option === '2') {
      randomRenameFiles(currentDirPath);
    } else {
      console.log('Invalid choice. Returning to main menu.');
      mainMenu();
    }
  });
}

function manualRenameFiles(dirPath) {
  listItems(dirPath, false);
  getRenameParams()
    .then(({ findText, replaceText }) => {
      return fs.promises.readdir(dirPath).then(files => {
        const renamePromises = files.map(file => {
          const oldPath = path.join(dirPath, file);
          const newFileName = file.replace(findText, replaceText);
          if (newFileName !== file) {
            const newPath = path.join(dirPath, newFileName);
            return fs.promises.rename(oldPath, newPath).then(() => {
              console.log(`Renamed: ${file} to ${newFileName}`);
            });
          }
        });

        return Promise.all(renamePromises);
      });
    })
    .then(() => {
      console.log('Files renamed successfully.\n');
      rl.question('Press Enter to return to the menu...', mainMenu);
    })
    .catch(err => console.error(err));
}

function randomRenameFiles(dirPath) {
  fs.promises.readdir(dirPath)
    .then(files => {
      const renamePromises = files.map((file, index) => {
        const oldPath = path.join(dirPath, file);
        const newFileName = `file_${index + 1}${path.extname(file)}`;
        const newPath = path.join(dirPath, newFileName);
        return fs.promises.rename(oldPath, newPath).then(() => {
          console.log(`Renamed: ${file} to ${newFileName}`);
        });
      });

      return Promise.all(renamePromises);
    })
    .then(() => {
      console.log('Files renamed randomly.\n');
      rl.question('Press Enter to return to the menu...', mainMenu);
    })
    .catch(err => console.error(err));
}

// Folder renaming functions
function renameFolders() {
  console.log(`Current directory: ${currentDirPath}\n`);
  console.log('Choose renaming option:\n1. Manual rename\n2. Random rename\n3. Back to Main Menu\n'); // Added back option

  rl.question('Enter your choice (1-3): ', (option) => {
    if (option === '3') {
      return mainMenu(); // Go back to main menu
    } else if (option === '1') {
      manualRenameFolders(currentDirPath);
    } else if (option === '2') {
      randomRenameFolders(currentDirPath);
    } else {
      console.log('Invalid choice. Returning to main menu.');
      mainMenu();
    }
  });
}

function manualRenameFolders(dirPath) {
  listItems(dirPath, true);
  getRenameParams()
    .then(({ findText, replaceText }) => {
      return fs.promises.readdir(dirPath, { withFileTypes: true }).then(items => {
        const renamePromises = items.map(item => {
          if (item.isDirectory()) {
            const oldPath = path.join(dirPath, item.name);
            const newFolderName = item.name.replace(findText, replaceText);
            if (newFolderName !== item.name) {
              const newPath = path.join(dirPath, newFolderName);
              return fs.promises.rename(oldPath, newPath).then(() => {
                console.log(`Renamed: ${item.name} to ${newFolderName}`);
              });
            }
          }
        });

        return Promise.all(renamePromises);
      });
    })
    .then(() => {
      console.log('Folders renamed successfully.\n');
      rl.question('Press Enter to return to the menu...', mainMenu);
    })
    .catch(err => console.error(err));
}

function randomRenameFolders(dirPath) {
  fs.promises.readdir(dirPath, { withFileTypes: true })
    .then(items => {
      const renamePromises = items.map((item, index) => {
        if (item.isDirectory()) {
          const oldPath = path.join(dirPath, item.name);
          const newFolderName = `folder_${index + 1}`;
          const newPath = path.join(dirPath, newFolderName);
          return fs.promises.rename(oldPath, newPath).then(() => {
            console.log(`Renamed: ${item.name} to ${newFolderName}`);
          });
        }
      });

      return Promise.all(renamePromises);
    })
    .then(() => {
      console.log('Folders renamed randomly.\n');
      rl.question('Press Enter to return to the menu...', mainMenu);
    })
    .catch(err => console.error(err));
}

// Helper functions
function getDir(type) {
  return new Promise((resolve, reject) => {
    console.log(`\nEnter the full path of the directory containing the ${type} you want to rename:`);
    rl.question('Directory Path: ', (dirPath) => {
      dirPath = dirPath.trim().replace(/^['"]|['"]$/g, '');

      fs.access(dirPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log('Directory does not exist. Please try again.');
          reject(err);
        } else {
          resolve(dirPath);
        }
      });
    });
  });
}

function listItems(dirPath, isFolder) {
  console.log(`\n${isFolder ? 'Folders' : 'Files'} in the directory:`);
  fs.readdir(dirPath, { withFileTypes: true }, (err, items) => {
    if (err) throw err;
    items.forEach(item => {
      if (isFolder && item.isDirectory()) {
        console.log(`+ ${item.name}`);
      } else if (!isFolder && item.isFile()) {
        console.log(`+ ${item.name}`);
      }
    });
  });
}

function getRenameParams() {
  return new Promise((resolve) => {
    rl.question('Enter the part of the name to find: ', (findText) => {
      rl.question('Enter the text to replace with: ', (replaceText) => {
        resolve({ findText, replaceText });
      });
    });
  });
}

// Start the application
mainMenu();


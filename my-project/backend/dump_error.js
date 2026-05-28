const fs = require('fs');

try {
  // Lire le fichier avec le bon encodage s'il est un peu corrompu
  let buf = fs.readFileSync('error.log');
  // Enlever les null bytes du UTF-16 si mélangé avec UTF-8
  let str = '';
  for(let i=0; i<buf.length; i++) {
    if (buf[i] !== 0) str += String.fromCharCode(buf[i]);
  }
  
  // N'afficher que les 1500 derniers caractères
  console.log("=== EXTRAIT EXACT DE ERROR.LOG ===");
  console.log(str.slice(-1500));
} catch(e) {
  console.error(e.message);
}

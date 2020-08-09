const fs = require('fs');
const parseODB = require('./parserODB');

let json_str;
try {
    // read contents of the file
    const data = fs.readFileSync('profile', 'UTF-8');

    let job = parseODB('profile', data);

    let profile = job.shapes[0];
    json_str = JSON.stringify(profile);
    console.log( JSON.stringify(profile) );

} catch (err) {
    console.error(err);
}

let fd;

try {
    fd = fs.openSync('profile.json', 'a');
    fs.appendFileSync(fd, json_str, 'utf8');
} catch (err) {
    console.log(err)
} finally {
    if (fd !== undefined)
        fs.closeSync(fd);
}

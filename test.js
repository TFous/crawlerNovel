let fs = require('fs')
let cmdstr = 'mongoimport --db test --collection novel --file ./downLoad/36868.json'
// fs.writeFile('./xcopy.bat', cmdstr, function (err) {
//     if (err) throw err;
//     var exec = require('child_process').exec;
//     exec('call ./xcopy.bat',
//         function (error, stdout, stderr) {
//         console.log(stdout)
//         console.log(stderr)
//             if (error !== null) {
//                 //console.log('exec error: ' + error);
//             }
//
//         });
// });

var exec = require('child_process').exec;
exec(cmdstr,
    function (error, stdout, stderr) {
        console.log(stdout)
        console.log(stderr)
        if (error !== null) {
            //console.log('exec error: ' + error);
        }
    });



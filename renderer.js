var exec = require('child_process').exec;
var fs = require('fs');

document.getElementById("run").addEventListener("click", function(e) {
    var lang = document.getElementById("lang").value;
    var spec = document.getElementById("spec").value;
    fs.writeFileSync("./project/specs/example.spec", spec);
    fs.writeFileSync("./project/src/test/java/StepImplementation.java", lang);
    exec('gauge --simple-console --verbose specs/', { cwd: './project' }, function(error, stdout, stderr) {
        document.getElementById("command_line").innerHTML = stdout;
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
});

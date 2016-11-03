const exec = require('child_process').exec;
const fs = require('fs');


document.getElementById("spec").value = fs.readFileSync("./sample/spec");;
document.getElementById("partition").value = fs.readFileSync("./sample/partition");;
document.getElementById("lang").value = fs.readFileSync("./sample/impl");;

document.getElementById("run").addEventListener("click", e => {
    const lang = document.getElementById("lang").value;
    const partition = document.getElementById("partition").value;
    let spec = document.getElementById("spec").value;

    const patt = /~~~(.|\s)*~~~/;
    spec = spec.replace(patt, "|col1|col2|\n|---|---|\n|row1|row1|");
    fs.writeFileSync("./project/specs/example.spec", spec);
    fs.writeFileSync("./project/src/test/java/StepImplementation.java", lang);
    fs.writeFileSync("./project/partition.txt", partition);

    exec('gauge --simple-console --verbose specs/', { cwd: './project' }, (error, stdout, stderr) => {
        document.getElementById("command_line").innerHTML = stdout;
        if (error !== null) console.log(`exec error: ${error}`);
    });
});

document.getElementById("savePartition").addEventListener("click", e => {
    const entities = [];
    const lines = document.getElementById("partition").value.trim().split("\n");
    for (let line of lines) {
        if (line.trim().substr(0, 2) === '##') {
            entities[entities.length - 1].partitions.push({ partition: line.trim(), conditions: [] })
        } else if (line.trim()[0] === '#') {
            entities.push({ entity: line.trim(), partitions: [] })
        } else if (line.trim()[0] === '*') {
            const partitions = entities[entities.length - 1].partitions;
            partitions[partitions.length - 1].conditions.push(line.trim());
        }
    }
    addAutoComplete(entities);
});

function addAutoComplete(entities) {
    $('#spec').textcomplete('destroy');
    const elements = entities.map(e => e.entity);
    entities.map(e => e.entity);
    const autocompleteText = {};
    entities.forEach(e => {
        let partitions = ""
        for (let p of e.partitions)
            partitions += "\n" + p.partition + "\n" + p.conditions.join("\n");
        autocompleteText[e.entity] = "~~~\n" + e.entity + "\n" + partitions + "\n~~~\n";
    });
    $('#spec').textcomplete([{
        match: /@(\w*)$/,
        search: function(term, callback) {
            callback($.map(elements, function(element) {
                return element.indexOf(term) === 0 ? element : null;
            }));
        },
        index: 1,
        replace: function(element) {
            return [autocompleteText[element], ""];
        },
        onKeydown: function(e, commands) {
            if (e.ctrlKey && e.keyCode === 74) {
                return commands.KEY_ENTER;
            }
        }
    }]);
}

function parseSpecData(text) {
    const entities = [];
    const lines = text.trim().split("\n");
    for (let line of lines) {
        if (line.trim()[0] === '#') {
            entities.push({ entity: line.trim(), partition: [] })
        } else if (line.trim()[0] === '*') {
            entities[entities.length - 1].partition.push(line.trim())
        }
    }
    return entities;
}

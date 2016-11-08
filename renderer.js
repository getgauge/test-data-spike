const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const template = `
const gauge = {partitions: {}};
exports.gauge = gauge;

gauge.partition = (text, callback) => {
    gauge.partitions[text.replace(/<.*>/g, "{}")] = callback;
}
`

document.getElementById("spec").value = fs.readFileSync("./sample/spec");
document.getElementById("partition").value = fs.readFileSync("./sample/partition");
document.getElementById("partition_impl").value = fs.readFileSync("./sample/partition_impl.js");
document.getElementById("lang").value = fs.readFileSync("./sample/impl");
savePartition();

document.getElementById("run").addEventListener("click", e => {
    const lang = document.getElementById("lang").value;
    const partition = document.getElementById("partition").value;
    const partition_impl = document.getElementById("partition_impl").value;
    let spec = document.getElementById("spec").value;
    const pattern = /~~~(.|\s)*~~~/;
    const text = spec.match(pattern);

    spec = spec.replace(pattern, convertToTable(getData(text[0], partition_impl)));
    fs.writeFileSync("./project/specs/example.spec", spec);
    fs.writeFileSync("./project/tests/step_implementation.js", lang);
    fs.writeFileSync("./project/partition.txt", partition);

    exec('gauge --simple-console --verbose specs/', { cwd: './project' }, (error, stdout, stderr) => {
        document.getElementById("command_line").innerHTML = stdout;
        if (error !== null) console.log(`exec error: ${error}`);
    });
});

document.getElementById("savePartition").addEventListener("click", savePartition);

function savePartition() {
    const entities = [];
    const lines = document.getElementById("partition").value.trim().split("\n");
    for (let line of lines) {
        if (line.trim().substr(0, 2) === '##') {
            entities[entities.length - 1].partitions.push({ partition: line.trim(), conditions: [] })
        } else if (line.trim()[0] === '#') {
            entities.push({ entity: line.trim(), partitions: [] })
        } else if (line.trim()[0] === '*') {
            if (entities[entities.length - 1].schema) {
                entities[entities.length - 1].schema.push(line.trim());
                continue;
            }
            const partitions = entities[entities.length - 1].partitions;
            partitions[partitions.length - 1].conditions.push(line.trim());
        } else if (/^___(_)*$/.test(line.trim())) {
            entities[entities.length - 1].schema = [];
        }
    }
    addAutoComplete(entities);
}

function addAutoComplete(entities) {
    $('#spec').textcomplete('destroy');
    const elements = entities.map(e => e.entity);
    entities.map(e => e.entity);
    const autocompleteText = {};
    entities.forEach(e => {
        let partitions = ""
        for (let p of e.partitions)
            partitions += "\n" + p.partition + "\n" + p.conditions.join("\n");
        let schema = "";
        if (e.schema)
            schema = "\n___________________________________\n" + e.schema.join("\n")
        autocompleteText[e.entity] = "~~~\n" + e.entity + "\n" + partitions + schema + "\n~~~\n";
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

function getData(text, partition_impl) {
    let entity = {};
    const lines = text.split("\n");
    let currentPartition = "";
    for (let line of lines) {
        if (line.trim().substr(0, 2) === '##') {
            currentPartition = line.trim().substr(2).trim();
        } else if (line.trim()[0] === '#') {
            entity = { entity: line.trim().substr(1).trim(), partitions: [] };
        } else if (line.trim()[0] === '*') {
            if (entity.schema) {
                entity.schema.push(line.trim());
                continue;
            }
            entity.partitions.push(entity.entity + " - " + currentPartition + " - " + line.trim().substr(1).trim());
        } else if (/^___(_)*$/.test(line.trim())) {
            entity.schema = [];
        }
    }
    fs.writeFileSync('./project/partition_impl.js', template + partition_impl);
    delete require.cache[path.resolve('./project/partition_impl.js')]
    const gauge = require('./project/partition_impl.js').gauge
    let data = [];
    entity.partitions.forEach(e => {
        let matches = [];
        if (/".*"/g.test(e)) {
            matches = e.match(/".*"/g).map(a => a.slice(1, -1));
            e = e.replace(/".*"/g, "{}");
        }
        data = data.concat(gauge.partitions[e].apply(this, matches));
    });
    return data;
}

function convertToTable(data) {
    const columns = Object.keys(data[0]);
    const rows = data.map(e => Object.keys(e).map(k => e[k]));
    return "|" + columns.join("|") + "|\n" + "|" + columns.map(e => "-".repeat(e.length)).join("|") + "|\n" + rows.map(r => "|" + r.join("|") + "|").join("\n");
}

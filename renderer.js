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
let entities = [];

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
    const pattern = /```(.|\n)*?```/g;
    const text = spec.match(pattern);
    text.forEach(t => {
        spec = spec.replace(t, convertToTable(getData(t, partition_impl)));
    });

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
    entities = [];
    const lines = document.getElementById("partition").value.trim().split("\n");
    let currentPartition = "";
    for (let line of lines) {
        if (line.trim().substr(0, 2) === '##') {
            currentPartition = line.trim().substr(2).trim();
            entities[entities.length - 1].partitions.push({ partition: currentPartition });
        } else if (line.trim()[0] === '#') {
            entities.push({ entity: line.trim().substr(1).trim(), partitions: [] })
        } else if (line.trim()[0] === '*') {
            if (entities[entities.length - 1].schema) {
                entities[entities.length - 1].schema.push(line.trim());
                continue;
            }
            var index = entities[entities.length - 1].partitions.map(p => p.partition).indexOf(currentPartition);
            if (index != -1)
                entities[entities.length - 1].partitions.splice(index, 1);
            if (line.trim().substr(1).trim()[0] === "@") {
                let partitions = entities[entities.length - 1].partitions;
                if (partitions.length > 0 && partitions[partitions.length - 1].partition === currentPartition) {
                    partitions[partitions.length - 1].conditions.push(line.trim().substr(1).trim().substr(1));
                } else {
                    partitions.push({ partition: currentPartition, conditions: [line.trim().substr(1).trim().substr(1)] });
                }
            } else {
                entities[entities.length - 1].partitions.push({ partition: currentPartition + " - " + line.trim().substr(1).trim() });
            }
        } else if (/^___(_)*$/.test(line.trim())) {
            entities[entities.length - 1].schema = [];
        }
    }
    addAutoComplete();
}

function addAutoComplete() {
    $('#spec').textcomplete('destroy');
    const elements = entities.map(e => e.entity);
    const autocompleteText = {};
    entities.forEach(e => {
        let partitions = ""
        for (let p of e.partitions)
            partitions += "\n" + "## " + p.partition;
        let schema = "";
        if (e.schema)
            schema = "\n___________________________________\n" + e.schema.join("\n")
        autocompleteText[e.entity] = "```\n# " + e.entity + "\n" + partitions + schema + "\n```\n";
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
    let specEntity = getEntityInSpec(text);
    fs.writeFileSync('./project/partition_impl.js', template + partition_impl);
    delete require.cache[path.resolve('./project/partition_impl.js')];
    const gauge = require('./project/partition_impl.js').gauge;
    let data = [];
    const entityDefinition = entities.filter((e) => e.entity.indexOf(specEntity.entity) != -1)[0];

    specEntity.partitions.forEach(e => {
        let partition = entityDefinition.partitions.filter(d => {
            return replaceArgs(d.partition) == replaceArgs(e)
        })[0];

        if (partition.conditions) {
            let partitionData = [];
            partition.conditions.forEach(c => {
                let matches = [];
                if (/".*"/g.test(c)) {
                    matches = c.match(/".*"/g).map(a => a.slice(1, -1));
                    c = c.replace(/".*"/g, "{}");
                }
                partitionData = partitionData.concat(gauge.partitions[c].apply(this, matches));
            });
            data.push(partitionData);
            return;
        }

        let matches = [];
        if (/".*"/g.test(e)) {
            matches = e.match(/".*"/g).map(a => a.slice(1, -1));
            e = e.replace(/".*"/g, "{}");
        }
        data = data.concat(gauge.partitions[specEntity.entity + " - " + e].apply(this, matches));
    });
    return data;
}

function replaceArgs(text) {
    return text.replace(/".*"/g, "{}").replace(/<.*>/g, "{}");
}

function getEntityInSpec(text) {
    let entity = {};
    const lines = text.split("\n");
    for (let line of lines) {
        if (line.trim().substr(0, 2) === '##') {
            entity.partitions.push(line.trim().substr(2).trim());
        } else if (line.trim()[0] === '#') {
            entity = { entity: line.trim().substr(1).trim(), partitions: [] };
        } else if (line.trim()[0] === '*') {
            entity.schema.push(line.trim());
        } else if (/^___(_)*$/.test(line.trim())) {
            entity.schema = [];
        }
    }
    return entity;
}

function convertToTable(data) {
    let columns = {};
    data.forEach(e => {
        if (e instanceof Array)
            e.forEach(o => Object.keys(o).forEach(k => columns[k] = true));
        else
            Object.keys(e).forEach(k => columns[k] = true);
    });
    columns = Object.keys(columns);
    const isComplexEntity = data.some(e => e instanceof Array);
    if (isComplexEntity) {
        let rows = allPossibleCases(data);
        return "|" + columns.join("|") + "|\n" + "|" + columns.map(e => "-".repeat(e.length)).join("|") + "|\n" + rows.map(r => "|" + columns.map(c => r[c]).join("|") + "|").join("\n");
    } else {
        let rows = data.map(e => Object.keys(e).map(k => e[k]));
        return "|" + columns.join("|") + "|\n" + "|" + columns.map(e => "-".repeat(e.length)).join("|") + "|\n" + rows.map(r => "|" + r.join("|") + "|").join("\n");
    }
}

function allPossibleCases(arr) {
    if (arr.length > 1) {
        let lastElements = allPossibleCases(arr.slice(1));
        let result = [];
        lastElements.forEach(e => {
            arr[0].forEach(a => {
                let eCopy = JSON.parse(JSON.stringify(e))
                result.push(Object.assign(eCopy, a));
            });
        });
        return result;
    }
    return arr[0];
}

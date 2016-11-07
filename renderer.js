const exec = require('child_process').exec;
const fs = require('fs');

document.getElementById("spec").value = fs.readFileSync("./sample/spec");;
document.getElementById("partition").value = fs.readFileSync("./sample/partition");;
document.getElementById("lang").value = fs.readFileSync("./sample/impl");;
savePartition();

document.getElementById("run").addEventListener("click", e => {
    const lang = document.getElementById("lang").value;
    const partition = document.getElementById("partition").value;
    let spec = document.getElementById("spec").value;
    const pattern = /~~~(.|\s)*~~~/;
    const text = spec.match(pattern);

    spec = spec.replace(pattern, convertToTable(getData(text[0])));
    fs.writeFileSync("./project/specs/example.spec", spec);
    fs.writeFileSync("./project/src/test/java/StepImplementation.java", lang);
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

function getData(text) {
  const entityName = {};
  const data=[];

  const lines = text.split("\n");
  for (let line of lines) {
      if (line.trim()[0] === '#') {
          entity = line.trim().substr(1).trim()
          break;
      }
  }
  if (entity==='albums') {
      return [{"Artist Name":"Artist1","Album Name":"Album1"},{"Artist Name":"Artist2","Album Name":"Album2"}];
    }

  if (entity==='buyer') {
      return [{"Name":"Buyer1","Address":"Address1"},{"Name":"Buyer1","Address":"Address2"}];
    }

  if (entity==='seller') {
      return [{"Name":"Seller1","Company":"Company1"},{"Name":"Seller 2","Company":"Company2"}];
    }
}

function convertToTable(data) {
    const columns = Object.keys(data[0]);
    console.log(data)
    const rows = data.map(e => Object.keys(e).map(k => e[k]));
    return "|" + columns.join("|") + "|\n" + "|" + columns.map(e => "-".repeat(e.length)).join("|") + "|\n" + rows.map(r => "|" + r.join("|") + "|").join("\n");
}

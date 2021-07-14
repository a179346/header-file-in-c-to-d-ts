/* eslint-disable no-console */
const fs = require('fs');
let current_indent = '';

module.exports = function (path, indent) {
  const content = fs.readFileSync(path).toString();
  const lines = content.replace(/\r\n/g, '\n').split('\n');

  current_indent = '';

  for (let i = 0; i < lines.length;i += 1) {
    let line = lines[i].trim();
    if (line.startsWith('//'))
      addLine(line);

    if (line.startsWith('typedef struct')) {
      const variables = [];
      let type_name = '';
      while (!type_name) {
        i += 1;
        line = lines[i].trim();
        if (line === '{') continue;
        if (line === '') continue;
        if (line.startsWith('//')) {
          variables.push({
            type: '',
            name: '',
            comment: line,
          });
          continue;
        }
        if (line.startsWith('}')) {
          type_name = line.replace('}', '').replace(';', '').trim();
          break;
        }
        const variable = {
          type: '',
          name: '',
          comment: '',
        };
        const commentIdx = line.indexOf('//');
        if (commentIdx !== -1) {
          variable.comment = line.slice(commentIdx);
          line = line.slice(0, commentIdx);
        }
        line = line.trim();
        const lineSplit = line.split(' ');
        let isArray = false;
        variable.name = lineSplit.pop().replace(';', '');
        const square_bracket_idx = variable.name.indexOf('[');
        if (square_bracket_idx !== -1) {
          isArray = true;
          variable.name = variable.name.slice(0, square_bracket_idx);
        }
        variable.type = getType(lineSplit, isArray);
        variables.push(variable);
      }
      addLine(`type ${type_name} = {`);
      addIndent(indent);
      for (const variable of variables) {
        if (!variable.type)
          addLine(variable.comment);
        addLine(`${variable.name}: ${variable.type}; ${variable.comment}`);
      }
      subIndent(indent);
      addLine('}');
      addLine('');
    }

  }
};

function addLine (line) {
  console.log(current_indent + line);
}

const numType = [ 'int', 'short', 'long', 'double', 'float', 'uint8', 'int8', 'uint16', 'int16', 'uint32', 'int32', 'fp32', 'fp64' ];
const charType = [ 'char' ];

function getType (lineSplit, isArray) {
  for (let i = 0;i < lineSplit.length;i += 1) {
    const str = lineSplit[i];
    if (str === 'unsigned') continue;
    if (str === 'signed') continue;

    if (numType.includes(str)) {
      if (isArray)
        return 'number[]';
      return 'number';
    }

    if (charType.includes(str))
      return 'string';

    if (isArray)
      return str + '[]';
    return str;
  }
}

function addIndent (indent) {
  current_indent += indent;
}

function subIndent (indent) {
  current_indent = current_indent.replace(indent, '');
}
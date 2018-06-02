#!/usr/bin/env node

const xml2js = require('xml2js');
const fs = require('fs');
const file = 'USVJ10404998_TEM.xml';
const parser = new xml2js.Parser();

function format(data) {
    const result = {
        isrc:data.TaggedEntityMessage.TaggedEntity[0].EntityIdentifiers.find(i => {
            return i.$.Type === 'ISRC'
        })._,
        tags: data.TaggedEntityMessage.TaggedEntity[0].Tags[0].Tag.map(t => {
            return {
                name: t.$.Path,
                value: t.$.Value
            }
        })
    };
    return result;
}


fs.readFile(file, 'utf8', (err, data) => {
    parser.parseString(data, function (err, result) {
        const formatted = format(result);
        console.log(JSON.stringify(formatted));
    });
});

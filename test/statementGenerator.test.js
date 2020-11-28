const { expect } = require("chai");
const { generateUpdateStatement } = require('../src/statementGenerator');
const originalDocument = require('./mocks/originalDocument.json')
const randomDocument = require('./mocks/randomDocument.json')

describe('statementGenerator', () => {
    it("Should returns a error if the key doesn't exists in the document", () => {
        const INCORRECT_KEY = "sdojfnsdjkln";
        try {
            generateUpdateStatement(originalDocument, {[INCORRECT_KEY]: [{
                    "title": "call of duty",
                    "players": []
                }]
            });
        } catch (e) {
            expect(e.message).to.eq(`The current key "${INCORRECT_KEY}" doesn't exists in the current document`);
        }
    });

    it('The common add should works perfect with the original document', () => {
        const statements = generateUpdateStatement(originalDocument, {"posts": [{"value": "four"}] });
        expect(statements).to.eqls({"$add": {"posts": [{"value": "four"}] }});
    });



});

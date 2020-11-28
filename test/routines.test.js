const { expect } = require("chai");
const { generateUpdateStatement } = require('../src/routines');
const originalDocument = require('./mocks/originalDocument.json')
const randomDocument = require('./mocks/randomDocument.json')

describe('routines', () => {
    describe('generateUpdateStatement - error',  () => {
        it("Should returns a error if the key doesn't exists in the document", () => {
            const INCORRECT_KEY = "sdojfnsdjkln";
            try {
                generateUpdateStatement(originalDocument, {
                    [INCORRECT_KEY]: [{
                        "title": "call of duty",
                        "players": []
                    }]
                });
            } catch (e) {
                expect(e.message).to.eq(`The current key "${INCORRECT_KEY}" doesn't exists in the current document`);
            }
        });
    });

    describe('generateUpdateStatement - $add',  () => {
        it('The common add should works perfect with the original document', () => {
            const statements = generateUpdateStatement(originalDocument, {"posts": [{"value": "four"}] });
            expect(statements).to.eqls({"$add": {"posts": [{"value": "four"}] }});
        });

        it('The common add should works perfect with any document match', () => {
            const statements = generateUpdateStatement(randomDocument, {"games": [{
                    "title": "call of duty",
                    "players": []
                }]
            });
            expect(statements).to.eqls({"$add": {"games": [{"title": "call of duty", "players": []}]}});
        });

        it('Nested elements should add if is necessary the original document', () => {
            const statement = generateUpdateStatement(originalDocument, {
                "posts": [
                    {
                        "_id": 3,
                        "mentions": [
                            {
                                "text": "banana"
                            }
                        ]
                    }
                ]
            });

            expect(statement).to.eqls({"$add": {"posts.1.mentions": [{"text": "banana"}]}});
        });

        it('Nested elements add should works perfect with any document match', () => {
            const statements = generateUpdateStatement(randomDocument, {"games": [{
                    "_id": 3,
                    "players": [
                        {
                            "name": "mixwell"
                        }
                    ]
                }]
            });
            expect(statements).to.eqls({
                "$add": {
                    "games.1.players": [
                        {
                            "name": "mixwell"
                        }
                    ]
                }
            });
        });
    });

    describe('generateUpdateStatement - $update',  () => {
        it('The common update should works with the original document', () => {
            const statements = generateUpdateStatement(originalDocument, {
                "posts": [
                    {
                        "_id": 2,
                        "value": "too"
                    }
                ]
            });

            expect(statements).to.eqls({ "$update": {"posts.0.value": "too"} });
        });

        it('The common update should works with any document match', () => {
            const statements = generateUpdateStatement(randomDocument, {
                "games": [
                    {
                        "_id": 2,
                        "title": "lol"
                    }
                ]
            });

            expect(statements).to.eqls({ "$update": {"games.0.title": "lol"} });
        });

        it('The nested update should works with the original document', () => {

            const statements = generateUpdateStatement(originalDocument, {
                "posts": [
                    {
                        "_id": 3,
                        "mentions": [
                            {
                                "_id": 5,
                                "text": "pear"
                            }
                        ]
                    }
                ]
            });
            expect(statements).to.eqls({ "$update": {"posts.1.mentions.0.text": "pear"}});
        });

        it('The nested update should works with any document', () => {

            const statements = generateUpdateStatement(randomDocument, {
                "games": [
                    {
                        "_id": 3,
                        "players": [
                            {
                                "_id": 5,
                                "name": "hik0"
                            }
                        ]
                    }
                ]
            });
            expect(statements).to.eqls({ "$update": {"games.1.players.0.name": "hik0"}});
        });
    });

    describe('generateUpdateStatement - $remove',  () => {
        it('The common remove should works with the original document', () => {
            const statements = generateUpdateStatement(originalDocument, {
                "posts": [
                    {
                        "_id": 2,
                        "_delete": true
                    }
                ]
            });

            expect(statements).to.eqls({ "$remove" : {"posts.0" : true} });
        });

        it('The common remove should works with any document', () => {
            const statements = generateUpdateStatement(randomDocument, {
                "games": [
                    {
                        "_id": 2,
                        "_delete": true
                    }
                ]
            });

            expect(statements).to.eqls({ "$remove" : {"games.0" : true} });
        });

        it('The nested remove should works with the original document', () => {
            const statements = generateUpdateStatement(originalDocument, {
                "posts": [
                    {
                        "_id": 3,
                        "mentions": [
                            {
                                "_id": 6,
                                "text": "pear",
                                "_delete": true
                            }
                        ]
                    }
                ]
            });

            expect(statements).to.eqls({ "$remove" : {"posts.1.mentions.1": true}});
        });

        it('The nested remove should works with the any document', () => {
            const statements = generateUpdateStatement(randomDocument, {
                "games": [
                    {
                        "_id": 3,
                        "players": [
                            {
                                "_id": 5,
                                "_delete": true
                            }
                        ]
                    }
                ]
            });

            expect(statements).to.eqls({ "$remove" : {"games.1.players.0": true}});
        });
    });

    describe('generateUpdateStatement - cross',  () => {
        it('Multiple mutations should returns multiple statements ', () => {
            const statements = generateUpdateStatement(originalDocument, {
                    "posts": [
                        {"_id": 2, "value": "too"},
                        {"value": "four"},
                        {"_id": 4, "_delete": true}
                    ]
                }
            );

            expect(statements).to.eqls({
                    "$update": {"posts.0.value": "too"},
                    "$add": {"posts": [{"value": "four"}] },
                    "$remove" : {"posts.2" : true}
                }
            );
        });
    });
});

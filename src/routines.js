const { checkObj, handleError } = require("./utils");
const FINDER = "_id";
let statements = {};

function generateUpdateStatement(document, mutations) {
    console.log("mutations :", mutations);
    statements = {};
    for (const key of Object.keys(mutations)) {
        checkObj(mutations);
        statements = deepCheck(mutations, document, null, key)
    }
    console.log("output: ", statements);
    return statements;
}

const buildPath = (path, obj, key) => !path ? key : `${path}.${key}`;

const deepCheck = (mutations, document, path, key) => {
    let currentPath = buildPath(path, document, key);
    const nextMutation = mutations[key] || mutations;
    const nextDocument = document[key] || document;
    const mutationLength = nextMutation?.length;

    if(!nextDocument) {
        handleError(`The current key ${key} doesn't exists in the current document`);
    }
    nextMutation.map((mutChild, i) => {
        // ADD
        if(!mutChild[FINDER]) {
            if(mutationLength > 1) {
                return addStatement("$add", currentPath || key, [mutChild]);
            }
            return addStatement("$add", currentPath || key, nextMutation);
        }
        for (const [childMutKey, childMutValue] of Object.entries(mutChild)) {
            if(!Array.isArray(nextDocument)) {
                handleError(`The current key "${key}" doesn't exists in the current document`);
            }
            nextDocument.map((docChild, j) => {
                // MATCH _id
                const match = childMutKey === FINDER && docChild[childMutKey] && docChild[childMutKey] === childMutValue;
                if(match) {
                    currentPath = buildPath(currentPath, docChild, j);
                    for (const [docChildKey, docChildValue] of Object.entries(docChild)) {
                        if (Array.isArray(docChildValue) && docChildValue.length) {
                            deepCheck(mutChild[docChildKey], docChildValue, currentPath, docChildKey);
                        } else {
                            const { _id, ...rest } = mutChild;
                            for (const [k, v] of Object.entries(rest)) {
                                // update if the key exists in that document
                                if(k === docChildKey && docChild[k] && !mutChild._delete) {
                                    currentPath = buildPath(currentPath, docChild, k);
                                     addStatement("$update", currentPath, v);
                                     currentPath = "";
                                     return;
                                } else if (mutChild._delete) {
                                    if(currentPath === j) {
                                        currentPath = buildPath(key, currentPath, j)
                                    }
                                    return addStatement("$remove", currentPath, true);
                                }
                            }
                        }
                    }
                }
            });
        }
    });

    return statements;
}

function addStatement(cmd, path, mutation) {
    statements[cmd] = {
        [path]: mutation
    }
    return statements;
}

module.exports = { generateUpdateStatement };

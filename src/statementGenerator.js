const FINDER = "_id";
let statements = {};

function generateUpdateStatement(document, mutation) {
    statements = {};
    console.log("mutation :", mutation);
    getStatements(document, mutation);

    console.log("output: ", statements);
    return statements;
}

function getStatements(document, mutations) {
    for (const key of Object.keys(mutations)) {
        checkObj(mutations);
        statements = deepCheck(mutations, document, null, key)
    }
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
                // return addStatement("$add", currentPath || key, nextMutation);

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

function checkObj(child) {
    if(!child || typeof child !== 'object') {
        handleError(`The mutation -> '${child}' has a bad syntax or isn't a object, check the struct`);
    }
}

function handleError(msg) {
    throw new Error(msg);
}

module.exports = { generateUpdateStatement };

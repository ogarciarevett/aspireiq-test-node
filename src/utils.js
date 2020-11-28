function handleError(msg) {
    throw new Error(msg);
}

function checkObj(child) {
    if(!child || typeof child !== 'object') {
        handleError(`The mutation -> '${child}' has a bad syntax or isn't a object, check the struct`);
    }
}

module.exports = {
    handleError,
    checkObj,
}
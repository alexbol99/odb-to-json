const dirTree = require("directory-tree");

const readJob = (path) => {
    const tree = dirTree(path);
    return tree;
}

let tree = readJob("./data/sample_genflex")
console.log(tree)


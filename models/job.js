
class Job {
    constructor(tree) {
        this.name = tree.path.split('\/').pop() || "";
        this.matrix = null;
        this.steps = [];
    }

    // get box() {
    //     let b = new Box();
    //     for (let shape of this.profiles) {
    //         b.merge(shape.box);
    //     }
    //     for (let shape of this.materials) {
    //         b.merge(shape.box);
    //     }
    //     for (let shape of this.shapes) {
    //         b.merge(shape.box);
    //     }
    //     return b;
    // }
}

module.exports = Job;
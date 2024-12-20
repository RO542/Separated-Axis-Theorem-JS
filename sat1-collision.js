// Reference on Separated Axis Theorem and Rotated Object Collision detection
// https://dyn4j.org/2010/01/sat/


export class RectangleBody {
    constructor(x, y, width, height, rotation) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.vertices =
            [[this.x - this.width / 2, this.y - this.height / 2],// top left 
            [this.x - this.width / 2, this.y + this.height / 2],// bottom left
            [this.x + this.width / 2, this.y + this.height / 2],// bottom right
            [this.x + this.width / 2, this.y - this.height / 2]]; // top right
        this.rotate(this.rotation);
    }

    translate(new_x, new_y) {
        this.x = new_x;
        this.y = new_y;
        this.rotate(this.rotation);

        this.vertices = [
            [this.x - this.width / 2, this.y - this.height / 2],// top left 
            [this.x - this.width / 2, this.y + this.height / 2],// bottom left
            [this.x + this.width / 2, this.y + this.height / 2],// bottom right
            [this.x + this.width / 2, this.y - this.height / 2] // top right
        ];

    }

    rotate(angle) {
        this.rotation = angle;
        const new_cos = Math.cos(-angle);
        const new_sin = Math.sin(-angle);
        for (let vertex of this.vertices) {
            const [x, y] = vertex;
            const rotated_x = (x - this.x) * new_cos - (y - this.y) * new_sin + this.x;
            const rotated_y = (y - this.y) * new_cos + (x - this.x) * new_sin + this.y;
            vertex[0] = rotated_x;
            vertex[1] = rotated_y;
        }
    }

    normalize(vector) {
        const length = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
        return [vector[0] / length, vector[1] / length];
    }

    // returns perpendicular vector given an edge/side to the rectangle
    getNormals() {
        this.vertices.push(this.vertices[0]);
        const normals = [];
        for (let i = 0; i < this.vertices.length - 1; i++) {
            const curr = this.vertices[i];
            const next = this.vertices[i + 1];
            const normal = ([- 1 * (curr[1] - next[1]), (curr[0] - next[0])]);
            normals.push(this.normalize(normal));
        }
        this.vertices.pop();
        return normals;
    }

    dotProduct(vector1, vector2) {
        return vector1[0] * vector2[0] + vector1[1] * vector2[1];
    }


    getProjection(axis) {
        // find min and max projections (shadow bounds) given 
        let minimum = Number.MAX_VALUE;
        let maximum = Number.MIN_VALUE;
        for (let vertex of this.vertices) {
            const x = this.dotProduct(axis, vertex);
            minimum = Math.min(minimum, x);
            maximum = Math.max(maximum, x)
        }
        return [minimum, maximum];
    }

    overlap(range1, range2) {
        const [min1, max1] = range1;
        const [min2, max2] = range2;
        return (min1 <= max2 && min2 <= max1)
    }

    testCollision(otherBody) {
        const axes1 = this.getNormals();
        const axes2 = otherBody.getNormals()

        for (let axis of axes1) {
            const range1 = (this.getProjection(axis));
            const range2 = (otherBody.getProjection(axis));
            if (!this.overlap(range1, range2))
                return false;
        }
        for (let axis of axes2) {
            const range1 = (this.getProjection(axis));
            const range2 = (otherBody.getProjection(axis));
            if (!this.overlap(range1, range2))
                return false;
        }
        return true; // if all axes overlap then a collision occurred
    }
}

//const x = new RectangleBody(1, 1, 4, 2, 0);
//const y = new RectangleBody(1, 1, 100, 100, 0);
//let t1 = [7, 98.98];
//let t2 = [39187, 28]
//
//console.log(x.dotProduct(t1, t2))
//console.log(x.testCollision(y));

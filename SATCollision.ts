type Vec2 = [number, number];

export class RectangleBody {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    vertices: Vec2[];

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vertices = [
            [x - width / 2, y - height / 2],
            [x - width / 2, y + height / 2],
            [x + width / 2, y + height / 2],
            [x + width / 2, y - height / 2]
        ];
    }

    clamp(num: number, min: number, max: number) {
        return num < min ? min : (num > max ? max : num);
    }

    translate(new_x: number, new_y: number): void {
        if (isNaN(new_x) || isNaN(new_y)) {
            throw new Error(`Either x or y is not a number, unable to translate rectangle: , new_x:${new_x}, new_y:${new_y}`);
        }
        this.x = new_x;
        this.y = new_y;
    }

    set rotate(angle: number) {
        // -angle means rotating the vertices clockwise
        const new_cos = Math.cos(-angle);
        const new_sin = Math.sin(-angle);
        for (let vertex of this.vertices) {
            const [x, y] = vertex;
            const rotated_x = (x - this.x) * new_cos - (y - this.y) * new_sin + this.x;
            const rotated_y = (y - this.y) * new_cos + (x - this.x) * new_sin + this.y;
            vertex[0] = rotated_x;
            vertex[1] = rotated_y;
        }
        this.rotation = angle;
    }

    normalize(vector: Vec2): Vec2 {
        const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
        return [vector[0] / length, vector[1] / length];
    }

    getNormals(): Vec2[] {
        this.vertices.push(this.vertices[0]);
        const normals: Vec2[] = [];

        for (let i = 0; i < this.vertices.length - 1; i++) {
            const curr = this.vertices[i];
            const next = this.vertices[i + 1];
            const normal: Vec2 = [-1 * (curr[1] - next[1]), (curr[0] - next[0])];
            normals.push(this.normalize(normal));
        }
        this.vertices.pop();

        // for (let i = 0; i < this.vertices.length; i++) {
        //     const curr = this.vertices[i];
        //     const next = this.vertices[(i + 1) % this.vertices.length];
        //     const normal: Vec2 = [-1 * (curr[1] - next[1]), curr[0] - next[0] ];
        //     normals.push(this.normalize(normal));
        // }

        return normals;
    }

    dotProduct(vector1: Vec2, vector2: Vec2): number {
        return vector1[0] * vector2[0] + vector1[1] * vector2[1];
    }

    // find min and max projections (shadow bounds) given 
    getProjection(axis: Vec2): [number, number] {
        let minimum = Number.MAX_VALUE;
        let maximum = Number.MIN_VALUE;
        for (let vertex of this.vertices) {
            const x = this.dotProduct(axis, vertex);
            minimum = Math.min(minimum, x);
            maximum = Math.max(maximum, x)
        }
        return [minimum, maximum];
    }

    overlap(range1: [number, number], range2: [number, number]) {
        const [min1, max1] = range1;
        const [min2, max2] = range2;
        return min1 <= max2 && min2 <= max1
    }

    testCollision(otherBody: RectangleBody) {
        const axes1 = this.getNormals();
        const axes2 = otherBody.getNormals();

        for (let axis of axes1) {
            const range1 = this.getProjection(axis);
            const range2 = otherBody.getProjection(axis);
            if (!this.overlap(range1, range2))
                return false;
        }

        for (let axis of axes2) {
            const range1 = this.getProjection(axis);
            const range2 = otherBody.getProjection(axis);
            if (!this.overlap(range1, range2))
                return false;
        }
        return true;
    }
}





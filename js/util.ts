export class Point {
    x:number
    y:number
    constructor(x,y) {
        if(typeof x == 'number') {
            this.x = x
            this.y = y
        } else {
            this.x = x.x
            this.y = x.y
        }
    }
    add(pt) {
        return new Point(this.x + pt.x, this.y + pt.y)
    }

    subtract(pt: Point) {
        return new Point(this.x - pt.x, this.y - pt.y)
    }
}

export function make_point(x,y) {
    return new Point(x,y)
}
export function clone_point(pt) {
    return new Point(pt.x,pt.y)
}


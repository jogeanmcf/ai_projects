class Sensor {
    constructor(car){
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI/1.5;

        this.rays = [];
        this.readings=[];
    }  

    update(roadBoarders, trafic){
        this.#castRays();
        this.readings=[];
        for(let i=0; i<this.rays.length;i++){
            this.readings.push(
                this.#getReading(
                    this.rays[i], 
                    roadBoarders, 
                    trafic)
            );
        }
    }

    #castRays(){
        this.rays = [];
        
        for(let i=0; i<this.rayCount;i++){
            
            const rayAngle = lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount==1 ? 0.5 : i/(this.rayCount - 1)
            ) + this.car.angle;

            const start = {x: this.car.x, y: this.car.y};
            
            const end = {
                x: this.car.x - Math.sin(rayAngle)*this.rayLength,
                y: this.car.y - Math.cos(rayAngle)*this.rayLength,
            };
            
            this.rays.push([start,end]);
            
        }
    }

    #getReading(ray, roadBoarders, trafic){
        let touches = [];
        for(let i=0; i< roadBoarders.length;i++){
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBoarders[i][0],
                roadBoarders[i][1]
            );
            if(touch){
                touches.push(touch)
            }
        }
        for(let i=0; i<trafic.length;i++){
            const poly = trafic[i].polygon;
            for(let j=0; j<poly.length; j++){
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if(value){
                    touches.push(value)
                }
            }
        }

        if(touches.length==0){
            return null;
        } else {
            const offsets = touches.map((e) => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find((e) => e.offset === minOffset)
        }
    }

    draw(ctx){

        for (let ray of this.rays){

            let end = ray[1];
            let index = this.rays.indexOf(ray);
            if (this.readings[index]){
                end = this.readings[index]
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'yellow';

            ctx.moveTo(
                ray[0].x,
                ray[0].y,
            );
            ctx.lineTo(
                end.x,
                end.y,
            );
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';

            ctx.moveTo(
                ray[1].x,
                ray[1].y,
            );
            ctx.lineTo(
                end.x,
                end.y,
            );
            ctx.stroke();
        }
        
    }
}
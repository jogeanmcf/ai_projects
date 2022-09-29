class Car {
    constructor(x,y,width,height, controlType, maxSpeed=3,color){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.angle = 0;
        this.friction = 0.05;
        this.isDamaged=false;

        this.useBrain = controlType=="AI";
        
        if(controlType!="DUMMY"){
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount,6,4]
            );
        }
        this.controls = new Controls(controlType);

        this.polygon = [];

    }

    update(roadBoarders, trafic){
        if(!this.isDamaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.isDamaged = this.#assessDamage(roadBoarders,trafic)
        }
        if(this.sensor){
            this.sensor.update(roadBoarders,trafic);
            const offsets = this.sensor.readings.map(
                (s)=> s===null ? 0 : 1-s.offset
            );
            const ouputs = NeuralNetwork.feedFoward(offsets, this.brain);
            
            if(this.useBrain){
                this.controls.forward=ouputs[0];
                this.controls.left=ouputs[1];
                this.controls.right=ouputs[2];
                this.controls.reverse=ouputs[3];
            }
        }
        
    }

    #assessDamage(roadBoarders,trafic){
        for(let i=0; i<roadBoarders.length; i++){
            if(polysIntersect(this.polygon, roadBoarders[i])){
                return true;
            }
        }
        for(let i=0; i<trafic.length; i++){
            if(polysIntersect(this.polygon, trafic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    #createPolygon(){
        const points=[];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width,this.height);
        
        points.push({
            x: this.x - Math.sin(this.angle - alpha)*rad,
            y: this.y - Math.cos(this.angle - alpha)*rad,
        });

        points.push({
            x: this.x - Math.sin(this.angle + alpha)*rad,
            y: this.y - Math.cos(this.angle + alpha)*rad,
        });

        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha)*rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha)*rad,
        });

        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha)*rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha)*rad,
        });

        return points;
    }

    #move(){
        if(this.controls.forward){
            this.speed += this.acceleration;
        }

        if(this.controls.reverse){
            this.speed -= this.acceleration
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }

        if (this.speed < -this.maxSpeed/2) {
            this.speed = -this.maxSpeed/2;
        }

        if (this.speed > 0) {
            this.speed -= this.friction;
        }

        if (this.speed < 0) {
            this.speed += this.friction;
        }

        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }
        
        if(this.speed!=0){
            const flip = this.speed > 0 ? 1 : -1;
            if(this.controls.left){
                this.angle += 0.03*flip;
            }
            if(this.controls.right){
                this.angle -= 0.03*flip;
            }
        }

        
        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle)*this.speed;
    }

    draw(ctx,drawSensor=false){
                
        if(this.isDamaged){
            ctx.fillStyle = "gray";
        } else{ 
            ctx.fillStyle= this.color;
        }
        
        ctx.moveTo(this.polygon[0]?.x, this.polygon[0]?.y)
        for(var i=1; i<this.polygon.length; i++){
            ctx.lineTo(
                this.polygon[i].x,
                this.polygon[i].y   
            )
        }
        ctx.fill();
        if(drawSensor){
            this.sensor?.draw(ctx);
        }
        
    }
}
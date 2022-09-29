const carCanvas=document.getElementById("carCanvas");
const networkCanvas=document.getElementById("networkCanvas");

carCanvas.width=300;
networkCanvas.width = 300;


const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2, carCanvas.width*0.9);
const N = 50;
const cars = generateCars(N);
let bestCar = cars[0];

if(localStorage.getItem("bestBrain")){
    for(let i=0; i<N; i++){
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"))
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.2)
        }
    }
}

const trafic = [
    new Car(road.getLaneCenter(1),-100,30,50, "DUMMY",2,"red"),
    new Car(road.getLaneCenter(0),-300,30,50, "DUMMY",2,"red"),
    new Car(road.getLaneCenter(2),-350,30,50, "DUMMY",2,"red"),
    new Car(road.getLaneCenter(2),-500,30,50, "DUMMY",2,"red"),
    new Car(road.getLaneCenter(0),-500,30,50, "DUMMY",2,"red"),
    new Car(road.getLaneCenter(1),-600,30,50, "DUMMY",2,"red"),
    new Car(road.getLaneCenter(2),-780,30,50, "DUMMY",2,"red"),
    new Car(road.getLaneCenter(0),-800,30,50, "DUMMY",2,"red"),
]

animate(carCtx);

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discart(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars = [];
    for(i=0; i<N; i++){
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50,"AI",3,"blue"));
    }
    return cars;
}

function animate() {

    // Updating the cenario 
    for(let traficCar of trafic ){
        traficCar.update(road.borders,[])
    }
    for(let car of cars){
        car.update(road.borders,trafic);
    }
    const bestCar = cars.find((car) => car.y == Math.min(...cars.map(car => car.y)));
    
    // Drawing the cenario
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;
    carCtx.restore();
    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height*0.7)

    road.draw(carCtx);
    
    carCtx.globalAlpha=0.2;
    for(let car of cars){
        car.draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);
    for(let traficCar of trafic){
        traficCar.draw(carCtx)
    }
    

    

    

    




    

    Visualizer.drawNetwork(networkCtx, bestCar.brain)
    requestAnimationFrame(animate)
}
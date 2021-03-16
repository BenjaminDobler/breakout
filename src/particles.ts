// var c = canvas;
// var ctx = c.getContext('2d');
// // Set full-screen
// c.width = innerWidth;
// c.height = innerHeight;
// // Options
// var background = '#333'; // Background color
// var particlesPerExplosion = 20;
// var particlesMinSpeed = 3;
// var particlesMaxSpeed = 6;
// var particlesMinSize = 1;
// var particlesMaxSize = 3;
// var explosions = [];
// var fps = 60;
// var now, delta;
// var then = 0;  // Zero start time
// var interval = 1000 / fps;

function randInt(min, max, positive = false) {
    if (positive == false) {
        var num = Math.floor(Math.random() * max) - min;
        num *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    } else {
        var num = Math.floor(Math.random() * max) + min;
    }
    return num;
}

export class Particle {
    particlesMinSpeed = 3;
    particlesMaxSpeed = 6;
    particlesMinSize = 1;
    particlesMaxSize = 10;
    xv;
    yv;
    size;
    r;
    g;
    b;
    constructor(public x, public y) {
        this.xv = randInt(this.particlesMinSpeed, this.particlesMaxSpeed, false);
        this.yv = randInt(this.particlesMinSpeed, this.particlesMaxSpeed, false);
        this.size = randInt(this.particlesMinSize, this.particlesMaxSize, true);
        this.r = randInt(0, 255);
        this.g = randInt(0, 255);
        this.b = randInt(0, 255);
    }
}

export class Explosion {
    particles = [];
    constructor(public x, public y, particlesPerExplosion = 20) {
        for (var i = 0; i < particlesPerExplosion; i++) {
            this.particles.push(new Particle(x, y));
        }
    }
}

export class Particles {
    // Options
    background = '#333'; // Background color
    particlesPerExplosion = 20;

    explosions = [];
    then = 0; // Zero start time

    constructor(private ctx) {}

    draw() {
        this.drawExplosion();
    }
    // Draw explosion(s)
    drawExplosion() {
        if (this.explosions.length == 0) {
            return;
        }
        for (var i = 0; i < this.explosions.length; i++) {
            var explosion: any = this.explosions[i];
            var particles = explosion.particles;
            if (particles.length == 0) {
                this.explosions.splice(i, 1);
                //return;
                continue;
            }
            for (var ii = 0; ii < particles.length; ii++) {
                var particle = particles[ii];
                // Check particle size
                // If 0, remove
                if (particle.size < 0) {
                    particles.splice(ii, 1);
                    // return;
                    continue;
                }
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, Math.PI * 2, 0, false);
                this.ctx.closePath();
                this.ctx.fillStyle = 'rgb(' + particle.r + ',' + particle.g + ',' + particle.b + ')';
                this.ctx.fill();
                // Update
                particle.x += particle.xv;
                particle.y += particle.yv;
                particle.size -= 0.1;
            }
        }
    }

    addExplosion(x, y) {
        this.explosions.push(new Explosion(x, y));
    }
}

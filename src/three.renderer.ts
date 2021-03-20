import {
    AmbientLight,
    BoxBufferGeometry,
    BoxGeometry,
    DoubleSide,
    EdgesGeometry,
    ExtrudeBufferGeometry,
    Group,
    IcosahedronGeometry,
    LineBasicMaterial,
    LineSegments,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PointLight,
    Scene,
    Shape,
    SphereGeometry,
    SpotLight,
    WebGLRenderer
} from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { Wall } from './objects/wall';
import { GUI } from 'dat.gui'

import { brickColors } from './types';


const gui = new GUI();

function createBoxWithRoundedEdges(width, height, depth, radius0, smoothness) {
    let shape = new Shape();
    let eps = 0.00001;
    let radius = radius0 - eps;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(
        width - radius * 2,
        height - radius * 2,
        eps,
        Math.PI / 2,
        0,
        true
    );
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    let geometry = new ExtrudeBufferGeometry(shape, {
        depth: depth - radius0 * 2,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius0,
        curveSegments: smoothness
    });

    geometry.center();

    return geometry;
}

function addEdges(b, color = 0xdedede) {
    var edgegeo = new EdgesGeometry(b.geometry);
    var mat = new LineBasicMaterial({ color: color, linewidth: 4 });
    var wireframe = new LineSegments(edgegeo, mat);
    wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
    b.add(wireframe);
}

class ThreeRenderer {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    paddle: Mesh;
    bricks: Mesh[] = [];

    existing: Map<any, any> = new Map<any, any>();
    removed: Map<any, any> = new Map<any, any>();

    group: Group;

    init(canvas, width, height, state) {
        this.group = new Group();

        this.scene = new Scene();

        this.camera = new PerspectiveCamera(80, width / height, 0.1, 2000);

        this.renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(width, height);
        // document.body.appendChild(renderer.domElement)

        const geometry: BoxBufferGeometry = new BoxBufferGeometry(
            state.paddle.width,
            state.paddle.height,
            30,
            20,
            20
        );
        const material: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x00ff00
        });

        this.paddle = new Mesh(geometry, material);
        addEdges(this.paddle);
        this.group.add(this.paddle);

        for (const brick of state.bricks) {
            var roundedBoxGeometry = createBoxWithRoundedEdges(
                brick.width,
                brick.height,
                30,
                4,
                3
            );
            roundedBoxGeometry.computeVertexNormals();
            roundedBoxGeometry.translate(0, 0.5, 0);
            const brickGeometry: BoxBufferGeometry = new BoxBufferGeometry(
                brick.width,
                brick.height,
                30
            );
            const brickMaterial: MeshLambertMaterial = new MeshLambertMaterial({
                color: brickColors[brick.gemType]
            });

            const b = new Mesh(roundedBoxGeometry, brickMaterial);

            b.position.x = brick.x + brick.width / 2;
            b.position.y = state.height - (brick.y + brick.height / 2);
            //addEdges(b, brickColors[brick.gemType]);
            this.group.add(b);
            this.existing.set(brick.id, b);
            this.bricks.push(b);
        }

        var geo = new PlaneBufferGeometry(width, height, 8, 8);
        var mat = new MeshBasicMaterial({
            color: 0x515151,
            side: DoubleSide
        });
        var plane = new Mesh(geo, mat);
        plane.position.z = -16;
        plane.position.x = state.width / 2;
        plane.position.y = state.height / 2;
        this.group.add(plane);

        const bottom = new Wall(state.width);
        bottom.position.x = state.width / 2;
        this.group.add(bottom);

        const top = new Wall(state.width);
        top.position.x = state.width / 2;
        top.position.y = state.height;
        this.group.add(top);

        const leftW = new Wall(state.height + 20);
        leftW.position.x = -10;
        leftW.position.y = state.height / 2;
        leftW.rotateZ(MathUtils.degToRad(90));
        this.group.add(leftW);

        const rightW = new Wall(state.height + 20);
        rightW.position.x = state.width + 10;
        rightW.position.y = state.height / 2;
        rightW.rotateZ(MathUtils.degToRad(90));
        this.group.add(rightW);

        const controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        controls.enableZoom = true;

        controls.dollyOut = function(){
            this.camera.position.z -= 100;
        }
        controls.dollyIn = function(){
            this.camera.position.z += 100;
        }

        const amb = new AmbientLight(0x444444);
        this.scene.add(amb);

        const light = new SpotLight(0xffffff);
        this.scene.add(light);
        light.position.set(state.width / 2, state.height / 2, 600);
        light.castShadow = false;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 2000;
        light.shadow.camera.fov = 40;

        const lightFolder = gui.addFolder('Light');
        lightFolder.add(light.position, 'x', 0, 2000);
        lightFolder.add(light.position, 'y', 0, 2000);
        lightFolder.add(light.position, 'z', 0, 2000);



        this.camera.position.set(0, 0, 500.0);
        this.camera.lookAt(0, 0, 0.0);
        controls.update();

        this.scene.add(this.group);

        this.group.position.x = -state.width / 2;
        this.group.position.y = -state.height / 2;

        //this.scene.rotateX(40);
    }

    addBall(ball) {
        const ballGeometry: SphereGeometry = new SphereGeometry(10, 20, 20);
        const ballMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x0000ff
        });



        const ballMesh = new Mesh(ballGeometry, ballMaterial);
        const mesh = new PointLight(0xffffff, 1, 200);
        mesh.add(ballMesh);

        this.existing.set(ball.id, mesh);
        this.group.add(mesh);
    }

    addGem(gem, state) {
        const brickGeometry = new IcosahedronGeometry(16);
        const brickMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: brickColors[gem.gemType]
        });

        const b = new Mesh(brickGeometry, brickMaterial);

        b.position.x = gem.x + gem.width / 2;
        b.position.y = state.height - gem.y;
        gem.rotY = 0;
        gem.rotX = 0;
        this.group.add(b);
        this.existing.set(gem.id, b);
    }

    addShoot(shoot, state) {
        const brickGeometry: BoxBufferGeometry = new BoxGeometry(10, 10, 10);

        const brickMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: '#ff0000'
        });

        const b = new Mesh(brickGeometry, brickMaterial);

        b.position.x = shoot.x;
        b.position.y = state.height - shoot.y;
        this.group.add(b);
        this.existing.set(shoot.id, b);
    }

    rotX = 0;
    rotY = 0;
    render(state) {
        this.rotX += 0.5;
        // this.rotY+=.5;
        for (const brick of state.bricks) {
            if (brick.hit && !this.removed.has(brick.id)) {
                this.group.remove(this.existing.get(brick.id));
                this.removed.set(brick.id, true);
            }
        }

        // Handle Gems
        for (const gem of state.gems) {
            if (!this.existing.has(gem.id)) {
                this.addGem(gem, state);
            } else {
                const g = this.existing.get(gem.id);
                g.position.y = state.height - gem.y;
                g.rotateX(MathUtils.degToRad(this.rotX));
                g.rotateY(MathUtils.degToRad(this.rotY));
            }

            if ((gem.out || gem.used) && !this.removed.has(gem.id)) {
                console.log('remove gem!');
                this.group.remove(this.existing.get(gem.id));
                this.removed.set(gem.id, gem);
            }
        }

        // Handle shoots
        for (const shoot of state.shoots) {
            if (!this.existing.has(shoot.id)) {
                this.addShoot(shoot, state);
            } else {
                const g = this.existing.get(shoot.id);
                g.position.y = state.height - shoot.y;
            }

            if (shoot.used && !this.removed.has(shoot.id)) {
                this.group.remove(this.existing.get(shoot.id));
                this.removed.set(shoot.id, shoot);
            }
        }


        // Handle balls
        for (const ball of state.balls) {
            if (ball.out && !this.removed.has(ball.id)) {
                this.group.remove(this.existing.get(ball.id));
                this.removed.set(ball.id, ball);
            }

            if (!this.existing.has(ball.id)) {
                this.addBall(ball);
            } else {
                const ballMesh = this.existing.get(ball.id);
                ballMesh.position.y = state.height - ball.y;
                ballMesh.position.x = ball.x + ball.radius;
            }
        }

        // Handle Paddle
        this.paddle.scale.x = state.paddle.width / 200;
        this.paddle.position.x = state.paddle.x + state.paddle.width / 2;
        this.paddle.position.y = state.height - state.paddle.y;


        this.renderer.render(this.scene, this.camera);
    }
}

const r = new ThreeRenderer();

let isInited = false;

export function reinit() {
    isInited = false;
}

export function render(canvas, brickColors, d) {
    if (!isInited) {
        r.init(canvas, d.width, d.height, d);
        isInited = true;
        r.render(d);
    } else {
        r.render(d);
    }
}

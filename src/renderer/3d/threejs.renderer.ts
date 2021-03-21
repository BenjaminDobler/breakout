import {
    AmbientLight,
    BoxBufferGeometry,
    BoxGeometry,
    DoubleSide,
    Group,
    IcosahedronGeometry,
    ImageUtils,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PointLight,
    RepeatWrapping,
    Scene,
    SphereGeometry,
    SpotLight,
    TextureLoader,
    WebGLRenderer
} from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { Wall } from './objects/wall';
import { GUI } from 'dat.gui';
import { brickColors } from '../../types';
import { createBoxWithRoundedEdges } from './utils';

const boardTextureImage = require('../../board3.png');

class ThreeRenderer {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    paddle: Mesh;
    bricks: Mesh[] = [];

    existing: Map<any, any> = new Map<any, any>();
    removed: Map<any, any> = new Map<any, any>();

    group: Group;
    gui;
    state: any;

    init(canvas, width, height, state) {
        this.group = new Group();

        this.scene = new Scene();

        if (this.gui) {
            this.gui.destroy();
        }
        this.gui = new GUI();

        const boardTexture = new TextureLoader().load(boardTextureImage, ()=>{
            this.render(this.state);
        });

        boardTexture.wrapS = boardTexture.wrapT = RepeatWrapping;
        boardTexture.repeat.set(5, 5); // Scale the board texture


        // Camera
        this.camera = new PerspectiveCamera(80, width / height, 0.1, 2000);
        this.camera.position.set(0, 0, 500.0);
        this.camera.lookAt(0, 0, 0.0);

        const cameraFolder = this.gui.addFolder('Camera');
        cameraFolder.add(this.camera, 'fov', 0, 400);
        cameraFolder.add(this.camera, 'far', 0, 3000);
        cameraFolder.add(this.camera, 'near', 0.0, 5);
        cameraFolder.add(this.camera.position, 'z', 0, 2000);
        cameraFolder.add(this.camera.position, 'y', -1000, 2000);

        this.renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(width, height);

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
        // addEdges(this.paddle);
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
            color: 0xffffff,
            side: DoubleSide
        });
        var plane = new Mesh(geo, mat);
        plane.position.z = -16;
        plane.position.x = state.width / 2;
        plane.position.y = state.height / 2;
        plane.material.map = boardTexture;

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

        controls.dollyOut = function () {
            this.camera.position.z -= 100;
        };
        controls.dollyIn = function () {
            this.camera.position.z += 100;
        };

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

        const lightFolder = this.gui.addFolder('Light');
        lightFolder.add(light.position, 'x', 0, 2000);
        lightFolder.add(light.position, 'y', 0, 2000);
        lightFolder.add(light.position, 'z', 0, 2000);

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
        mesh.position.x = ball.x;
        mesh.position.z = 10;

        mesh.add(ballMesh);

        this.existing.set(ball.id, mesh);
        this.group.add(mesh);
        return mesh;
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
        return b;
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
        return b;
    }

    addItem(item, state, type) {
        if (type === 'gem') {
            return this.addGem(item, state);
        } else if (type === 'ball') {
            return this.addBall(item);
        } else if (type === 'shoot') {
            return this.addShoot(item, state);
        }
    }

    addOrRemoveItem(items, state, type) {
        const i = [];
        for (const item of items) {
            if (item.out && !this.removed.has(item.id)) {
                this.group.remove(this.existing.get(item.id));
                this.removed.set(item.id, item);
            } else {
                let existing = this.existing.get(item.id);
                if (!existing) {
                    existing = this.addItem(item, state, type);
                    console.log('existing created ', existing);
                }
                i.push([item, existing]);
            }
        }
        return i;
    }

    rotX = 0;
    rotY = 0;
    render(state) {
        this.state = state;
        this.rotX += 0.5;
        // this.rotY+=.5;

        this.addOrRemoveItem(state.bricks, state, 'brick');
        const gems = this.addOrRemoveItem(state.gems, state, 'gem');
        const shoots = this.addOrRemoveItem(state.shoots, state, 'shoot');
        const balls = this.addOrRemoveItem(state.balls, state, 'ball');

        console.log(gems);

        for (const [gem, mesh] of gems) {
            mesh.position.y = state.height - gem.y;
            mesh.rotateX(MathUtils.degToRad(this.rotX));
            mesh.rotateY(MathUtils.degToRad(this.rotY));
        }

        for (const [shoot, mesh] of shoots) {
            mesh.position.y = state.height - shoot.y;
        }

        for (const [ball, mesh] of balls) {
            mesh.position.y = state.height - ball.y;
            mesh.position.x = ball.x + ball.radius;
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

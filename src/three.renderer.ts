import {
    AmbientLight,
    BoxBufferGeometry,
    BoxGeometry,
    DoubleSide,
    EdgesGeometry,
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
    SphereGeometry,
    SpotLight,
    WebGLRenderer
} from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { Wall } from './objects/wall';

import { brickColors } from './types';

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
    ball: Mesh;
    bricks: Mesh[] = [];

    removed: Map<any, any> = new Map<any, any>();

    brickMap: Map<any, any> = new Map<any, any>();
    gemMap: Map<any, any> = new Map<any, any>();

    group: Group;

    init(canvas, width, height, state) {
        this.group = new Group();

        this.scene = new Scene();

        this.camera = new PerspectiveCamera(80, width / height, 0.1, 2000);

        this.renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(width, height);
        // document.body.appendChild(renderer.domElement)

        const ballGeometry: SphereGeometry = new SphereGeometry(10, 20, 20);
        const ballMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x0000ff
        });

        this.ball = new Mesh(ballGeometry, ballMaterial);
        this.group.add(this.ball);

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
            const brickGeometry: BoxBufferGeometry = new BoxBufferGeometry(
                brick.width,
                brick.height,
                30
            );
            const brickMaterial: MeshLambertMaterial = new MeshLambertMaterial({
                color: brickColors[brick.gemType]
            });

            const b = new Mesh(brickGeometry, brickMaterial);

            b.position.x = brick.x + brick.width / 2;
            b.position.y = state.height - (brick.y + brick.height / 2);
            addEdges(b, brickColors[brick.gemType]);
            this.group.add(b);
            this.brickMap.set(brick.id, b);
            this.bricks.push(b);
        }

        var geo = new PlaneBufferGeometry(width, height, 8, 8);
        var mat = new MeshBasicMaterial({
            color: 0x20639b,
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

        //this.scene.add(new AmbientLight(0xffffff, 0.5))
        //this.scene.add(new PointLight(0xffffff, 0.1))

        const controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        controls.enableZoom = true;

        const amb = new AmbientLight(0x444444);
        this.scene.add(amb);

        const light = new SpotLight(0xffffff);
        this.scene.add(light);
        light.position.set(state.width / 2, state.height / 2, 400);
        light.castShadow = false;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 2000;
        light.shadow.camera.fov = 20;

        this.camera.position.set(0, 0, 500.0);
        this.camera.lookAt(0, 0, 0.0);
        controls.update();

        this.scene.add(this.group);

        this.group.position.x = -state.width / 2;
        this.group.position.y = -state.height / 2;

        //this.scene.rotateX(40);
    }

    addGem(gem, state) {
        // const brickGeometry: BoxGeometry = new BoxGeometry(
        //     gem.width,
        //     gem.height,
        //     30
        // )

        const brickGeometry = new IcosahedronGeometry(16);
        const brickMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: brickColors[gem.gemType]
        });

        const b = new Mesh(brickGeometry, brickMaterial);

        b.position.x = gem.x + gem.width / 2;
        b.position.y = state.height - gem.y;
        gem.rotY = 0;
        gem.rotX = 0;
        // addEdges(b)
        this.group.add(b);
        this.gemMap.set(gem.id, b);
    }

    rotX = 0;
    rotY = 0;
    render(state) {
        this.rotX += 0.5;
        // this.rotY+=.5;
        for (const brick of state.bricks) {
            if (brick.hit && !this.removed.has(brick.id)) {
                this.group.remove(this.brickMap.get(brick.id));
                this.removed.set(brick.id, true);
            }
        }

        for (const gem of state.gems) {
            if (!this.gemMap.has(gem.id)) {
                this.addGem(gem, state);
            } else {
                const g = this.gemMap.get(gem.id);
                g.position.y = state.height - gem.y;
                g.rotateX(MathUtils.degToRad(this.rotX));
                g.rotateY(MathUtils.degToRad(this.rotY));
            }

            if ((gem.out || gem.used) && !this.removed.has(gem.id)) {
                console.log('remove gem!');
                this.group.remove(this.gemMap.get(gem.id));
                this.removed.set(gem.id, gem);
            }
        }

        this.paddle.position.x = state.paddle.x + state.paddle.width / 2;
        this.paddle.position.y = state.height - state.paddle.y;
        this.ball.position.y = state.height - state.ball.y;
        this.ball.position.x = state.ball.x + state.ball.radius;
        this.renderer.render(this.scene, this.camera);
    }
}

const r = new ThreeRenderer();

let isInited = false;

export function render(canvas, brickColors, d) {
    if (!isInited) {
        r.init(canvas, d.width, d.height, d);
        isInited = true;
        //r.render(d)
    } else {
        r.render(d);
    }
}
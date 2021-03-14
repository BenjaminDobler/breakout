import {
    AmbientLight,
    BoxGeometry,
    DoubleSide,
    EdgesGeometry,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PointLight,
    Scene,
    SphereGeometry,
    WebGLRenderer,
} from 'three'
import { brickColors } from './types'

function addEdges(b) {
    var edgegeo = new EdgesGeometry(b.geometry)
    var mat = new LineBasicMaterial({ color: 0x000000, linewidth: 4 })
    var wireframe = new LineSegments(edgegeo, mat)
    wireframe.renderOrder = 1 // make sure wireframes are rendered 2nd
    b.add(wireframe)
}

class ThreeRenderer {
    scene: Scene
    camera: PerspectiveCamera
    renderer: WebGLRenderer
    paddle: Mesh
    ball: Mesh
    bricks: Mesh[] = []

    removed: Map<any, any> = new Map<any, any>()

    brickMap: Map<any, any> = new Map<any, any>()
    gemMap: Map<any, any> = new Map<any, any>()

    init(canvas, width, height, state) {
        this.scene = new Scene()

        this.camera = new PerspectiveCamera(100, width / height, 0.1, 2000)

        this.renderer = new WebGLRenderer({ canvas: canvas })
        this.renderer.setSize(width, height)
        // document.body.appendChild(renderer.domElement)

        const ballGeometry: SphereGeometry = new SphereGeometry(10, 20, 20)
        const ballMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x0000ff,
        })

        this.ball = new Mesh(ballGeometry, ballMaterial)
        this.scene.add(this.ball)

        const geometry: BoxGeometry = new BoxGeometry(
            state.paddle.width,
            state.paddle.height,
            30
        )
        const material: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x00ff00,
        })

        this.paddle = new Mesh(geometry, material)
        addEdges(this.paddle)
        this.scene.add(this.paddle)

        for (const brick of state.bricks) {
            const brickGeometry: BoxGeometry = new BoxGeometry(
                brick.width,
                brick.height,
                30
            )
            const brickMaterial: MeshLambertMaterial = new MeshLambertMaterial({
                color: brickColors[brick.gemType],
            })

            const b = new Mesh(brickGeometry, brickMaterial)

            b.position.x = brick.x + brick.width / 2;
            b.position.y = state.height - brick.y
            addEdges(b)
            this.scene.add(b)
            this.brickMap.set(brick.id, b)
            this.bricks.push(b)
        }

        var geo = new PlaneBufferGeometry(width, height, 8, 8)
        var mat = new MeshBasicMaterial({
            color: 0xffffff,
            side: DoubleSide,
        })
        var plane = new Mesh(geo, mat)
        plane.position.z = -30
        plane.position.x = state.width / 2
        plane.position.y = state.height / 2
        this.scene.add(plane)

        var geoSide = new PlaneBufferGeometry(100, height, 8, 8)

        var left = new Mesh(geoSide, mat)
        left.position.z = -30
        left.position.x = 0
        left.position.y = state.height / 2

        left.rotateY(90)
        addEdges(left)

        this.scene.add(left)

        var right = new Mesh(geoSide, mat)
        right.position.z = -30
        right.position.x = state.width
        right.position.y = state.height / 2

        right.rotateY(90)
        addEdges(right)

        this.scene.add(right)

        this.scene.add(plane)

        this.scene.add(new AmbientLight(0xffffff, 0.5))
        this.scene.add(new PointLight(0xffffff, 0.1))

        this.camera.position.set(state.width / 2, state.height / 2, 300.0)
        this.camera.lookAt(state.width / 2, state.height / 2, 0.0)

        // this.scene.rotateX(40);
    }

    addGem(gem, state) {
        const brickGeometry: BoxGeometry = new BoxGeometry(
            gem.width,
            gem.height,
            30
        )
        const brickMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: brickColors[gem.gemType],
        })

        const b = new Mesh(brickGeometry, brickMaterial)

        b.position.x = gem.x
        b.position.y = state.height - gem.y
        addEdges(b)
        this.scene.add(b)
        this.gemMap.set(gem.id, b)
    }

    render(state) {
        for (const brick of state.bricks) {
            if (brick.hit && !this.removed.has(brick.id)) {
                this.scene.remove(this.brickMap.get(brick.id))
                this.removed.set(brick.id, true)
            }
        }

        for (const gem of state.gems) {
            if (!this.gemMap.has(gem.id)) {
                this.addGem(gem, state)
            } else {
                const g = this.gemMap.get(gem.id)
                g.position.y = state.height - gem.y
            }

            if (gem.out && !this.removed.has(gem.id)) {
                this.scene.remove(this.gemMap.get(gem.id))
                this.removed.set(gem.id, gem)
            }
        }

        this.paddle.position.x = state.paddle.x + state.paddle.width / 2;
        this.paddle.position.y = state.height - state.paddle.y
        this.ball.position.y = state.height - state.ball.y
        this.ball.position.x = state.ball.x + state.ball.radius;
        this.renderer.render(this.scene, this.camera)
    }
}

const r = new ThreeRenderer()

let isInited = false

export function render(canvas, brickColors, d) {
    if (!isInited) {
        r.init(canvas, d.width, d.height, d)
        isInited = true
    } else {
        r.render(d)
    }
}

import {
    AmbientLight,
    BoxGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PerspectiveCamera,
    PointLight,
    Scene,
    SphereGeometry,
    WebGLRenderer,
} from 'three'

class ThreeRenderer {
    scene: Scene
    camera: PerspectiveCamera
    renderer: WebGLRenderer
    paddle: Mesh
    ball: Mesh
    bricks: Mesh[] = []

    init(canvas, width, height, state) {
        this.scene = new Scene()

        this.camera = new PerspectiveCamera(75, width / height, 0.1, 2000)

        this.renderer = new WebGLRenderer({ canvas: canvas })
        this.renderer.setSize(width, height)
        // document.body.appendChild(renderer.domElement)

        const ballGeometry: SphereGeometry = new SphereGeometry(20, 20, 20)
        const ballMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x0000ff,
        })

        this.ball = new Mesh(ballGeometry, ballMaterial)
        this.scene.add(this.ball)

        const geometry: BoxGeometry = new BoxGeometry(
            state.paddle.width,
            state.paddle.height,
            10
        )
        const material: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x00ff00
        })

        this.paddle = new Mesh(geometry, material)
        this.scene.add(this.paddle)

        for (const brick of state.bricks) {
            const brickGeometry: BoxGeometry = new BoxGeometry(
                brick.width,
                brick.height,
                10
            )
            const brickMaterial: MeshLambertMaterial = new MeshLambertMaterial({
                color: 0xff0000,
                // wireframe: true,
            })

            const b = new Mesh(brickGeometry, brickMaterial)
            b.position.x = brick.x
            b.position.y = state.height - brick.y
            this.scene.add(b)
            this.bricks.push(b)
        }

        this.scene.add(new AmbientLight(0xffffff, 0.5))
        this.scene.add(new PointLight(0xffffff, 0.5))

        //this.camera.position.z = 800
        this.camera.position.set(0, 0.0, 800.0)
        // this.camera.lookAt(0.0, 0.0, 0.0);

        // var animate = function () {
        //     requestAnimationFrame(animate)

        //     cube.rotation.x += 0.01
        //     cube.rotation.y += 0.01

        //     renderer.render(scene, camera)
        // }
    }

    render(state) {
        console.log('render')

        // state.bricks.forEach((brick, i)=>{
        //     this.bricks[i].position.x = brick.x;
        //     this.bricks[i].position.y = state.height - brick.y;
        // })
        this.paddle.position.x = state.paddle.x
        this.paddle.position.y = state.height - state.paddle.y
        this.ball.position.y = state.height - state.ball.y
        this.ball.position.x = state.ball.x

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

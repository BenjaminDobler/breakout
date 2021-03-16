import { BoxBufferGeometry, Mesh, MeshStandardMaterial, Object3D } from "three";


export class Wall extends Object3D {
    constructor(private width) {
        super()
    
        const geometry = new BoxBufferGeometry(width, 20, 30, 10)
        const material = new MeshStandardMaterial({
          color: 0x515151
        })
        const mesh = new Mesh(geometry, material)
    
        this.add(mesh)
      }


}
import {
    EdgesGeometry,
    ExtrudeBufferGeometry,
    LineBasicMaterial,
    LineSegments,
    Shape
} from 'three';

export function createBoxWithRoundedEdges(
    width,
    height,
    depth,
    radius0,
    smoothness
) {
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

export function addEdges(b, color = 0xdedede) {
    var edgegeo = new EdgesGeometry(b.geometry);
    var mat = new LineBasicMaterial({ color: color, linewidth: 4 });
    var wireframe = new LineSegments(edgegeo, mat);
    wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
    b.add(wireframe);
}

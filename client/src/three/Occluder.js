import * as THREE from 'three';

export class Occluder {
  constructor(parent) {
    this.group = new THREE.Group();
    parent.add(this.group);
    const geo = new THREE.CylinderGeometry(1, 1, 1, 32, 1, true);
    const mat = new THREE.MeshBasicMaterial({ colorWrite: false });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.renderOrder = -1;
    this.group.add(this.mesh);
    this.enabled = true;
  }

  /**
   * @param {{radius:number,height:number,y:number,enabled?:boolean}} p
   */
  update(p) {
    this.enabled = p.enabled !== false;
    this.group.visible = this.enabled;
    const radius = Math.max(0.01, Math.abs(p.radius||1));
    const height = Math.max(0.01, Math.abs(p.height||1));
    this.mesh.scale.set(radius, height, radius);
    this.group.position.set(0, (p.y||0), 0);
  }
}



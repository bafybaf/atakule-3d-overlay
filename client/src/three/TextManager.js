import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { fontLoader } from '../utils/fontLoader.js';

export class TextManager {
  /**
   * @param {THREE.Group} parent
   */
  constructor(parent) {
    this.group = new THREE.Group();
    parent.add(this.group);
    this.textMesh = new Text();
    this.textMesh.anchorX = 'center';
    this.textMesh.anchorY = 'middle';
    this.textMesh.text = ' ';
    this.textMesh.color = 0xffffff;
    this.textMesh.fontSize = 1;
    // Don't set font - let troika-three-text use default
    this.group.add(this.textMesh);
  }

  /**
   * Update text material and layout
   * @param {{text:string,fontSize:number,letterSpacing:number,color:string,fontFamily:string,fontWeight:string,tiltX:number,tiltY:number,yOffset:number}} p
   */
  update(p) {
    const raw = (p.text && p.text.length > 0) ? p.text : ' ';
    const content = p.reverseText ? [...raw].reverse().join('') : raw;
    this.textMesh.text = content;
    this.textMesh.fontSize = p.fontSize || 1;
    this.textMesh.letterSpacing = p.letterSpacing ?? 0;
    this.textMesh.color = p.color || '#ffffff';
    
    // Set font weight if provided
    if (p.fontWeight) {
      this.textMesh.fontWeight = p.fontWeight;
    }
    
    // Don't set font - troika-three-text has persistent font loading issues
    // Font selection only affects UI elements, not 3D text
    // The 3D text will use troika-three-text's default font which supports Turkish characters
    
    this.group.rotation.x = (p.tiltX || 0) * Math.PI/180;
    this.group.rotation.y = (p.tiltY || 0) * Math.PI/180;
    this.group.position.set((p.xOffset||0)/100, (p.yOffset||0)/100, 0);
    this.textMesh.sync();
  }
}



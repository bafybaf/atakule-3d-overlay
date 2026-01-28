import * as THREE from 'three';
import { Text } from 'troika-three-text';

export class CircularText {
  constructor(parent) {
    this.group = new THREE.Group();
    parent.add(this.group);
    this.chars = [];
  }

  /**
   * @param {{text:string,color:string,fontSize:number,letterSpacing:number,fontFamily:string,fontWeight:string,radius:number,faceOutward?:boolean,frontHalfOnly?:boolean,tiltX?:number,tiltY?:number,xOffset?:number,yOffset?:number,rotationY?:number}} p
   */
  update(p) {
    const raw = (p.text && p.text.length > 0) ? p.text : ' ';
    const text = p.reverseText ? [...raw].reverse().join('') : raw;
    
    // Emoji'leri doğru şekilde parse et (Unicode surrogate pair desteği)
    // Spread operator emoji'leri doğru şekilde ayırır
    const chars = [...text]; // Emoji'leri doğru parse eder
    const total = chars.length;
    
    // Allow negative radius to invert circle direction; clamp tiny values
    let radius = (typeof p.radius === 'number') ? p.radius : 4;
    if (Math.abs(radius) < 0.001) radius = radius >= 0 ? 0.001 : -0.001;
    const fontSize = p.fontSize || 1;
    
    // Apply tilt and rotation to the group
    this.group.rotation.x = (p.tiltX || 0) * Math.PI/180;
    this.group.rotation.y = (p.rotationY !== undefined ? p.rotationY : (p.tiltY || 0) * Math.PI/180);
    this.group.position.set((p.xOffset||0)/100, (p.yOffset||0)/100, 0);
    
    // allocate meshes
    while (this.chars.length < total) {
      const t = new Text();
      t.anchorX = 'center';
      t.anchorY = 'middle';
      t.text = ' ';
      this.group.add(t);
      this.chars.push(t);
    }
    while (this.chars.length > total) {
      const t = this.chars.pop();
      this.group.remove(t);
    }
    
    const spacing = p.letterSpacing ?? 0;
    const step = (Math.PI * 2) / Math.max(1, total + spacing * total);
    const up = new THREE.Vector3(0,1,0);
    const center = new THREE.Vector3(0,0,0);
    const mat = new THREE.Matrix4();
    
    // Mavi kalp emojisi
    const blueHeart = '💙';
    
    for (let i=0;i<total;i++) {
      const angle = i * step;
      const t = this.chars[i];
      const char = chars[i]; // Spread operator ile doğru parse edilmiş karakter
      
      // Mavi kalp emojisini tespit et
      const isBlueHeart = char === blueHeart;
      
      t.text = char;
      t.fontSize = fontSize;
      
      // Mavi kalp emojisini tespit et ve mavi renk ver
      if (isBlueHeart) {
        t.color = '#4A90E2'; // Mavi renk
        // Emoji render için özel ayar yok - troika-three-text varsayılan font ile emoji'leri destekler
        // Emoji'lerin görünmesi için fontSize'u biraz artırabiliriz
        t.fontSize = fontSize * 1.2; // Emoji için biraz daha büyük
      } else {
        t.color = p.color || '#ffffff';
      }
      
      // Set font weight if provided
      if (p.fontWeight) {
        t.fontWeight = p.fontWeight;
      }
      
      // Don't set font - troika-three-text has persistent font loading issues
      // Font selection only affects UI elements, not 3D text
      // The 3D text will use troika-three-text's default font which supports Turkish characters and emojis
      
      t.position.set(Math.cos(angle)*radius, 0, Math.sin(angle)*radius);
      // absolute orientation using lookAt matrix (prevents self spinning)
      mat.lookAt(t.position, center, up);
      t.quaternion.setFromRotationMatrix(mat);
      if (p.faceOutward) {
        t.rotateY(Math.PI);
      }
      t.sync();
    }

    // Show only front-facing half relative to camera at +Z
    if (p.frontHalfOnly) {
      this.group.updateMatrixWorld(true);
      const wp = new THREE.Vector3();
      for (let i=0;i<total;i++) {
        const t = this.chars[i];
        t.getWorldPosition(wp);
        t.visible = wp.z > 0; // in front of origin towards camera
      }
    } else {
      for (let i=0;i<total;i++) this.chars[i].visible = true;
    }
  }
}



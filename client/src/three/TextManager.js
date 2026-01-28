import * as THREE from 'three';
import { Text } from 'troika-three-text';

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
    
    // Mavi kalp emojisini (💙) tespit et - emoji'yi doğru şekilde kontrol et
    const blueHeart = '💙';
    // Emoji'yi spread operator ile parse et ve kontrol et
    const contentChars = [...content];
    const hasBlueHeart = contentChars.includes(blueHeart);
    
    if (!hasBlueHeart) {
      // Kalp yok, normal render
      this.textMesh.text = content;
      this.textMesh.fontSize = p.fontSize || 1;
      this.textMesh.letterSpacing = p.letterSpacing ?? 0;
      this.textMesh.color = p.color || '#ffffff';
      
      // Eski ekstra mesh'leri temizle
      while (this.group.children.length > 1) {
        const child = this.group.children[1];
        this.group.remove(child);
        if (child.dispose) child.dispose();
      }
      
      if (p.fontWeight) {
        this.textMesh.fontWeight = p.fontWeight;
      }
      
      this.group.rotation.x = (p.tiltX || 0) * Math.PI/180;
      this.group.rotation.y = (p.tiltY || 0) * Math.PI/180;
      this.group.position.set((p.xOffset||0)/100, (p.yOffset||0)/100, 0);
      this.textMesh.sync();
      return;
    }
    
    // Kalp var, her karakter için ayrı mesh oluştur - sabit harf aralığı için
    const fontSize = p.fontSize || 1;
    const letterSpacing = p.letterSpacing ?? 0;
    const baseColor = p.color || '#ffffff';
    const blueColor = '#4A90E2'; // Mavi renk
    
    // Eski ekstra mesh'leri temizle
    while (this.group.children.length > 1) {
      const child = this.group.children[1];
      this.group.remove(child);
      if (child.dispose) child.dispose();
    }
    
    // Her karakter için ayrı mesh oluştur
    const meshes = [];
    let currentX = 0;
    // Sabit karakter aralığı - isim uzunluğundan bağımsız, letterSpacing'i yok say
    const charSpacing = fontSize * 0.45; // Her karakter için sabit genişlik (daha sıkı aralık)
    
    // Her karakter için mesh oluştur
    for (let i = 0; i < contentChars.length; i++) {
      const char = contentChars[i];
      const isBlueHeart = char === blueHeart;
      
      const charMesh = i === 0 ? this.textMesh : new Text();
      if (i > 0) {
        charMesh.anchorX = 'left';
        charMesh.anchorY = 'middle';
        this.group.add(charMesh);
      } else {
        charMesh.anchorX = 'left';
        charMesh.anchorY = 'middle';
      }
      
      charMesh.text = char;
      
      if (isBlueHeart) {
        // Kalp emojisi için özel ayarlar
        charMesh.fontSize = fontSize * 1.8; // Daha küçük kalp
        charMesh.letterSpacing = 0;
        charMesh.color = blueColor;
        charMesh.outlineWidth = '3%';
        charMesh.outlineColor = blueColor;
        // Kalp için genişlik - diğer karakterlerle aynı aralık
        charMesh.position.x = currentX;
        charMesh.position.y = 0;
        charMesh.position.z = 0;
        currentX += charSpacing; // Diğer karakterlerle aynı aralık
      } else {
        // Normal karakter için
        charMesh.fontSize = fontSize;
        charMesh.letterSpacing = 0; // letterSpacing'i manuel pozisyonlama ile yapıyoruz
        charMesh.color = baseColor;
        if (p.fontWeight) {
          charMesh.fontWeight = p.fontWeight;
        }
        // Her karakter için sabit genişlik
        charMesh.position.x = currentX;
        charMesh.position.y = 0;
        charMesh.position.z = 0;
        currentX += charSpacing;
      }
      
      meshes.push(charMesh);
    }
    
    // Tüm mesh'leri merkeze hizala
    const totalWidth = currentX - charSpacing; // Son karakterden sonra boşluk yok
    const offsetX = -totalWidth / 2;
    meshes.forEach(mesh => {
      mesh.position.x += offsetX;
    });
    
    // Grup rotasyon ve pozisyon
    this.group.rotation.x = (p.tiltX || 0) * Math.PI/180;
    this.group.rotation.y = (p.tiltY || 0) * Math.PI/180;
    this.group.position.set((p.xOffset||0)/100, (p.yOffset||0)/100, 0);
    
    // Tüm mesh'leri sync et
    meshes.forEach(mesh => {
      mesh.sync();
    });
  }
}



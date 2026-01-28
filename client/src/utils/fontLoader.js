// Font loading utility for troika-three-text
export class FontLoader {
  constructor() {
    this.loadedFonts = new Set();
    this.loadingPromises = new Map();
  }

  // Load a font and ensure it's available for troika-three-text
  async loadFont(fontFamily) {
    if (this.loadedFonts.has(fontFamily)) {
      return fontFamily;
    }

    if (this.loadingPromises.has(fontFamily)) {
      return this.loadingPromises.get(fontFamily);
    }

    const promise = this._loadFont(fontFamily);
    this.loadingPromises.set(fontFamily, promise);
    
    try {
      const result = await promise;
      this.loadedFonts.add(fontFamily);
      return result;
    } catch (error) {
      console.warn(`Failed to load font ${fontFamily}, falling back to Arial:`, error);
      return 'Arial';
    }
  }

  async _loadFont(fontFamily) {
    return new Promise((resolve, reject) => {
      // Check if font is already loaded in the browser
      if (document.fonts && document.fonts.check(`16px "${fontFamily}"`)) {
        resolve(fontFamily);
        return;
      }

      // Load font using CSS Font Loading API
      if (document.fonts) {
        document.fonts.load(`16px "${fontFamily}"`).then(() => {
          resolve(fontFamily);
        }).catch(() => {
          reject(new Error(`Font ${fontFamily} not available`));
        });
      } else {
        // Fallback for older browsers
        const testElement = document.createElement('div');
        testElement.style.fontFamily = fontFamily;
        testElement.style.fontSize = '16px';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.textContent = 'Test';
        document.body.appendChild(testElement);
        
        // Check if font loaded by comparing computed styles
        const computedStyle = window.getComputedStyle(testElement);
        const fontFamilyLoaded = computedStyle.fontFamily.includes(fontFamily);
        
        document.body.removeChild(testElement);
        
        if (fontFamilyLoaded) {
          resolve(fontFamily);
        } else {
          reject(new Error(`Font ${fontFamily} not available`));
        }
      }
    });
  }

  // Preload common fonts
  async preloadCommonFonts() {
    const commonFonts = [
      'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
      'Source Sans Pro', 'Oswald', 'Playfair Display', 'Merriweather', 'PT Sans'
    ];

    const loadPromises = commonFonts.map(font => this.loadFont(font));
    await Promise.allSettled(loadPromises);
  }
}

// Singleton instance
export const fontLoader = new FontLoader();

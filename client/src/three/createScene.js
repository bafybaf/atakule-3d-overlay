import * as THREE from 'three';

/**
 * Initialize Three.js scene with transparent background and lights
 * @param {HTMLCanvasElement} canvas
 * @param {{width:number,height:number}} size
 */
export function createScene(canvas, size) {
  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: false,
    alpha: true, 
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
    powerPreference: "default",
    stencil: false,
    depth: true,
    logarithmicDepthBuffer: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(size.width, size.height, false);
  
  // Sadece 3D yazı için şeffaf arka plan
  renderer.setClearColor(0x000000, 0.0); // Şeffaf arka plan
  renderer.autoClear = true; // Otomatik temizleme
  
  function render() {
    // Şeffaf arka plan için özel render
    renderer.clear(true, true, true); // Color, depth, stencil temizle
    renderer.render(scene, camera);
  }
  
  // WebGL context'i al ve şeffaflık ayarları
  const gl = renderer.getContext();
  
  // Şeffaflık için WebGL ayarları
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(35, size.width / size.height, 0.1, 100);
  camera.position.set(0, 0, 10);
  
  // Video plane kaldırıldı - sadece 3D yazı

  // Şeffaf arka plan - video plane yok

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(2, 4, 5);
  scene.add(ambient, dir);

  const root = new THREE.Group();
  scene.add(root);

  function resize(w, h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function getViewSizeAtZ(z = 0) {
    const dist = Math.max(0.001, camera.position.z - z);
    const vFov = (camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFov / 2) * dist;
    const width = height * camera.aspect;
    return { width, height };
  }

  // 🎬 VIDEO OVERLAY SETUP FONKSİYONU
  function setupVideoOverlay(videoElementId = 'background-video') {
    const video = document.getElementById(videoElementId);
    
    if (!video) {
      console.warn(`Video element with id '${videoElementId}' not found`);
      return false;
    }

    // Canvas'ı video üzerine konumlandır
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none'; // Mouse olaylarını video'ya geçir
    canvas.style.zIndex = '10';
    canvas.style.background = 'transparent'; // Ekstra şeffaflık
    
    // Video ayarları
    video.style.position = 'relative';
    video.style.zIndex = '1';
    video.style.display = 'block';

    console.log('✅ Video overlay setup completed');
    return true;
  }

  // 🎯 RESPONSIVE VIDEO OVERLAY
  function setupResponsiveVideoOverlay(videoElementId = 'background-video', containerSelector = null) {
    const video = document.getElementById(videoElementId);
    const container = containerSelector ? document.querySelector(containerSelector) : video?.parentElement;
    
    if (!video || !container) {
      console.warn('Video or container not found for responsive overlay');
      return false;
    }

    // Container ayarları
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    // Video ayarları
    video.style.position = 'absolute';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.zIndex = '1';

    // Canvas overlay ayarları
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    canvas.style.background = 'transparent';

    // Resize listener
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        resize(width, height);
      }
    });

    resizeObserver.observe(container);

    console.log('✅ Responsive video overlay setup completed');
    return { cleanup: () => resizeObserver.disconnect() };
  }

  // 🎨 CANVAS STYLE HELPER
  function setCanvasStyles(styles = {}) {
    const defaultStyles = {
      position: 'absolute',
      top: '0',
      left: '0',
      pointerEvents: 'none',
      zIndex: '10',
      background: 'transparent'
    };

    const finalStyles = { ...defaultStyles, ...styles };
    
    Object.assign(canvas.style, finalStyles);
  }

  // 🎬 COMPOSITE CANVAS RENDERING
  const exportCanvas = document.createElement('canvas');
  const exportCtx = exportCanvas.getContext('2d');
  exportCanvas.width = size.width;
  exportCanvas.height = size.height;

  // Export renderer (şeffaf)
  const exportRenderer = new THREE.WebGLRenderer({
    canvas: document.createElement('canvas'),
    alpha: true,
    preserveDrawingBuffer: true,
    antialias: false
  });
  exportRenderer.setSize(size.width, size.height);
  exportRenderer.setClearColor(0x000000, 0.0);
  exportRenderer.setClearAlpha(0.0);

  // Composite frame capture fonksiyonu
  function captureCompositeFrame(videoElement) {
    if (!videoElement) {
      console.warn('Video element not found for composite rendering');
      return exportCanvas;
    }
    
    // Video readyState kontrolü - daha esnek
    if (videoElement.readyState < 1) {
      console.warn('Video not ready for composite rendering, readyState:', videoElement.readyState);
      return exportCanvas;
    }

    // 1. Export canvas'ı temizle
    exportCtx.clearRect(0, 0, size.width, size.height);
    
    // 2. Video frame'i çiz (arka plan)
    exportCtx.drawImage(videoElement, 0, 0, size.width, size.height);
    
    // 3. Three.js scene'i export renderer'a render et
    exportRenderer.render(scene, camera);
    
    // 4. Three.js render'ı composite canvas'a ekle
    exportCtx.globalCompositeOperation = 'source-over';
    exportCtx.drawImage(exportRenderer.domElement, 0, 0);
    
    return exportCanvas;
  }

  // Video + Three.js composite renderer
  function createCompositeRenderer(videoElement) {
    return {
      captureFrame: () => captureCompositeFrame(videoElement),
      canvas: exportCanvas,
      renderer: exportRenderer
    };
  }

  return { 
    renderer, 
    scene, 
    camera, 
    root, 
    resize, 
    render, 
    getViewSizeAtZ,
    setupVideoOverlay,           // ✅ Video overlay setup
    setupResponsiveVideoOverlay, // ✅ Responsive version
    setCanvasStyles,             // ✅ Style helper
    // 🎬 Composite Rendering
    exportCanvas,
    exportRenderer,
    captureCompositeFrame,
    createCompositeRenderer
  };
}


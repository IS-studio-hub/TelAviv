import * as THREE from 'three';

function makeCanvas(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawPalmIcon(ctx, x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 70);
  ctx.quadraticCurveTo(-6, 20, 0, -10);
  ctx.stroke();
  for (let i = 0; i < 7; i += 1) {
    const angle = -Math.PI / 2 + (i - 3) * 0.38;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(
      Math.cos(angle) * 18,
      -28 + Math.sin(angle) * 6,
      Math.cos(angle) * 46,
      -8 + Math.sin(angle) * 36
    );
    ctx.stroke();
  }
  ctx.restore();
}

export function createTextures() {
  const stucco = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#efd3a6';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i += 1) {
      const shade = 200 + Math.random() * 40;
      ctx.fillStyle = `rgba(${shade}, ${shade - 30}, ${shade - 70}, 0.08)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  });
  stucco.wrapS = stucco.wrapT = THREE.RepeatWrapping;
  stucco.repeat.set(2, 2);

  const cobble = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#8d6a4e';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(60, 40, 28, 0.18)';
    ctx.lineWidth = 2;
    for (let y = 0; y < h; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y + (y % 56 === 0 ? 8 : 0));
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let i = 0; i < 400; i += 1) {
      ctx.fillStyle = `rgba(255, 220, 180, ${Math.random() * 0.07})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 6, 3);
    }
  });
  cobble.wrapS = cobble.wrapT = THREE.RepeatWrapping;
  cobble.repeat.set(8, 8);

  const curb = makeCanvas(256, 64, (ctx, w, h) => {
    const stripe = w / 8;
    for (let i = 0; i < 8; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? '#d94b3a' : '#f4efe6';
      ctx.fillRect(i * stripe, 0, stripe, h);
    }
  });
  curb.wrapS = THREE.RepeatWrapping;
  curb.repeat.set(18, 1);

  const windowWarm = makeCanvas(256, 256, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#f7d7a1');
    gradient.addColorStop(1, '#e8a45a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(90, 50, 20, 0.18)';
    ctx.fillRect(0, 0, w, 18);
    ctx.fillRect(w / 2 - 4, 0, 8, h);
    ctx.fillStyle = 'rgba(255, 240, 200, 0.35)';
    ctx.fillRect(18, 28, 70, 40);
  });

  const windowCool = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#6d8898';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(20, 30, 40, 0.25)';
    ctx.fillRect(w / 2 - 4, 0, 8, h);
    ctx.fillRect(0, h / 2 - 4, w, 8);
  });

  const palmLogo = makeCanvas(512, 640, (ctx, w, h) => {
    ctx.fillStyle = '#f3e6c6';
    roundRect(ctx, 24, 24, w - 48, h - 48, 90);
    ctx.fill();
    ctx.strokeStyle = '#2f6f62';
    ctx.lineWidth = 18;
    roundRect(ctx, 48, 48, w - 96, h - 96, 76);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.42, 118, 0, Math.PI * 2);
    ctx.stroke();
    drawPalmIcon(ctx, w / 2, h * 0.46, 1.7, '#2f6f62');
  });

  const brighter = makeCanvas(512, 768, (ctx, w, h) => {
    ctx.fillStyle = '#f7f0dc';
    roundRect(ctx, 10, 10, w - 20, h - 20, 18);
    ctx.fill();
    ctx.fillStyle = '#1c1710';
    ctx.font = '700 42px Outfit';
    ctx.textAlign = 'left';
    const lines = ['A', 'Brighter', 'Tel Aviv', 'Together'];
    lines.forEach((line, i) => ctx.fillText(line, 48, 140 + i * 70));
    ctx.strokeStyle = '#1c1710';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(48, h - 90);
    ctx.bezierCurveTo(120, h - 160, 220, h - 40, 300, h - 110);
    ctx.stroke();
  });

  const goodIdeas = makeCanvas(512, 640, (ctx, w, h) => {
    ctx.fillStyle = '#f4ead0';
    roundRect(ctx, 12, 12, w - 24, h - 24, 16);
    ctx.fill();
    ctx.fillStyle = '#1d3b34';
    ctx.font = '800 36px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('GOOD', w / 2, 150);
    ctx.fillText('IDEAS', w / 2, 200);
    ctx.fillText('BETTER', w / 2, 250);
    ctx.fillText('CITIES', w / 2, 300);
    ctx.strokeStyle = '#2f6f62';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(w / 2, 430, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, 418, 28, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2 - 40, 455);
    ctx.quadraticCurveTo(w / 2, 480, w / 2 + 40, 455);
    ctx.stroke();
  });

  const dizengoff = makeCanvas(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#dfe7ef';
    roundRect(ctx, 8, 8, w - 16, h - 16, 18);
    ctx.fill();
    ctx.strokeStyle = '#3a4d62';
    ctx.lineWidth = 10;
    roundRect(ctx, 22, 22, w - 44, h - 44, 12);
    ctx.stroke();
    ctx.fillStyle = '#243246';
    ctx.font = '700 48px Heebo';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText("רח' דיזנגוף", w / 2, 110);
    ctx.font = '600 28px Outfit';
    ctx.direction = 'ltr';
    ctx.fillText('DIZENGOFF St.', w / 2, 165);
  });

  const plaque = makeCanvas(1024, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#2a241c';
    ctx.font = '700 120px Heebo';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('תל אביב', w / 2, 210);
    ctx.font = '500 64px Outfit';
    ctx.direction = 'ltr';
    ctx.fillText('TEL AVIV', w / 2, 320);
  });

  const number = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#3a4a86';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#3a4a86';
    ctx.font = '700 72px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('23', w / 2, h / 2 + 4);
  });

  const leaf = makeCanvas(256, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#3f8a4c');
    gradient.addColorStop(1, '#1f5a32');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(w / 2, 10);
    ctx.quadraticCurveTo(w - 10, h * 0.4, w / 2, h - 8);
    ctx.quadraticCurveTo(10, h * 0.4, w / 2, 10);
    ctx.fill();
  });

  const cloud = makeCanvas(512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 252, 246, 0.92)';
    const blobs = [
      [180, 140, 70],
      [250, 120, 90],
      [330, 140, 74],
      [220, 160, 60],
      [300, 165, 55],
    ];
    blobs.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  const arrows = {
    projects: makeArrow('#c45c32', '#f7efe0', 'projects', 'right'),
    about: makeArrow('#f3e6c8', '#5a4630', 'about me', 'right'),
    articles: makeArrow('#f7f1de', '#5a4630', 'articles', 'left'),
    contact: makeArrow('#efe4c6', '#5a4630', 'contact', 'right'),
  };

  return {
    stucco,
    cobble,
    curb,
    windowWarm,
    windowCool,
    palmLogo,
    brighter,
    goodIdeas,
    dizengoff,
    plaque,
    number,
    leaf,
    cloud,
    arrows,
  };
}

function makeArrow(bg, fg, label, dir) {
  return makeCanvas(768, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bg;
    ctx.beginPath();
    if (dir === 'right') {
      ctx.moveTo(24, 28);
      ctx.lineTo(w - 110, 28);
      ctx.lineTo(w - 24, h / 2);
      ctx.lineTo(w - 110, h - 28);
      ctx.lineTo(24, h - 28);
    } else {
      ctx.moveTo(w - 24, 28);
      ctx.lineTo(110, 28);
      ctx.lineTo(24, h / 2);
      ctx.lineTo(110, h - 28);
      ctx.lineTo(w - 24, h - 28);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(40, 28, 16, 0.18)';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = fg;
    ctx.font = '600 72px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, w / 2, h / 2 + 4);
  });
}

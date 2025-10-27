// fireworks.js
export function launchFireworks(x, y) {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d");
  canvas.classList.remove("hidden");

  const particles = [];
  const colors = ["#ff4b4b", "#ffcc00", "#00ccff", "#33ff66", "#ff66cc"];
  const count = 20;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      angle: Math.random() * 2 * Math.PI,
      speed: Math.random() * 3 + 2,
      radius: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 60,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
  }

  function update() {
    particles.forEach((p) => {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.life--;
    });
  }

  function animate() {
    draw();
    update();
    if (particles.some((p) => p.life > 0)) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.add("hidden");
    }
  }

  animate();
}
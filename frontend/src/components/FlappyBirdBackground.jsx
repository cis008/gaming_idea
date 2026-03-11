import { useEffect, useRef } from "react";

// ── constants ──────────────────────────────────────────────────────────────
const PIPE_GAP = 160;   // vertical gap between top & bottom pipe
const PIPE_WIDTH = 52;
const PIPE_SPEED = 2.2;
const PIPE_EVERY = 240;   // pixels between pipe pairs
const BIRD_SIZE = 26;
const GRAVITY = 0.22;
const FLAP_FORCE = -4.8;

// Pokémon Emerald palette
const COL = {
    skyTop: "#c8e6c9",
    skyBot: "#e8f5e9",
    pipe: "#27ae60",
    pipeDark: "#1a7a42",
    pipeCap: "#2ecc71",
    bird: "#f1c40f",
    birdDark: "#d4ac0d",
    beak: "#e67e22",
    eye: "#2d3436",
    ground: "#27ae60",
    groundTop: "#2ecc71",
    cloud: "rgba(255,255,255,0.55)",
    star: "rgba(241,196,15,0.7)",
};

function drawPipe(ctx, x, gapY, cH) {
    const topH = gapY - PIPE_GAP / 2;
    const botY = gapY + PIPE_GAP / 2;
    const botH = cH - botY - 36; // leave ground height

    // top pipe body
    ctx.fillStyle = COL.pipe;
    ctx.fillRect(x, 0, PIPE_WIDTH, topH);
    // top pipe sheen
    ctx.fillStyle = COL.pipeDark;
    ctx.fillRect(x + PIPE_WIDTH - 10, 0, 10, topH);
    // top pipe cap
    ctx.fillStyle = COL.pipeCap;
    ctx.fillRect(x - 4, topH - 18, PIPE_WIDTH + 8, 18);
    ctx.fillStyle = COL.pipe;
    ctx.fillRect(x - 4 + PIPE_WIDTH - 8, topH - 18, 8, 18);

    // bottom pipe body
    ctx.fillStyle = COL.pipe;
    ctx.fillRect(x, botY, PIPE_WIDTH, botH);
    ctx.fillStyle = COL.pipeDark;
    ctx.fillRect(x + PIPE_WIDTH - 10, botY, 10, botH);
    // bottom pipe cap
    ctx.fillStyle = COL.pipeCap;
    ctx.fillRect(x - 4, botY, PIPE_WIDTH + 8, 18);
    ctx.fillStyle = COL.pipe;
    ctx.fillRect(x - 4 + PIPE_WIDTH - 8, botY, 8, 18);
}

function drawBird(ctx, x, y, wing) {
    // body
    ctx.fillStyle = COL.bird;
    ctx.beginPath();
    ctx.ellipse(x, y, BIRD_SIZE / 2, BIRD_SIZE / 2.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // belly
    ctx.fillStyle = COL.birdDark;
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 3, BIRD_SIZE / 3.5, BIRD_SIZE / 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // wing
    ctx.fillStyle = COL.birdDark;
    ctx.beginPath();
    const wy = wing ? y + 4 : y - 4;
    ctx.ellipse(x - 2, wy, BIRD_SIZE / 3.5, BIRD_SIZE / 5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // beak
    ctx.fillStyle = COL.beak;
    ctx.beginPath();
    ctx.moveTo(x + BIRD_SIZE / 2, y);
    ctx.lineTo(x + BIRD_SIZE / 2 + 8, y + 2);
    ctx.lineTo(x + BIRD_SIZE / 2, y + 5);
    ctx.closePath();
    ctx.fill();

    // eye
    ctx.fillStyle = COL.eye;
    ctx.beginPath();
    ctx.arc(x + 5, y - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // eye shine
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x + 6, y - 5, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawCloud(ctx, x, y, r) {
    ctx.fillStyle = COL.cloud;
    for (const [dx, dy, dr] of [[0, 0, r], [r * 0.7, -r * 0.3, r * 0.7], [r * 1.4, 0, r * 0.75], [-r * 0.5, r * 0.1, r * 0.6]]) {
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, dr, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGround(ctx, cW, cH, offset) {
    const GH = 36;
    ctx.fillStyle = COL.ground;
    ctx.fillRect(0, cH - GH, cW, GH);

    ctx.fillStyle = COL.groundTop;
    ctx.fillRect(0, cH - GH, cW, 6);

    // stripes
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    for (let i = 0; i < cW + 40; i += 40) {
        const sx = ((i - offset % 40) + cW) % (cW + 40) - 20;
        ctx.fillRect(sx, cH - GH + 10, 24, 6);
    }
}

// ── component ──────────────────────────────────────────────────────────────
function FlappyBirdBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // fit canvas to element
        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Auto-pilot bird uses a PD controller to steer through pipe centres
        let birdY = canvas.height * 0.45;
        let birdVY = 0;
        let wingTick = 0;
        let tick = 0;
        let groundOffset = 0;

        // Build cloud positions once
        const clouds = Array.from({ length: 6 }, (_, i) => ({
            x: (i / 6) * canvas.width * 1.5,
            y: 40 + Math.random() * canvas.height * 0.35,
            r: 28 + Math.random() * 22,
            speed: 0.4 + Math.random() * 0.4,
        }));

        // Pipes
        const pipes = Array.from({ length: 5 }, (_, i) => ({
            x: canvas.width + i * PIPE_EVERY + 80,
            gapY: canvas.height * 0.3 + Math.random() * canvas.height * 0.35,
        }));

        let rafId;

        const loop = () => {
            const cW = canvas.width;
            const cH = canvas.height;

            // ── sky gradient ──
            const grad = ctx.createLinearGradient(0, 0, 0, cH);
            grad.addColorStop(0, COL.skyTop);
            grad.addColorStop(1, COL.skyBot);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, cW, cH);

            // ── clouds ──
            for (const c of clouds) {
                drawCloud(ctx, c.x, c.y, c.r);
                c.x -= c.speed;
                if (c.x + c.r * 2.5 < 0) {
                    c.x = cW + c.r;
                    c.y = 40 + Math.random() * cH * 0.35;
                }
            }

            // ── pipes ──
            for (const p of pipes) {
                drawPipe(ctx, p.x, p.gapY, cH);
                p.x -= PIPE_SPEED;
                if (p.x + PIPE_WIDTH < 0) {
                    // recycle pipe
                    const last = pipes.reduce((a, b) => (b.x > a.x ? b : a));
                    p.x = last.x + PIPE_EVERY;
                    p.gapY = cH * 0.28 + Math.random() * cH * 0.38;
                }
            }

            // ── auto-pilot: find next pipe ahead of bird and steer to its gap centre ──
            const BIRD_X = cW * 0.22;
            const nextPipe = pipes
                .filter(p => p.x + PIPE_WIDTH > BIRD_X - 10)
                .sort((a, b) => a.x - b.x)[0];

            if (nextPipe) {
                const dy = birdY - nextPipe.gapY;
                // flap if bird is above target by enough velocity margin
                if (dy > -30 && birdVY > FLAP_FORCE * 0.3) {
                    birdVY += FLAP_FORCE * 0.55;
                }
            }

            birdVY += GRAVITY;
            birdY += birdVY;

            // clamp to stay on screen
            const maxY = cH - 36 - BIRD_SIZE;
            if (birdY < BIRD_SIZE) { birdY = BIRD_SIZE; birdVY = Math.abs(birdVY) * 0.5; }
            if (birdY > maxY) { birdY = maxY; birdVY = -2; }

            // ── bird ──
            wingTick++;
            drawBird(ctx, BIRD_X, birdY, wingTick % 18 < 9);

            // ── ground ──
            groundOffset += PIPE_SPEED;
            drawGround(ctx, cW, cH, groundOffset);

            tick++;
            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
                opacity: 1,
                pointerEvents: "none",
            }}
        />
    );
}

export default FlappyBirdBackground;

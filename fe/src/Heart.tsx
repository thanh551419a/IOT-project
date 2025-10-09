import React, { useEffect, useRef } from "react";

const Heart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    /*
     * Settings
     */
    const settings = {
      particles: {
        length: 2000, // maximum amount of particles
        duration: 2, // particle duration in sec
        velocity: 100, // particle velocity in pixels/sec
        effect: -1.3, // play with this for a nice effect
        size: 13, // particle size in pixels
      },
    };

    /*
     * Point class
     */
    class Point {
      x: number;
      y: number;

      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }

      clone() {
        return new Point(this.x, this.y);
      }

      // overload signatures
      length(): number;
      length(len: number): Point;
      length(len?: number): number | Point {
        if (len === undefined) {
          return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        this.normalize();
        this.x *= len;
        this.y *= len;
        return this;
      }

      normalize() {
        const len = this.length() as number;
        this.x /= len;
        this.y /= len;
        return this;
      }
    }

    /*
     * Particle class
     */
    class Particle {
      position: Point = new Point();
      velocity: Point = new Point();
      acceleration: Point = new Point();
      age = 0;

      initialize(x: number, y: number, dx: number, dy: number) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
      }

      update(deltaTime: number) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
      }

      draw(context: CanvasRenderingContext2D, image: HTMLImageElement) {
        function ease(t: number) {
          return (--t) * t * t + 1;
        }
        const size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(
          image,
          this.position.x - size / 2,
          this.position.y - size / 2,
          size,
          size
        );
      }
    }

    /*
     * ParticlePool class
     */
    class ParticlePool {
      particles: Particle[];
      firstActive = 0;
      firstFree = 0;
      duration = settings.particles.duration;

      constructor(length: number) {
        this.particles = new Array(length);
        for (let i = 0; i < this.particles.length; i++) {
          this.particles[i] = new Particle();
        }
      }

      add(x: number, y: number, dx: number, dy: number) {
        this.particles[this.firstFree].initialize(x, y, dx, dy);
        this.firstFree++;
        if (this.firstFree === this.particles.length) this.firstFree = 0;
        if (this.firstActive === this.firstFree) this.firstActive++;
        if (this.firstActive === this.particles.length) this.firstActive = 0;
      }

      update(deltaTime: number) {
        if (this.firstActive < this.firstFree) {
          for (let i = this.firstActive; i < this.firstFree; i++) {
            this.particles[i].update(deltaTime);
          }
        }
        if (this.firstFree < this.firstActive) {
          for (let i = this.firstActive; i < this.particles.length; i++) {
            this.particles[i].update(deltaTime);
          }
          for (let i = 0; i < this.firstFree; i++) {
            this.particles[i].update(deltaTime);
          }
        }

        while (
          this.particles[this.firstActive].age >= this.duration &&
          this.firstActive !== this.firstFree
        ) {
          this.firstActive++;
          if (this.firstActive === this.particles.length) this.firstActive = 0;
        }
      }

      draw(context: CanvasRenderingContext2D, image: HTMLImageElement) {
        if (this.firstActive < this.firstFree) {
          for (let i = this.firstActive; i < this.firstFree; i++) {
            this.particles[i].draw(context, image);
          }
        }
        if (this.firstFree < this.firstActive) {
          for (let i = this.firstActive; i < this.particles.length; i++) {
            this.particles[i].draw(context, image);
          }
          for (let i = 0; i < this.firstFree; i++) {
            this.particles[i].draw(context, image);
          }
        }
      }
    }

    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const particles = new ParticlePool(settings.particles.length);
    const particleRate =
      settings.particles.length / settings.particles.duration;
    let time: number;

    function pointOnHeart(t: number) {
      return new Point(
        160 * Math.pow(Math.sin(t), 3),
        130 * Math.cos(t) -
          50 * Math.cos(2 * t) -
          20 * Math.cos(3 * t) -
          10 * Math.cos(4 * t) +
          25
      );
    }

    const image = (() => {
      const c = document.createElement("canvas");
      const ctx = c.getContext("2d")!;
      c.width = settings.particles.size;
      c.height = settings.particles.size;

      function to(t: number) {
        const point = pointOnHeart(t);
        point.x =
          settings.particles.size / 2 +
          (point.x * settings.particles.size) / 350;
        point.y =
          settings.particles.size / 2 -
          (point.y * settings.particles.size) / 350;
        return point;
      }

      ctx.beginPath();
      let t = -Math.PI;
      let p = to(t);
      ctx.moveTo(p.x, p.y);
      while (t < Math.PI) {
        t += 0.01;
        p = to(t);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fillStyle = "#FF5CA4";
      ctx.fill();

      const img = new Image();
      img.src = c.toDataURL();
      return img;
    })();

    function render() {
      requestAnimationFrame(render);

      const newTime = new Date().getTime() / 1000;
      const deltaTime = newTime - (time || newTime);
      time = newTime;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const amount = particleRate * deltaTime;
      for (let i = 0; i < amount; i++) {
        const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
        const dir = pos.clone().length(settings.particles.velocity) as Point;
        particles.add(
          canvas.width / 2 + pos.x,
          canvas.height / 2 - pos.y,
          dir.x,
          -dir.y
        );
      }

      particles.update(deltaTime);
      particles.draw(context, image);
    }

    function onResize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    window.addEventListener("resize", onResize);
    setTimeout(() => {
      onResize();
      render();
    }, 10);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas
        id="pinkboard"
        ref={canvasRef}
        style={{
          position: "relative",
          width: "500px",
          height: "500px",
        }}
      />
      <div
        style={{
          backgroundColor: "black",
          width: "100%",
          color: "rgb(225, 12, 168)",
          fontSize: "31px",
          fontStyle: "italic",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        Anh Yêu Em
      </div>
    </div>
  );
};

export default Heart;

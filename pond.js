class Pond {
    constructor() {
        this.canvas = document.getElementById('pondCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.ripples = [];
        this.duck = { x: 200, y: this.height * 0.4, fleeing: false, floatOffset: 0 };
        this.waveOffset = 0;
        this.time = 0;
        
        this.reeds = Array(45).fill().map(() => ({
            x: Math.random() * this.width,
            y: this.height * (0.6 + Math.random() * 0.1),
            height: 60 + Math.random() * 80,
            sway: Math.random() * Math.PI * 2
        }));
        
        this.lilypads = Array(8).fill().map(() => ({
            x: Math.random() * this.width,
            y: this.height * (0.45 + Math.random() * 0.2),
            size: 15 + Math.random() * 20,
            rotation: Math.random() * Math.PI * 2
        }));
        
        // Add foreground rocks
        this.foregroundRocks = Array(8).fill().map(() => ({
            x: Math.random() * this.width,
            y: this.height * (0.85 + Math.random() * 0.15),
            size: 30 + Math.random() * 40,
            details: Array(5).fill().map(() => ({
                offset: {
                    x: (Math.random() - 0.5) * 20,
                    y: (Math.random() - 0.5) * 10
                },
                size: Math.random() * 0.6 + 0.4
            }))
        }));
        
        // Add underwater rocks
        this.underwaterRocks = Array(12).fill().map(() => ({
            x: Math.random() * this.width,
            y: this.height * (0.7 + Math.random() * 0.2),
            size: 20 + Math.random() * 30,
            opacity: Math.random() * 0.3 + 0.1
        }));
        
        // Far shore details
        this.farShore = {
            y: this.height * 0.4,
            points: Array(10).fill().map((_, i) => ({
                x: (this.width * i / 9),
                y: this.height * (0.4 + Math.sin(i * 0.8) * 0.02)
            }))
        };
        
        this.setupEventListeners();
        this.animate();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.addRipple(x, y);
            
            // Make duck flee if clicked near it
            const duckDistance = Math.hypot(x - this.duck.x, y - this.duck.y);
            if (duckDistance < 50) {
                this.duck.fleeing = true;
            }
        });
    }

    addRipple(x, y) {
        this.ripples.push({
            x,
            y,
            radius: 0,
            maxRadius: 50,
            speed: 2
        });
    }

    drawDuck(x, y, compression) {
        const floatOffset = Math.sin(this.time * 2) * 3;
        this.ctx.fillStyle = 'black';
        
        // Body
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + floatOffset, 18, 12 * compression, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Head and neck
        this.ctx.beginPath();
        this.ctx.ellipse(x + 15, y - 5 * compression + floatOffset, 10, 8 * compression, Math.PI / 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bill
        this.ctx.beginPath();
        this.ctx.ellipse(x + 24, y - 6 * compression + floatOffset, 6, 3 * compression, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }

    applyDithering(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const threshold = 127;

        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const oldPixel = data[idx];
                const newPixel = oldPixel < threshold ? 0 : 255;
                const error = oldPixel - newPixel;

                data[idx] = data[idx + 1] = data[idx + 2] = newPixel;

                // Floyd-Steinberg dithering
                if (x + 1 < width) 
                    data[idx + 4] += error * 7/16;
                if (y + 1 === imageData.height) continue;
                if (x > 0) 
                    data[idx + width * 4 - 4] += error * 3/16;
                data[idx + width * 4] += error * 5/16;
                if (x + 1 < width) 
                    data[idx + width * 4 + 4] += error * 1/16;
            }
        }
    }

    drawShoreline() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height * 0.2);
        this.ctx.lineTo(this.width, this.height * 0.4);
        this.ctx.lineTo(this.width, 0);
        this.ctx.lineTo(0, 0);
        this.ctx.fill();
    }

    drawRocks() {
        this.rocks.forEach(rock => {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.beginPath();
            
            // Create irregular rock shape
            const points = [];
            const segments = 12;
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const radius = rock.size * (1 + Math.sin(angle * 3) * rock.roughness);
                points.push({
                    x: rock.x + Math.cos(angle) * radius,
                    y: rock.y + Math.sin(angle) * radius * 0.5
                });
            }
            
            this.ctx.moveTo(points[0].x, points[0].y);
            points.forEach((point, i) => {
                const nextPoint = points[(i + 1) % points.length];
                const xc = (point.x + nextPoint.x) / 2;
                const yc = (point.y + nextPoint.y) / 2;
                this.ctx.quadraticCurveTo(point.x, point.y, xc, yc);
            });
            
            this.ctx.fill();
        });
    }

    drawReeds() {
        this.reeds.forEach(reed => {
            const swayAmount = Math.sin(this.time * 0.5 + reed.sway) * 3;
            
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.lineWidth = 1;
            
            // Draw main reed stalk with gentle curve
            this.ctx.beginPath();
            this.ctx.moveTo(reed.x, reed.y);
            
            // Control points for more natural curve
            const cp1x = reed.x + swayAmount * 0.5;
            const cp1y = reed.y - reed.height * 0.5;
            const cp2x = reed.x + swayAmount;
            const cp2y = reed.y - reed.height;
            
            this.ctx.bezierCurveTo(
                cp1x, cp1y,
                cp2x, cp2y,
                reed.x + swayAmount, reed.y - reed.height
            );
            this.ctx.stroke();
            
            // Draw fewer, more subtle reed leaves
            for (let i = 0; i < 2; i++) {
                const heightOffset = reed.height * (0.5 + i * 0.25);
                const leafLength = reed.height * 0.15;
                const angle = Math.PI * 0.7 + Math.sin(this.time * 0.3 + reed.sway + i) * 0.1;
                
                this.ctx.beginPath();
                this.ctx.moveTo(
                    reed.x + swayAmount * (heightOffset / reed.height),
                    reed.y - heightOffset
                );
                this.ctx.lineTo(
                    reed.x + swayAmount * (heightOffset / reed.height) + Math.cos(angle) * leafLength,
                    reed.y - heightOffset + Math.sin(angle) * leafLength
                );
                this.ctx.stroke();
            }
        });
    }

    drawWaves() {
        // Add depth gradient to water
        const waterGradient = this.ctx.createLinearGradient(0, this.height * 0.4, 0, this.height);
        waterGradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
        waterGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        this.ctx.fillStyle = waterGradient;
        this.ctx.fillRect(0, this.height * 0.4, this.width, this.height * 0.6);

        // Enhanced wave patterns
        for (let y = this.height * 0.4; y < this.height; y += 3) {
            const depth = (y - this.height * 0.4) / (this.height * 0.6);
            this.ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + depth * 0.15})`;
            this.ctx.beginPath();
            
            const compression = Math.pow(depth, 2) * 0.8;
            
            for (let x = 0; x < this.width; x += 1) {
                const waveHeight = 
                    Math.sin(x * 0.02 + y * 0.01 + this.waveOffset) * 3 * (1 - depth) +
                    Math.sin(x * 0.01 - y * 0.02 + this.waveOffset * 0.7) * 2 * (1 - depth) +
                    Math.sin(x * 0.03 + this.waveOffset * 1.3) * 1 * (1 - depth) +
                    Math.sin(x * 0.007 + y * 0.005 + this.waveOffset * 0.5) * 5 * (1 - depth);
                
                const yPos = y + waveHeight * compression;
                
                if (x === 0) {
                    this.ctx.moveTo(x, yPos);
                } else {
                    this.ctx.lineTo(x, yPos);
                }
            }
            this.ctx.stroke();
        }
    }

    drawLilypad(x, y, size, rotation) {
        const compression = Math.pow((y / this.height), 1.5) * 0.8;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation + Math.sin(this.time * 0.5) * 0.05);
        this.ctx.scale(1, compression);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size, size, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add leaf detail
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, size * (0.5 + i * 0.1), size * (0.5 + i * 0.1), 0, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    drawSky() {
        // Static night sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.7);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height * 0.7);
        
        // Add static stars
        for (let i = 0; i < 200; i++) {
            const x = (this.width * i / 200) + (Math.random() * 10 - 5);
            const y = Math.random() * this.height * 0.5;
            if (Math.random() > 0.5) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    drawUnderwaterRocks() {
        this.underwaterRocks.forEach(rock => {
            const gradient = this.ctx.createRadialGradient(
                rock.x, rock.y, 0,
                rock.x, rock.y, rock.size
            );
            gradient.addColorStop(0, `rgba(0, 0, 0, ${rock.opacity})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.ellipse(rock.x, rock.y, rock.size, rock.size * 0.6, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawFarShore() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        
        // Draw curved far shore
        this.ctx.moveTo(this.farShore.points[0].x, this.farShore.points[0].y);
        this.farShore.points.forEach((point, i) => {
            if (i < this.farShore.points.length - 1) {
                const xc = (point.x + this.farShore.points[i + 1].x) / 2;
                const yc = (point.y + this.farShore.points[i + 1].y) / 2;
                this.ctx.quadraticCurveTo(point.x, point.y, xc, yc);
            }
        });
        
        this.ctx.lineTo(this.width, 0);
        this.ctx.lineTo(0, 0);
        this.ctx.fill();
    }

    drawForegroundRocks() {
        this.foregroundRocks.forEach(rock => {
            // Main rock shape
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            this.ctx.beginPath();
            this.ctx.moveTo(rock.x, rock.y);
            
            // Create irregular rock shape with details
            const points = [];
            const segments = 15;
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI;
                const radius = rock.size * (0.8 + Math.sin(angle * 2) * 0.2);
                points.push({
                    x: rock.x + Math.cos(angle) * radius,
                    y: rock.y + Math.sin(angle) * radius * 0.5
                });
            }
            
            // Draw smooth rock outline
            this.ctx.moveTo(points[0].x, points[0].y);
            points.forEach((point, i) => {
                if (i < points.length - 1) {
                    const xc = (point.x + points[i + 1].x) / 2;
                    const yc = (point.y + points[i + 1].y) / 2;
                    this.ctx.quadraticCurveTo(point.x, point.y, xc, yc);
                }
            });
            
            this.ctx.fill();
            
            // Add rock details/texture
            rock.details.forEach(detail => {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.beginPath();
                this.ctx.ellipse(
                    rock.x + detail.offset.x,
                    rock.y + detail.offset.y,
                    rock.size * 0.2 * detail.size,
                    rock.size * 0.1 * detail.size,
                    Math.random() * Math.PI,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            });
        });
    }

    animate() {
        this.time += 0.02;
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawSky();
        this.drawFarShore();
        this.drawWaves();
        this.drawUnderwaterRocks();
        this.drawReeds();
        this.lilypads.forEach(pad => {
            this.drawLilypad(pad.x, pad.y, pad.size, pad.rotation);
        });
        this.drawForegroundRocks();

        // Update and draw ripples
        this.ripples.forEach((ripple, index) => {
            const compression = Math.pow((ripple.y / this.height), 1.5) * 0.8;
            this.ctx.strokeStyle = `rgba(0, 0, 0, ${0.5 * (1 - ripple.radius / ripple.maxRadius)})`;
            this.ctx.beginPath();
            this.ctx.ellipse(ripple.x, ripple.y, ripple.radius, ripple.radius * compression, 0, 0, Math.PI * 2);
            this.ctx.stroke();
            
            ripple.radius += ripple.speed;
            if (ripple.radius > ripple.maxRadius) {
                this.ripples.splice(index, 1);
            }
        });

        // Update duck
        if (this.duck.fleeing) {
            this.duck.x += 3;
            this.duck.y -= 1;
            if (this.duck.x > this.width + 50) {
                this.duck.fleeing = false;
                this.duck.x = -50;
                this.duck.y = 350;
            }
        }

        const duckCompression = Math.pow((this.duck.y / this.height), 1.5) * 0.8;
        this.drawDuck(this.duck.x, this.duck.y, duckCompression);

        // Apply dithering
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        this.applyDithering(imageData);
        this.ctx.putImageData(imageData, 0, 0);

        requestAnimationFrame(() => this.animate());
    }
}

new Pond(); 
// Variables globales
let cuerdas = []; // Array para almacenar las cuerdas
let notasMusicales = []; // Array para las notas musicales
let mensaje = "IMAGINA, SIENTE, CREA...";
let textoMostrado = "";
let indexTexto = 0;
let velocidadTexto = 5; // Cada 5 frames una nueva letra
let esperaFrames = 120; // Espera 120 frames después de terminar
let contadorEspera = 0;
let mostrandoTexto = true;

function setup() {
  // Creamos un canvas que ocupe todo el ancho de la ventana y con 500px de alto (200px más)
  let canvas = createCanvas(windowWidth, 500);
  canvas.parent('canvas-container'); // Asume que habrá un div con id 'canvas-container'
  canvas.style('display', 'block'); // Elimina espacios innecesarios
  canvas.style('margin', '0'); // Elimina márgenes
  
  // Configuración básica
  textAlign(CENTER, CENTER);
  textFont('Arial');
  background(15, 15, 25);
  
  // Crear cuerdas - aumentamos el número para llenar mejor el espacio vertical
  let numCuerdas = 25;
  for (let i = 0; i < numCuerdas; i++) {
    let y = map(i, 0, numCuerdas - 1, 30, height - 30);
    let amplitud = map(i, 0, numCuerdas - 1, 1, 4); // Amplitud ligeramente mayor
    let velocidad = map(i, 0, numCuerdas - 1, 0.01, 0.03);
    cuerdas.push(new Cuerda(y, amplitud, velocidad));
  }
  
  // Crear más notas musicales para llenar el espacio adicional
  for (let i = 0; i < 15; i++) { // Aumentado de 8 a 15
    let tipo = floor(random(4)); // 0:negra, 1:blanca, 2:corchea, 3:clave sol
    let x = random(width);
    let y = random(50, height - 50);
    let tamaño = random(20, 40);
    let velocidadX = random(-0.5, 0.5);
    let velocidadY = random(-0.5, 0.5);
    notasMusicales.push(new NotaMusical(x, y, tamaño, tipo, velocidadX, velocidadY));
  }
}

function draw() {
  // Fondo con efecto de gradiente suave
  background(15, 15, 25, 20); // Fondo semi-transparente para un efecto de estela
  fill(30, 30, 50, 80);
  noStroke();
  for (let i = 0; i < height; i += 20) {
    let alpha = map(i, 0, height, 150, 50);
    fill(15, 15, 25, alpha);
    rect(0, i, width, 20);
  }
  
  // Dibujamos las cuerdas
  for (let cuerda of cuerdas) {
    cuerda.actualizar();
    cuerda.mostrar();
    
    // De vez en cuando, activamos una cuerda
    if (random(100) < 0.8) {
      if (!cuerda.activa) {
        cuerda.pulsar(random(0.5, 3), random([true, false]));
      }
    }
  }
  
  // Actualizamos y mostramos las notas musicales
  for (let nota of notasMusicales) {
    nota.mover();
    nota.mostrar();
  }
  
  // Efecto de tecleo para el mensaje
  actualizarTecleo();
  
  // Texto central - ahora centrado verticalmente en el canvas más alto
  let brillo = map(sin(frameCount * 0.05), -1, 1, 200, 255);
  fill(255, 255, brillo);
  textSize(36); // Texto principal más grande
  text(textoMostrado, width / 2, height / 2);
  
  // Subtítulo
  if (textoMostrado.length === mensaje.length) {
    fill(200, 200, 255, 180);
    textSize(20); // Subtítulo más grande
    text("Tu espacio de expreción", width / 2, height / 2 + 45);
  }
}

function actualizarTecleo() {
  if (mostrandoTexto) {
    if (frameCount % velocidadTexto === 0) {
      if (indexTexto < mensaje.length) {
        textoMostrado += mensaje.charAt(indexTexto);
        indexTexto++;
      } else {
        contadorEspera++;
        if (contadorEspera >= esperaFrames) {
          contadorEspera = 0;
          textoMostrado = "";
          indexTexto = 0;
        }
      }
    }
  }
}

class Cuerda {
  constructor(y, amplitud, velocidad) {
    this.y = y;
    this.amplitud = amplitud;
    this.velocidad = velocidad;
    this.tiempo = random(1000); // Fase inicial aleatoria
    this.activa = false;
    this.pulsoTiempo = 0;
    this.pulsoAmplitud = 0;
    this.pulsoVelocidad = 0;
    this.pulsoDecaimiento = 0.98;
    this.color = color(
      120 + random(50),
      150 + random(50),
      200 + random(55),
      70 + random(30)
    );
  }
  
  actualizar() {
    this.tiempo += this.velocidad;
    
    // Actualizar el pulso si la cuerda está activa
    if (this.activa) {
      this.pulsoTiempo += this.pulsoVelocidad;
      this.pulsoAmplitud *= this.pulsoDecaimiento;
      
      // Desactivar cuando la amplitud es muy baja
      if (this.pulsoAmplitud < 0.1) {
        this.activa = false;
      }
    }
  }
  
  pulsar(amplitud, direccion) {
    this.activa = true;
    this.pulsoAmplitud = amplitud;
    this.pulsoTiempo = 0;
    this.pulsoVelocidad = direccion ? 0.3 : -0.3;
  }
  
  mostrar() {
    stroke(this.color);
    strokeWeight(1.5);
    noFill();
    
    beginShape();
    for (let x = 0; x < width; x += 5) {
      // Movimiento base suave
      let baseY = this.y + sin(x * 0.01 + this.tiempo) * this.amplitud;
      
      // Movimiento de pulso si está activo
      let pulsoY = 0;
      if (this.activa) {
        // Crear una onda que se propaga a lo largo de la cuerda
        let distanciaDesdeInicio = x;
        let atenuacion = map(
          min(distanciaDesdeInicio, width - distanciaDesdeInicio),
          0, width/2, 1, 0.2
        );
        
        pulsoY = sin(x * 0.05 - this.pulsoTiempo) * this.pulsoAmplitud * atenuacion;
      }
      
      vertex(x, baseY + pulsoY);
    }
    endShape();
  }
}

class NotaMusical {
  constructor(x, y, tamaño, tipo, velocidadX, velocidadY) {
    this.x = x;
    this.y = y;
    this.tamaño = tamaño;
    this.tipo = tipo; // 0:negra, 1:blanca, 2:corchea, 3:clave sol
    this.velocidadX = velocidadX;
    this.velocidadY = velocidadY;
    this.rotacion = random(TWO_PI);
    this.velocidadRotacion = random(-0.01, 0.01);
    this.tiempoVida = 0;
    this.opacidad = random(120, 200);
  }
  
  mover() {
    // Actualizar posición con movimiento suave y natural
    this.x += this.velocidadX + sin(frameCount * 0.02 + this.x * 0.01) * 0.3;
    this.y += this.velocidadY + cos(frameCount * 0.03 + this.y * 0.01) * 0.2;
    this.rotacion += this.velocidadRotacion;
    this.tiempoVida += 0.01;
    
    // Detectar bordes y rebotar suavemente
    if (this.x < 0 || this.x > width) {
      this.velocidadX *= -1;
      this.x = constrain(this.x, 0, width);
    }
    
    if (this.y < 50 || this.y > height - 50) {
      this.velocidadY *= -1;
      this.y = constrain(this.y, 50, height - 50);
    }
    
    // Variar ligeramente la velocidad para movimiento más natural
    if (random(100) < 5) {
      this.velocidadX += random(-0.1, 0.1);
      this.velocidadY += random(-0.1, 0.1);
      
      // Limitar la velocidad máxima
      this.velocidadX = constrain(this.velocidadX, -1, 1);
      this.velocidadY = constrain(this.velocidadY, -1, 1);
    }
  }
  
  mostrar() {
    push();
    translate(this.x, this.y);
    rotate(this.rotacion);
    
    // Color con brillo pulsante sutil
    let brilloPulsante = map(sin(frameCount * 0.05 + this.tiempoVida), -1, 1, -20, 20);
    fill(255, 255, 255, this.opacidad + brilloPulsante);
    noStroke();
    
    // Dibujar según el tipo de nota
    if (this.tipo === 0) { // Negra
      this.dibujarNegra();
    } else if (this.tipo === 1) { // Blanca
      this.dibujarBlanca();
    } else if (this.tipo === 2) { // Corchea
      this.dibujarCorchea();
    } else if (this.tipo === 3) { // Clave de Sol
      this.dibujarClaveSol();
    }
    
    pop();
  }
  
  dibujarNegra() {
    // Cabeza de la nota
    ellipse(0, 0, this.tamaño * 0.8, this.tamaño * 0.6);
    // Plica
    rect(this.tamaño * 0.4, 0, this.tamaño * 0.1, -this.tamaño * 1.5);
  }
  
  dibujarBlanca() {
    // Cabeza de la nota (oval hueco)
    push();
    fill(15, 15, 25);
    stroke(255, 255, 255, this.opacidad);
    strokeWeight(2);
    ellipse(0, 0, this.tamaño * 0.8, this.tamaño * 0.6);
    pop();
    // Plica
    fill(255, 255, 255, this.opacidad);
    noStroke();
    rect(this.tamaño * 0.4, 0, this.tamaño * 0.1, -this.tamaño * 1.5);
  }
  
  dibujarCorchea() {
    // Cabeza de la nota
    ellipse(0, 0, this.tamaño * 0.8, this.tamaño * 0.6);
    // Plica
    rect(this.tamaño * 0.4, 0, this.tamaño * 0.1, -this.tamaño * 1.5);
    // Corchete
    noFill();
    stroke(255, 255, 255, this.opacidad);
    strokeWeight(2);
    beginShape();
    vertex(this.tamaño * 0.5, -this.tamaño * 1.5);
    bezierVertex(
      this.tamaño * 1, -this.tamaño * 1.5,
      this.tamaño * 1, -this.tamaño * 1,
      this.tamaño * 0.5, -this.tamaño * 1
    );
    endShape();
  }
  
  dibujarClaveSol() {
    // Simplificación de una clave de sol
    noFill();
    stroke(255, 255, 255, this.opacidad);
    strokeWeight(2);
    
    // Espiral principal
    beginShape();
    for (let i = 0; i < TWO_PI * 1.5; i += 0.1) {
      let r = this.tamaño * 0.3 * (1 - i / (TWO_PI * 2));
      let x = r * cos(i);
      let y = r * sin(i) + this.tamaño * 0.3;
      vertex(x, y);
    }
    endShape();
    
    // Línea vertical
    line(0, this.tamaño * 0.3, 0, -this.tamaño * 0.8);
    
    // Curva inferior
    beginShape();
    vertex(0, -this.tamaño * 0.8);
    bezierVertex(
      this.tamaño * 0.5, -this.tamaño * 0.8,
      this.tamaño * 0.5, -this.tamaño * 0.4,
      0, -this.tamaño * 0.4
    );
    endShape();
  }
}

// Función para hacer el canvas responsive cuando cambia el tamaño de la ventana
function windowResized() {
  resizeCanvas(windowWidth, 500); // Mantener la nueva altura de 500px
}
let A1 = 0, A2 = 0;
let phi1 = 0, phi2 = 0;
let omega01 = 0, omega02 = 0;
let positionData1 = [], positionData2 = [];
let positionChart1, positionChart2;
let animationFrame;
let canvas, ctx, originX, originY, time;
let length1 = 0, length2 = 0;
let visualLength1, visualLength2;

const MIN_VISUAL_LENGTH = 50;  // Longitud mínima para visualización
const MAX_VISUAL_LENGTH = 100;  // Longitud máxima para visualización

function calcularOmega0Acoplado(m1, M1, L1, R1, m2, M2, L2, R2, g) {
    const num1 = (m1 * L1 / 2) + M1 * (L1 + R1);
    const den1 = (m1 * (L1 ** 2) / 3) + (2 / 5) * M1 * (R1 ** 2) + M1 * (L1 + R1) ** 2;
    const omega01 = Math.sqrt((num1 * g) / den1);
    const num2 = (m2 * L2 / 2) + M2 * (L2 + R2);
    const den2 = (m2 * (L2 ** 2) / 3) + (2 / 5) * M2 * (R2 ** 2) + M2 * (L2 + R2) ** 2;
    const omega02 = Math.sqrt((num2 * g) / den2);
    return { omega01, omega02 };
}

function inicializarSimulacion() {
    canvas = document.getElementById('pendulumCanvas');
    ctx = canvas.getContext('2d');
    originX = canvas.width / 2;
    originY = 100;
    time = 0;
    positionData1 = [];
    positionData2 = [];
}

function inicializarGraficos() {
    const ctx1 = document.getElementById('positionChart1').getContext('2d');
    const ctx2 = document.getElementById('positionChart2').getContext('2d');

    positionChart1 = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: [], // Las etiquetas serán los valores de tiempo
            datasets: [{
                label: 'Posición angular Pendulum 1',
                data: [], // Aquí se agregarán los datos de posición angular del pendulum 1
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Tiempo (s)' } },
                y: { title: { display: true, text: 'Ángulo (rad)' } }
            }
        }
    });

    positionChart2 = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: [], // Las etiquetas serán los valores de tiempo
            datasets: [{
                label: 'Posición angular Pendulum 2',
                data: [], // Aquí se agregarán los datos de posición angular del pendulum 2
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Tiempo (s)' } },
                y: { title: { display: true, text: 'Ángulo (rad)' } }
            }
        }
    });
}

const MAX_DATA_POINTS = 250; // Número máximo de puntos a mantener en los gráficos

function actualizarGraficos(theta1, theta2) {
    // Crear datos de posición y velocidad
    const timeLabel = time.toFixed(2); // Etiqueta de tiempo

    // Verificar y eliminar puntos más antiguos si se excede el límite
    if (positionChart1.data.labels.length >= MAX_DATA_POINTS) {
        positionChart1.data.labels.shift(); // Eliminar el punto más antiguo
        positionChart1.data.datasets[0].data.shift(); // Eliminar el valor correspondiente
    }
    if (positionChart2.data.labels.length >= MAX_DATA_POINTS) {
        positionChart2.data.labels.shift(); // Eliminar el punto más antiguo
        positionChart2.data.datasets[0].data.shift(); // Eliminar el valor correspondiente
    }

    // Agregar los nuevos datos a la gráfica del primer péndulo
    positionChart1.data.labels.push(timeLabel); // Añadir el tiempo como etiqueta
    positionChart1.data.datasets[0].data.push(theta1.toFixed(3)); // Añadir el ángulo de posición

    // Agregar los nuevos datos a la gráfica del segundo péndulo
    positionChart2.data.labels.push(timeLabel); // Añadir el tiempo como etiqueta
    positionChart2.data.datasets[0].data.push(theta2.toFixed(3)); // Añadir el ángulo de posición

    // Actualizar gráficos
    positionChart1.update();
    positionChart2.update();
}

function determinarModoVibracion(theta1, theta2) {
    const umbral = 0.1; // Umbral para considerar si están en el mismo modo
    if (Math.abs(theta1 - theta2) < umbral) {
        return "Primer modo (ambos en fase)";
    } else {
        return "Segundo Modo (fuera de fase)";
    }
}

function actualizarPendulosAcoplados() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += 0.01;

    // Cálculo del ángulo y posición del primer péndulo
    let theta1 = A1 * Math.cos(omega01 * time + phi1);
    let x1 = originX + visualLength1 * Math.sin(theta1);  // Usar longitudes visuales
    let y1 = originY + visualLength1 * Math.cos(theta1);

    // Cálculo del ángulo y posición del segundo péndulo
    let theta2 = A2 * Math.cos(omega02 * time + phi2);
    let x2 = x1 + visualLength2 * Math.sin(theta2);  // Usar longitudes visuales
    let y2 = y1 + visualLength2 * Math.cos(theta2);

    // Dibujar el primer péndulo
    ctx.beginPath();
    ctx.moveTo(originX, originY);  // Anclar el primer péndulo en el origen
    ctx.lineTo(x1, y1);  // Dibujar la barra del primer péndulo
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x1, y1, 20, 0, Math.PI * 2);  // Dibujar la esfera del primer péndulo
    ctx.fillStyle = "#FF0000";
    ctx.fill();

    // Dibujar el segundo péndulo
    ctx.beginPath();
    ctx.moveTo(x1, y1);  // Anclar el segundo péndulo en la posición final del primero
    ctx.lineTo(x2, y2);  // Dibujar la barra del segundo péndulo
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x2, y2, 20, 0, Math.PI * 2);  // Dibujar la esfera del segundo péndulo
    ctx.fillStyle = "#0000FF";
    ctx.fill();

    // Actualizar gráficos con los ángulos actuales
    actualizarGraficos(theta1, theta2);

    // Determinar y mostrar el modo de vibración
    const modoVibracion = determinarModoVibracion(theta1, theta2);
    document.getElementById('modoVibracion').innerHTML = `Modo de vibración: ${modoVibracion}`;

    // Continuar la animación
    animationFrame = requestAnimationFrame(actualizarPendulosAcoplados);
}

function calcularRaices(k, m1, M1, L1, R1, m2, M2, L2, R2, omega1, omega2) {
    // Calcular k1 y k2
    const k1 = k / ((m1 * (L1 ** 2) / 3) + (2 / 5) * M1 * (R1 ** 2) + M1 * (L1 + R1) ** 2);
    const k2 = k / ((m2 * (L2 ** 2) / 3) + (2 / 5) * M2 * (R2 ** 2) + M2 * (L2 + R2) ** 2);

    // Calcular z1 y z2
    const discriminante = Math.sqrt((omega01 ** 2 + omega02 ** 2 + k1 + k2) ** 2 - 4 * (omega1 ** 2 * omega2 ** 2 + k1 * omega2 ** 2 + k2 * omega1 ** 2));

    const z1 = (omega01 ** 2 + omega02 ** 2 + k1 + k2 + discriminante) / 2;
    const z2 = (omega01 ** 2 + omega02 ** 2 + k1 + k2 - discriminante) / 2;

    return { z1, z2, k1, k2 };
}

function calcAmplitud(k1, z1, z2, omega1) {
    // Calcular las amplitudes A1 y A2
    const Al1 = (k1 / (z1 - omega01 - k1));
    const Al2 = (k1 / (z2 - omega01 - k1));

    return { Al1, Al2 };
}

function mostrarEcuaciones(m1, M1, L1, R1, m2, M2, L2, R2, omega01, omega02) {
    const equation1 = `θ1(t) = ${Al1.toFixed(3)}(B1) * cos(${omega01.toFixed(3)} * t + ϕ) + ${Al2.toFixed(3)}(B2) * cos(${omega02.toFixed(3)} * t + ϕ)`;
    const equation2 = `θ2(t) = B1 * cos(${omega01.toFixed(3)} * t + ϕ) + B2 * cos(${omega01.toFixed(3)} * t + ϕ)`;
    
    document.getElementById('equation1').textContent = equation1;
    document.getElementById('equation2').textContent = equation2;
}



document.getElementById('iniciar').addEventListener('click', function() {
    // Obtener las entradas de los usuarios
    const theta01 = parseFloat(document.getElementById('theta01').value);
    const theta02 = parseFloat(document.getElementById('theta02').value);
    const m1 = parseFloat(document.getElementById('m1').value);
    const M1 = parseFloat(document.getElementById('M1').value);
    const L1 = parseFloat(document.getElementById('L1').value);
    const R1 = parseFloat(document.getElementById('R1').value);
    const m2 = parseFloat(document.getElementById('m2').value);
    const M2 = parseFloat(document.getElementById('M2').value);
    const L2 = parseFloat(document.getElementById('L2').value);
    const R2 = parseFloat(document.getElementById('R2').value);
    const g = 9.81; // Gravedad en m/s^2

    const { omega01: calcOmega01, omega02: calcOmega02 } = calcularOmega0Acoplado(m1, M1, L1, R1, m2, M2, L2, R2, g);

    // Asignar las frecuencias calculadas
    omega01 = calcOmega01;
    omega02 = calcOmega02;
    const { z1, z2, k1, k2 } = calcularRaices(1, m1, M1, L1, R1, m2, M2, L2, R2, omega01, omega02);
    A1 = theta01;
    A2 = theta02;
    // Calcular las amplitudes usando la nueva función
    const { Al1: newAl1, Al2: newAl2 } = calcAmplitud(k1, z1, z2, omega01);

    // Asignar las amplitudes calculadas
    Al1 = newAl1;
    Al2 = newAl2;

    const Amp1 = (theta01 + theta02) / 2*Al1;  // Amplitud para el primer modo
    const Amp2 = (theta01 - theta02) / 2*Al2;  // Amplitud para el segundo modo
    // Asignar longitudes físicas para el cálculo de las posiciones
    length1 = L1;
    length2 = L2;

    // Escalar las longitudes para la visualización
    visualLength1 = Math.max(MIN_VISUAL_LENGTH, Math.min(MAX_VISUAL_LENGTH, length1 * 100));
    visualLength2 = Math.max(MIN_VISUAL_LENGTH, Math.min(MAX_VISUAL_LENGTH, length2 * 100));

    // Asignar fases iniciales
    phi1 = 0; // Suponiendo fase inicial 0 para ambos péndulos
    phi2 = 0;
    
    // Mostrar ecuaciones
    mostrarEcuaciones(m1, M1, L1, R1, m2, M2, L2, R2, omega01, omega02);
    
    // Actualizar resultados en el HTML
    document.getElementById('omegaZero1').textContent = omega01.toFixed(3);
    document.getElementById('omegaZero2').textContent = omega02.toFixed(3);
    document.getElementById('amplitude1').textContent = Al1.toFixed(3);
    document.getElementById('amplitude2').textContent = Al2.toFixed(3);
    document.getElementById('amp1').textContent = Amp1.toFixed(3); // Muestra Amp1
    document.getElementById('amp2').textContent = Amp2.toFixed(3); // Muestra Amp2
    document.getElementById('phase1').textContent = phi1.toFixed(3);
    document.getElementById('phase2').textContent = phi2.toFixed(3);

    // Inicializar simulación y gráficos
    inicializarSimulacion();
    inicializarGraficos();
    actualizarPendulosAcoplados();  // Iniciar la animación
});

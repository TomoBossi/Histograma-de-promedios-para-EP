p5.disableFriendlyErrors = true;
// Variables globales
let usarPromedios = true, // Usar promedios (si false, por defecto usa llenados individuales en vez de promedios)
    nFigus = 6, // Figus por álbum
    mLlenados = 10, // Valor inicial para la cantidad de álbumes llenados por promedio calculado
    kPromedios = 1000, // Total de promedios calculados y a ser utilizados en simultaneo (como máximo)
    
    // Promedios / Lógica interna
    promedioAnalitico,
    promediosPrecalArray = [], // Array para guardado de los promedios calculados
    promediosInput, // Contiene al último promedio inputeado
    promediosInputArray = [], // Contiene a la lista de promedios inputeados, por orden
    promediosPrecalEnUso = 0, // Promedios precalculados utilizados en los gráficos
    promediosArray = [], // Conjunto de promedios (inputs primero, precalculados después)
    promediosGrilla,
    promediosInputTotales = 45, // Tamaño total de la grilla de inputs
    promediosPorFila = 15, // Inputs por fila de la grilla
    mLlenadosInput,
    mLlenadosResetx,
    mLlenadosResety,
    mLlenadosResets,
    
    // Histograma
    promedioTotal,
    histxPos,
    histyPos,
    histPlotTotalWidth,
    histPlotTotalHeight,
    histxMin,
    histxMax,
    histxMaxFix,
    nBins,
    binWidth,
    histTickPos,
    histWidth,
    histHeight,
    histBorderxL,
    histBorderxR,
    histBorderyT,
    histBorderyB,
    histCuentaPromediosEnteros = [],
    histBinMax = 0,
    histGridHeight,
    histGridInput = [],
    mostrarAnalitico = false,
    mostrarExperimental = true,
    mostrarAnaliticoTogglex,
    mostrarAnaliticoToggley,
    mostrarExperimentalTogglex,
    mostrarExperimentalToggley,
    mostrarPromedioToggles = 20,
    mParaDecimal = 8, // mLlenados a partir de los cuales mostrar decimales en el eje x (bins cada 0,5)
    
    // Slider
    grabbing = false, // Moviendo el slider
    sliderxL,
    sliderxR,
    sliderxC,
    slidery,
    sliderPos,
    
    // Grilla de inputs
    xpos = [],
    ypos = [],
    xsize,
    ysize,
    tsize,
    borde,
    separacion,
    
    // Colores
    bgc = [255, 235, 205] // [255, 255, 255] // [250, 200, 180], // Color de fondo
    hc1 = [250, 200, 170] // [130, 130, 130] // [250, 180, 160], // Color acentuado 1 (grilla vacía)
    hc2 = [255, 230, 210] // [230, 230, 230] // [220, 120, 120], // Color acentuado 2 (bordes)
    hc3 = [180, 150, 130] // [140, 140, 140] // [150, 100, 100], // Color acentuado 3 (promedios precalculados)
    hc4 = [120, 50, 30] // [70, 70, 70] // [100,   0,   0]; // Color acentuado 4 (slider y botón para resampleo)

function preload() {
  if (usarPromedios) {
    promediosPrecalArray = calcularPromedios(nFigus, mLlenados, kPromedios);
  } else {
    mLlenados = 1;
    promediosPrecalArray = calcularPromedios(nFigus, mLlenados, kPromedios);
  }
  promedioAnalitico = 0;
  for (let n = 1; n <= nFigus; n++) {
    promedioAnalitico += nFigus/n
  }
}



function setup() {
  createCanvas(max(windowWidth, 765), max(windowHeight, 400)); // Tamaño adaptable
  
  // Inicializar tamaños de la grilla de inputs
  xsize = 0.8*width/promediosPorFila;
  ysize = 0.4*width/promediosPorFila;
  tsize = 0.8*ysize;
  borde = 0.55*width/(promediosPorFila+1);
  separacion = (width-(xsize*(promediosPorFila-1) + 2*borde))/(promediosPorFila-1);
  
  // Inicializar campo para inputs
  promediosInputField = createInput('', 'text');
  promediosInputField.size(155, 20);
  promediosInputField.position(borde - xsize/2 + 5, promediosInputField.size().height/2);
  
  // Inicializar posiciones de la grilla de inputs
  for (let i = 0; i < promediosInputTotales; i++) {
    xpos.push(borde + (xsize+separacion)*(i%promediosPorFila));
    ypos.push(2*promediosInputField.size().height + 0.3*width/promediosPorFila + 0.5*width/promediosPorFila*(int(i/promediosPorFila)));
  }
  
  // Inicializar slider
  sliderxL = min(2/3*width, width-275);
  sliderxR = width - borde + xsize/2 - 10;
  sliderxC = sliderxL + (sliderxR-sliderxL)/2;
  slidery  = promediosInputField.size().height - 10;
  
  // Inicializar histograma
  histInit(0, 
           2*promediosInputField.size().height + 4.75*ysize, 
           width-20, 
           height - (2*promediosInputField.size().height + 4.75*ysize) - 10);
  
  // Inicializar toggles para mostrar promedios
  mostrarAnaliticoToggley = 2*promediosInputField.size().height + 0.6*width/promediosPorFila + 0.5*width/promediosPorFila*(int(promediosInputTotales/promediosPorFila)-1);
  mostrarAnaliticoTogglex = sliderxR-20+10;
  mostrarExperimentalToggley = mostrarAnaliticoToggley + mostrarPromedioToggles + 5;
  mostrarExperimentalTogglex = mostrarAnaliticoTogglex;
  
  // Inicializar campo para fijar mLlenados
  mLlenadosInputField = createInput('', 'text');
  mLlenadosInputField.size(228, 20);
  mLlenadosInputField.position(sliderxL-30-mLlenadosInputField.size().width+8, promediosInputField.size().height/2);
  mLlenadosResetx = mLlenadosInputField.position().x - promediosInputField.size().height + 2;
  mLlenadosResety = promediosInputField.size().height;
  mLlenadosResets = promediosInputField.size().height + 4;
}



function draw() {
  background(bgc);
  cursor(ARROW);
  
  // Dibujar campos para inputs
  mLlenadosInputField.attribute('placeholder', concat('Álbumes llenados por promedio (', concat(String(mLlenados),')')));
  if (mLlenados > 1) {
    promediosInputField.attribute('placeholder', 'Agregá un promedio acá');
  } else {
    promediosInputField.attribute('placeholder', 'Agregá un resultado acá');
  }
  rectMode(CORNER);
  fill(hc1);
  noStroke();
  rect(0, 0, width, 2*promediosInputField.size().height);
  fill(hc2);
  rect(promediosInputField.position().x-5,
       promediosInputField.position().y-5,
       promediosInputField.size().width+10,
       promediosInputField.size().height+10,
       5, 5);
  rect(mLlenadosInputField.position().x-5,
       mLlenadosInputField.position().y-5,
       mLlenadosInputField.size().width+10,
       mLlenadosInputField.size().height+10,
       5, 5);
  
  // Actualizar promediosArray
  promediosArray = promediosInputArray.concat(promediosPrecalArray.slice(0, promediosPrecalEnUso)).slice(0, kPromedios);
  
  // Actualizar promedio total
  promedioTotal = promediosArray.reduce((a, b) => a + b, 0);
  if (promedioTotal) {
    promedioTotal /= promediosArray.length;
  }
  
  // Dibujar histograma
  histPlot();
  
  // Dibujar grilla de inputs
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  promediosGrilla = promediosArray; // promediosInputArray
  for (let i = 0; i < promediosInputTotales; i++) {
    fill(hc1);
    strokeWeight(1.5);
    noStroke();
    
    if (i < promediosGrilla.length) {
      fill(hc3);
      stroke(40);
      if (i < promediosInputArray.length) {
        fill(sat(mapRGB(promediosInputArray[i], promedioAnalitico*1.2, promedioAnalitico*0.9), 0.5));
      }
    }
    
    rect(xpos[i], ypos[i], xsize, ysize, 5, 5);
    
    if (i < promediosGrilla.length) {
      fill(255);
      stroke(0);
      strokeWeight(4);
      textSize(tsize);
      text(round(promediosGrilla[i], 1), xpos[i], ypos[i]+tsize/15)
    }
  }
  for (let i = 0; i < promediosInputArray.length; i++) {
    if (abs(mouseX - xpos[i]) < xsize/2 && abs(mouseY - ypos[i]) < ysize/2) {
      cursor(HAND);
    }
  }
  
  // Dibujar slider
  fill(hc2);
  noStroke();
  rectMode(CORNER);
  rect(sliderxL-10,
       promediosInputField.size().height/4,
       sliderxR-sliderxL+10*2, 
       promediosInputField.size().height*3/2,
       10, 10);
  sliderPos = constrain(map(promediosPrecalEnUso, 0, kPromedios - promediosInputArray.length, sliderxL, sliderxR), sliderxL, sliderxR);
  stroke(hc4);
  strokeWeight(2);
  line(sliderxL, slidery, sliderxR, slidery);
  fill(hc4);
  ellipseMode(CENTER);
  ellipse(sliderPos, slidery, 6, 6);
  if (dist(mouseX, mouseY, sliderPos, slidery) < 20) {
    ellipse(sliderPos, slidery, 13, 13);
    cursor('grab');
  }
  if (grabbing) {
    ellipse(sliderPos, slidery, 13, 13);
    cursor('grab');
    promediosPrecalEnUso = constrain(map(mouseX, sliderxL, sliderxR, 0, kPromedios - promediosInputArray.length), 0, kPromedios - promediosInputArray.length);
  }
  fill(hc4);
  noStroke();
  textSize(15);
  textAlign(RIGHT, TOP);
  text(kPromedios, sliderxR, slidery + 10);
  textAlign(LEFT, TOP);
  text(promediosInputArray.length, sliderxL, slidery + 10);
  textAlign(CENTER, TOP);
  if (mLlenados > 1) {
    text(String(promediosArray.length)+' promedios en total', sliderxC, slidery + 10);
  } else {
    text(String(promediosArray.length)+' llenados en total', sliderxC, slidery + 10);
  }
  
  // Dibujar botón para resampleo
  redoButton(mLlenadosResetx, mLlenadosResety);
}



function keyPressed() {
  // console.log(keyCode);
  if (keyCode == 13) { // Si el usuario aprieta ENTER...
    if (promediosInputField.value() != '') { // Si hay algún input en el campo...
      promediosInput = parseFloat(promediosInputField.value().replace(',','.')); // Parsearlo y guardarlo en promediosInput
      if (isNumber(promediosInput) && promediosInput >= nFigus && promediosInputArray.length < promediosInputTotales) { // Si se obutvo un número (no NaN) válido (>= nFigus) y el array de promedios input no está lleno...
        promediosInputArray.push(promediosInput); // Guardarlo al final de promediosInputArray,
      }
      promediosInputField.value(''); // Y borrar el input actualmente en el campo
    }
    
    if (mLlenadosInputField.value() != '') {
      mLlenadosInput = int(parseFloat(mLlenadosInputField.value().replace(',','.')))
      if (isNumber(mLlenadosInput)) {
        mLlenados = constrain(mLlenadosInput, 1, 100);
        promediosPrecalArray = calcularPromedios(nFigus, mLlenados, kPromedios);
      }
      mLlenadosInputField.value('');
    }
  }
  
  if (keyCode == 37) {
    promediosPrecalEnUso--;
    promediosPrecalEnUso = constrain(promediosPrecalEnUso, 0, kPromedios - promediosInputArray.length);
  } else if (keyCode == 39) {
    promediosPrecalEnUso++;
    promediosPrecalEnUso = constrain(promediosPrecalEnUso, 0, kPromedios - promediosInputArray.length);
  }
}



function calcularPromedios(nFigus, mLlenados, kPromedios) { // Precomputa kPromedios promedios
  let promedio,
      promediosPrecalArray = [],
      album = [],
      c = 0,
      figu;
  
  for (let k = 0; k < kPromedios; k++) {
    promedio = 0;
  
    for (let m = 0; m < mLlenados; m++) {
      album = Array(nFigus).fill(0);
      c = 0;
      while (album.reduce((a, b) => a + b, 0) < nFigus) {
        figu = int(random(0, nFigus));
        album[figu] = 1;
        c++;
      }
      promedio += c;
    }
    
    promedio /= mLlenados;
    promediosPrecalArray.push(promedio);
  }
  
  return promediosPrecalArray;
}



function isNumber(n) {
  return Number(n) === n;
}



function mapRGB(value, minVal, maxVal) {
  mapped = map(value, minVal, maxVal, 0, 1);
  if (minVal == 0){
    R = min([1, 2*mapped]);
    G = min([1, 2*(1 - mapped)]);
  } else {
    R = min([1, 2*(1 - mapped)]);
    G = min([1, 2*mapped]);
  }
  return [255*R, 255*G, 0];
}



function sat(col, relSat = 0.55) { // https://stackoverflow.com/questions/31627303/calculate-new-rgb-by-saturation
  let min = col.indexOf(Math.min.apply(null, col)), // index of min
      max = col.indexOf(Math.max.apply(null, col)), // index of max
      mid = [0, 1, 2].filter(function (i) {return i !== min && i !== max;})[0],
      a = col[max] - col[min],
      b = col[mid] - col[min],
      x = col[max],
      arr = [x, x, x];
  
  if (min === max) {
    min = 2; // both max = min = 0, => mid = 1, so set min = 2
    a = 1;   // also means a = b = 0, don't want division by 0 in `b / a`
  }

  arr[max] = x;
  arr[min] = Math.round(x * (1 - relSat));
  arr[mid] = Math.round(x * ((1 - relSat) + relSat * b / a));

  return arr;
}



function mousePressed() {
  for (let i = 0; i < promediosInputArray.length; i++) {
    if (abs(mouseX - xpos[i]) < xsize/2 && abs(mouseY - ypos[i]) < ysize/2) {
      promediosInputArray.splice(i, 1); // Remover un input
    }
  }
  
  if (dist(mouseX, mouseY, sliderPos, slidery) < 20) {
    grabbing = true;
  }
  
  if (mouseX > mostrarAnaliticoTogglex && mouseX < mostrarAnaliticoTogglex + mostrarPromedioToggles && mouseY > mostrarAnaliticoToggley && mouseY < mostrarAnaliticoToggley + mostrarPromedioToggles) {
    mostrarAnalitico = !mostrarAnalitico;
  }
  
  if (promedioTotal > histxMin && mouseX > mostrarExperimentalTogglex && mouseX < mostrarExperimentalTogglex + mostrarPromedioToggles && mouseY > mostrarExperimentalToggley && mouseY < mostrarExperimentalToggley + mostrarPromedioToggles) {
    mostrarExperimental = !mostrarExperimental;
  }
  
  if (dist(mouseX, mouseY, mLlenadosResetx, mLlenadosResety) < (promediosInputField.size().height + 4)/2) {
    promediosPrecalArray = calcularPromedios(nFigus, mLlenados, kPromedios);
  }
}



function mouseReleased() {
  grabbing = false;
}



function histInit(x, y, w, h) {
  histxPos = x;
  histyPos = y;
  histPlotTotalWidth = w;
  histPlotTotalHeight = h;
  histxMin = nFigus;
  histxMax = int(promedioAnalitico*1.75);
  histxMaxFix = histxMax
  histBorderxL = histxPos+0.1*histPlotTotalWidth;
  histBorderxR = histxPos+0.925*histPlotTotalWidth;
  histBorderyT = histyPos+0.075*histPlotTotalHeight;
  histBorderyB = histyPos+0.875*histPlotTotalHeight;
  histWidth = histBorderxR - histBorderxL;
  histHeight = histBorderyB - histBorderyT;
}



function histPlot() {
  histxMax = max((1+1*(mLlenados >= mParaDecimal))*histxMaxFix, int((1+1*(mLlenados >= mParaDecimal))*Math.max(...promediosArray)));
  nBins = histxMax - histxMin*(1+1*(mLlenados >= mParaDecimal)) + 1;
  binWidth = histWidth/nBins;
  histCuentaPromediosEnteros = Array(nBins).fill(0);
  histGridInput = Array(nBins).fill(0);
  for (let i = 0; i < promediosArray.length; i++) {
    histCuentaPromediosEnteros[int((1+1*(mLlenados >= mParaDecimal))*(promediosArray[i]-histxMin))] += 1;
    if (i < promediosInputArray.length) {
      histGridInput[int((1+1*(mLlenados >= mParaDecimal))*(promediosArray[i]-histxMin))] += 1;
    }
  }
  
  histBinMax = Math.max(...histCuentaPromediosEnteros);
  // Datos acumulados
  rectMode(CENTER);
  noStroke();
  histGridHeight = histHeight/histBinMax;
  for (let i = 0; i < nBins; i++) {
    for (let j = 0; j < histCuentaPromediosEnteros[i]; j++) {
      if (j < histGridInput[i]) {
        strokeWeight(1.5);
        stroke(0, 255/histBinMax);
        fill(sat(mapRGB(i*(1-0.5*(mLlenados >= mParaDecimal))+histxMin, promedioAnalitico*1.2, promedioAnalitico*0.9), 0.5));
      } else {
        noStroke();
        fill(hc3);
      }
      rect(histBorderxL+(i+0.5)*binWidth, 
           histBorderyB-histGridHeight/2-histGridHeight*j, 
           0.7*binWidth, 0.95*histGridHeight, 5, 5);
    }
  }
  // Ejes
  stroke(0);
  strokeWeight(2.5);
  line(histBorderxL, histBorderyB, histBorderxR+binWidth, histBorderyB);
  line(histBorderxR+binWidth, histBorderyB, histBorderxR+binWidth-7.5, histBorderyB-7.5);
  line(histBorderxR+binWidth, histBorderyB, histBorderxR+binWidth-7.5, histBorderyB+7.5);
  line(histBorderxL, histBorderyB, histBorderxL, histBorderyT-20);
  line(histBorderxL, histBorderyT-20, histBorderxL-7.5, histBorderyT-12.5);
  line(histBorderxL, histBorderyT-20, histBorderxL+7.5, histBorderyT-12.5);
  // Eje x ticks
  textAlign(CENTER, TOP);
  fill(0);
  for (let i = 0; i < nBins; i++) {
    histTickPos = map(i, 0, nBins, histBorderxL, histBorderxR);
    stroke(0);
    line(histTickPos, histBorderyB, histTickPos, histBorderyB+5);
    stroke(0, 30);
    line(histTickPos, histBorderyB, histTickPos, histBorderyT);
    noStroke();
    textSize(min(binWidth/2, histHeight/15)*(1.2-0.4*(i%2==1 && mLlenados >= mParaDecimal)));
    text(i*(1-0.5*(mLlenados >= mParaDecimal))+histxMin, histTickPos + binWidth/2, histBorderyB+7.5);
  }
  // Eje y ticks
  textSize(histHeight/15);
  textAlign(RIGHT, CENTER);
  stroke(0);
  line(histBorderxL, histBorderyB, histBorderxL-5, histBorderyB);
  line(histBorderxL, histBorderyT, histBorderxL-5, histBorderyT);
  noStroke();
  text(0, histBorderxL-10, histBorderyB);
  if (histBinMax) {
    text(histBinMax, histBorderxL-10, histBorderyT);
  }
  // Nombres de ejes
  textAlign(CENTER, CENTER);
  textSize(histHeight/27.5*constrain(histWidth/histHeight, 0, 2));
  textStyle('bold');
  push();
  rotate(radians(-90));
  text('Cantidad acumulada', -histBorderyT-histHeight/2, histBorderxL/1.5);
  pop();
  textSize(histHeight/30*constrain(histWidth/histHeight, 0, 2));
  if (mLlenados > 1) {
    text('Resultados de los experimentos (promedios de '+ String(mLlenados) +' llenados)', 
         histBorderxL + histWidth/2, 
         histyPos+histPlotTotalHeight-histHeight/40);
  } else {
    text('Resultados de los experimentos (llenados individuales)', 
         histBorderxL + histWidth/2, 
         histyPos+histPlotTotalHeight-histHeight/40);
  }
  // Promedio analitico
  textSize(20);
  stroke(255, 0, 0);
  fill(255, 0, 0);
  strokeWeight(1);
  if (mostrarAnalitico) {
    line(map(promedioAnalitico, histxMin, histxMax*(1-0.5*(mLlenados >= mParaDecimal))+1-(0.5*(mLlenados >= mParaDecimal)), histBorderxL, histBorderxR), histBorderyB,
         map(promedioAnalitico, histxMin, histxMax*(1-0.5*(mLlenados >= mParaDecimal))+1-(0.5*(mLlenados >= mParaDecimal)), histBorderxL, histBorderxR), histBorderyT-20)
    textAlign(LEFT, TOP);
    noStroke();
    text(round(promedioAnalitico, 2), 2+map(promedioAnalitico, histxMin, histxMax*(1-0.5*(mLlenados >= mParaDecimal))+1-(0.5*(mLlenados >= mParaDecimal)), histBorderxL, histBorderxR), histBorderyT-20)
  }
  // Toggle analítico
  fill(230, 0, 0);
  textAlign(RIGHT, TOP);
  textSize(15);
  noStroke();
  text('Promedio teórico', mostrarAnaliticoTogglex-5, mostrarAnaliticoToggley + 3);
  if (mostrarAnalitico) {
    rect(mostrarAnaliticoTogglex+10, mostrarAnaliticoToggley+10, 
         mostrarPromedioToggles*0.66, mostrarPromedioToggles*0.66, 2, 2);
  }
  stroke(230, 0, 0);
  strokeWeight(1.5);
  noFill();
  rectMode(CORNER);
  rect(mostrarAnaliticoTogglex, mostrarAnaliticoToggley, 
       mostrarPromedioToggles, mostrarPromedioToggles, 3, 3);
  if (mouseX > mostrarAnaliticoTogglex && mouseX < mostrarAnaliticoTogglex + mostrarPromedioToggles && mouseY > mostrarAnaliticoToggley && mouseY < mostrarAnaliticoToggley + mostrarPromedioToggles) {
    cursor(HAND);
  }
  // Promedio experimental
  textSize(20);
  if (promedioTotal > histxMin) {
    stroke(0, 0, 255);
    fill(0, 0, 255);
    strokeWeight(1);
    if (mostrarExperimental) {
      line(map(promedioTotal, histxMin, histxMax*(1-0.5*(mLlenados >= mParaDecimal))+1-(0.5*(mLlenados >= mParaDecimal)), histBorderxL, histBorderxR), histBorderyB,
           map(promedioTotal, histxMin, histxMax*(1-0.5*(mLlenados >= mParaDecimal))+1-(0.5*(mLlenados >= mParaDecimal)), histBorderxL, histBorderxR), histBorderyT-40)
      textAlign(RIGHT, TOP);
      noStroke();
      text(round(promedioTotal, 2), -2+map(promedioTotal, histxMin, histxMax*(1-0.5*(mLlenados >= mParaDecimal))+1-0.5*(mLlenados >= mParaDecimal), histBorderxL, histBorderxR), histBorderyT-40)
    }
    // Toggle experimental
    fill(0, 0, 230);
    textAlign(RIGHT, TOP);
    textSize(15);
    noStroke();
    text('Promedio experimental', mostrarExperimentalTogglex-5, mostrarExperimentalToggley + 3);
    rectMode(CENTER);
    if (mostrarExperimental) {
      rect(mostrarExperimentalTogglex+10, mostrarExperimentalToggley+10, 
           mostrarPromedioToggles*0.66, mostrarPromedioToggles*0.66, 2, 2);
    }
    stroke(0, 0, 230);
    strokeWeight(1.5);
    noFill();
    rectMode(CORNER);
    rect(mostrarExperimentalTogglex, mostrarExperimentalToggley, 
         mostrarPromedioToggles, mostrarPromedioToggles, 3, 3);
    if (mouseX > mostrarExperimentalTogglex && mouseX < mostrarExperimentalTogglex + mostrarPromedioToggles && mouseY > mostrarExperimentalToggley && mouseY < mostrarExperimentalToggley + mostrarPromedioToggles) {
      cursor(HAND);
    }
  } else {
    mostrarExperimental = true;
  }
  textStyle('normal');
}



function redoButton(x, y) {
  noStroke();
  rectMode(CENTER);
  fill(hc2);
  stroke(bgc);
  ellipse(x, y, mLlenadosResets)
  noStroke();
  fill(hc4);
  ellipse(x, y, mLlenadosResets*1.8/3);
  fill(hc2);
  ellipse(x, y, mLlenadosResets*1.4/3);
  rect(x+mLlenadosResets/4.5, y-mLlenadosResets/4.5, mLlenadosResets/5);
  fill(hc4);
  triangle(x, y-0.95*mLlenadosResets/2.25, x, y-0.2*mLlenadosResets/2.25, x+mLlenadosResets/4.5, y-0.6*mLlenadosResets/2.25);

  if (dist(mouseX, mouseY, mLlenadosResetx, mLlenadosResety) < (promediosInputField.size().height + 4)/2) {
    cursor(HAND);
  }
}

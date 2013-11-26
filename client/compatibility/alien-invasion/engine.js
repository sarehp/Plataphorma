// Alien Invasion utiliza duck typing para implementar como dibujar
// elementos en la pantalla (método draw()) y para que actualicen su
// estado cada vez que el bucle de animación marca un nuevo paso
// (método step()).
//
// Estos dos métodos son implementados por: las pantallas iniciales y
// final del juego, los sprites que se muestran en la pantalla
// (jugador, enemigo, proyectiles, y los elementos como el marcador de
// puntuación o el número de vidas.




// Objeto singleton Game: se guarda una unica instancia del
// constructor anónimo en el objeto Game
var Game = new function() {                                                                  
  var boards = [];

    // Inicializa el juego
  this.initialize = function(canvasElementId,sprite_data,callback) {
    this.canvas = document.getElementById(canvasElementId);

	// Propiedades para pantallas táctiles
    this.playerOffset = 10;
    this.canvasMultiplier= 1;
    this.setupMobile();

    this.width = this.canvas.width;
    this.height= this.canvas.height;

    this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
    if(!this.ctx) { return alert("Please upgrade your browser to play"); }

    this.setupInput();

    this.loop(); 

      // Añadimos como un nuevo tablero al juego el panel con los
      // botones para pantalla táctil, sólo si hemos detectado pantalla móvil
    if(this.mobile) {
      this.setBoard(4,new TouchControls());
    }

    SpriteSheet.load(sprite_data,callback);
  };
  

    // Gestión de la entrada (teclas para izda/derecha y disparo)
    var KEY_CODES = { 37:'left', 39:'right', 32 :'fire' };
    this.keys = {};

    var focusCanvas = true;

    this.setupInput = function() {
        $(window).click(function(event){
          if (event.target.id == "game")
            focusCanvas = true;
          else 
            focusCanvas = false;
        });

	$(window).keydown(function(event){
          if (focusCanvas)
	    if (KEY_CODES[event.which]) {
		Game.keys[KEY_CODES[event.which]] = true;
		return false;
	    }
	});
	
	$(window).keyup(function(event){
          if (focusCanvas)
	    if (KEY_CODES[event.which]) {
		Game.keys[KEY_CODES[event.which]] = false;
		return false;
	    }
	});
	
    }


    // Bucle del juego
    var boards = [];

    this.loop = function() { 
	// segundos transcurridos
	var dt = 30 / 1000;

	// Para cada board, de 0 en adelante, se 
	// llama a su método step() y luego a draw()
	for(var i=0,len = boards.length;i<len;i++) {
	    if(boards[i]) { 
		boards[i].step(dt);
		boards[i].draw(Game.ctx);
	    }
	}

	// Ejecutar dentro de 30 ms
	setTimeout(Game.loop,30);
    };
    
    // Para cambiar el panel activo en el juego.
    // Son capas: se dibujan de menor num a mayor
    // Cada capa tiene que tener en su interfaz step() y draw()
    this.setBoard = function(num,board) { boards[num] = board; };



  this.setupMobile = function() {
    var container = document.getElementById("container"),
        hasTouch =  !!('ontouchstart' in window),
        w = window.innerWidth, h = window.innerHeight;

    if(hasTouch) { this.mobile = true; }

    if(screen.width >= 1280 || !hasTouch) { return false; }

    if(w > h) {
      alert("Please rotate the device and then click OK");
      w = window.innerWidth; h = window.innerHeight;
    }

    container.style.height = h*2 + "px";
    window.scrollTo(0,1);

    h = window.innerHeight + 2;
    container.style.height = h + "px";
    container.style.width = w + "px";
    container.style.padding = 0;

    if(h >= this.canvas.height * 1.75 || w >= this.canvas.height * 1.75) {
      this.canvasMultiplier = 2;
      this.canvas.width = w / 2;
      this.canvas.height = h / 2;
      this.canvas.style.width = w + "px";
      this.canvas.style.height = h + "px";
    } else {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    this.canvas.style.position='absolute';
    this.canvas.style.left="0px";
    this.canvas.style.top="0px";

  };


};


// Objeto singleton SpriteSheet: se guarda una unica instancia del
// constructor anónimo en el objeto SpriteSheet
var SpriteSheet = new function() {

    // Almacena nombre_de_sprite: rectángulo para que sea mas facil
    // gestionar los sprites del fichero images/sprite.png
    this.map = { }; 

    // Para cargar hoja de sprites. 
    //
    // Parámetros: spriteData: parejas con nombre de sprite, rectángulo
    // callback: para llamarla cuando se haya cargado la hoja de
    // sprites
    this.load = function(spriteData,callback) { 
	this.map = spriteData;
	this.image = new Image();
	this.image.onload = callback;
	this.image.src = 'images/sprites.png';
    };

    
    // Para dibujar sprites individuales en el contexto de canvas ctx
    //
    // Parámetros: contexto, string con nombre de sprite para buscar
    //  en this.map, x e y en las que dibujarlo, y opcionalmente,
    //  frame para seleccionar el frame de un sprite que tenga varios
    //  como la explosion
    this.draw = function(ctx,sprite,x,y,frame) {
	var s = this.map[sprite];
	if(!frame) frame = 0;
	ctx.drawImage(this.image,
                      s.sx + frame * s.w, 
                      s.sy, 
                      s.w, s.h, 
                      Math.floor(x), Math.floor(y),
                      s.w, s.h);
    };
}

// La clase TitleScreen ofrece la interfaz step(), draw() para que
// pueda ser mostrada desde el bucle principal del juego

// Usa fillText, con el siguiente font enlazado en index.html <link
// href='http://fonts.googleapis.com/css?family=Bangers'
// rel='stylesheet' type='text/css'> Otros fonts:
// http://www.google.com/fonts

var TitleScreen = function TitleScreen(title,subtitle,callback) {
    var up = false;

    // En cada paso, comprobamos si la tecla ha pasado de no pulsada a
    // pulsada. Si comienza el juego con la tecla pulsada, hay que
    // soltarla y
    this.step = function(dt) {
	if(!Game.keys['fire']) up = true;
	if(up && Game.keys['fire'] && callback) callback();
    };

    this.draw = function(ctx) {
	ctx.fillStyle = "#FFFFFF";
	ctx.textAlign = "center";

	ctx.font = "bold 40px bangers";
	ctx.fillText(title,Game.width/2,Game.height/2);

	ctx.font = "bold 20px bangers";
	ctx.fillText(subtitle,Game.width/2,Game.height/2 + 40);
    };
};



// GameBoard implementa un tablero de juego que gestiona la
// interacción entre los elementos del juego sobre el que se disponen
// los elementos del juego (fichas, cartas, naves, proyectiles, etc.)

// La clase GameBoard ofrece la interfaz step(), draw() para que sus
// elementos puedan ser mostrados desde el bucle principal del juego.

var GameBoard = function() {
    var board = this;

    // Colección de objetos contenidos por este tablero
    this.objects = [];

    // Propiedad que lleva la cuenta de cuántos objetos de cada tipo
    // hay en el tablero de juegos
    this.cnt = {};

    // Añade obj a objects
    this.add = function(obj) { 
	obj.board=this;  // Para que obj pueda referenciar el tablero
	this.objects.push(obj); 
	
	// Actualizamos el contador de objetos de este tipo
	this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;

	return obj; 
    };

    // Los siguientes 3 métodos gestionan el borrado.  Cuando un board
    // está siendo recorrido (en step()) podría eliminarse algún
    // objeto, lo que interferiría en el recorrido. Por ello borrar se
    // hace en dos fases: marcado, y una vez terminado el recorrido,
    // se modifica objects.

    // Marcar un objeto para borrar
    this.remove = function(obj) { 
	var idx = this.removed.indexOf(obj);
	if(idx == -1) {
	    this.removed.push(obj); 
	    return true;
	} else {
	    return false;
	}
    };


    // Inicializar la lista de objetos pendientes de ser borrados
    this.resetRemoved = function() { this.removed = []; }

    // Elimina de objects los objetos pendientes de ser borrados
    this.finalizeRemoved = function() {
	for(var i=0, len=this.removed.length; i<len;i++) {
	    // Buscamos qué índice tiene en objects[] el objeto i de
	    // removed[]
	    var idx = this.objects.indexOf(this.removed[i]);

	    // splice elimina de objects el objeto en la posición idx
	    if(idx != -1) {
		this.cnt[this.removed[i].type]--;
		this.objects.splice(idx,1); 
	    }
	}
    }


    // Iterador que aplica el método funcName a todos los
    // objetos de objects
    this.iterate = function(funcName) {
	// Convertimos en un array args (1..)
	var args = Array.prototype.slice.call(arguments,1);

	for(var i=0, len=this.objects.length; i<len;i++) {
	    var obj = this.objects[i];
	    obj[funcName].apply(obj,args)
	}
    };

    // Devuelve el primer objeto de objects para el que func es true
    this.detect = function(func) {
	for(var i = 0,val=null, len=this.objects.length; i < len; i++) {
	    if(func.call(this.objects[i])) return this.objects[i];
	}
	return false;
    };

    // Cuando Game.loop() llame a step(), hay que llamar al método
    // step() de todos los objetos contenidos en el tablero.  Antes se
    // inicializa la lista de objetos pendientes de borrar, y después
    // se borran los que hayan aparecido en dicha lista
    this.step = function(dt) { 
	this.resetRemoved();
	this.iterate('step',dt);
	this.finalizeRemoved();
    };

    // Cuando Game.loop() llame a draw(), hay que llamar al método
    // draw() de todos los objetos contenidos en el tablero
    this.draw= function(ctx) {
	this.iterate('draw',ctx);
    };

    // Comprobar si hay intersección entre los rectángulos que
    // circunscriben a los objetos o1 y o2
    this.overlap = function(o1,o2) {
	// return !((o1 encima de o2)    || (o1 debajo de o2)   ||
        //          (o1 a la izda de o2) || (o1 a la dcha de o2)
	return !((o1.y+o1.h-1<o2.y) || (o1.y>o2.y+o2.h-1) ||
		 (o1.x+o1.w-1<o2.x) || (o1.x>o2.x+o2.w-1));
    };

    // Encontrar el primer objeto de tipo type que colisiona con obj
    // Si se llama sin type, en contrar el primer objeto de cualquier
    // tipo que colisiona con obj
    this.collide = function(obj,type) {
	return this.detect(function() {
	    if(obj != this) {
		var col = (!type || this.type & type) && board.overlap(obj,this)
		return col ? this : false;
	    }
	});
    };


};


// Constructor Sprite 
var Sprite = function() { }

Sprite.prototype.setup = function(sprite,props) {
    this.sprite = sprite;
    this.merge(props);
    this.frame = this.frame || 0;
    this.w =  SpriteSheet.map[sprite].w;
    this.h =  SpriteSheet.map[sprite].h;
}

Sprite.prototype.merge = function(props) {
    if(props) {
	for (var prop in props) {
	    this[prop] = props[prop];
	}
    }
}

Sprite.prototype.draw = function(ctx) {
    SpriteSheet.draw(ctx,this.sprite,this.x,this.y,this.frame);
}

Sprite.prototype.hit = function(damage) {
    this.board.remove(this);
}


// Clase para implementar los niveles de un juego. 

// Al constructor del nivel se le pasan los datos que definen el nivel
//   (p.ej. level1 en game.js) y una función a la que llamar si el
//   jugador gana (winGame en game.js).
var Level = function(levelData,callback) {
    // Recuerda el formato de cada batería de enemigos definida en levelData
    //  Comienzo, Fin,   Frecuencia,  Tipo,       Override
    //  [ 0,       4000,  500,         'step',     { x: 100 } ]
    this.levelData = [];

    // levelData, como todos los objetos en JavaScript, se pasa por
    // referencia. Aquí realizamos una copia profunda de levelData. Es
    // necesaria porque los datos del nivel se van modificando mientras
    // que se juega el nivel, por lo que si no hacemos una copia no se
    // podría volver a jugar un mismo nivel
    for(var i =0; i<levelData.length; i++) {
	// Para copiarla usamos este patrón JavaScript para realizar
	// copias: Object.create() crea un nuevo objeto que tiene como
	// prototipo el objeto pasado como argumento. Ese objeto, que
	// a todos los efectos podemos considerar como una copia del
	// argumento, se añade a this.levelData
	this.levelData.push(Object.create(levelData[i]));
    }

    // La propiedad t lleva la cuenta del tiempo que ha pasado. Se
    // actualiza en step()
    this.t = 0;
    this.callback = callback;
};


// Método que, junto a draw(), forma parte de la interfaz que tiene
// que ofrecer cualquier objeto añadido como tablero a Game.boards.
// En este método se lleva la cuenta del tiempo que ha transcurrido, y
// se van añadiendo nuevos enemigos al tablero de juegos según lo
// indicado en la definición del nivel almacenada en this.levelData
Level.prototype.step = function(dt) {
    var idx = 0, remove = [], curShip = null;

    // Actualizamos el tiempo que ha pasado 
    this.t += dt * 1000;

    // Recuerda el formato de cada batería de enemigos definida en levelData
    //  Comienzo, Fin,   Frecuencia,  Tipo,       Override
    // [ 0,       4000,  500,         'step',     { x: 100 } ]

    // Var recorriendo las baterías de enemigos (filas en levelData)
    while (curShip = this.levelData[idx]) {

	// Si ya ha pasado el tiempo en el que hay que crear enemigos
	// de esta batería, se añaden a remove para que sean borrados
	// una vez acabado el bucle. ¡No se eliminan directamente
	// porque el bucle está iterando sobre la estructura de datos!
	// Es el mismo patrón que utilizamos cuando borramos sprites
	// del tablero de juegos: marcamos en remove para borrar y
	// borramos una vez concluído el bucle.
	if(this.t > curShip[1]) {
	    remove.push(curShip);
	} else if(curShip[0] < this.t) {
	    // Ha llegado la hora de crear un nuevo enemigo de esta batería
	    var enemy = enemies[curShip[3]],
            override = curShip[4];

	    this.board.add(new Enemy(enemy,override));

	    // Recuerda el formato de cada batería de enemigos definida en levelData
	    //  Comienzo, Fin,   Frecuencia,  Tipo,       Override
	    // [ 0,       4000,  500,         'step',     { x: 100 } ]

	    // Modificamos la definición de esta batería para
	    // programar la creación del siguiente enemigo dentro de
	    // Frecuencia ms
	    curShip[0] += curShip[2];
	}
	idx++; // Pasamos a la siguiente batería de enemigos
    }

    // Elimina del nivel una batería de enemigos del nivel si ha sido
    // añadida a remove en el anterior bucle porque ya ha pasado su
    // ventana de tiempo en la que hay que crear enemigos de dicha
    // batería
    for(var i=0,len=remove.length;i<len;i++) {
	var remIdx = this.levelData.indexOf(remove[i]);
	if(remIdx != -1) this.levelData.splice(remIdx,1);
    }

    // Comprueba si hay que terminar el nivel porque no quedan más
    // enemigos que generar, y no quedan enemigos en el tablero de
    // juegos.  Para ello se hace uso de la propiedad this.board.cnt
    // que lleva la cuenta de cuántos objetos de cada tipo hay en el
    // tablero de juegos.
    if(this.levelData.length === 0 && this.board.cnt[OBJECT_ENEMY] === 0) {
	if(this.callback) this.callback();
    }

};

// Level implementa draw() porque al añadirse como tablero a Game el
// bucle Game.loop() va a llamar a step() y a draw(). Pero no hay nada
// que hacer en draw() para un nivel, ya que los sprites de los
// enemigos los añade el nivel al tablero de juegos (GameBoard). 
Level.prototype.draw = function(ctx) { };




// Clase para controlar el juego mediante botones en la pantalla
// táctil de un móvil o una tableta
var TouchControls = function() {

    
    // Consideraremos el ancho de la pantalla dividido en 5 franjas
    // verticales o columnas. En las dos de la izda situaremos los
    // botones de dirección y en la derecha el de disparo
    var unitWidth = Game.width/5;

    // Separación entre columnas
    var gutterWidth = 10;

    // Ancho de cada columna
    var blockWidth = unitWidth-gutterWidth;

    // Dibuja un rectángulo con texto dentro. Usado para representar
    // los botones. 
    // Los botones de las flechas izquierda y derecha usan los
    // caracteres Univode UTF-8 \u25C0 y \u25B6 respectivamente, que
    // corresponden a sendos triángulos
    this.drawSquare = function(ctx,x,y,txt,on) {
	// Usamos un nivel de opacidad del fondo (globalAlpha)
	// diferente para que cambie la apariencia del botón en
	// función de si está presionado (opaco) o no (más
	// transparente)
	ctx.globalAlpha = on ? 0.9 : 0.6;

	ctx.fillStyle =  "#CCC";
	ctx.fillRect(x,y,blockWidth,blockWidth);

	ctx.fillStyle = "#FFF";
	ctx.textAlign = "center";
	ctx.globalAlpha = 1.0;
	ctx.font = "bold " + (3*unitWidth/4) + "px arial";


	ctx.fillText(txt, 
                     x+blockWidth/2,
                     y+3*blockWidth/4+5);
    };



    this.draw = function(ctx) {
	// Guarda las propiedades del contexto actual para evitar que
	// los siguientes cambios que se hacen a la opacidad del fondo
	// y al font dentro de drawSquare() afecten a otras llamadas
	// del canvas
	ctx.save();

	var yLoc = Game.height - unitWidth;
	this.drawSquare(ctx,gutterWidth,yLoc,"\u25C0", Game.keys['left']);
	this.drawSquare(ctx,unitWidth + gutterWidth,yLoc,"\u25B6", Game.keys['right']);
	this.drawSquare(ctx,4*unitWidth,yLoc,"A",Game.keys['fire']);

	// Recupera el estado salvado al principio del método
	ctx.restore();
    };

    this.step = function(dt) { };

    this.trackTouch = function(e) {
	var touch, x;
	
	// Elimina comportamiento por defecto para este evento, como
	// scrolling, clicking, zooming, etc.
	e.preventDefault();

	// Detección de eventos sobre las dos franjas de la izquierda
	// correspondientes a flecha izquierda y flecha derecha
	Game.keys['left'] = false;
	Game.keys['right'] = false;
	for(var i=0;i<e.targetTouches.length;i++) {
	    // Independientemente de dónde se tocó originalmente, nos
	    // fijamos en todos los dedos y si hay alguno sobre los
	    // botones de dirección, lo consideramos activado. Esto
	    // permite desplazar los dedos sin levantarlos, y que se
	    // generen eventos cuando pasan por encima de los botones
	    // de dirección
	    touch = e.targetTouches[i];

	    // Al fijarnos sólo en las coordenadas X hacemos que toda
	    // la franja vertical de cada botón sea activa.
	    x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
	    if(x < unitWidth) {
		Game.keys['left'] = true;
	    } 
	    if(x > unitWidth && x < 2*unitWidth) {
		Game.keys['right'] = true;
	    } 
	}

	// Detección de eventos sobre franja de la derecha: disparo
	if(e.type == 'touchstart' || e.type == 'touchend') {
	    for(i=0;i<e.changedTouches.length;i++) {
		// Sólo consideramos dedos que han intervenido en el
		// evento actual (touchstart o touchend según
		// comprobamos en el anterior if)
		touch = e.changedTouches[i];

		// Al fijarnos sólo en las coordenadas X hacemos que toda
		// la franja vertical de cada botón sea activa.
		x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
		if(x > 4 * unitWidth) {
		    Game.keys['fire'] = (e.type == 'touchstart');
		}
	    }
	}
    };

    // Registra los manejadores para los eventos táctiles asociados al
    // elemento Game.canvas del DOM
    Game.canvas.addEventListener('touchstart',this.trackTouch,true);
    Game.canvas.addEventListener('touchmove',this.trackTouch,true);
    Game.canvas.addEventListener('touchend',this.trackTouch,true);

    // Si ha habido un evento de toque es que estamos en una pantalla
    // tactil, en cuyo caso guardamos un offset para que la nave del
    // jugador esté desplazada hacia arriba para dejar espacio para
    // los botones en la pantalla tactil.  Ver en game.js cómo hemos
    // modificado PlayerShip para que tenga en cuenta este
    // offset.
    Game.playerOffset = unitWidth + 20;

};


var GamePoints = function() {
  Game.points = 0;

  var pointsLength = 8;

  this.draw = function(ctx) {
    ctx.save();
    ctx.font = "bold 18px arial";
    ctx.fillStyle= "#FFFFFF";

    var txt = "" + Game.points;
    var i = pointsLength - txt.length, zeros = "";
    while(i-- > 0) { zeros += "0"; }

    ctx.fillText(zeros + txt,10,20);
    ctx.restore();

  };

  this.step = function(dt) { };
};

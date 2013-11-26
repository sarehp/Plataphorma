var sprites = {
    ship: { sx: 0, sy: 0, w: 37, h: 42, frames: 1 },
    missile: { sx: 0, sy: 30, w: 2, h: 10, frames: 1 },
    enemy_purple: { sx: 37, sy: 0, w: 42, h: 43, frames: 1 },
    enemy_bee: { sx: 79, sy: 0, w: 37, h: 43, frames: 1 },
    enemy_ship: { sx: 116, sy: 0, w: 42, h: 43, frames: 1 },
    enemy_circle: { sx: 158, sy: 0, w: 32, h: 33, frames: 1 },
    explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12 },
    enemy_missile: { sx: 9, sy: 42, w: 3, h: 20, frame: 1 }
};


var enemies = {

    // straight sólo tiene el parámetro E para la velocidad vertical,
    // por lo que se mueve hacia abajo a velocidad constante.
    straight: { x: 0,   y: -50, sprite: 'enemy_ship', health: 10, 
		E: 100 },


    //  ltr (left to right) tiene velocidad constante vertical pero
    //  tiene parámetros B y C que le dotan de una velocidad
    //  horizontal sinusoidal suave.
    ltr:      { x: 0,   y: -100, sprite: 'enemy_purple', health: 10, 
		B: 75, C: 1, E: 100, missiles: 2  },


    // circle tiene velocidad sinusoidal vx e vy, que junto al
    // parámetro H de desplazamiento en el tiempo le dotan de un
    // movimiento circular.
    circle:   { x: 250,   y: -50, sprite: 'enemy_circle', health: 10, 
		A: 0,  B: -100, C: 1, E: 20, F: 100, G: 1, H: Math.PI/2 },


    //  wiggle y step tienen los mismos parámetros pero con diferentes
    //  magnitudes que les hacen serpentear de manera diferente según
    //  van bajando.
    wiggle:   { x: 100, y: -50, sprite: 'enemy_bee', health: 20, 
		B: 50, C: 4, E: 100, firePercentage: 0.001, missiles: 2 },

    step:     { x: 0,   y: -50, sprite: 'enemy_circle', health: 10,
		B: 150, C: 1.2, E: 75 }

};


var OBJECT_PLAYER = 1,
OBJECT_PLAYER_PROJECTILE = 2,
OBJECT_ENEMY = 4,
OBJECT_ENEMY_PROJECTILE = 8,
OBJECT_POWERUP = 16;

var startGame = function() {
    Game.setBoard(0,new Starfield(20,0.4,100,true));
    Game.setBoard(1,new Starfield(50,0.6,100));
    Game.setBoard(2,new Starfield(100,1.0,50));
    Game.setBoard(3,new TitleScreen("Alien Invasion", 
                                    "Press fire to start playing",
                                    playGame));
};


// Definición del nivel level1.  

// Está definido por una colección de
// baterías de naves enemigas, una por fila. Para cada fila, los
// enemigos de esa batería se comienzan a crear cuando llega el
// Comienzo de la batería, y se están creando hasta que llega el Fin
// de la batería, con una separación entre cada dos enemigos creados
// de Frecuencia ms.  Para cada tanda de enemigos se especifica su
// tipo para poder encontrar su plantilla en enemies, y parámetros
// override que substituyen a los de la plantilla en enemies para ese
// enemigo.

var level1 = [
    //  Comienzo, Fin,   Frecuencia,  Tipo,       Override
    [ 0,      4000,  500, 'step' ],
    [ 6000,   13000, 800, 'ltr' ],
    [ 10000,  16000, 400, 'circle' ],
    [ 17800,  20000, 500, 'straight', { x: 50 } ],
    [ 18200,  20000, 500, 'straight', { x: 90 } ],
    [ 18200,  20000, 500, 'straight', { x: 10 } ],
    [ 22000,  25000, 400, 'wiggle', { x: 150 }],
    [ 22000,  25000, 400, 'wiggle', { x: 100 }]
];


var playGame = function() {
    var board = new GameBoard();
    board.add(new PlayerShip());

    // Se un nuevo nivel al tablero de juego, pasando la definición de
    // nivel level1 y la función callback a la que llamar si se ha
    // ganado el juego
    board.add(new Level(level1,winGame));
    Game.setBoard(3,board);
    Game.setBoard(5,new GamePoints(0));
};


// Llamada cuando han desaparecido todos los enemigos del nivel sin
// que alcancen a la nave del jugador
var winGame = function() {
    Meteor.call("matchFinish", Session.get("current_game"), Game.points);
    Game.setBoard(3,new TitleScreen("You win!", 
                                    "Press fire to play again",
                                    playGame));
};


// Llamada cuando la nave del jugador ha sido alcanzada, para
// finalizar el juego
var loseGame = function() {
    Meteor.call("matchFinish", Session.get("current_game"), Game.points);
    Game.setBoard(3,new TitleScreen("You lose!", 
                                    "Press fire to play again",
                                    playGame));
};



// Si se construye con clear==true no se pintan estrellas con fondo
// transparente, sino fondo en negro
var Starfield = function(speed,opacity,numStars,clear) {

    // Creamos un objeto canvas, no visible en la página Web
    var stars = $('<canvas/>')
	.attr('width', Game.width)
	.attr('height', Game.height)[0];
    // Sin jQuery lo hacemos asi:
    //    var stars = document.createElement("canvas");
    //    stars.width = Game.width; 
    //    stars.height = Game.height;


    var starCtx = stars.getContext("2d");

    var offset = 0;

    // Si la opción clear está activada, el fondo del canvas se pinta
    // de negro. Utilizado en el nivel mas profundo de estrellas
    if(clear) {
	starCtx.fillStyle = "#000";
	starCtx.fillRect(0,0,stars.width,stars.height);
    }

    // Dibujamos las estrellas blancas sobre el canvas no visible,
    // como rectángulos de 2 pixeles en posiciones aleatorias
    starCtx.fillStyle = "#FFF";
    starCtx.globalAlpha = opacity; // nivel de transparencia de las estrellas
    for(var i=0;i<numStars;i++) {
	starCtx.fillRect(Math.floor(Math.random()*stars.width),
			 Math.floor(Math.random()*stars.height),
			 2,
			 2);
    }

    // Se llama a este método en cada frame de la animación para dibujar
    // el campo de estrellas en la pantalla
    this.draw = function(ctx) {
	var intOffset = Math.floor(offset);
	var remaining = stars.height - intOffset;

	// Dibujar sobre el contexto ctx la parte de arriba del canvas con
	// las estrellas
	if(intOffset > 0) {
	    ctx.drawImage(stars,
			  0, remaining,
			  stars.width, intOffset,
			  0, 0,
			  stars.width, intOffset);
	}

	// Dibujar sobre el contexto ctx la parte inferior del canvas con
	// las estrellas
	if(remaining > 0) {
	    ctx.drawImage(stars,
			  0, 0,
			  stars.width, remaining,
			  0, intOffset,
			  stars.width, remaining);
	}
    }

    // En cada paso de la animación, movemos el campo de estrellas
    // modificando el offset según la cantidad de tiempo transcurrida
    this.step = function(dt) {
	offset += dt * speed; // velocidad = espacio / tiempo
	offset = offset % stars.height;
    }
}


// La clase PlayerShip tambien ofrece la interfaz step(), draw() para
// poder ser dibujada desde el bucle principal del juego
var PlayerShip = function() { 
    this.setup('ship', { vx: 0, reloadTime: 0.25, maxVel: 200 });

    this.reload = this.reloadTime;
    this.x = Game.width/2 - this.w / 2;
    this.y = Game.height - Game.playerOffset - this.h;

    this.step = function(dt) {
	if(Game.keys['left']) { this.vx = -this.maxVel; }
	else if(Game.keys['right']) { this.vx = this.maxVel; }
	else { this.vx = 0; }

	this.x += this.vx * dt;

	if(this.x < 0) { this.x = 0; }
	else if(this.x > Game.width - this.w) { 
	    this.x = Game.width - this.w;
	}

	this.reload-=dt;
	if(Game.keys['fire'] && this.reload < 0) {
	    // Esta pulsada la tecla de disparo y ya ha pasado el tiempo reload
	    Game.keys['fire'] = false;
	    this.reload = this.reloadTime;

	    // Se añaden al gameboard 2 misiles 
	    this.board.add(new PlayerMissile(this.x,this.y+this.h/2));
	    this.board.add(new PlayerMissile(this.x+this.w,this.y+this.h/2));
	}
    };
};


// Heredamos del prototipo new Sprite()
PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;


// Llamada cuando una nave enemiga colisiona con la nave del usuario
PlayerShip.prototype.hit = function(damage) {
    if(this.board.remove(this)) {
	loseGame();
    }
};


// Constructor para los misiles.
// Los metodos de esta clase los añadimos a su prototipo. De esta
// forma solo existe una copia de cada uno para todos los misiles, y
// no una copia para cada objeto misil
var PlayerMissile = function(x,y) {
    this.setup('missile',{ vy: -700, damage: 10 });
    this.x = x - this.w/2;
    this.y = y - this.h; 
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

PlayerMissile.prototype.step = function(dt)  {
    this.y += this.vy * dt;
    var collision = this.board.collide(this,OBJECT_ENEMY);
    if(collision) {
	collision.hit(this.damage);
	this.board.remove(this);
    } else if(this.y < -this.h) { 
	this.board.remove(this); 
    }
};



// Constructor para las naves enemigas. Un enemigo se define mediante
// un conjunto de propiedades provenientes de 3 sitios distintos, que
// se aplican  este orden:
// 1. baseParameters: propiedad del prototipo con los valores por
//    omisión para las constantes A..H de las velocidades vx y vy
// 2. parámetros definidos en la plantilla blueprint que se pasa como
//    parámetro al crear el enemigo. Pueden modificar las propiedades
//    definidas en 1.
// 3. parámetros definidos en el parámetro override. Pueden modificar
// las propiedades definidas en 1 y 2.

// El código del constructor añade las propiedades en este orden al
// objeto que crea.

// Para definir un nuevo tipo de enemigo: se elige una plantilla
// existente o se crea una nueva, y se pasan opcionalmente en override
// valores alternativos para los parámetros de la plantilla o de
// baseParameters. Ver cómo se añaden 2 enemigos en la función
// playGame() de este fichero.

var Enemy = function(blueprint,override) {
    // Cada instancia tendrá las propiedades definidas en baseParameters
    this.merge(this.baseParameters);

    // Se llama a setup para que se añadan como propiedades el sprite
    // y los atributos definidos en el parámetro blueprint, pudiendo
    // estas modificar los definidos en baseParameters
    this.setup(blueprint.sprite,blueprint);

    // Se copian los atributos definidos en el parámetro override,
    // pudiendo modificar los definidos en baseParameters y en
    // blueprint
    this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

// Inicializa los parámetros de las ecuacione de velocidad, y t, que
// es la edad de este enemigo
Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0, reloadTime: 0.75, 
                                   reload: 0 };


Enemy.prototype.step = function(dt) {
    // Actualizamos la edad
    this.t += dt;

    // El patrón de movimiento lo dictan las ecuaciones que se utilizarán
    // para calcular las componentes x e y de su velocidad: vx e vy:
    
    // vx tiene una componente constante A, y otra que va variando
    // cíclicamente en función de la edad del enemigo (t), según la
    // sinuisoide definida por las constantes B, C y D.
    // A: componente constante de la velocidad horizontal
    // B: fuerza de la velocidad horizontal sinusoidal
    // C: periodo de la velocidad horizontal sinusoidal
    // D: desplazamiento en el tiempo de la velocidad horizontal sinusoidal
    this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);

    // vy tiene una componente constante E, y otra que va variando
    // cíclicamente en función de la edad del enemigo (t), según la
    // sinuisoide definida por las constantes F, G y H.
    // E: componente constante de la velocidad vertical
    // F: fuerza de la velocidad vertical sinusoidal
    // G: periodo de la velocidad vertical sinusoidal
    // H: desplazamiento en el tiempo de la velocidad vertical sinusoidal
    this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    var collision = this.board.collide(this,OBJECT_PLAYER);
    if(collision) {
	collision.hit(this.damage);
	this.board.remove(this);
    }

    if(this.reload <= 0 && Math.random() < (this.firePercentage || 0.01) ) {
	this.reload = this.reloadTime;
	if(this.missiles == 2) {
	    this.board.add(new EnemyMissile(this.x+this.w-2,this.y+this.h/2));
	    this.board.add(new EnemyMissile(this.x+2,this.y+this.h/2));
	} else {
	    this.board.add(new EnemyMissile(this.x+this.w/2,this.y+this.h));
	}

    }
    this.reload-=dt;

    if(this.y > Game.height ||
       this.x < -this.w ||
       this.x > Game.width) {
	this.board.remove(this);
    }
};

Enemy.prototype.hit = function(damage) {
    this.health -= damage;
    if(this.health <=0) {
	if(this.board.remove(this)) {
	    Game.points += this.points || 100;
	    this.board.add(new Explosion(this.x + this.w/2, 
					 this.y + this.h/2));
	}
    }
};


var EnemyMissile = function(x,y) {
    this.setup('enemy_missile',{ vy: 200, damage: 10 });
    this.x = x - this.w/2;
    this.y = y;
};

EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;

EnemyMissile.prototype.step = function(dt)  {
    this.y += this.vy * dt;
    var collision = this.board.collide(this,OBJECT_PLAYER)
    if(collision) {
	collision.hit(this.damage);
	this.board.remove(this);
    } else if(this.y > Game.height) {
	this.board.remove(this); 
    }
};



// Constructor para la explosión

var Explosion = function(centerX,centerY) {
    this.setup('explosion', { frame: 0 });
    this.x = centerX - this.w/2;
    this.y = centerY - this.h/2;
    this.subFrame = 0;
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt) {
    this.frame = Math.floor(this.subFrame++ / 2);
    if(this.subFrame >= 24) {
	this.board.remove(this);
    }
}



$(function() {
    Game.initialize("game",sprites,startGame);
});


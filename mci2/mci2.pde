import de.voidplus.leapmotion.*; //<>//

//TODO:
/*
 Kollision mit Wand
 −(2(n · v) n − v) Wo n = normalisierter Wandvector, v = direction
 Maximale Kollision / Reibung
 ? Gesten swap Level usw.
     + Wände nach Links, - Wände nach rechts
 ? Reset
     + Wände = 1 oder bleiben, Regenrate Level
 */

float TARGET_RAD = 37.5;
float PROJECTILE_RAD = 10;

LeapMotion leap = null;
Player player = null;
Projectile ball = null;

Level level;
PVector levelSize = new PVector(600,800);

void setup() {
  size(600, 800);
  background(200);

  leap = new LeapMotion(this);
  player = new Player();

  level = new Level(1, 300, 600);
}

void draw() {
  background(200);
  level.draw();
  player.updateState();

  printDebugInfo();

  //CheckShooting

  if (player.isShooting) {
    //update projectile, if existent
    if (ball == null) {
      PVector currentPlayerPos = new PVector(player.position.x, player.position.y);
      //Direction = sling - player pos (YAY MATHE 1 B)
      PVector diff = currentPlayerPos.sub(level.slingPos);
      
      float velocity = diff.mag();
      
      ball = new Projectile(new PVector(player.position.x, player.position.y), new PVector(diff.x, diff.y).normalize(), velocity);
      ball.draw();
    } else {
      //update projectile pos
      ball.updatePosition();
      ball.draw();
      checkGoal();
    }
  } else {
    if (player.pinch == PinchState.PINCHED) {
      drawPinch();
      drawAimingLine();
    }
  }
}

void printDebugInfo() {
  for (Hand hand : leap.getHands()) {
    text("PinchStrength: " + hand.getPinchStrength(), 10, 10, 10);
  }
  text("PinchState: " + player.pinch, 10, 25, 10);
  if (player.pinch == PinchState.PINCHED) {
    text("Vector PinchPos: (" + (int) player.position.x + "," + (int) player.position.y + "," + (int) player.position.z + ")", 10, 40, 10);
  }
}

void checkGoal(){
  if(ball.position.dist(level.target) < TARGET_RAD - PROJECTILE_RAD){
    player.isShooting = false;
    ball = null;
    println("YAY Hit ZE TARRRGET");
  }
}

void drawPinch() {
  fill(255, 0, 0);
  ellipse(player.position.x, player.position.y, 10, 10);
}

void drawAimingLine() {
  line(player.position.x, player.position.y, level.slingPos.x, level.slingPos.y);
}



class Player {

  PinchState pinch = PinchState.INVALID;
  PVector position = null;
  boolean isShooting;

  public Player() {
    isShooting = false;
  }

  public void updateState() {
    setPinchPos();
  }

  private void setPinchPos() {
    //Right Hand not tracked, reset Position
    if (leap.getRightHand() == null) {
      pinch = PinchState.INVALID;
      return;
    }

    //Currently pinched
    for (Hand hand : leap.getHands()) {
      if (hand.getPinchStrength() >= 0.75) {
        pinch = PinchState.PINCHED;
        position = leap.getRightHand().getThumb().getPosition();
        return;
      }
    }

    //Only reachable if unpinched
    if (pinch == PinchState.PINCHED) {
      //Player pinched before
      isShooting = true;
    }

    //Currently not pinched, but trackable
    pinch = PinchState.UNPINCHED;
  }
}

enum PinchState {
  PINCHED, 
    UNPINCHED, 
    INVALID
}

class Level {
  Wall[] walls;
  PVector slingPos;
  PVector target;

  Level(int numberOfWalls, int slingX, int slingY) {
    initWalls(numberOfWalls);
    slingPos = new PVector(slingX, slingY);
    target = new PVector(300, 100);
  }

  public void draw() {
    drawSling();
    drawWalls();
    drawTarget();
  }

  private void drawSling() {
    fill(0, 0, 0);
    ellipse(slingPos.x, slingPos.y, 10, 10);
  }

  private void initWalls(int number) {
    walls = new Wall[number]; 
    for (int i = 0; i < number; i++) {
      walls[i] = new Wall(random(600), random(0, 400), random(600), random(0, 400));
    }
  }


  private void drawWalls() {
    for (Wall wall : walls) {
      line(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
    }
  }

  private void drawTarget() {
    fill(0, 0, 0);
    ellipse(target.x, target.y, TARGET_RAD, TARGET_RAD);
  }
}


class Projectile {
  PVector position;
  PVector direction;
  float velocity;
  
  float maxVelocity = 20;
  

  public Projectile(PVector pos, PVector dir, float vel) {
    position = pos;
    direction = dir;
    velocity = (vel/500 * maxVelocity);
  }

  public void draw() {
    fill(0, 0, 255);
    ellipse(position.x, position.y, PROJECTILE_RAD, PROJECTILE_RAD);
  }

  public void updatePosition() {
    position.x += -(velocity * direction.x);
    position.y += -(velocity * direction.y);
    checkBorderCollision();
  }
  
  private void checkBorderCollision()
  {
    if(position.x <= 0 || position.x >= levelSize.x)
    {
      direction.x = -direction.x;
    }
    if(position.y <= 0 || position.y >= levelSize.y)
    {
      direction.y = -direction.y;
    }
    
  }
}

class Wall {
  PVector start;
  PVector end;

  public Wall(float xStart, float yStart, float xEnd, float yEnd) {
    start = new PVector(xStart, yStart, 0);
    end = new PVector(xEnd, yEnd, 0);
  }
}
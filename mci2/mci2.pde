import de.voidplus.leapmotion.*;

  //TODO:
  /*
  Geschwindigkeit
  Kollision mit Wand
  Target
  Maximale Kollision / Reibung
  Hindernisse, Level
  ? Gesten swap Level usw.
  ? Reset
  */

LeapMotion leap;
Player player;

Level level;

boolean isShooting = false;

void setup() {
  size(600,800);
  background(200);
  
  leap = new LeapMotion(this);
  player = new Player();
  
  level = new Level(0, 300, 600);
}

void draw(){
  background(200);
  level.draw();
  player.updatePositions();
  
  //Check if there is currently a shot projectile
  if(!isShooting){
    //check if player wants to shoot 
    if(player.pinch == PinchState.PINCHED){   
      drawPinch();
      //connection line between sling and pinch
      drawAimingLine();
    }
    
    //player triggered shot
    if(player.pinch == PinchState.UNPINCHED && player.position != null){
      //Draw Projectile, ...
      isShooting = true;
      
    }
  } else {
    //Projectile flying
  }
  
  
  //update projectile 
}

void drawPinch(){
  fill(255,0,0);
  ellipse(player.position.x,player.position.y,10,10);
}

void drawAimingLine(){
  line(player.position.x,player.position.y,level.slingPos.x,level.slingPos.y);
}



class Player {
  
  PinchState pinch = PinchState.INVALID;
  PVector position = null;
  
  public Player(){
  }
  
  public void updatePositions(){
    setPinchPos();
}
   //<>// //<>//
  private void setPinchPos(){
    //Right Hand not tracked, reset Position
    if(leap.getRightHand() == null){
      pinch = PinchState.INVALID;
      return;
    }
    
    //Currently pinched
    if(leap.getRightHand().getPinchStrength() >= 0.99){
      pinch = PinchState.PINCHED;
      position = leap.getRightHand().getThumb().getPosition();
      return;
    }
    
    //Currently not pinched, but trackable
    pinch = PinchState.UNPINCHED;
  }
}

enum PinchState{
  PINCHED,
  UNPINCHED,
  INVALID
}

class Level{
 int walls;
 PVector slingPos;
 
 
 Level(int numberOfWalls, int slingX, int slingY){
   walls = numberOfWalls;
   slingPos = new PVector(slingX, slingY);
 }
 
 public void draw(){
   drawSling();
 }
 
 private void drawSling(){
   fill(0,0,0);
   ellipse(slingPos.x,slingPos.y,10,10);
 }
}


class Projectile{
  float x, y; //Position
  PVector direction;
}
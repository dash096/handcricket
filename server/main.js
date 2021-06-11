var html = `
<html>

<head>
  <title> Dispo </title>
  
  <style>
      ${require('./main.css')}
  </style>
  
</head>

<body>

  <div id='wrapper'>
    
    <div id='header'>
        <div id='nav_icon_container'>
            <div class='nav_icon' id='one'>
            </div>
            <div class='nav_icon' id='two'>
            </div>
            <div class='nav_icon' id='three'>
            </div>
        </div>
    </div>

    
    <div id='design'>
    </div>

    
    <div id='main'>
        <div id='logo_container'>
            <img src='${process.env.AVATAR_URL}' alt='logo'>
        </div>

        <h3 id='title'> Dispo </h3>
        <p>
          The gateway to online sporting
        </p>

        <div class='redirect'>
            <a href="${process.env.INVITE_URL}"> <strong> Invite Bot </strong> </a>
        </div>
    </div>
  
  
    <div id='features'>
        <div id='title'>
            <h3>
              Why Dispo?
            </h3>
        </div>
      
        <div id='cricket' class='category'>
            <img src='https://i.postimg.cc/FKGdD7zb/cricket-player.png'>
            
            <h4> Cricket </h4>
            <p>
                The sport cricket in Discord with actual strikeRate, runRate, orangeCap holder, purpleCap holder, total runs, total wickets with some powerups together brings you real fun with your friends!
            </p>
        </div>
        <div id='football' class='category'>
            <img src='https://i.postimg.cc/pdP5fDWX/football-players.png'>
           
            <h4> Football </h4>
            <p>
                Get your hands on the most interesting part of Football, Penalty Shootouts!
            </p>
        </div>
        <div id='games' class='category'>
            <img src='https://i.postimg.cc/HWzMHKkB/joystick.png'>
          
            <h4> Minigames </h4>
            <p>
                We also found a way to cure your loneliness, try the minigames also known as Single Player Games.
            </p>
        </div>
    </div>
  
  
    <div id='joinus'>
        <div id='title'>
            <h3>
            Community
            </h3>
        </div>
        <div id='description'>
            <p>
                Excited? Want to try it? Join our community server, let us have fun together!
            </p>
            <br>
            <strong> Community Perks: </strong>
            
            <ul>
                <li> Helmet for your character
                <li> 2x Coin Multi
                <li> Access to Decor Shop
                <li> More hidden stuffs
            </ul>
        </div>
        <div id='redirect'>
            <a href="${process.env.COMMUNITY_URL}">
                Join us
            </a>
        </div>
    </div>
  
  
    <div id='footer'>
        <h2> @Dispo </h2>
    </div>
  
  
  </div>
  
</body>

</html>
`

module.exports = html;
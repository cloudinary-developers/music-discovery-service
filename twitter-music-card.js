'use latest';

import express from 'express';
import { fromExpress } from 'webtask-tools';
import bodyParser from 'body-parser';
const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  var sound = "https://capitol-music-360.cloudinary.auth0-extend.com/music-discovery-service/song/21258162/stream";
  var poster = "https://res.cloudinary.com/capitol-music-group/image/upload/v1526798279/audio-stream/zedd.png";
  var player = `https://canadian-music-week.cloudinary.auth0-extend.com/twitter-audio-container?poster=${poster}&url=${sound}`;
  var twitterid = "@cloudinary";
  var title = "Capitol Music Group";
  var website = "https://vuesic.herokuapp.com"
  var description = "Zedd - Clarity";
  var image = poster;
  var width = "500";
  var height = "500";
  var cardtype = 'player';  // summary, 
  var hashtags = 'cloudinary,vuejs,music'
  
  var tweetURL = `https://twitter.com/intent/tweet?text=${encodeURI(description)}&url=${encodeURI(website)}&hashtags=${hashtags}&via=${twitterid}`
  var body = `<body>

<style type="text/css">
audio {
   position:absolute;
   top: 0vh;
   left:0px;
   width:100vw;
   max-width: 420px;
   height:auto;
}

img{
   position:absolute;
   top: 5vh;
   left:0px;
   width:auto;
   max-width: 420px;
   height:auto;
}
</style>

<img src="https://res.cloudinary.com/capitol-music-group/image/upload/v1526798279/audio-stream/zedd.png">
<audio controls="">
  <source src="https://capitol-music-360.cloudinary.auth0-extend.com/music-discovery-service/song/21258162/stream" poster="https://res.cloudinary.com/capitol-music-group/image/upload/v1526798279/audio-stream/zedd.png" type="audio/mp3">
Your browser does not support audio
</audio>

<script>

</script>


  </body>`
  
  const HTML = renderView({
    cardtype:cardtype,
    title: title,
    player: player,
    twitterid: twitterid,
    description: description,
    image: image,
    width: width,
    height: height,
    body:'Copy and paste this url into twitter and post',
    tweetURL: tweetURL
  });

  res.set('Content-Type', 'text/html');
  res.status(200).send(HTML);
});

module.exports = fromExpress(app);


function renderView(locals) {
  var template = `
<!DOCTYPE html>
<html>
<head>
	<meta content='text/html; charset=UTF-8' http-equiv='Content-Type' />
	<meta name="twitter:card" content="${locals.cardtype}" />
	<meta name="twitter:site" content="${locals.twitterid}" />
	<meta name="twitter:title" content="${locals.title}" />
	<meta name="twitter:description" content="${locals.description}" />
	<meta name="twitter:image" content="${locals.image}" />
	<meta name="twitter:url" content="${locals.website}" />
	<meta name="twitter:player" content="${locals.player}" />
	<meta name="twitter:player:width" content="${locals.width}" />
	<meta name="twitter:player:height" content="${locals.height}" />
	<style type="text/css">
      video {
         width:100%;
         max-width:600px;
         height:auto;
      }
</style>
<script type="text/javascript" async src="https://platform.twitter.com/widgets.js"></script>
</head>

<body>
${locals.body}
<br/>
 <!--
<a href="${locals.tweetURL}" target="_blank">
<span data-link="#share-twitter"><img src="http://res.cloudinary.com/christekh/image/upload/c_crop,h_200,w_192/v1526979659/white-twitter-logo-transparent-background-9-300x200_atjr4d.png" alt="" class="share--twitter"></span> 
<br/>
Tweet
</a>
 -->
</body>
</html>`;
  
  return template
  
}

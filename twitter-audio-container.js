'use latest';

import express from 'express';
import { fromExpress } from 'webtask-tools';
import bodyParser from 'body-parser';
const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  //  var sound =  "https://canadian-music-week.cloudinary.auth0-extend.com/music-discovery-service/song/67631499/stream";
  //  var poster =  "https://artwork-cdn.7static.com/static/img/sleeveart/00/070/263/0007026306_800.jpg";
  
  const HTML = renderView({
    sound: req.query.url,
    poster: req.query.poster
  });

  res.set('Content-Type', 'text/html');
  res.status(200).send(HTML);
});

module.exports = fromExpress(app);

function renderView(locals) {
  return `
    <!DOCTYPE html>
<html>
<head>
</head>
<body>

<style type="text/css">
audio {
   position:absolute;
   top: 0vh;
   left:0px;
   width:100vw;
   max-width: 550px;
   height:420;
}

img{
   position:absolute;
   top: 5vh;
   left:0px;
   width:auto;
   max-width: 550px;
   height:auto;
}
</style>

<img src="${locals.poster}"/>
<audio controls autoplay>
  <source src="${locals.sound}" poster="${locals.poster}" type="audio/mp3">
Your browser does not support audio
</audio>

<script>

</script>
</body>
</html>
  `;
}

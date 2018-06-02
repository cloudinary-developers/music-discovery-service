var express    = require('express');
var Webtask    = require('webtask-tools');
var bodyParser = require('body-parser');
var cloudinary = require('cloudinary');

var app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
 const context = req.webtaskContext;

  const configure = (URL) => {
       cloudinary.config(setCloudinaryConfig(URL));
       return cloudinary;
  }
 
   context.cloudinary = {
     personalAccess: () => configure(context.secrets.CLOUDINARY_URL),
     allAccess: () => configure(context.secrets.CMG_CLOUDINARY_URL),
     secureAccess: () => configure(context.secrets.CMG_CLOUDINARY_SECURE_URL)
   }

 next();
});



var apiContext = function (req, res, next) {
  const context = req.webtaskContext;

  // paging 
  const page = context.query.page || 1;
  const pageSize = context.query.pageSize || 100;
  console.log('API Inited.')
  next()
}

// Use our API Middleware
app.use(apiContext)

/*

*/

// type: images, video, raw
function listAndExportRessources(type,version, prefix){
	let cloudinary = context.cloudinary.secureAccess();
		cloudinary.v2.api.resources({resource_type:type , max_results:500,type:'authenticated', prefix:prefix,tags:false, context:false },function(error, result){
		  
		  if(err) return console.log(err);
		  
		  		console.log(`found ${result.resources.length} ${type}`)

		});
}


app.get('/assets/', function (req, res) {
  
  
async function exportLists(){
	await listAndExportRessources('image','v4','wayne_shorter');
	await listAndExportRessources('video','v4','wayne_shorter');
	await listAndExportRessources('raw','v4','wayne_shorter');
}

exportLists();
    res.send("Send the response");
});


app.get('/boxscan/:page', function (req, res) {
  const context = req.webtaskContext;
  const public_id = "assets/wayne_shorter/core/odyssey_of_iska/LA_0016328_odyssey8tr";
  // Config and Call Method
  let cloudinary = context.cloudinary.secureAccess();
  let page = req.params.page || 1;
  try{
  let image = cloudinary.image(public_id, 
  {sign_url: true, type: "authenticated", 
  transformation: [
    {width: 800, page: page, crop: "scale"}
    ]});
    res.send(image);
  }catch(error){
    console.log('Error: ', error)
    res.send(error);
}
  
});

app.get('/image/:transformation/*', function (req, res) {
  const context = req.webtaskContext;
  const transformation = req.params.transformation.split(',');
  const public_id = req.params[0];
  
  let transformations = [];
  
  var lookup = {
    w: "width",
    h: "height",
    c: "crop",
    q: "quality",
    f: "format",
    e: "effect",
    fl: "flags",
    l: "overlay",
    ar: "apect_ratio",
    g: "gravity",
    z: "zoom",
    x: "x",
    y: "y",
    r: "radius",
    a: "angle",
    o: "opacity",
    bo: "border",
    b: "background",
    u: "underlay",
    d: "default_image",
    dl: "delay",
    co: "color",
    cs: "color_space",
    dpr: "dpr",
    pg: "page",
    dn: "density",
    t: "transformation",
    $: "variable"
    
  };
  
  transformation.forEach(function(item){
    let transform = {};
    let key = item.split('_')[0];
    let value = item.split('_')[1];
    transform[lookup[key]] = value;
    transformations.push(transform)
  })
  
  console.log(transformations);
  
  // Config and Call Method
  let cloudinary = context.cloudinary.secureAccess();
  let image = cloudinary.image(public_id, 
  {sign_url: true, type: "authenticated", 
  transformation: transformations});
  console.log(image);
  res.send(image);
});



app.get('/', function (req, res) {
  const context = req.webtaskContext;
  // Config and Call Method
  let cloudinary = context.cloudinary.secureAccess();
  let image = cloudinary.image("assets/wayne_shorter/core/speak_no_evil/gelder_inlay_clone.png", 
  {sign_url: true, type: "authenticated", 
  transformation: [
  {width: 400, crop: "scale"},
  {effect: "style_transfer", overlay: "authenticated:assets:wayne_shorter:core:speak_no_evil:brush_300dpi"}
  ]});

  res.send(image);
});


// Cloudinary Config Utility
function setCloudinaryConfig(cloudEnv){
  if(!cloudEnv){
    return ;
  }
let cloud = cloudEnv.split('@')[1];
let api_key = cloudEnv.split('@')[0].split('//')[1].split(':')[0];
let api_secret = cloudEnv.split('@')[0].split('//')[1].split(':')[1];

return {
      "cloud_name": cloud,
      "api_key": api_key,
      "api_secret": api_secret
    }
}


module.exports = Webtask.fromExpress(app);
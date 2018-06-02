const express    = require('express');
const Webtask    = require('webtask-tools');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary');
const request    = require('request');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
 const context = req.webtaskContext;

 const get = (url) => {
  return {
        "cloud_name": url.split('@')[1],
        "api_key": url.split('@')[0].split('//')[1].split(':')[0],
        "api_secret": url.split('@')[0].split('//')[1].split(':')[1]
      }
 }

  const configure = (url) => {
       cloudinary.config(get(url));
       return cloudinary;
  }
 
   context.cloudinary = {
     personalAccess: () => configure(context.secrets.CLOUDINARY_URL),
     allAccess: () => configure(context.secrets.CMG_CLOUDINARY_URL),
     secureAccess: () => configure(context.secrets.CMG_CLOUDINARY_SECURE_URL)
   }

 next();
});

// type: images, video, raw
function listAndExportRessources(type, version, prefix) {
  const cloudinary = context.cloudinary.secureAccess();
  const options = {
    resource_type: type, 
    max_results: 500,
    type: 'authenticated', 
    prefix: prefix,
    tags: false, 
    context: false 
  }

  cloudinary.v2.api.resources(options, (error, result) => {
    if(error)
      return console.log(error);

      console.log(`found ${result.resources.length} ${type}`)
  });
}

app.get('/albums', (req, res) => {
  const context = req.webtaskContext;
  const cloudinary = context.cloudinary.secureAccess();

  const format = result => {
    return result;
  };

  cloudinary.v2.search
    .expression('access_mode:authenticated', 'resource_type:image', 'context.asset_type:album_artwork')
    .with_field('context')
    .with_field('tags')
    .max_results(10)
    .execute((error, result) => {
        if(error) return res.send(error);

        res.send(format(result));
    });
});

app.get('/assets', (req, res) => {

  async function exportLists(){
    await listAndExportRessources('image','v4','wayne_shorter');
    await listAndExportRessources('video','v4','wayne_shorter');
    await listAndExportRessources('raw','v4','wayne_shorter');
  }

  exportLists();
  res.send("Send the response");
});


app.get('/boxscan/:page', (req, res) => {
  const context = req.webtaskContext;
  const cloudinary = context.cloudinary.secureAccess();
  const public_id = "assets/wayne_shorter/core/odyssey_of_iska/LA_0016328_odyssey8tr";

    const options = {
      sign_url: true, 
      type: "authenticated",
      transformation: [{
        width: 800,
        page: req.params.page || 1,
        crop: "scale"
      } ]
    };

    res.send(cloudinary.image(public_id, options));
});

app.get('/image/:transformation/*', (req, res) => {
  const context = req.webtaskContext;
  const cloudinary = context.cloudinary.secureAccess();
  const public_id = req.params[0];
  const transformations = [];
  
  const lookup = {
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
  
  req.params.transformation.split(',')
    .forEach((item) => {
      const transform = {};
      const { key, value } = item.split('_');
      transform[lookup[key]] = value;
      transformations.push(transform)
    });
  
  const options = {
    sign_url: true,
    type: 'authenticated',
    transformation: transformations
  };

  res.send(cloudinary.image(public_id, options));
});


app.get('/song/:public_id/*', (req, res) => {
  const context = req.webtaskContext;
  const cloudinary = context.cloudinary.secureAccess();
  const public_id =  req.params[0] || "assets/wayne_shorter/core/soothsayer/05099951437251_S_04_TheSoothsayer_USBN20700919.mp3";
  
  const options = {
    sign_url: true,
    type: "authenticated",
    resource_type: "video"
  };
  const url = cloudinary.v2.url(public_id, options)

  req.pipe(request(url)).pipe(res);
});


app.get('/', (req, res) => {
  const context = req.webtaskContext;
  const cloudinary = context.cloudinary.secureAccess();
  const options = {
    sign_url: true,
    type: "authenticated",
    transformation: [
      {
        width: 400, 
        crop: "scale"
      },
      {
        effect: "style_transfer", 
        overlay: "authenticated:assets:wayne_shorter:core:speak_no_evil:brush_300dpi"
      }
    ]
  };
  const image = cloudinary.image("assets/wayne_shorter/core/speak_no_evil/gelder_inlay_clone.png", options);

  res.send(image);
});

module.exports = Webtask.fromExpress(app);

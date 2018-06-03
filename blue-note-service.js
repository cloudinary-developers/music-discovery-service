const express = require("express");
const Webtask = require("webtask-tools");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary");
const request = require("request");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  const context = req.webtaskContext;

  const get = url => {
    return {
      cloud_name: url.split("@")[1],
      api_key: url
        .split("@")[0]
        .split("//")[1]
        .split(":")[0],
      api_secret: url
        .split("@")[0]
        .split("//")[1]
        .split(":")[1]
    };
  };

  const configure = url => {
    cloudinary.config(get(url));
    return cloudinary;
  };

  context.cloudinary = {
    personalAccess: () => configure(context.secrets.CLOUDINARY_URL),
    allAccess: () => configure(context.secrets.CMG_CLOUDINARY_URL),
    secureAccess: () => configure(context.secrets.CMG_CLOUDINARY_SECURE_URL)
  };

  next();
});

app.get("/assets", (req, res) => {
  const context = req.webtaskContext;
  const cloudinary = context.cloudinary.secureAccess();

  const getsrc = tag => {
    //the cloudinary.url method returned a malformed url for 
    // secured images, so we are using cloudinary.image and 
    // parsing the img tag. yeah it's hacky.
    return tag.split(' ')[1]
              .split('=')[1]
              .replace('\'', '')
              .replace('\'', '');
  }

  const format = result => {
    console.log(result.resources.length);
    return result.resources.map(r => {
      
      const asset = {
        public_id: r.public_id,
        folder: r.folder,
        album_title: r.context.album_title,
        album_upc: r.context.album_upc,
        url: cloudinary.utils.url(r.public_id, {
          resource_type: r.resource_type,
          type: 'authenticated',
          sign_url: true
        }),
        secure_url: r.secure_url,
        context: r.context
      };

      if(r.resource_type == 'image') {
        asset.thumbnail = getsrc(cloudinary.image(r.public_id, { width: 100, crop: 'thumb', sign_url: true, type: 'authenticated' }));
        asset.medium = getsrc(cloudinary.image(r.public_id, { width: 500, crop: 'scale', sign_url: true, type: 'authenticated' }));
        asset.large = getsrc(cloudinary.image(r.public_id, { width: 1200, crop: 'scale', sign_url: true, type: 'authenticated' }));
         asset.square = getsrc(cloudinary.image(r.public_id, {format:'png', width: 512, height: 512,  crop: 'fit', sign_url: true, type: 'authenticated' }));
      }
      
      return asset;
    });
  };

  cloudinary.v2.search
    .expression(
      "public_id:assets/wayne_shorter/* AND access_mode:authenticated"
    )
    .with_field("context")
    .with_field("tags")
    .max_results(500)
    .execute((error, result) => {
      if (error) return res.send(error);

      res.send(format(result));
    });
});

app.get("/boxscan/:page", (req, res) => {
  const context = req.webtaskContext;
  const cloudinary = context.cloudinary.secureAccess();
  const public_id =
    "assets/wayne_shorter/core/odyssey_of_iska/LA_0016328_odyssey8tr";

  const options = {
    sign_url: true,
    type: "authenticated",
    transformation: [
      {
        width: 800,
        page: req.params.page || 1,
        crop: "scale"
      }
    ]
  };

  res.send(cloudinary.image(public_id, options));
});

app.get("/image/:transformation/*", (req, res) => {
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

  req.params.transformation.split(",").forEach(item => {
    const transform = {};
    const { key, value } = item.split("_");
    transform[lookup[key]] = value;
    transformations.push(transform);
  });

  const options = {
    sign_url: true,
    type: "authenticated",
    transformation: transformations
  };

  res.send(cloudinary.image(public_id, options));
});

app.get("/song/:public_id/*", (req, res) => {
  const context = req.webtaskContext;
  const cloudinary = context.cloudinary.secureAccess();
  const public_id =
    req.params[0] ||
    "assets/wayne_shorter/core/soothsayer/05099951437251_S_04_TheSoothsayer_USBN20700919.mp3";

  const options = {
    sign_url: true,
    type: "authenticated",
    resource_type: "video"
  };
  const url = cloudinary.v2.url(public_id, options);

  req.pipe(request(url)).pipe(res);
});

app.get("/", (req, res) => {
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
        overlay:
          "authenticated:assets:wayne_shorter:core:speak_no_evil:brush_300dpi"
      }
    ]
  };
  const image = cloudinary.image(
    "assets/wayne_shorter/core/speak_no_evil/gelder_inlay_clone.png",
    options
  );

  res.send(image);
});

module.exports = Webtask.fromExpress(app);

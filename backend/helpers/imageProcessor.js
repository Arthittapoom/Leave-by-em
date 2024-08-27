const multer = require('multer');
const sharp = require('sharp');
const fs = require("fs");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('Not an image! Please upload on images.', false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadProductImages = upload.fields([
  { name: 'brandImg', maxCount: 10 },
  { name: 'banner', maxCount: 10 },
  { name: 'product', maxCount: 10 },
  { name: 'slip', maxCount: 10 },
]);

const resizerImages = async (req, res, next) => {
  let imgRespList = [];

  let imglist;
 
  req.files.product
  ? imglist = req.files.product
  :
  req.files.brandImg
  ? imglist = req.files.brandImg
  :
  req.files.banner
  ? imglist = req.files.banner
  :
  req.files.slip
  ? imglist = req.files.slip
  : ''

  const date = Date.now()


  if(!fs.existsSync(`./img/${req.body.title}`))
  {
    fs.mkdirSync(`./img/${req.body.title}`)
    fs.mkdirSync(`./img/${req.body.path}`)
    fs.mkdirSync(`./img/${req.body.path}/large`)
    fs.mkdirSync(`./img/${req.body.path}/thumbnail`)    
  }
  else if(!fs.existsSync(`./img/${req.body.path}`))
  {
    fs.mkdirSync(`./img/${req.body.path}`)
    fs.mkdirSync(`./img/${req.body.path}/large`)
    fs.mkdirSync(`./img/${req.body.path}/thumbnail`)    
  }
  else if(!fs.existsSync(`./img/${req.body.path}/large`) || !fs.existsSync(`./img/${req.body.path}/thumbnail`))
  {
    fs.mkdirSync(`./img/${req.body.path}/large`)
    fs.mkdirSync(`./img/${req.body.path}/thumbnail`)
  }

  imglist.forEach(async (file,i) => {
    imgRespList.push({
      large: `img/${req.body.path}/large/${date}-${i}.webp`,
      thumbnail: `img/${req.body.path}/thumbnail/${date}-${i}.webp`
    });

    await sharp(file.buffer)
      .webp({ quality: 75 })
      .toFile(`./img/${req.body.path}/large/${date}-${i}.webp`);

    await sharp(file.buffer)
      .resize({ width: 200 })
      .webp({ quality: 60 })
      .toFile(`./img/${req.body.path}/thumbnail/${date}-${i}.webp`);     
  })

  req.body.imgRespList = imgRespList

  next();
};

const uploadStatusImages = async (req, res, next) => {

  let largeList = []
  let thumbnailList = []

  req.body.imgRespList.forEach(item => {
    largeList.push(item.large)
    thumbnailList.push(item.thumbnail)
  })

  res.status(201).json({
    status: "success",
    result: {
      imglargelist: largeList,
      imgthumbnaillist: thumbnailList
    },
  });
};

module.exports = {
  uploadProductImages,
  resizerImages,
  uploadStatusImages
};

let Parser = require('rss-parser');

var mp3Duration = require('mp3-duration');
const mm = require('music-metadata');

//const {Feed} = require("feed");
const {Podcast} = require("podcast");

//var convert = require('xml-js');

let fs = require('fs');
let https = require('https');


let descriptions = require('./descriptions.json');


(async () => {
  // console.log(feed.title);


  //download(0)

  // console.log(feed)


  // check()

  // generate();

  process();


  async function process() {
    let content = fs.readFileSync('protecting_project_pulp.rss', {encoding: 'utf8'});
    let parser = new Parser();
    let feed = await parser.parseString(content);
    feed.items.forEach(i => {
      i.description = descriptions[parseInt(i.guid) - 1]
    });
    fs.writeFileSync('manifest.json', JSON.stringify(feed));
  }

  function generate() {

    const manifest = JSON.parse(fs.readFileSync('manifest.json'))

    const data = { items, ...rest } = manifest;

    const feed = new Podcast({
      title: 'Protecting Project Pulp',
      description: 'Protecting Project Pulp was an "Audio Pulp Fiction Magazine" hosted by Dave Robison and Simon Hildebrandt, and produced by Fred Himebaugh. PPP was originally serialised between 2012 and 2014.',
      id: "http://ppp.requisite.link",
      siteUrl: "http://ppp.requisite.link",
      language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
      image: "http://ppp.requisite.link/ppp-logo.png",
      itunesImage: "http://ppp.requisite.link/ppp-logo.png",
      copyright: "All rights reserved 2013, Simon Hildebrandt",
      updated: new Date(), // optional, default = today
      itunesExplicit: false,
      feedLinks: {
        // json: "https://example.com/json",
        // atom: "https://example.com/atom",
        atom: "http://ppp.requisite.link/protecting_project_pulp.rss"
      },
      author: "Simon Hildebrandt",
      itunesOwner: {
        name: "Simon Hildebrandt",
        email: "simonhildebrandt@gmail.com"
      },
      categories: ['Arts'],
      itunesCategory: [{
        text: 'Arts',
        subcats: [{
          text: 'Books'
        }]
      }],
    });

    // feed.addCategory("Arts");

    items.forEach(item => {
      let filename = item.enclosure.url.split("/").pop();
      let path = `episodes/${filename}`;
      const url = `http://ppp.requisite.link/${path}`;
      // const stats = fs.statSync(path, {throwIfNoEntry: false});

      // console.log(stats)
      // length = stats.size
      // type = "audio/mpeg"

      feed.addItem({
        title: item.title,
        id: url,
        link: url,
        description: item.description,
        content: item.content,
        image: item.image,
        //enclosure: { url, length, type },
        enclosure: {url, file: path},
        date: new Date()
      });
    });

    //fs.writeFileSync('public/ppp.rss', feed.rss2())
    fs.writeFileSync('public/ppp.rss', feed.buildXml(2))
  }


  function check() {
    const feed = JSON.parse(fs.readFileSync('manifest.json'))

    console.log(feed);

    feed.items.forEach(async item => {
      let filename = item.enclosure.url.split("/").pop();
      let path = `episodes/${filename}`

      // const stats = fs.statSync(path, {throwIfNoEntry: false});
      // console.log(`${stats ? 'found' : 'not found'} ${path}`)

      // mp3Duration(path, async (err, duration) => {
      //   if (err) {
      //     console.log(err)
      //   } else {
      //     console.log(`${duration} - ${path}`)
      //   }
      // })

      const metadata = await mm.parseFile(path);
      console.log({metadata})
    })

  }

  function download(index) {

    const item = feed.items[index]

    if (!item) return;

    console.log("Downloading " + item.title + " - " + (item.enclosure.length / 1000000) + "Mb - " + item.enclosure.url);

    let filename = item.enclosure.url.split("/").pop();
    let path = `episodes/${filename}`

    const stats = fs.statSync(path, {throwIfNoEntry: false});

    if (stats) {
      download(index + 1);
      return;
    }

    let length = 0;
    const stream = fs.createWriteStream(path);

    https.get(item.enclosure.url, res => {
      res.on('data', function(d) {
        length += d.length;
        stream.write(d);
      } )
    })
      // .on('response', function(d) {
      //   data += d;
      // } )
      .on('error', function(err) {
        console.error(err)
      } )
      .on('close', function() {
        console.log({length, size: item.enclosure.length})

        download(index + 1);
      } )
  }


})();


// var result = convert.xml2json(content, {compact: true, spaces: 4});

// console.log(result);

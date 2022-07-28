let Parser = require('rss-parser');

var mp3Duration = require('mp3-duration');
const mm = require('music-metadata');

const Feed = require("pfeed-podcast");
const { Podcast } = require("podcast");
var RSS = require('rss');

let fs = require('fs');
let https = require('https');
const util = require('util');


const getDuration = util.promisify(mp3Duration);

let descriptions = require('./descriptions.json');


(async () => {
  // console.log(feed.title);


  //download(0)

  // console.log(feed)


  // check()

  generate();

  // process();


  async function process() {
    let content = fs.readFileSync('protecting_project_pulp.rss', {encoding: 'utf8'});
    let parser = new Parser();
    let feed = await parser.parseString(content);
    feed.items.forEach(i => {
      i.description = descriptions[parseInt(i.guid) - 1]
    });
    fs.writeFileSync('manifest.json', JSON.stringify(feed));
  }

  async function generate() {

    const manifest = JSON.parse(fs.readFileSync('manifest.json'))

    const data = { items, ...rest } = manifest;

    //const content = getFeedContent(items);
    const content = await getRSSContent(items);
    fs.writeFileSync('public/ppp.rss', content)
  }

  async function getRSSContent(items) {
    const author = 'Simon Hildebrandt';
    const email = 'simonhildebrandt@gmail.com';
    const summary = 'Protecting Project Pulp was an "Audio Pulp Fiction Magazine" hosted by Dave Robison and Simon Hildebrandt, and produced by Fred Himebaugh. PPP was originally serialised between 2012 and 2014.';
    const image_url = "http://ppp.requisite.link/ppp-logo.png";
    const date = new Date();

    var feed = new RSS({
      title: 'Protecting Project Pulp',
      description: 'Protecting Project Pulp was an "Audio Pulp Fiction Magazine" hosted by Dave Robison and Simon Hildebrandt, and produced by Fred Himebaugh. PPP was originally serialised between 2012 and 2014.',
      feed_url: 'http://ppp.requisite.link/ppp.rss',
      site_url: 'http://ppp.requisite.link',
      image_url,
      language: 'en',
      custom_namespaces: {
        'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'
      },
      custom_elements: [
        {'itunes:explicit': 'no'},
        {'itunes:author': author},
        {'itunes:summary': summary},
        {'itunes:owner': [
          {'itunes:name': author},
          {'itunes:email': email}
        ]},
        {'itunes:image': {
          _attr: {
            href: image_url
          }
        }},
        {'itunes:category': [
          {_attr: {
            text: 'Arts'
          }}
        ]}
      ]
    });

    const promises = items.map(async item => {
      let filename = item.enclosure.url.split("/").pop();
      let path = `episodes/${filename}`;
      const url = `http://ppp.requisite.link/${path}`;
      const description = descriptions[parseInt(item.guid) - 1]
      const duration = await getDuration(path);

      return {
        title: item.title,
        description,
        guid: url,
        enclosure: { url, file: path },
        date,
        custom_elements: [
          { 'itunes:duration': durationString(duration) }
        ]
      };
    });

    const data = await Promise.all(promises);

    data.map(item => feed.item(item));

    return feed.xml({indent: true});
  }

  function durationString(seconds) {
    const date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  function getFeedContent(items) {
    const feed = new Feed({
      title: 'Protecting Project Pulp',
      description: 'Protecting Project Pulp was an "Audio Pulp Fiction Magazine" hosted by Dave Robison and Simon Hildebrandt, and produced by Fred Himebaugh. PPP was originally serialised between 2012 and 2014.',
      id: "http://ppp.requisite.link",
      siteUrl: "http://ppp.requisite.link",
      link: "http://ppp.requisite.link",
      language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
      image: "http://ppp.requisite.link/ppp-logo.png",
      itunesImage: "http://ppp.requisite.link/ppp-logo.png",
      copyright: "All rights reserved 2013, Simon Hildebrandt",
      updated: new Date(), // optional, default = today
      explicit: false,
      feedLinks: {
        // json: "https://example.com/json",
        // atom: "https://example.com/atom",
        atom: "http://ppp.requisite.link/ppp.rss"
      },
      feed: "http://ppp.requisite.link/ppp.rss",
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
      const stats = fs.statSync(path, {throwIfNoEntry: false});

      const description = descriptions[parseInt(item.guid) - 1]

      // console.log(stats)
      length = stats.size
      type = "audio/mpeg"

      feed.addItem({
        title: item.title,
        id: item.guid,
        link: url,
        description,
        content: description,
        image: item.image,
        //enclosure: { url, length, type },
        enclosure: {url, file: path},
        media: [
          {
            type, length,
            sources: [ { uri: url } ]
          }
        ],
        date: new Date()
      });
    });

    return feed.podcast();
  }

  function getPodcastContent(items) {
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
      explicit: 'no',
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

    return feed.buildXml('  ');
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


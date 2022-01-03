import React from 'react';

import { Flex, Image, Link, Box } from "@chakra-ui/react"
import { DownloadIcon } from "@chakra-ui/icons"

import ReactAudioPlayer from 'react-audio-player';

import manifest from '../manifest.json';


const items = manifest.items.sort((a, b) => parseInt(a.guid) - parseInt(b.guid))



function PodcastItem({item}) {
  const { guid, content, description, enclosure }  = item;
  const [title, author] = content.split(" by ");
  const descLines = description.split("\n");

  const number = guid.replace('extra', '');
  const extra = guid.includes('extra');

  const url = '/episodes/' + enclosure.url.split("/").pop();

  return <Flex
    id={guid}
    mb={6}
    align="flex-start"
    borderBottomWidth={1}
    bg="white"
    p={3}
    pb={4}
    display="column"
  >
    <Flex direction="row" mb={2} align="flex-start">
      <Flex
        fontFamily="monospace"
        fontSize={[20, 24, 32]}
        bgColor="blue.300"
        color="white"
        borderRadius={8}
        px={3}
        py={3}
        align="flex-end"
        flex="0 0 auto"
        direction="column"
        lineHeight={1}
      >
        <Flex>#{number.padStart(3, '0')}</Flex>
        { extra && <Flex fontSize={16} fontWeight="bold">extra</Flex> }
      </Flex>

      <Flex direction="column" pl={6} pt={2} align="stretch" flexGrow={1}>
        <Flex direction="row" justify="space-between" flexGrow={1}>
          <Flex fontSize={20} mb={2}>
            <Link href={`#${guid}`}><b>{title}</b> <em>by {author}</em></Link>
          </Flex>
          <Link href={url} fontWeight="bold" color="gray.300"fontSize={16}>mp3<DownloadIcon/></Link>
        </Flex>
        <Flex direction="column" mb={6}>{descLines.map((line, i) => (<p key={i}>{line}</p>))}</Flex>
      </Flex>
    </Flex>
    <ReactAudioPlayer
      src={url}
      controls
      style={{display: "block", width: "100%"}}
      preload="metadata"
    />
  </Flex>
}

export default function App() {

  return <Flex
    align="stretch"
    direction={["column", "column", "row"]}
    bg="gray.200"
  >
    <Flex
      p={4}
      align="center"
      justify={["center", "center", "flex-start"]}
      direction={["row", "row", "column"]}
      flexBasis="30%"
    >
      <Link href="http://ppp.requisite.link">
        <Image src="ppp-logo.svg" mb={8} minWidth={32}/>
      </Link>
      <Flex
        fontSize={16}
        color="white"
        bg="orange.400"
        justify="center"
        fontWeight="bold"
        borderRadius={8}
        flexShrink={1}
        px={3}
        py={2}
        ml={[8, 8, 0]}
      >
        <Link href="ppp.rss">RSS</Link>
      </Flex>
      <Box mt={[0, 0, 8]} ml={[8, 8, 0]} fontSize={[12, 14, 16]}>
        <b>Protecting Project Pulp</b> was an “Audio Pulp Fiction Magazine”
        hosted by Dave Robison and Simon Hildebrandt, and produced by Fred
        Himebaugh. PPP was originally serialized between 2012 and 2014.
      </Box>
    </Flex>
    <Flex direction="column" p={4} flexBasis="70%">
      { items.map(item => <PodcastItem key={item.guid} item={item}/>) }
    </Flex>
  </Flex>
}

# tvpp-log-parser

[![Generated with nod](https://img.shields.io/badge/generator-nod-2196F3.svg?style=flat-square)](https://github.com/diegohaz/nod)
[![NPM version](https://img.shields.io/npm/v/tvpp-log-parser.svg?style=flat-square)](https://npmjs.org/package/tvpp-log-parser)
[![Build Status](https://img.shields.io/travis/Turox/tvpp-log-parser/master.svg?style=flat-square)](https://travis-ci.org/Turox/tvpp-log-parser) [![Coverage Status](https://img.shields.io/codecov/c/github/Turox/tvpp-log-parser/master.svg?style=flat-square)](https://codecov.io/gh/Turox/tvpp-log-parser/branch/master)

An awesome module

## Install

npm:

    npm i tvpp-log-parser

Yarn:

    yarn add tvpp-log-parser

## Usage

```js
import myModule from "tvpp-log-parser";

myModule();
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [compareWithOldEvent](#comparewitholdevent)
    -   [Parameters](#parameters)
-   [push](#push)
-   [push](#push-1)
-   [forEach](#foreach)
-   [pieces](#pieces)
-   [addOverlayEntries](#addoverlayentries)
    -   [Parameters](#parameters-1)

### compareWithOldEvent

Takes an predecessor event and calculates the difference
It generates the added and removed fields

#### Parameters

-   `event`  Event

### push

If the new states doesn't have an node that was present on the last event,
we should add it to the removed array

### push

If the new states have an node that wasn't present on the last event,
we should add it to the added array

### forEach

Lets pull all infinity nodes to the beginning of the list
In order to be able to get the highest distance from the 'source' node,
and draw the nodes that are not connected to the 'source' node at the outer ring

I believe that this can be optimized

### pieces

0.0.0.0:0 works as an separator,
 to the right are the servers which our 'hostAddress' sends chunks to,
 to the left are the servers which 'hostAddress' receives packets from.

### addOverlayEntries

#### Parameters

-   `entries`  

## License

MIT © [Turox](https://github.com/Turox)

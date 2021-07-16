#!/usr/bin/env node

const path = require('path');
const flashLoader = require('flash-player-loader');
const { arch } = require('process');

flashLoader.addSource(path.join(__dirname, '..', 'flash', arch));
flashLoader.load();

function append_flash_path(app) {

}

module.exports = append_flash_path;
#!/bin/zsh
cd "${0:A:h}/story-publisher" || exit 1
/usr/local/bin/node service.mjs start || { read "?Không mở được tool. Bấm Enter để đóng."; exit 1; }
open -a 'Google Chrome' 'http://localhost:3030/'

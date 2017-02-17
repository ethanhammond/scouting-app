#!/bin/bash

gnome-terminal -e 'ssh -t tmp@10.6.3.7 "cd scouting-app ; bash"'
gnome-terminal -e 'ssh -t tmp@10.6.3.7 "cd scouting-app ; npm start"'
gnome-terminal -e './file-watcher.sh'
vim -S

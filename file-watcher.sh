#!/bin/bash
watch rsync -avzr --exclude '.git' --exclude '.*.swp' . tmp@10.6.3.7:scouting-app/

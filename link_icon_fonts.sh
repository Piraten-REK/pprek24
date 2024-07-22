#!/bin/bash

target_folder=assets/fonts/

# create directory if necessary
mkdir -p $target_folder

cd $target_folder

for src in ../../node_modules/bootstrap-icons/font/fonts/*; do
  font=$(basename $src)

  # test if link already exists
  if [ ! -e $font ]; then
    # create symlink
    ln -s $src $font

    # create .gitignore if not existent
    test ! -e .gitignore && touch .gitignore

    if ! git check-ignore $font; then
      echo $font >> .gitignore
    fi

  fi
done

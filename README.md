# GitHub Avatar Downloader

## Problem Statement

Given a GitHub repository name and owner, download all the contributors' profile images and save them to a subdirectory, `avatars/`.

Also includes a recommend function which will list the 5 most common starred repos of the chosen repos contributors.

## Expected Usage

This program should be executed from the command line, in the following manner:

To download the avatars of all contributors of a repo:

`node download_avatars.js <repo-creator> <repo-name>`

To list recommended repos from contributors of a repo:

`node recommend.js <repo-creator> <repo-name>`
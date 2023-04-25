# Updates

## 2023-04-25

- Built and tagged `3`, `3.19` and `3.19c` to the last commit prior to merging
  the 3.20 development branch.
- This should facilitate running `3.19` while this project addresses `3.20`
  migration issues.

## 2022-10-14

- Will now create and run as user `sbbs(1000)` and group `sbbs(1000)` instead of
  root. Passwordless sudo is setup in the environment

## 2022-09-08

- `linux/x86-64` builds only for now... ARM builds have been too problematic.
- Removed 3.19b from docker images, they were broken on AMD and some Intel
  platforms.
- Stale Nightlies removed.
- `latest`, `3` and `3.19` are from a recent nightly commit.
- `nightly` builds are working again, the latest commit does not match manually
  pushed dates, this should clear when there's a future nightly commit.

### Breaking change

You now only need to mount a single directory `.` to `/sbbs-data`, if you were
using the example docker-compose, you should be able to simply switch out the
volume path(s) for a single entry. If you are overriding the web directory, you
should still mount this as `mydir:/sbbs/web` which will work properly inside the
container. Do not mount `./backup` to `/backup`, this will by symlinked to
`/sbbs-data/backup`

`/sbbs/scripts/sbbs` - will appear higher in the PATH statement before
`/sbbs/exec/sbbs` this is intentional as it will run the initialization process
before starting, this will appropriately link the directories in question from
`/sbbs-data` to `/sbbs` inside the runtime instance.

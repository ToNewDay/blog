# set -eo pipefail
git config --local http.postBuffer 524288000
git submodule init
git submodule update --remote
yarn install
yarn global add gulp-cli
yarn add --dev gulp
gulp 
yarn build
gulp dbJsonCopy
gulp copyDocsFile
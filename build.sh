# set -eo pipefail

yarn install
yarn global add gulp-cli
yarn add --dev gulp
gulp 
yarn build
gulp dbJsonCopy
gulp copyDocsFile
#!/bin/bash

## 加载变量
source "./_shell/init.sh"
#############

npm install

echo "开始打包" &&
  npm run build

echo "清空 ProdProject 目录"

rm -rf ${deployPath}

## copy

echo "移动文件到 ProdProject 目录"

cp -r ${outPutPath}"/." ${deployPath}"/"

exit

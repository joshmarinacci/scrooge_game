#console.log('building')

#// mkdir output dir
#// copy index.html
#// copy maps

rm -rf build
mkdir -p build

mkdir -p build/fonts
cp -r fonts/* build/fonts

cp index.html build
cp config.json build

mkdir -p build/tiles
cp tiles/*.png build/tiles

mkdir -p build/maps
cp maps/*.json build/maps

mkdir -p build/js
npx tsc
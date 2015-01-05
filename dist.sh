rm dist/snarl.zip
zip snarl.zip LICENSE README.md
mv snarl.zip dist/
cd dist
zip snarl.zip ./*s
echo "Built latest snarl dist .zip"

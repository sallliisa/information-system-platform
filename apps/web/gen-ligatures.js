const exec = require('child_process').exec
exec(
  'export PATH=$PATH:/home/gamer/.local/bin && pyftsubset ./src/assets/material-symbols-variable.woff2 --output-file=./src/assets/material-symbols-variable.min.woff2 --flavor=woff2 --glyphs-file=./src/assets/iconList.txt --verbose --no-layout-closure',
  (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(stdout)
  }
)

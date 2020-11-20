
module.exports.html = function html(css, topic, script){
  return`
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <title></title>
      <link rel="stylesheet" href="${css}">
    </head>
    <body>
      ${topic}
      <script src="${script}"></script>
    </body>
  </html>
  `;
}

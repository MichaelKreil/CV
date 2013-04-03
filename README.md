# Interactive Curriculum Vitae

You can play with it at <http://michael-kreil.de/cv>

## Folders

* `data` contains a csv file with all events (projects, interviews, etc.), based on the Excel file CV.xlsx.
* `node` generates the html client
  * `template.html` template für ejs
  * `convert.js` uses `data/CV.txt` and `node/template.html` to generate `client/index.html` and `client/script/data.js`
* `client` contains the html client
  * most of the visualisation magic happens in `client/script/main.js` and `client/script/grid.js`

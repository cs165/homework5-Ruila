const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1Ha_C6ecUbrTZVGxQ0ZCe4ZheZgnBuUml22MDGsvyL7I';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  const data = [];
  for(let i=1; i<rows.length; i++){
  const obj = {};
  const key = [];
  for(let j=0; j<rows[0].length; j++){
    key[j]=rows[0][j];
    obj[key[j]]=rows[i][j];
  }
    data.push(obj);
}

  res.json(data);

}
app.get('/api', onGet);

async function onPost(req, res) {

  // TODO(you): Implement onPost.
  const messageBody = req.body;
  const result = await sheet.getRows();
  const rows = result.rows;
  const input = [];
  console.log(messageBody);
  for(let i=0;i<rows[0].length;i++){
    input[i]=messageBody[rows[0][i]];
  }
  await sheet.appendRow(input);

  res.json( { status: 'success'} );
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  // TODO(you): Implement onPatch.
  const result = await sheet.getRows();
  const rows = result.rows;
  let flag= -1;
  let newRow = [];
  for(let i=1;i<rows.length;i++){
    for(let j=0;j<rows[0].length;j++){
      if(column==rows[0][j]&&value==rows[i][j]){
        flag = i;
        break;
      }
    }
    if(flag!=-1)
    break;
  }

  for(let i=0;i<rows[0].length;i++)
  {
    if (rows[0][i] in messageBody) {
      newRow.push(messageBody[rows[0][i]]);
    } else {
      newRow.push(rows[flag][i]);
    }
  }

  await sheet.setRow(flag, newRow);

  res.json( { status: 'success'} );
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;

  // TODO(you): Implement onDelete.
  const result = await sheet.getRows();
  const rows = result.rows;
  for(let i=0;i<rows.length;i++){
    for(let j=0;j<rows[0].length;j++){
      if(column===rows[0][j]&&value===rows[i][j]){
        await sheet.deleteRow(i);
        break;
      }
    }
  }
  res.json( { status: 'success'} );
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!!`);
});

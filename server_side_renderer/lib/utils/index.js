const fs = require('fs');
const path = require('path');

const getDefaultView = () => {
     return  fs.readFileSync(path.resolve(__dirname, 'default.html'), {
          encoding: 'utf8',
      });      
};

module.exports = {
     getDefaultView
};
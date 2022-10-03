const { merge } = require('webpack-merge');
const WriteFilePlugin = require('write-file-webpack-plugin');
const common = require('./webpack.common.js');


module.exports = merge(common, {
  output: {
    path: `${__dirname}/../../origo/build/plugins/`,
    publicPath: '/build/js',
    filename: 'layermanager.js',
    libraryTarget: 'var',
    libraryExport: 'default',
    library: 'Layermanager'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader"
          },            
          {
            loader: "css-loader"
          },          
          {
            loader: "sass-loader"     
          }
        ]
      }      
    ]
  },  
  plugins: [
    new WriteFilePlugin()
  ],  
  devServer: {
    contentBase: './',
    port: 9005
  }
});

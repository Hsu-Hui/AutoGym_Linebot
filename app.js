var linebot = require('linebot');
var express = require('express');
var line  = require('@line/bot-sdk');
const request = require('request');   

var video_url,depiction,imges_url,_keyword;
var AutoGymJSON = 'https://spreadsheets.google.com/feeds/list/1m4lW8U4HqRSMQT6zX1rmvnHvn82rYxfgolryMXnfN1Y/od6/public/values?alt=json';
const config = {
  channelAccessToken: 'Your channelAccessToken',
  channelSecret: 'Your channelSecret'
};
const client  = new line.Client(config);
const app = express();
app.post('/', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch(error=>{
        console.error(error);
    });

});



async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  else{
    await request(AutoGymJSON, function (error, response, body) {
    console.error(error);
    //console.log(body);

      var msg = event.message.text;
      var json=JSON.parse(body);
      for(var i = 0; i < json.feed.entry.length; i++) {
        var keyword = json.feed.entry[i].gsx$keyword.$t.split(",");
        keyword.forEach(element => 
        {
          if (msg.indexOf(element) != -1)
          {
            _keyword=element;
            video_url=json.feed.entry[i].gsx$videourl.$t;
            depiction=json.feed.entry[i].gsx$depiction.$t;
            imges_url=json.feed.entry[i].gsx$imgesurl.$t;
            return client.replyMessage(event.replyToken,{
              "type": "flex",
              "altText": "教學影片",
              "contents": {
                "type": "bubble",
                "hero": {
                  "type": "image",
                  "url": imges_url,
                  "size": "full",
                  "aspectRatio": "20:20",
                  "aspectMode": "cover"
                },
                "body": {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "vertical",
                      "margin": "lg",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "baseline",
                          "spacing": "md",
                          "contents": [
                            {
                              "type": "text",
                              "text": _keyword+"教學影片",
                              "color": "#000000",
                              "size": "lg",
                              "flex": 1,
                              "margin": "none",
                              "offsetTop": "none",
                              "align": "center"
                            }
                          ],
                          "margin": "none",
                          "width": "250px",
                          "height": "30px"
                        }
                      ]
                    }
                  ]
                },
                "footer": {
                  "type": "box",
                  "layout": "vertical",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "button",
                      "style": "link",
                      "height": "sm",
                      "action": {
                        "type": "uri",
                        "label": "GO",
                        "uri": video_url
                      }
                    },
                    {
                      "type": "spacer",
                      "size": "sm"
                    }
                  ],
                  "flex": 0
                }
              }
            })
            .then(res => console.log(res))
            .catch(e => console.log(e.originalError.response.data.details))
          }
        })
      }
    });
    
  }
  
}


// listen on port
const port = process.env.PORT || 8082;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});




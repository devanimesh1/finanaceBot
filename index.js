const axios = require('axios');
const express = require('express');
const app = express();
const path = require('path');
const df = require('dialogflow-fulfillment');
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));

app.post('/', express.json(), (request, response) => {
  const agent = new df.WebhookClient({
    request: request,
    response: response
  });

  console.log(JSON.stringify(request.body));

  function welcome() {
    agent.add(`Welcome to financebot!
    What would you like to do today? policy details, 
    fund value, 
    FAQs`);
    
  }

  function start() {
    agent.add("btn~What are you Looking for?~Policy Details,Fund Value,FAQs");
  }

  function search(number) {
    return new Promise(resolve => {
      var axios = require('axios');

      var config = {
        method: 'get',
        url: `https://<MY API>/search?policMob=${number}`,
        headers: {}
      };

      axios(config)
        .then(function (response) {
          resolve(response.data)
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });
    })
  }

  function save(number) {
    return new Promise(resolve => {
      var axios = require('axios');
      axios.post('https://<MY API>',{
        "data": {"id": "", "policMob": `${number}`}
    })
        .then(function (response) {
          resolve(response.data)
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });
    })
  }

  function searchSave() {
    let number = agent.parameters.mobile_policy
    console.log(number);
    return search(number)
    .then(res=>{
      if (res.length != 0){
        agent.add("Here is your Policy details.");
      }
      else {
        agent.add("Please tell me you date of birth to proceed...");
        agent.context.set({name:"dob", lifespan:1});
        return save(number);
      }
    })
  }

  function searchSave2() {
    let number = agent.parameters.mobile_policy
    console.log(number);
    return search(number)
    .then(res=>{
      if (res.length != 0){
        agent.add("Please enter the six digits OTP(123456) sent to your registered mobile number.");
      }
      else {
        agent.add("Please tell me you date of birth to proceed...");
        agent.context.set({name:"date", lifespan:1});
        return save(number);
      }
    })
  }

  var intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('start', start);
  intentMap.set(`1.1 Take mobile/Policy No. and ask DOB`, searchSave);
  intentMap.set(`2.1 Take mobile/Policy No. and ask DOB`, searchSave2);

  agent.handleRequest(intentMap);
});

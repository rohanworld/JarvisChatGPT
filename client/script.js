console.log("This Script is working");

import bot from './assets/bot.svg';
import user from './assets/user.svg'; 

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element){
  element.textContent = 'Loading.';
  // for every 300 ms, add a dot to the end of the text
  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

// fucntion to give typing effect for the output
function typeText(element, text){
  let index = 0;
  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  }, 20); 
}

// creating a unique if fro eevry single message
function generateUniqueId(){
  const timeStampe = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);
  return `id-${timeStampe}-${hexaDecimalString}`
}

// function to create a message
function chatStripe(isAi, value, uniqueId){
  // The return has to be the template string, not a regular string coz u cannot spaces
  // Value is gonna be the AI Genreated message
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
        <img src="${isAi ? bot : user}" alt=" " />
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  // user chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();
  
  //bot chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv  = document.getElementById(uniqueId);
  loader(messageDiv);

  //frtch the data from the server
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  }else{
    const err = await response.text();
    messageDiv.innerHTML = 'Something went wrong';
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})